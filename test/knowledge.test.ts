import assert from "node:assert/strict";
import test from "node:test";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import {
  assessJevFit,
  buildLlmsTxt,
  getKnowledgeManifest,
  loadKnowledgeRecords,
  searchKnowledge,
} from "../src/knowledge/repository.js";
import { createJevMcpServer } from "../src/mcp/server.js";

test("canonical knowledge records keep stable unique ids, status, sources, and freshness", async () => {
  const records = await loadKnowledgeRecords();
  assert.ok(records.length >= 75);
  assert.equal(new Set(records.map((record) => record.id)).size, records.length);
  assert.ok(records.every((record) => record.id.includes(":")));
  assert.ok(records.every((record) => record.status.length > 0 && record.lastVerifiedAt.length > 0));
  const vendorClaims = records.filter((record) => record.kind === "claim" && record.status === "Vendor Claim");
  assert.ok(vendorClaims.length > 0);
  assert.ok(vendorClaims.every((record) => record.sources.length > 0));
  const manifest = getKnowledgeManifest(records);
  assert.equal(manifest.recordCount, records.length);
  assert.equal(manifest.counts.claim, 9);
  assert.equal(manifest.counts.opportunity, 31);
});

test("search, llms export, and fit assessment expose bounded cited context", async () => {
  const records = await loadKnowledgeRecords();
  const results = searchKnowledge(records, { query: "agent tool firewall guardrail", limit: 5 });
  assert.ok(results.length > 0);
  assert.match(results[0]?.record.title ?? "", /agent|tool|firewall/iu);
  const llms = buildLlmsTxt(records);
  assert.match(llms, /\/mcp/u);
  assert.match(llms, /Vendor Claim/u);
  const assessment = assessJevFit("Route high-volume agent tool calls by semantic risk and ask a human when confidence is low.", records);
  assert.ok(["strong", "promising"].includes(assessment.fit));
  assert.ok(assessment.candidateDecisionPoints.length > 0);
  assert.ok(assessment.keepDeterministic.length > 0);
});

test("MCP lists read-only research tools and returns claim provenance", async () => {
  const server = await createJevMcpServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "jev-atlas-tests", version: "1.0.0" });
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  try {
    const tools = await client.listTools();
    assert.deepEqual(tools.tools.map((tool) => tool.name).sort(), ["assess_jev_fit", "get_build_blueprint", "get_jev_context_pack", "search_jev_knowledge", "trace_jev_claim"].sort());
    assert.ok(tools.tools.every((tool) => tool.annotations?.readOnlyHint === true));
    const resources = await client.listResources();
    assert.ok(resources.resources.some((resource) => resource.uri === "jev://overview"));
    assert.ok(resources.resources.some((resource) => resource.uri.startsWith("jev://opportunities/")));
    const response = await client.callTool({ name: "trace_jev_claim", arguments: { claim: "typed output" } });
    const text = response.content.find((entry) => entry.type === "text");
    assert.ok(text && "text" in text);
    assert.match(text.text, /counterarguments/u);
    assert.match(text.text, /docs\.typesafe\.ai/u);
  } finally {
    await client.close();
    await server.close();
  }
});
