import assert from "node:assert/strict";
import test from "node:test";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { POST } from "../src/app/api/v1/fit-check/route.js";
import { loadKnowledgeRecords } from "../src/knowledge/repository.js";
import { createJevMcpServer } from "../src/mcp/server.js";
import {
  FIT_CHECK_MODELS,
  isFitCheckModelConfigured,
  renderFitCheckMarkdown,
  runFitCheck,
  type FitCheckGenerate,
} from "../src/lib/fit-check.js";

const WORKFLOW = "Every inbound support email lands in one shared inbox. A person decides which of six teams owns it, how urgent it is, and whether it needs a manager. Roughly 900 emails a day.";

/** The route reads process.env directly, so the no-env path is pinned here. */
function withoutGatewayEnv<T>(run: () => T): T {
  const saved = { key: process.env.AI_GATEWAY_API_KEY, oidc: process.env.VERCEL_OIDC_TOKEN };
  delete process.env.AI_GATEWAY_API_KEY;
  delete process.env.VERCEL_OIDC_TOKEN;
  try {
    return run();
  } finally {
    if (saved.key !== undefined) process.env.AI_GATEWAY_API_KEY = saved.key;
    if (saved.oidc !== undefined) process.env.VERCEL_OIDC_TOKEN = saved.oidc;
  }
}

function post(body: unknown, headers: Record<string, string> = {}) {
  return withoutGatewayEnv(() => POST(new Request("http://localhost/api/v1/fit-check", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  })));
}

test("with no gateway credentials the check falls back to the deterministic rules result", async () => {
  const records = await loadKnowledgeRecords();
  assert.equal(isFitCheckModelConfigured({}), false);
  assert.equal(isFitCheckModelConfigured({ AI_GATEWAY_API_KEY: "x" }), true);
  assert.equal(isFitCheckModelConfigured({ VERCEL_OIDC_TOKEN: "x" }), true);

  const result = await runFitCheck(WORKFLOW, records, { env: {} });
  assert.equal(result.mode, "rules");
  assert.equal(result.model, null);
  assert.match(result.reason ?? "", /credentials/u);
  assert.ok(result.decisionPoints.length > 0);
  assert.ok(result.keepInCode.length > 0);
  assert.ok(result.keepInLlm.length > 0);
  assert.ok(result.caveats.length > 0);
  assert.ok(result.relatedRecords.every((record) => record.status.length > 0 && record.canonicalPath.startsWith("/")));
});

test("a model result keeps only grounded record ids and known lenses, and keeps the deterministic caveats", async () => {
  const records = await loadKnowledgeRecords();
  const rules = await runFitCheck(WORKFLOW, records, { env: {} });
  const groundedId = rules.relatedRecords[0]?.id;
  assert.ok(groundedId);

  const generate: FitCheckGenerate = async () => ({
    verdict: "strong",
    headline: "Six-way ownership and an urgency score are both bounded decisions.",
    decisionPoints: [
      { step: "Assign the owning team", primitive: "Choice", question: "Which team owns this email?", options: ["billing", "shipping"], scale: "ignored for a Choice", whyJev: "A bounded set of handlers.", lens: "routing-and-triage" },
      { step: "Rate urgency", primitive: "Score", question: "How urgent is this?", options: ["leaked from a Choice"], scale: "0 to 1, where 1 is same-hour.", whyJev: "An ordered dimension.", lens: "not-a-real-lens" },
    ],
    keepInCode: ["Sending the reply and writing the audit row."],
    keepInLlm: ["Drafting the reply text."],
    firstExperiment: "Label 300 recent emails with the team that actually handled them and compare.",
    relatedRecordIds: [groundedId, "opportunity:entirely-invented-record", "pattern:also-invented"],
  });

  const result = await runFitCheck(WORKFLOW, records, { generate });
  assert.equal(result.mode, "model");
  assert.equal(result.model, FIT_CHECK_MODELS[0]);
  assert.equal(result.verdict, "strong");

  // Unknown ids are dropped rather than rendered as if the atlas backed them.
  assert.deepEqual(result.relatedRecords.map((record) => record.id), [groundedId]);

  const [choice, score] = result.decisionPoints;
  assert.equal(choice?.lens, "routing-and-triage");
  assert.equal(choice?.lensTitle, "Routing and triage");
  assert.deepEqual(choice?.options, ["billing", "shipping"]);
  assert.equal(choice?.scale, "", "a Choice never carries a scale");
  assert.equal(score?.lens, null, "an unknown lens id is dropped");
  assert.equal(score?.lensTitle, null);
  assert.deepEqual(score?.options, [], "a Score never carries options");
  assert.equal(score?.scale, "0 to 1, where 1 is same-hour.");

  // The deterministic caveats survive the model pass, with the model's own on top.
  for (const caveat of rules.caveats) assert.ok(result.caveats.includes(caveat), `missing caveat: ${caveat}`);
  assert.match(result.caveats[0] ?? "", /hypothesis, not a finding/u);

  const markdown = renderFitCheckMarkdown(WORKFLOW, result);
  assert.match(markdown, /Jev fit check/u);
  assert.match(markdown, /Routing and triage/u);
  assert.doesNotMatch(markdown, /entirely-invented-record/u);
});

