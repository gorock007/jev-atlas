import type { RawPost } from "../types.js";

export interface ScoreResult {
  relevance: number;
  novelty: number;
  technicalDepth: number;
  buildPotential: number;
  reasons: string[];
  themes: string[];
}

const TECHNICAL_TERMS = [
  "architecture", "api", "sdk", "typed", "probability", "confidence", "calibration",
  "rlcd", "latency", "benchmark", "implementation", "workflow", "router", "routing",
  "classifier", "verification", "agent", "tool selection", "system one", "noul",
];
const BUILD_TERMS = ["built", "building", "github", "repository", "demo", "prototype", "integration", "open source", "experiment"];
const LIMIT_TERMS = ["limitation", "failure", "accuracy", "wrong", "tradeoff", "criticism", "struggle", "benchmark"];
const GENERIC_REACTION = /^(?:this is\s+)?(?:huge|wow|amazing|incredible|game changer|wild|insane|can't wait|ai is moving fast)[! .🔥🚀]*$/iu;

function matchedTerms(text: string, terms: string[]): string[] {
  return terms.filter((term) => text.includes(term));
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function scorePost(post: RawPost): ScoreResult {
  const text = post.text.toLocaleLowerCase();
  const reasons: string[] = [];
  let relevance = 0;

  const namesJev = /\bjev\b/iu.test(post.text);
  const namesTypeSafe = /\btype\s?safe(?:\s+ai)?\b/iu.test(post.text);
  const coreTerm = /\b(system one|rlcd|calibrated decisions?|jev-latest)\b/iu.test(post.text);
  if (namesJev && namesTypeSafe) {
    relevance += 42;
    reasons.push("names Jev and TypeSafe");
  } else if (namesJev && coreTerm) {
    relevance += 38;
    reasons.push("names Jev with distinctive model vocabulary");
  } else if (namesJev) {
    relevance += 16;
    reasons.push("names Jev without a strong identity signal");
  } else if (namesTypeSafe && coreTerm) {
    relevance += 35;
    reasons.push("distinctive TypeSafe/System One terminology");
  }

  const technical = matchedTerms(text, TECHNICAL_TERMS);
  const building = matchedTerms(text, BUILD_TERMS);
  const limitations = matchedTerms(text, LIMIT_TERMS);
  relevance += Math.min(28, technical.length * 5);
  relevance += Math.min(18, building.length * 6);
  relevance += Math.min(12, limitations.length * 4);
  if (technical.length) reasons.push(`technical signals: ${technical.slice(0, 4).join(", ")}`);
  if (building.length) reasons.push(`build signals: ${building.slice(0, 3).join(", ")}`);
  if (limitations.length) reasons.push(`evidence/limitation signals: ${limitations.slice(0, 3).join(", ")}`);

  if (post.links.some((link) => /github\.com|gitlab\.com|codeberg\.org/iu.test(link))) {
    relevance += 12;
    reasons.push("links to source code");
  } else if (post.links.length > 0) {
    relevance += 5;
    reasons.push("contains an external source");
  }

  const wordCount = post.text.trim().split(/\s+/u).filter(Boolean).length;
  if (wordCount >= 35) relevance += 8;
  else if (wordCount < 6) relevance -= 15;

  if (GENERIC_REACTION.test(post.text.trim())) {
    relevance -= 45;
    reasons.push("generic reaction with no substantive content");
  }

  // Engagement is capped at a small contribution: it is corroborating context, not quality.
  const engagement = post.metrics.likes + post.metrics.replies * 2 + post.metrics.quotes * 2 + post.metrics.reposts;
  relevance += Math.min(5, Math.log10(engagement + 1) * 2);

  const novelty = clamp(20 + limitations.length * 15 + building.length * 10 + (post.links.length ? 10 : 0) + Math.min(20, wordCount / 3));
  const technicalDepth = clamp(technical.length * 11 + limitations.length * 6 + Math.min(30, wordCount / 2));
  const buildPotential = clamp(building.length * 15 + technical.length * 5 + (post.links.length ? 15 : 0));
  const themes = [...new Set([...technical, ...limitations])];

  return { relevance: clamp(relevance), novelty, technicalDepth, buildPotential, reasons, themes };
}
