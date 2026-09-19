import assert from "node:assert/strict";
import test from "node:test";
import { extractLinks, isSafeHttpUrl } from "../src/processing/links.js";
import nextConfig, { contentSecurityPolicy, securityHeaders } from "../next.config.js";
import { safeHref, safeMarkdownHref } from "../src/lib/format.js";
import { loadKnowledgeRecords } from "../src/knowledge/repository.js";
import { loadAnalysis, loadProcessedPosts } from "../src/lib/research-data.js";
import { renderFitCheckMarkdown, runFitCheck, type FitCheckGenerate } from "../src/lib/fit-check.js";
import { GET as searchRoute } from "../src/app/api/v1/search.json/route.js";
import { dynamicParams as claimDynamicParams } from "../src/app/claims/[slug]/page.js";
import { dynamicParams as ideaDynamicParams } from "../src/app/ideas/[slug]/page.js";
import { dynamicParams as patternDynamicParams } from "../src/app/patterns/[slug]/page.js";
import { dynamicParams as projectDynamicParams } from "../src/app/projects/[slug]/page.js";
import ResearchDocumentPage, { dynamicParams as researchDynamicParams } from "../src/app/research/[slug]/page.js";

test("next config applies the complete security header set to every route", async () => {
  const rules = await nextConfig.headers?.();
  assert.ok(rules);
  assert.equal(rules.length, 1);
  assert.equal(rules[0]?.source, "/:path*");
  assert.deepEqual(rules[0]?.headers, securityHeaders);

  const headers = new Map(securityHeaders.map(({ key, value }) => [key, value]));
  assert.equal(headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(headers.get("X-Frame-Options"), "DENY");
  assert.equal(headers.get("Referrer-Policy"), "strict-origin-when-cross-origin");
  assert.equal(headers.get("Permissions-Policy"), "camera=(), microphone=(), geolocation=()");
  for (const directive of [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ]) assert.ok(contentSecurityPolicy.includes(directive), `missing CSP directive: ${directive}`);
});

test("only http(s) links survive extraction from third-party post content", () => {
  const hostile = [
    "javascript:alert(document.cookie)",
    "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
    "not a url at all",
  ];
  for (const value of hostile) {
    assert.equal(isSafeHttpUrl(value), false, `${value} must not be treated as a safe link`);
    assert.equal(safeHref(value), undefined, `${value} must not reach an href`);
  }
  assert.equal(safeHref(null), undefined);
  assert.equal(safeHref(""), undefined);
  assert.equal(safeHref("https://x.com/i/web/status/1"), "https://x.com/i/web/status/1");

  // Entity URLs arrive from the API response, not our own regex, so they are
  // filtered on the same path as URLs found in post text.
  const links = extractLinks("see https://github.com/example/repo now", ["javascript:alert(1)", "https://docs.typesafe.ai/primitives"]);
  assert.deepEqual(links.sort(), ["https://docs.typesafe.ai/primitives", "https://github.com/example/repo"]);
});

test("research markdown links use a narrow href allowlist", () => {
  for (const value of [
    "javascript:alert(document.cookie)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
    "//evil.example/path",
    "/\\evil.example/path",
    "relative/path",
  ]) assert.equal(safeMarkdownHref(value), undefined, `${value} must render as plain text`);

  for (const value of [
    "https://example.com/path",
    "http://example.com/path",
    "mailto:research@example.com",
    "/research/report",
    "#limitations",
  ]) assert.equal(safeMarkdownHref(value), value);
});

test("unknown static record slugs terminate as not found", async () => {
  assert.deepEqual(
    [claimDynamicParams, ideaDynamicParams, patternDynamicParams, projectDynamicParams, researchDynamicParams],
    [false, false, false, false, false],
  );
  await assert.rejects(
    ResearchDocumentPage({ params: Promise.resolve({ slug: "../package.json" }) }),
    (error: unknown) => error instanceof Error && "digest" in error && error.digest === "NEXT_HTTP_ERROR_FALLBACK;404",
  );
});

test("model-written fit-check text cannot carry HTML into copied markdown", async () => {
  const records = await loadKnowledgeRecords();
  const generate: FitCheckGenerate = async () => ({
    verdict: "promising",
    headline: "<img src=x onerror=alert(1)> Bounded routing",
    decisionPoints: [{
      step: "<script>alert(1)</script> Assign a team",
      primitive: "Choice",
      question: "Which <b>team</b>?",
      options: ["<i>billing</i>"],
      scale: "",
      whyJev: "A <strong>bounded</strong> set.",
      lens: "routing-and-triage",
    }],
    keepInCode: ["<svg onload=alert(1)>Send the reply"],
    keepInLlm: ["<em>Draft</em> the reply"],
    firstExperiment: "Label <b>recent</b> emails.",
    relatedRecordIds: [],
  });
  const result = await runFitCheck("Route each incoming support request to one of six teams.", records, { generate });
  const modelText = [
    result.headline,
    ...result.decisionPoints.flatMap((point) => [point.step, point.question, ...point.options, point.scale, point.whyJev]),
    ...result.keepInCode,
    ...result.keepInLlm,
    result.firstExperiment,
  ].join("\n");
  assert.doesNotMatch(modelText, /[<>]/u);
  assert.doesNotMatch(renderFitCheckMarkdown("A plain workflow description.", result), /<[^>]+>/u);
});

test("no published knowledge source escapes the http(s) allowlist", async () => {
  const records = await loadKnowledgeRecords();
  const sources = records.flatMap((record) => record.sources);
  assert.ok(sources.length > 0);
  for (const source of sources) {
    assert.ok(isSafeHttpUrl(source.url), `unsafe source URL published: ${source.url}`);
  }
});

test("the public search endpoint bounds its input", async () => {
  const base = "http://localhost/api/v1/search.json";

  const missing = await searchRoute(new Request(base));
  assert.equal(missing.status, 400);

  const oversized = await searchRoute(new Request(`${base}?q=${"a".repeat(501)}`));
  assert.equal(oversized.status, 400);

  const accepted = await searchRoute(new Request(`${base}?q=${"a".repeat(500)}`));
  assert.equal(accepted.status, 200);

  // limit is clamped, so a caller cannot ask for the whole corpus in one hit.
  const flooded = await searchRoute(new Request(`${base}?q=jev&limit=100000`));
  const body = await flooded.json() as { count: number };
  assert.ok(body.count <= 25, `limit was not clamped: ${body.count}`);

  const garbage = await searchRoute(new Request(`${base}?q=jev&limit=notanumber`));
  assert.equal(garbage.status, 200);
});

test("the published analysis artifact reproduces no post text", async () => {
  const [analysis, posts] = await Promise.all([loadAnalysis(), loadProcessedPosts()]);
  if (!analysis || !posts.length) return; // no local corpus to compare against

  // analysis.json is committed and deployed. The corpus is not. Any run of post
  // text appearing in the artifact would be republishing Post content.
  const published = JSON.stringify(analysis);
  for (const entry of posts) {
    const text = entry.post.text.replace(/\s+/gu, " ").trim();
    for (let start = 0; start + 60 <= text.length; start += 20) {
      const run = text.slice(start, start + 60);
      assert.ok(!published.includes(run), `analysis.json reproduces post text: "${run}"`);
    }
  }

  for (const citation of analysis.topEvidence) {
    assert.ok(!("summary" in citation), "evidence citations must not carry a post summary");
    assert.ok(isSafeHttpUrl(citation.url));
  }
});
