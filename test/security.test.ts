import assert from "node:assert/strict";
import test from "node:test";
import { extractLinks, isSafeHttpUrl } from "../src/processing/links.js";
import { safeHref } from "../src/lib/format.js";
import { loadKnowledgeRecords } from "../src/knowledge/repository.js";
import { loadAnalysis, loadProcessedPosts } from "../src/lib/research-data.js";
import { GET as searchRoute } from "../src/app/api/v1/search.json/route.js";

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
