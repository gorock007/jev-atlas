import assert from "node:assert/strict";
import { readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import { loadKnowledgeRecords, relatedRecords } from "../src/knowledge/repository.js";
import { ADDRESSABLE_KINDS, canonicalPathFor, idSlug, resourceUriFor } from "../src/knowledge/paths.js";
import { OPPORTUNITY_LENSES, OPPORTUNITY_LENS_IDS } from "../src/knowledge/lenses.js";
import { BUILD_IDEAS } from "../src/research/catalog.js";
import { createJevMcpServer } from "../src/mcp/server.js";

/** Resolves a website path to the App Router directory that must render it. */
async function routeExists(path: string): Promise<boolean> {
  const segments = path.split("/").filter(Boolean);
  let dir = resolve(process.cwd(), "src/app");
  for (const segment of segments) {
    const entries = await readdir(dir);
    const literal = entries.find((entry) => entry === segment);
    const dynamic = entries.find((entry) => entry.startsWith("[") && entry.endsWith("]"));
    const next = literal ?? dynamic;
    if (!next) return false;
    dir = resolve(dir, next);
  }
  return stat(resolve(dir, "page.tsx")).then(() => true, () => false);
}

test("every opportunity carries an authored lens and every lens is populated", () => {
  assert.equal(new Set(OPPORTUNITY_LENSES.map((lens) => lens.id)).size, OPPORTUNITY_LENSES.length);
  assert.equal(OPPORTUNITY_LENSES.length, OPPORTUNITY_LENS_IDS.length);
  for (const idea of BUILD_IDEAS) {
    assert.ok(OPPORTUNITY_LENS_IDS.includes(idea.lens), `${idea.name} has an unknown lens: ${idea.lens}`);
  }
  for (const lens of OPPORTUNITY_LENSES) {
    assert.ok(BUILD_IDEAS.some((idea) => idea.lens === lens.id), `no opportunity is mapped to ${lens.id}`);
  }
});

test("every knowledge record resolves to a website route that exists", async () => {
  const records = await loadKnowledgeRecords();
  const paths = [...new Set(records.map((record) => record.canonicalPath))];
  for (const path of paths) {
    assert.ok(path.startsWith("/"), `canonical path must be absolute: ${path}`);
    assert.ok(await routeExists(path), `no route renders ${path}`);
  }
  for (const record of records.filter((entry) => ADDRESSABLE_KINDS.includes(entry.kind))) {
    assert.equal(record.canonicalPath, canonicalPathFor(record.kind, idSlug(record.id)));
    assert.ok(record.canonicalPath.split("/").length === 3, `addressable records need a per-record page: ${record.canonicalPath}`);
  }
});

test("MCP resource URIs mirror the website's canonical paths", async () => {
  const records = await loadKnowledgeRecords();
  const server = await createJevMcpServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "jev-atlas-parity", version: "1.0.0" });
  await server.connect(serverTransport);
  await client.connect(clientTransport);
  try {
    const listed = new Set((await client.listResources()).resources.map((resource) => resource.uri));
    for (const record of records.filter((entry) => ADDRESSABLE_KINDS.includes(entry.kind))) {
      const uri = resourceUriFor(record.kind, idSlug(record.id));
      assert.ok(listed.has(uri), `MCP is missing a resource for ${record.id}`);
      assert.ok(uri.endsWith(record.canonicalPath.split("/").pop() ?? ""), `${uri} does not mirror ${record.canonicalPath}`);
    }
    assert.ok(listed.has("jev://mental-models"));

    const templates = await client.listResourceTemplates();
    assert.ok(templates.resourceTemplates.some((template) => template.uriTemplate === "jev://context-packs/{domain}"));

    const pack = await client.readResource({ uri: "jev://context-packs/agent-tool-gating" });
    const text = pack.contents[0];
    assert.ok(text && "text" in text && text.text.includes("Agent tool gating"));
    assert.match(String((text as { text: string }).text), /Evidence status/u);
  } finally {
    await client.close();
    await server.close();
  }
});

test("related records stay on-topic, balanced across kinds, and exclude the record itself", async () => {
  const records = await loadKnowledgeRecords();
  const firewall = records.find((record) => record.id === "opportunity:agent-tool-firewall");
  assert.ok(firewall);
  const related = relatedRecords(firewall, records, { kinds: ["pattern", "project", "claim"], limit: 4 });
  assert.ok(related.length > 0);
  assert.ok(related.every((record) => record.id !== firewall.id));
  assert.ok(related.every((record) => ["pattern", "project", "claim"].includes(record.kind)));
  // Short records must not be crowded out by wordier kinds: a case study has to
  // be able to reach its reusable pattern.
  assert.ok(related.some((record) => record.kind === "pattern"), "no pattern surfaced for a gating opportunity");

  for (const project of records.filter((record) => record.kind === "project")) {
    const siblings = relatedRecords(project, records, { kinds: ["pattern", "opportunity", "claim"], limit: 4 });
    assert.ok(siblings.some((record) => record.kind === "pattern"), `${project.id} surfaced no reusable pattern`);
  }
});
