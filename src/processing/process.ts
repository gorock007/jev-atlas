import { resolve } from "node:path";
import type { ProcessedPost, RawPost } from "../types.js";
import { readJsonLines, replaceJsonLines } from "../utils/files.js";
import { classify } from "./classify.js";
import { projectLinks } from "./links.js";
import { scorePost } from "./relevance.js";
import { extractKeyClaims } from "./claims.js";

function summarize(text: string): string {
  const collapsed = text.replace(/\s+/gu, " ").trim();
  if (collapsed.length <= 240) return collapsed;
  return `${collapsed.slice(0, 237).trimEnd()}…`;
}

export async function processPosts(rootDir = process.cwd()): Promise<ProcessedPost[]> {
  const inputPath = resolve(rootDir, "data/raw/posts.jsonl");
  const outputPath = resolve(rootDir, "data/processed/posts.jsonl");
  const raw = await readJsonLines<RawPost>(inputPath);
  const unique = new Map<string, RawPost>();
  for (const post of raw) if (!unique.has(post.id)) unique.set(post.id, post);

  const processed = [...unique.values()].map((post): ProcessedPost => {
    const scores = scorePost(post);
    return {
      post,
      categories: classify(post.text),
      relevance_score: scores.relevance,
      novelty_score: scores.novelty,
      technical_depth: scores.technicalDepth,
      build_potential: scores.buildPotential,
      score_reasons: scores.reasons,
      summary: summarize(post.text),
      // Extractive only: every string remains attributable to the source post.
      key_claims: extractKeyClaims(post.text),
      linked_projects: projectLinks(post.links),
      themes: scores.themes,
    };
  }).sort((a, b) => b.relevance_score - a.relevance_score || b.technical_depth - a.technical_depth);

  await replaceJsonLines(outputPath, processed);
  return processed;
}
