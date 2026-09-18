import assert from "node:assert/strict";
import test from "node:test";
import type { RawPost } from "../src/types.js";
import { scorePost } from "../src/processing/relevance.js";
import { classify } from "../src/processing/classify.js";

function post(text: string, links: string[] = []): RawPost {
  return {
    id: "1",
    text,
    author_id: null,
    username: null,
    author_name: null,
    created_at: null,
    url: "https://x.com/i/web/status/1",
    conversation_id: null,
    in_reply_to_user_id: null,
    metrics: { likes: 0, replies: 0, reposts: 0, quotes: 0, bookmarks: null, impressions: null },
    links,
    query_source: "test",
    collected_at: "2026-09-18T00:00:00.000Z",
  };
}

test("technical low-engagement evidence outranks generic reactions", () => {
  const technical = scorePost(post(
    "I built a TypeSafe AI Jev router and benchmarked confidence thresholds, latency, and failure cases. Code and dataset:",
    ["https://github.com/example/jev-router"],
  ));
  const reaction = scorePost(post("This is huge 🔥"));
  assert.ok(technical.relevance >= 85);
  assert.ok(reaction.relevance < 40);
});

test("classification supports multiple research labels", () => {
  const categories = classify("I built a GitHub demo to benchmark Jev agent routing latency and limitations.");
  assert.ok(categories.includes("CODE"));
  assert.ok(categories.includes("BENCHMARK"));
  assert.ok(categories.includes("ROUTING"));
  assert.ok(categories.includes("LIMITATION"));
});
