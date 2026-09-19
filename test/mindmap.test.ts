import assert from "node:assert/strict";
import { readFile, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";
import { OPPORTUNITY_LENSES } from "../src/knowledge/lenses.js";
import { buildMindmap, flattenMindmap, START_ANCHORS } from "../src/knowledge/mindmap.js";
import { loadKnowledgeRecords } from "../src/knowledge/repository.js";

/** Resolves a website path to the App Router page or route handler that serves it. */
async function routeExists(path: string): Promise<boolean> {
  let dir = resolve(process.cwd(), "src/app");
  for (const segment of path.split("/").filter(Boolean)) {
    const entries = await readdir(dir);
    const next = entries.find((entry) => entry === segment) ?? entries.find((entry) => entry.startsWith("[") && entry.endsWith("]"));
    if (!next) return false;
    dir = resolve(dir, next);
  }
  const exists = (file: string) => stat(resolve(dir, file)).then(() => true, () => false);
  return (await exists("page.tsx")) || (await exists("route.ts"));
}

test("mind map counts match the knowledge repository", async () => {
  const records = await loadKnowledgeRecords();
  const nodes = new Map(flattenMindmap(buildMindmap(records)).map((node) => [node.id, node]));
  const count = (kind: string) => records.filter((record) => record.kind === kind).length;

  assert.equal(nodes.get("proven")?.count, count("claim"));
  assert.equal(nodes.get("built")?.count, count("project"));
  assert.equal(nodes.get("build")?.count, count("opportunity"));
  assert.equal(nodes.get("proven:evidence")?.count, count("evidence"));
  assert.equal(nodes.get("fit:patterns")?.count, count("pattern"));
  assert.equal(nodes.get("what:library")?.count, count("document"));
  assert.equal(nodes.get("agent:manifest")?.count, records.length);

  for (const lens of OPPORTUNITY_LENSES) {
    const node = nodes.get(`lens:${lens.id}`);
    assert.equal(node?.count, records.filter((record) => record.metadata.lens === lens.id).length, lens.id);
    assert.equal(node?.children?.length, node?.count, `${lens.id} lists every blueprint it counts`);
  }
  const lensTotal = OPPORTUNITY_LENSES.reduce((sum, lens) => sum + (nodes.get(`lens:${lens.id}`)?.count ?? 0), 0);
  assert.equal(lensTotal, count("opportunity"), "every opportunity sits under exactly one lens");
});

test("every claim, project, and opportunity appears once with its evidence status preserved", async () => {
  const records = await loadKnowledgeRecords();
  const nodes = flattenMindmap(buildMindmap(records));
  for (const record of records.filter((entry) => ["claim", "project", "opportunity"].includes(entry.kind))) {
    const matches = nodes.filter((node) => node.id === record.id);
    assert.equal(matches.length, 1, `${record.id} appears ${matches.length} times`);
    assert.equal(matches[0]?.href, record.canonicalPath);
    assert.equal(matches[0]?.status, record.status, `${record.id} lost its status`);
  }

  const vendorClaims = records.filter((record) => record.kind === "claim" && record.status === "Vendor Claim");
  const vendorGroup = nodes.find((node) => node.id === "proven:vendor-claim");
  assert.equal(vendorGroup?.label, "Vendor Claim");
  assert.deepEqual(vendorGroup?.children?.map((node) => node.id).sort(), vendorClaims.map((record) => record.id).sort());
  for (const group of nodes.filter((node) => /^(proven|built):/u.test(node.id) && node.children)) {
    for (const child of group.children ?? []) assert.equal(child.status, group.status, `${child.id} is grouped under the wrong status`);
  }
});

test("every mind map node links to a route that exists", async () => {
  const records = await loadKnowledgeRecords();
  const nodes = flattenMindmap(buildMindmap(records));
  assert.equal(new Set(nodes.map((node) => node.id)).size, nodes.length, "node ids are unique");
  for (const node of nodes) {
    assert.ok(node.href.startsWith("/"), `${node.id} has no internal href`);
    const path = node.href.split("#")[0] ?? "/";
    assert.ok(await routeExists(path), `${node.id} links to ${node.href}, which has no route`);
  }

  const lensIds = new Set<string>(OPPORTUNITY_LENSES.map((lens) => lens.id));
  for (const node of nodes.filter((entry) => entry.href.startsWith("/map#"))) assert.ok(lensIds.has(node.href.slice(5)), node.href);

  // The two practice pages are leaves, not collections, so nothing else would
  // catch them silently dropping out of the tree.
  const leafParents = [["what", "what:guide", "/guide"], ["fit", "fit:cost", "/cost"]] as const;
  for (const [parent, id, href] of leafParents) {
    const node = nodes.find((entry) => entry.id === id);
    assert.equal(node?.href, href, `${id} does not link to ${href}`);
    const under = nodes.find((entry) => entry.id === parent)?.children?.some((child) => child.id === id);
    assert.ok(under, `${id} does not sit under ${parent}`);
  }

  const startPage = await readFile(resolve(process.cwd(), "src/app/start/page.tsx"), "utf8");
  for (const [key, anchor] of Object.entries(START_ANCHORS)) {
    assert.ok(startPage.includes(`START_ANCHORS.${key}`), `/start does not render the #${anchor} anchor`);
    assert.ok(nodes.some((node) => node.href === `/start#${anchor}`), `no node links to /start#${anchor}`);
  }
});
