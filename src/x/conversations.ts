import { resolve } from "node:path";
import type { ProcessedPost } from "../types.js";
import { readJsonLines } from "../utils/files.js";
import type { ResearchQuery } from "./queries.js";

const EXPANSION_CATEGORIES = new Set([
  "CODE", "PROJECT", "EXPERIMENT", "BENCHMARK", "ARCHITECTURE", "CRITICISM", "USE_CASE",
]);

export async function buildConversationQueries(
  rootDir = process.cwd(),
  threshold = 85,
  maximum = 5,
): Promise<ResearchQuery[]> {
  const posts = await readJsonLines<ProcessedPost>(resolve(rootDir, "data/processed/posts.jsonl"));
  const selected = posts.filter((entry) =>
    entry.relevance_score >= threshold
    && entry.post.conversation_id
    && entry.categories.some((category) => EXPANSION_CATEGORIES.has(category)),
  );
  const unique = new Map<string, ProcessedPost>();
  for (const entry of selected) {
    const conversationId = entry.post.conversation_id;
    if (conversationId && !unique.has(conversationId)) unique.set(conversationId, entry);
  }
  return [...unique.entries()].slice(0, maximum).map(([conversationId, entry]) => ({
    name: `conversation-${conversationId}`,
    query: `conversation_id:${conversationId} -is:retweet lang:en`,
    rationale: `Selective expansion of ${entry.post.url} (relevance ${entry.relevance_score})`,
  }));
}
