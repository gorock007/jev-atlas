import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import type { ProcessedPost } from "../src/types.js";
import { appendJsonLines } from "../src/utils/files.js";
import { analyzeResearch } from "../src/research/analyze.js";
import { generateReport } from "../src/reporting/report.js";
import { BUILD_IDEAS } from "../src/research/catalog.js";
import { buildAdaptiveQueries } from "../src/x/queries.js";
import { buildConversationQueries } from "../src/x/conversations.js";

function processed(overrides: Partial<ProcessedPost> = {}): ProcessedPost {
  return {
    post: {
      id: "1",
      text: "I built a Jev TypeSafe architecture demo with routing and a benchmark.",
      author_id: null,
      username: null,
      author_name: null,
      created_at: "2026-09-18T00:00:00.000Z",
      url: "https://x.com/i/web/status/1",
      conversation_id: "1",
      in_reply_to_user_id: null,
      metrics: { likes: 1, replies: 1, reposts: 0, quotes: 0, bookmarks: null, impressions: null },
      links: ["https://github.com/example/jev-demo"],
      query_source: "test",
      collected_at: "2026-09-18T00:00:00.000Z",
    },
    categories: ["PROJECT", "CODE", "ARCHITECTURE"],
    relevance_score: 90,
    novelty_score: 80,
    technical_depth: 80,
    build_potential: 90,
    score_reasons: ["test"],
    summary: "A Jev architecture demo.",
    key_claims: ["The author built a Jev architecture demo."],
    linked_projects: ["https://github.com/example/jev-demo"],
    themes: ["routing"],
    ...overrides,
  };
}

test("catalog contains at least thirty fully specified Jev-native ideas", () => {
  assert.ok(BUILD_IDEAS.length >= 30);
  for (const idea of BUILD_IDEAS) {
    assert.ok(idea.name && idea.problem && idea.whyJev && idea.mvp && idea.validation);
    assert.ok(idea.evidence.length > 0);
  }
});

test("adaptive queries prioritize local signals and conversation expansion is selective", async () => {
  const rootDir = await mkdtemp(join(tmpdir(), "jev-research-"));
  const high = processed();
  const low = processed({
    post: { ...high.post, id: "2", url: "https://x.com/i/web/status/2", conversation_id: "2" },
    relevance_score: 84,
  });
  await appendJsonLines(join(rootDir, "data/processed/posts.jsonl"), [high, low]);
  const adaptive = buildAdaptiveQueries([high, low]);
  assert.equal(adaptive.length, 4);
  assert.match(adaptive[0]?.query ?? "", /Jev/);
  const conversations = await buildConversationQueries(rootDir, 85);
  assert.equal(conversations.length, 1);
  assert.match(conversations[0]?.query ?? "", /^conversation_id:1/);
});

test("analysis and report generate all required research artifacts from cached data", async () => {
  const rootDir = await mkdtemp(join(tmpdir(), "jev-report-"));
  await appendJsonLines(join(rootDir, "data/processed/posts.jsonl"), [processed()]);
  const analysis = await analyzeResearch(rootDir);
  assert.ok(analysis.claims.length >= 8);
  assert.ok(analysis.patterns.length >= 5);
  assert.ok(analysis.ideas.length >= 30);
  await generateReport(rootDir);
  const report = await readFile(join(rootDir, "research/JEV-REPORT.md"), "utf8");
  for (const heading of [
    "## Executive Summary", "## What Jev Actually Is", "## Criticism",
    "## Jev-Native Products", "## Build Ideas", "## Open Questions", "## Sources",
  ]) assert.match(report, new RegExp(heading));
});

