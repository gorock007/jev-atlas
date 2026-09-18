import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { collect } from "../src/x/collector.js";
import { XClient } from "../src/x/client.js";
import { readJson } from "../src/utils/files.js";
import type { RunState } from "../src/types.js";

test("collector paginates, deduplicates, checkpoints, and uses current post.fields", async () => {
  const rootDir = await mkdtemp(join(tmpdir(), "jev-collector-"));
  const requestedUrls: URL[] = [];
  const pages = [
    {
      data: [
        { id: "1", text: "TypeSafe AI Jev typed routing architecture benchmark", public_metrics: {} },
        { id: "2", text: "TypeSafe AI Jev GitHub integration demo", public_metrics: {} },
      ],
      meta: { result_count: 2, next_token: "page-two" },
    },
    {
      data: [
        { id: "2", text: "TypeSafe AI Jev GitHub integration demo", public_metrics: {} },
        { id: "3", text: "TypeSafe AI Jev limitation and accuracy experiment", public_metrics: {} },
      ],
      meta: { result_count: 2 },
    },
  ];
  let page = 0;
  const mockFetch = (async (input: string | URL | Request) => {
    requestedUrls.push(new URL(typeof input === "string" || input instanceof URL ? input : input.url));
    return new Response(JSON.stringify(pages[page++]), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }) as typeof fetch;
  const client = new XClient("not-a-real-token", "https://example.test", mockFetch);

  const state = await collect({
    budgetUsd: 3,
    maxPosts: 100,
    maxRequests: 5,
    relevanceThreshold: 60,
    highValueThreshold: 85,
    queries: [{ name: "test", query: '"Jev" typesafe', rationale: "test" }],
    rootDir,
  }, client);

  assert.equal(requestedUrls.length, 2);
  assert.equal(requestedUrls[0]?.searchParams.has("post.fields"), true);
  assert.equal(requestedUrls[0]?.searchParams.has("tweet.fields"), false);
  assert.equal(requestedUrls[1]?.searchParams.get("next_token"), "page-two");
  assert.equal(state.postsFetched, 4);
  assert.equal(state.uniquePosts, 3);
  assert.equal(state.requestCount, 2);
  assert.equal(state.estimatedSpendUsd, 0.02);
  assert.equal(state.stopReason, "complete");

  const lines = (await readFile(join(rootDir, "data/raw/posts.jsonl"), "utf8")).trim().split("\n");
  assert.equal(lines.length, 3);
  const persisted = await readJson<RunState | null>(join(rootDir, "data/run-state.json"), null);
  assert.equal(persisted?.uniquePosts, 3);
  assert.equal(persisted?.queries.test?.completed, true);
});
