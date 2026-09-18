import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import type { ProcessedPost, ResearchAnalysis, RunState } from "@/types";

export interface ResearchDocument {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  filename: string;
}

export interface LoadedDocument extends ResearchDocument {
  markdown: string;
  headings: Array<{ id: string; title: string; level: number }>;
  readingMinutes: number;
}

export const RESEARCH_DOCUMENTS: ResearchDocument[] = [
  {
    slug: "report",
    title: "Jev Research Report",
    eyebrow: "Primary synthesis",
    description: "The complete view: evidence, developer activity, architectures, limitations, and opportunities.",
    filename: "JEV-REPORT.md",
  },
  {
    slug: "foundations",
    title: "Jev Foundations",
    eyebrow: "Source classification",
    description: "Facts, vendor claims, independent observations, opinions, speculation, and unknowns.",
    filename: "jev-foundations.md",
  },
  {
    slug: "claims",
    title: "Research Claims",
    eyebrow: "Evidence ledger",
    description: "Important claims with status, evidence, counterarguments, sources, and open questions.",
    filename: "claims.md",
  },
  {
    slug: "projects",
    title: "What People Are Building",
    eyebrow: "Ecosystem activity",
    description: "Located projects and demonstrations, kept separate from proposals and speculation.",
    filename: "what-people-are-building.md",
  },
  {
    slug: "mental-models",
    title: "Emerging Mental Models",
    eyebrow: "How developers frame Jev",
    description: "Competing interpretations: classifier, router, verifier, policy layer, complement, or replacement.",
    filename: "mental-models.md",
  },
  {
    slug: "architecture-patterns",
    title: "Architecture Patterns",
    eyebrow: "Repeated structures",
    description: "Decision sidecars, cascade routers, confidence gates, quorums, and deterministic action layers.",
    filename: "architecture-patterns.md",
  },
  {
    slug: "build-ideas",
    title: "Build Ideas",
    eyebrow: "31 grounded hypotheses",
    description: "Detailed product hypotheses with MVPs, validation experiments, evidence, and unknowns.",
    filename: "build-ideas.md",
  },
  {
    slug: "build-opportunities",
    title: "Build Opportunities",
    eyebrow: "Indie-developer shortlist",
    description: "The highest-leverage experiments ranked for tractability, proof value, and open-source potential.",
    filename: "build-opportunities.md",
  },
];

async function readJson<T>(path: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

function slugify(value: string): string {
  return value
    .toLocaleLowerCase()
    .replace(/[`*_]/gu, "")
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "");
}

export async function loadAnalysis(): Promise<ResearchAnalysis | null> {
  return readJson<ResearchAnalysis>(resolve(process.cwd(), "data/processed/analysis.json"));
}

export async function loadProcessedPosts(): Promise<ProcessedPost[]> {
  try {
    const contents = await readFile(resolve(process.cwd(), "data/processed/posts.jsonl"), "utf8");
    return contents.split("\n").filter(Boolean).map((line) => JSON.parse(line) as ProcessedPost);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function loadRunSummary(): Promise<{
  requests: number;
  returnedPosts: number;
  estimatedSpendUsd: number;
  runs: number;
}> {
  const dataDir = resolve(process.cwd(), "data");
  let names: string[] = [];
  try {
    names = await readdir(dataDir);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const states = (await Promise.all(
    names.filter((name) => name.endsWith("run-state.json")).map((name) => readJson<RunState>(resolve(dataDir, name))),
  )).filter((state): state is RunState => state !== null);
  return states.reduce((summary, state) => ({
    requests: summary.requests + state.requestCount,
    returnedPosts: summary.returnedPosts + state.postsFetched,
    estimatedSpendUsd: summary.estimatedSpendUsd + state.estimatedSpendUsd,
    runs: summary.runs + 1,
  }), { requests: 0, returnedPosts: 0, estimatedSpendUsd: 0, runs: 0 });
}

export async function loadDocument(slug: string): Promise<LoadedDocument | null> {
  const document = RESEARCH_DOCUMENTS.find((entry) => entry.slug === slug);
  if (!document) return null;
  const markdown = await readFile(resolve(process.cwd(), "research", document.filename), "utf8");
  const headings = markdown.split("\n").flatMap((line) => {
    const match = /^(#{2,3})\s+(.+)$/u.exec(line);
    if (!match?.[1] || !match[2]) return [];
    const title = match[2].replace(/[*_`]/gu, "").trim();
    return [{ id: slugify(title), title, level: match[1].length }];
  });
  const words = markdown.replace(/[#*`|[\]()_-]/gu, " ").split(/\s+/u).filter(Boolean).length;
  return { ...document, markdown, headings, readingMinutes: Math.max(1, Math.ceil(words / 220)) };
}
