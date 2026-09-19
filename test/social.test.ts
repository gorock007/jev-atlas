import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultSocialCardCopy,
  recordSocialCardCopy,
  SOCIAL_CARD_CONTENT_TYPE,
  SOCIAL_CARD_SIZE,
  truncateHeadline,
} from "../src/lib/social-card.js";
import { loadKnowledgeRecords } from "../src/knowledge/repository.js";

test("social card image is a 1200x630 PNG", () => {
  assert.equal(SOCIAL_CARD_SIZE.width, 1200);
  assert.equal(SOCIAL_CARD_SIZE.height, 630);
  assert.equal(SOCIAL_CARD_CONTENT_TYPE, "image/png");
});

test("truncateHeadline leaves short text untouched and clips long text with an ellipsis", () => {
  assert.equal(truncateHeadline("What can you actually build with Jev?"), "What can you actually build with Jev?");
  const long = "x".repeat(200);
  const truncated = truncateHeadline(long, 170);
  assert.equal(truncated.length, 170);
  assert.ok(truncated.endsWith("…"));
});

test("default card copy reads counts from the analysis artifact instead of hardcoding them", () => {
  const copy = defaultSocialCardCopy({
    generatedAt: "",
    dataset: { totalPosts: 0, retainedPosts: 0, analyzedPosts: 0, highValuePosts: 0 },
    categoryCounts: {},
    claims: new Array(9).fill(null) as never,
    projects: [],
    patterns: [],
    ideas: new Array(31).fill(null) as never,
    topEvidence: [],
  });
  assert.equal(copy.headline, "What can you actually build with Jev?");
  assert.match(copy.footer, /31 build blueprints/);
  assert.match(copy.footer, /9 tracked claims/);

  const withoutAnalysis = defaultSocialCardCopy(null);
  assert.match(withoutAnalysis.footer, /31 build blueprints/);
  assert.match(withoutAnalysis.footer, /9 tracked claims/);
});

test("record card copy labels the record kind and status, and never overflows a long claim title", async () => {
  const records = await loadKnowledgeRecords();
  const longestClaim = records
    .filter((record) => record.kind === "claim")
    .reduce((longest, record) => (record.title.length > longest.title.length ? record : longest));

  const copy = recordSocialCardCopy(longestClaim);
  assert.match(copy.label, /EVIDENCE LEDGER/);
  assert.match(copy.label, new RegExp(longestClaim.status.toUpperCase()));
  assert.ok(copy.headline.length <= 170);

  const idea = records.find((record) => record.kind === "opportunity");
  assert.ok(idea);
  assert.match(recordSocialCardCopy(idea!).label, /BUILD BLUEPRINT/);

  const project = records.find((record) => record.kind === "project");
  assert.ok(project);
  assert.match(recordSocialCardCopy(project!).label, /CASE STUDY/);

  const pattern = records.find((record) => record.kind === "pattern");
  assert.ok(pattern);
  assert.match(recordSocialCardCopy(pattern!).label, /ARCHITECTURE PATTERN/);
});