test("a long headline is trimmed rather than collapsing the whole result to rules mode", async () => {
  const records = await loadKnowledgeRecords();
  const generate: FitCheckGenerate = async () => ({
    verdict: "promising",
    headline: "x".repeat(400),
    decisionPoints: [{ step: "Assign the owning team", primitive: "Choice", question: "Which team?", options: [], scale: "", whyJev: "Bounded.", lens: "routing-and-triage" }],
    keepInCode: [],
    keepInLlm: [],
    firstExperiment: "y".repeat(2_000),
    relatedRecordIds: [],
  });
  const result = await runFitCheck(WORKFLOW, records, { generate });
  assert.equal(result.mode, "model");
  assert.ok(result.headline.length <= 120);
  assert.ok(result.firstExperiment.length <= 900);
  // With no id the model could cite, the grounding set is still offered.
  assert.ok(result.relatedRecords.length > 0);
});

test("a throwing or malformed model falls back to the rules result instead of erroring", async () => {
  const records = await loadKnowledgeRecords();
  const thrown = await runFitCheck(WORKFLOW, records, { generate: async () => { throw new Error("gateway down"); } });
  assert.equal(thrown.mode, "rules");
  assert.match(thrown.reason ?? "", /unavailable/u);

  const malformed = await runFitCheck(WORKFLOW, records, { generate: async () => ({ verdict: "excellent" }) });
  assert.equal(malformed.mode, "rules");
  assert.ok(malformed.decisionPoints.length > 0);
});

test("the second model is tried when the first one fails", async () => {
  const records = await loadKnowledgeRecords();
  const tried: string[] = [];
  const generate: FitCheckGenerate = async ({ model }) => {
    tried.push(model);
    if (model === FIT_CHECK_MODELS[0]) throw new Error("primary unavailable");
    return {
      verdict: "promising",
      headline: "Ownership routing is the bounded decision here.",
      decisionPoints: [{ step: "Assign the owning team", primitive: "Choice", question: "Which team?", options: ["billing"], scale: "", whyJev: "Bounded.", lens: "routing-and-triage" }],
      keepInCode: ["Sending the reply."],
      keepInLlm: ["Drafting the reply."],
      firstExperiment: "Label 300 emails and compare.",
      relatedRecordIds: [],
    };
  };
  const result = await runFitCheck(WORKFLOW, records, { generate });
  assert.deepEqual(tried, [...FIT_CHECK_MODELS]);
  assert.equal(result.mode, "model");
  assert.equal(result.model, FIT_CHECK_MODELS[1]);
});

test("the route rejects a body outside its bounds and never returns an error for a rate limit", async () => {
  const short = await post({ workflow: "too short" });
  assert.equal(short.status, 400);
  assert.match((await short.json()).error, /at least 20/u);

  const long = await post({ workflow: "a".repeat(2_001) });
  assert.equal(long.status, 400);
  assert.match((await long.json()).error, /2000 characters or fewer/u);

  const wrongType = await post({ workflow: 42 });
  assert.equal(wrongType.status, 400);

  const notJson = await post("{not json");
  assert.equal(notJson.status, 400);

  const ok = await post({ workflow: WORKFLOW }, { "x-forwarded-for": "203.0.113.10" });
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get("Cache-Control"), "no-store");
  const payload = await ok.json();
  assert.equal(payload.result.mode, "rules", "no gateway credentials are set in the test environment");
});

test("the per-IP limiter degrades to the rules result rather than failing the request", async () => {
  const ip = "198.51.100.77";
  const results = [];
  for (let attempt = 0; attempt < 7; attempt += 1) {
    const response = await post({ workflow: WORKFLOW }, { "x-forwarded-for": ip });
    assert.equal(response.status, 200);
    results.push((await response.json()).result);
  }
  const limited = results.at(-1);
  assert.equal(limited.mode, "rules");
  assert.match(limited.reason, /more than 5 model checks in a minute/u);
  assert.ok(limited.decisionPoints.length > 0, "a limited caller still gets the deterministic assessment");
});

test("the public MCP tool never spends gateway credit, whatever the environment", async () => {
  // assess_jev_fit is unauthenticated, so a model call there is budget anyone
  // can drain. The tool must stay deterministic even with credentials present.
  process.env.AI_GATEWAY_API_KEY = "test-key-that-must-never-be-used";
  try {
    const server = await createJevMcpServer();
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "jev-atlas-tests", version: "1.0.0" });
    await server.connect(serverTransport);
    await client.connect(clientTransport);
    try {
      const response = await client.callTool({ name: "assess_jev_fit", arguments: { workflow: WORKFLOW } });
      const assessment = (response.structuredContent as { result: { assessment: { mode: string; model: string | null; reason: string; decisionPoints: unknown[]; relatedRecords: unknown[] } } }).result.assessment;
      assert.equal(assessment.mode, "rules");
      assert.equal(assessment.model, null);
      assert.match(assessment.reason, /Served over MCP/u);
      // It still hands the agent the deterministic pass and the grounded records.
      assert.ok(assessment.decisionPoints.length > 0);
      assert.ok(assessment.relatedRecords.length > 0);
    } finally {
      await client.close();
      await server.close();
    }
  } finally {
    delete process.env.AI_GATEWAY_API_KEY;
  }
});
