import { loadAnalysis, loadDocument, RESEARCH_DOCUMENTS } from "@/lib/research-data";
import { formatCategory } from "@/lib/format";
import type { BuildIdea, ProjectFinding, ResearchClaim } from "@/types";
import { findLens } from "./lenses";
import { canonicalPathFor, idSlug, knowledgeId, knowledgeSlug } from "./paths";
import {
  KNOWLEDGE_KINDS,
  type EvidenceStatus,
  type JevFitAssessment,
  type KnowledgeKind,
  type KnowledgeManifest,
  type KnowledgeRecord,
  type KnowledgeSearchOptions,
  type KnowledgeSearchResult,
  type KnowledgeSource,
} from "./types";

const OFFICIAL_SOURCES: KnowledgeSource[] = [
  { url: "https://docs.typesafe.ai/primitives", label: "TypeSafe primitives", sourceClass: "official" },
  { url: "https://docs.typesafe.ai/concepts/how-to-build-with-system-one", label: "How to build with TypeSafe", sourceClass: "official" },
  { url: "https://typesafe.ai/blog/introducing-system-one-models-and-jev", label: "Introducing System One Models and Jev", sourceClass: "official" },
];

const KIND_ORDER: Record<KnowledgeKind, number> = {
  overview: 0,
  pattern: 1,
  project: 2,
  opportunity: 3,
  claim: 4,
  document: 5,
  evidence: 6,
};

function sourceClass(url: string): KnowledgeSource["sourceClass"] {
  if (/docs\.typesafe\.ai|typesafe\.ai/u.test(url)) return "official";
  if (/github\.com|gitlab\.com/u.test(url)) return "repository";
  if (/x\.com|twitter\.com/u.test(url)) return "social";
  return "research";
}

function sourcesFromUrls(urls: string[]): KnowledgeSource[] {
  return [...new Set(urls)].map((url, index) => ({ url, label: `Source ${index + 1}`, sourceClass: sourceClass(url) }));
}

function recordBase(generatedAt: string) {
  return { generatedAt, lastVerifiedAt: generatedAt, relatedIds: [] as string[] };
}

function claimRecord(claim: ResearchClaim, index: number, generatedAt: string): KnowledgeRecord {
  const id = knowledgeId("claim", claim.claim);
  return {
    ...recordBase(generatedAt),
    id,
    kind: "claim",
    title: claim.claim,
    summary: claim.evidence,
    body: `## Evidence\n\n${claim.evidence}\n\n## Counterarguments\n\n${claim.counterarguments}\n\n## Open questions\n\n${claim.openQuestions}`,
    status: claim.status,
    tags: ["claim", claim.status.toLocaleLowerCase().replaceAll(" ", "-")],
    sources: sourcesFromUrls(claim.sources),
    canonicalPath: canonicalPathFor("claim", idSlug(id)),
    limitations: [claim.counterarguments, claim.openQuestions],
    metadata: { index: index + 1, openQuestions: claim.openQuestions, counterarguments: claim.counterarguments },
  };
}

function projectRecord(project: ProjectFinding, generatedAt: string): KnowledgeRecord {
  const id = knowledgeId("project", project.name);
  return {
    ...recordBase(generatedAt),
    id,
    kind: "project",
    title: project.name,
    summary: project.description,
    body: `## Builder\n\n${project.builder}\n\n## Jev's role\n\n${project.jevRole}\n\n## Architecture\n\n${project.architecture}\n\n## Why it matters\n\n${project.insight}`,
    status: project.status === "ACTUALLY BUILT" ? "Observed" : "Authored Hypothesis",
    tags: ["project", project.status.toLocaleLowerCase().replaceAll(" ", "-"), project.jevRole],
    sources: sourcesFromUrls([project.source, ...(project.repositoryOrDemo ? [project.repositoryOrDemo] : [])]),
    canonicalPath: canonicalPathFor("project", idSlug(id)),
    limitations: ["A located repository or demonstration does not establish production reliability or independent validation."],
    metadata: { builder: project.builder, projectStatus: project.status, architecture: project.architecture, repositoryOrDemo: project.repositoryOrDemo },
  };
}

function opportunityRecord(idea: BuildIdea, generatedAt: string): KnowledgeRecord {
  const id = knowledgeId("opportunity", idea.name);
  const lens = findLens(idea.lens);
  return {
    ...recordBase(generatedAt),
    id,
    kind: "opportunity",
    title: idea.name,
    summary: idea.product,
    body: `## Problem\n\n${idea.problem}\n\n## Why Jev\n\n${idea.whyJev}\n\n## Architecture\n\n${idea.architecture}\n\n## Current alternative\n\n${idea.currentAlternative}\n\n## Jev advantage\n\n${idea.advantage}\n\n## 1–7 day MVP\n\n${idea.mvp}\n\n## Validation experiment\n\n${idea.validation}\n\n## Unknowns\n\n${idea.unknowns}`,
    status: "Authored Hypothesis",
    tags: ["opportunity", idea.confidence.toLocaleLowerCase(), `indie-fit-${idea.indieFit}`, `lens:${idea.lens}`],
    sources: sourcesFromUrls(idea.evidence),
    canonicalPath: canonicalPathFor("opportunity", idSlug(id)),
    limitations: [idea.unknowns, "This is a research hypothesis, not evidence of product demand or Jev performance in this workflow."],
    metadata: {
      lens: idea.lens,
      lensTitle: lens?.title ?? idea.lens,
      lensProperty: lens?.property ?? "",
      confidence: idea.confidence,
      confidenceReason: idea.confidenceReason,
      indieFit: idea.indieFit,
      problem: idea.problem,
      architecture: idea.architecture,
      mvp: idea.mvp,
      validation: idea.validation,
      unknowns: idea.unknowns,
    },
  };
}

export async function loadKnowledgeRecords(): Promise<KnowledgeRecord[]> {
  const analysis = await loadAnalysis();
  if (!analysis) return [];
  const generatedAt = analysis.generatedAt;
  const documents = (await Promise.all(RESEARCH_DOCUMENTS.map((document) => loadDocument(document.slug)))).filter((document) => document !== null);
  const records: KnowledgeRecord[] = [
    {
      ...recordBase(generatedAt),
      id: "overview:what-is-jev",
      kind: "overview",
      title: "What is Jev?",
      summary: "Jev is TypeSafe's System One model for fast, narrow, typed probabilistic judgments that application code can compose into workflows.",
      body: "Jev accepts structured or unstructured application state and answers explicit Choice, Score, or Noul questions. It is designed to sit inside ordinary software: code keeps control of deterministic rules and side effects while Jev handles bounded semantic judgments. It is not a chatbot, autonomous agent, general text generator, or proof that a probabilistic decision is correct.",
      status: "Official Documentation",
      tags: ["jev", "system-one", "choice", "score", "noul", "typed-decisions", "overview"],
      sources: OFFICIAL_SOURCES,
      canonicalPath: canonicalPathFor("overview", "what-is-jev"),
      limitations: ["Performance and pricing claims require workload-specific validation.", "Typed outputs constrain shape, not semantic correctness."],
      relatedIds: ["document:foundations", "document:mental-models", "document:architecture-patterns"],
      metadata: { authoritativeFor: ["concept", "primitives", "official positioning"] },
    },
    ...analysis.claims.map((claim, index) => claimRecord(claim, index, generatedAt)),
    ...analysis.projects.map((project) => projectRecord(project, generatedAt)),
    ...analysis.patterns.map((pattern) => ({
      ...recordBase(generatedAt),
      id: knowledgeId("pattern", pattern.name),
      kind: "pattern" as const,
      title: pattern.name,
      summary: pattern.description,
      body: `${pattern.description}\n\n## Caveat\n\n${pattern.caveat}`,
      status: "Plausible" as const,
      tags: ["pattern", "architecture", knowledgeSlug(pattern.name)],
      sources: sourcesFromUrls(pattern.evidence),
      canonicalPath: canonicalPathFor("pattern", knowledgeSlug(pattern.name)),
      limitations: [pattern.caveat],
      metadata: { caveat: pattern.caveat },
    })),
    ...analysis.ideas.map((idea) => opportunityRecord(idea, generatedAt)),
    ...analysis.topEvidence.map((evidence, index) => ({
      ...recordBase(generatedAt),
      id: `evidence:${index + 1}`,
      kind: "evidence" as const,
      title: evidence.summary,
      summary: evidence.summary,
      body: `Research relevance score: ${evidence.relevance}. Categories: ${evidence.categories.map(formatCategory).join(", ")}.`,
      status: "Source Evidence" as const,
      tags: ["evidence", ...evidence.categories.map((category) => category.toLocaleLowerCase())],
      sources: sourcesFromUrls([evidence.url]),
      canonicalPath: canonicalPathFor("evidence", String(index + 1)),
      limitations: ["A social post is a source artifact, not independent verification of every statement it contains."],
      metadata: { relevance: evidence.relevance, categories: evidence.categories },
    })),
    ...documents.map((document) => ({
      ...recordBase(generatedAt),
      id: `document:${document.slug}`,
      kind: "document" as const,
      title: document.title,
      summary: document.description,
      body: document.markdown,
      status: "Authored Hypothesis" as const,
      tags: ["document", document.eyebrow, document.slug],
      sources: [] as KnowledgeSource[],
      canonicalPath: canonicalPathFor("document", document.slug),
      limitations: ["This synthesis inherits the collection and scoring limitations described in the methodology."],
      metadata: { readingMinutes: document.readingMinutes, sections: document.headings.filter((heading) => heading.level === 2).length },
    })),
  ];
  return records.sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || a.title.localeCompare(b.title));
}

function normalize(value: string): string {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/gu, " ").trim();
}

function searchableText(record: KnowledgeRecord): string {
  return normalize([record.title, record.summary, record.body, record.status, record.tags.join(" "), JSON.stringify(record.metadata)].join(" "));
}

export function searchKnowledge(records: KnowledgeRecord[], options: KnowledgeSearchOptions): KnowledgeSearchResult[] {
  const limit = Math.min(Math.max(options.limit ?? 10, 1), 25);
  const phrase = normalize(options.query);
  const terms = [...new Set(phrase.split(" ").filter((term) => term.length > 1))];
  return records
    .filter((record) => (!options.kinds?.length || options.kinds.includes(record.kind)) && (!options.statuses?.length || options.statuses.includes(record.status)))
    .map((record) => {
      const title = normalize(record.title);
      const summary = normalize(record.summary);
      const tags = normalize(record.tags.join(" "));
      const all = searchableText(record);
      let score = phrase && title.includes(phrase) ? 18 : 0;
      if (phrase && summary.includes(phrase)) score += 9;
      for (const term of terms) {
        if (title.includes(term)) score += 6;
        if (tags.includes(term)) score += 4;
        if (summary.includes(term)) score += 3;
        if (all.includes(term)) score += 1;
      }
      if (!terms.length && record.kind === "overview") score = 1;
      return { score, record };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || KIND_ORDER[a.record.kind] - KIND_ORDER[b.record.kind] || a.record.title.localeCompare(b.record.title))
    .slice(0, limit);
}

const STOP_WORDS = new Set(["the", "and", "for", "with", "that", "this", "from", "into", "when", "over", "than", "each", "jev", "typesafe", "code", "decision", "decisions", "model", "models", "not", "are", "can", "has", "its", "per", "use", "used", "uses"]);

/** Crude singular folding so "threshold" and "thresholds" count as one term. */
function stem(word: string): string {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 4 && word.endsWith("es") && !word.endsWith("ses")) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

function termsOf(text: string): Set<string> {
  return new Set(normalize(text).split(" ").filter((word) => word.length > 3 && !STOP_WORDS.has(word)).map(stem));
}

/** Dice coefficient, so a short record is not punished for having few terms. */
function dice(a: Set<string>, b: Set<string>): number {
  if (!a.size || !b.size) return 0;
  return (2 * overlap(a, b)) / (a.size + b.size);
}

/**
 * Headline terms carry more weight than body terms: a pattern named
 * "Confidence gate" should still connect to an opportunity whose body explains
 * that it gates on confidence.
 */
function conceptTerms(record: KnowledgeRecord): { key: Set<string>; all: Set<string> } {
  const key = termsOf([record.title, record.tags.join(" ")].join(" "));
  const all = termsOf([record.title, record.summary, record.tags.join(" "), record.body.slice(0, 2_000)].join(" "));
  return { key, all };
}

function overlap(a: Set<string>, b: Set<string>): number {
  let count = 0;
  for (const term of a) if (b.has(term)) count += 1;
  return count;
}

/**
 * Derives sibling records by concept overlap. These are navigational
 * suggestions, not asserted relationships, so a related record never inherits
 * the evidence status of the record it was surfaced from.
 */
export function relatedRecords(record: KnowledgeRecord, records: KnowledgeRecord[], options: { kinds?: KnowledgeKind[]; limit?: number } = {}): KnowledgeRecord[] {
  const limit = Math.min(Math.max(options.limit ?? 4, 1), 12);
  const terms = conceptTerms(record);
  const explicit = new Set(record.relatedIds);
  const scored = records
    .filter((candidate) => candidate.id !== record.id && (!options.kinds?.length || options.kinds.includes(candidate.kind)))
    .map((candidate) => {
      const other = conceptTerms(candidate);
      const score = dice(terms.key, other.key) * 6
        + dice(terms.key, other.all) * 3
        + dice(terms.all, other.key) * 3
        + dice(terms.all, other.all)
        + (explicit.has(candidate.id) ? 100 : 0);
      return { candidate, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.candidate.title.localeCompare(b.candidate.title));

  // Round-robin across the requested kinds so a long, wordy kind cannot crowd
  // out a short one — a project case study should still reach its pattern.
  const byKind = new Map<KnowledgeKind, KnowledgeRecord[]>();
  for (const entry of scored) {
    const bucket = byKind.get(entry.candidate.kind) ?? [];
    bucket.push(entry.candidate);
    byKind.set(entry.candidate.kind, bucket);
  }
  const order = (options.kinds ?? [...byKind.keys()]).filter((kind) => byKind.has(kind));
  const picked: KnowledgeRecord[] = [];
  for (let round = 0; picked.length < limit && order.some((kind) => (byKind.get(kind)?.length ?? 0) > round); round += 1) {
    for (const kind of order) {
      const candidate = byKind.get(kind)?.[round];
      if (candidate && picked.length < limit) picked.push(candidate);
    }
  }
  return picked;
}

export function findKnowledgeRecord(records: KnowledgeRecord[], idOrTitle: string, kind?: KnowledgeKind): KnowledgeRecord | null {
  const target = normalize(idOrTitle);
  return records.find((record) => (!kind || record.kind === kind) && (normalize(record.id) === target || normalize(record.title) === target || record.id.endsWith(`:${knowledgeSlug(idOrTitle)}`))) ?? null;
}

export function getKnowledgeManifest(records: KnowledgeRecord[]): KnowledgeManifest {
  const latest = records.map((record) => record.lastVerifiedAt).sort().at(-1) ?? new Date(0).toISOString();
  const counts = Object.fromEntries(KNOWLEDGE_KINDS.map((kind) => [kind, records.filter((record) => record.kind === kind).length])) as Record<KnowledgeKind, number>;
  return {
    name: "Jev Atlas",
    schemaVersion: "1.0.0",
    generatedAt: latest,
    lastVerifiedAt: latest,
    recordCount: records.length,
    counts,
    interfaces: { website: "/", llms: "/llms.txt", llmsFull: "/llms-full.txt", mcp: "/mcp", api: "/api/v1/manifest.json" },
  };
}

export function renderRecordMarkdown(record: KnowledgeRecord): string {
  const sources = record.sources.length ? record.sources.map((source, index) => `${index + 1}. [${source.label}](${source.url}) — ${source.sourceClass}`).join("\n") : "No direct source links are attached to this synthesis record.";
  return `# ${record.title}\n\n- ID: \`${record.id}\`\n- Type: ${record.kind}\n- Evidence status: ${record.status}\n- Last verified: ${record.lastVerifiedAt}\n- Canonical path: ${record.canonicalPath}\n\n${record.summary}\n\n${record.body}\n\n## Limitations\n\n${record.limitations.map((item) => `- ${item}`).join("\n")}\n\n## Sources\n\n${sources}`;
}

export function renderCollectionMarkdown(title: string, records: KnowledgeRecord[]): string {
  return `# ${title}\n\n${records.map(renderRecordMarkdown).join("\n\n---\n\n")}`;
}

export function buildLlmsTxt(records: KnowledgeRecord[]): string {
  const manifest = getKnowledgeManifest(records);
  const groups = KNOWLEDGE_KINDS.map((kind) => {
    const entries = records.filter((record) => record.kind === kind).map((record) => `- [${record.title}](${record.canonicalPath}): ${record.summary} [${record.status}]`);
    return entries.length ? `## ${kind[0]?.toLocaleUpperCase()}${kind.slice(1)}\n${entries.join("\n")}` : "";
  }).filter(Boolean);
  return `# Jev Atlas\n\n> Independent, evidence-aware research about Jev, System One models, implementation patterns, projects, claims, and build opportunities.\n\nThis index contains ${manifest.recordCount} records. Prefer official TypeSafe documentation for current API contracts. Use Jev Atlas for ecosystem context, evidence status, case studies, caveats, and authored hypotheses.\n\n## Agent interfaces\n- Full context: /llms-full.txt\n- Manifest: /api/v1/manifest.json\n- Search: /api/v1/search.json?q=QUERY\n- MCP: /mcp\n- Agent setup: /agent\n\n${groups.join("\n\n")}`;
}

export function buildLlmsFullTxt(records: KnowledgeRecord[]): string {
  return `# Jev Atlas — Full research context\n\nGenerated from the canonical Jev Atlas knowledge layer. Evidence status and source provenance must be preserved when making claims.\n\n${records.map(renderRecordMarkdown).join("\n\n---\n\n")}`;
}

export function assessJevFit(workflow: string, records: KnowledgeRecord[]): JevFitAssessment {
  const text = normalize(workflow);
  const positiveDefinitions = [
    [/classif|categor|intent/u, "The workflow contains bounded classification or intent judgments."],
    [/route|triage|dispatch|assign/u, "It contains semantic routing or triage."],
    [/score|rank|prioriti|severity/u, "It needs an ordered score, ranking, or priority judgment."],
    [/verify|guard|risk|safe|policy/u, "It contains verification, risk, or guardrail decisions."],
    [/unstructured|message|email|ticket|document|text/u, "It makes decisions over unstructured state."],
    [/real time|latency|interactive|high volume|every event|repeated/u, "It may benefit from frequent or latency-sensitive judgments."],
    [/agent|tool call|mcp/u, "It contains agent or tool-selection boundaries that can be gated by typed decisions."],
  ] as const;
  const negativeDefinitions = [
    [/write|generate|compose|draft|summari[sz]e/u, "The primary requirement appears to be open-ended text generation."],
    [/plan|research the web|browse|multi step|autonomous/u, "The primary requirement may need deliberative or multi-step reasoning."],
    [/exact calculation|deterministic|database lookup|arithmetic/u, "This decision may be expressible more reliably as deterministic code."],
  ] as const;
  const positiveSignals = positiveDefinitions.filter(([pattern]) => pattern.test(text)).map(([, message]) => message);
  const nonFitSignals = negativeDefinitions.filter(([pattern]) => pattern.test(text)).map(([, message]) => message);
  const points: JevFitAssessment["candidateDecisionPoints"] = [];
  if (/classif|categor|intent|route|triage|dispatch|assign/u.test(text)) points.push({ title: "Classify or route the incoming state", primitive: "Choice", reason: "The output is likely one option from a bounded set of handlers or categories." });
  if (/score|rank|prioriti|severity|frustrat|quality/u.test(text)) points.push({ title: "Score an ordered quality or risk dimension", primitive: "Score", reason: "The output appears to lie on a defined ordered spectrum." });
  if (/verify|guard|risk|safe|policy|detect|whether|is this/u.test(text)) points.push({ title: "Evaluate a binary condition with uncertainty", primitive: "Noul", reason: "The probability of a yes/no condition can drive a threshold or escalation." });
  if (!points.length && positiveSignals.length) points.push({ title: "Decompose the semantic judgment", primitive: "Mixed", reason: "The workflow has possible Jev signals, but the atomic questions still need to be defined." });
  const fit: JevFitAssessment["fit"] = positiveSignals.length >= 3 && nonFitSignals.length === 0 ? "strong" : positiveSignals.length >= 2 ? "promising" : positiveSignals.length === 1 ? "unclear" : "weak";
  const related = searchKnowledge(records, { query: workflow, kinds: ["pattern", "project", "opportunity"], limit: 8 }).map((result) => result.record.id);
  return {
    fit,
    summary: fit === "strong" ? "This workflow contains several bounded semantic decisions that may be good Jev experiments." : fit === "promising" ? "Parts of this workflow may fit Jev after the broad task is decomposed into atomic decisions." : fit === "unclear" ? "One possible Jev signal is present, but the decision boundary needs clarification." : "The description does not yet show a strong bounded-decision use case for Jev.",
    positiveSignals,
    nonFitSignals,
    candidateDecisionPoints: points,
    keepDeterministic: ["Control flow and side effects", "Exact calculations and database constraints", "Authorization and irreversible safety policy", "Fallbacks, retries, and human escalation"],
    validationSteps: ["Collect representative labeled examples from the real workflow.", "Define narrow questions and explicit criteria before writing integration code.", "Measure accuracy and calibration by confidence bucket.", "Compare against the current rule, classifier, or LLM baseline.", "Choose thresholds from observed errors and action risk."],
    caveats: ["This is a retrieval-and-rules assessment, not a benchmark of Jev on your data.", "Typed output prevents schema drift but does not guarantee semantic correctness.", "Keep deterministic backstops around high-impact actions."],
    relatedRecordIds: related,
  };
}

export function getContextPack(records: KnowledgeRecord[], goal: string, kinds?: KnowledgeKind[]): { overview: KnowledgeRecord | null; results: KnowledgeRecord[]; guidance: string[] } {
  const overview = records.find((record) => record.id === "overview:what-is-jev") ?? null;
  const results = searchKnowledge(records, { query: goal, ...(kinds?.length ? { kinds } : {}), limit: 10 }).map((result) => result.record).filter((record) => record.id !== overview?.id);
  return {
    overview,
    results,
    guidance: ["Keep deterministic rules and side effects in code.", "Decompose broad judgments into narrow typed questions.", "Batch independent questions over the same state.", "Validate confidence thresholds on representative data.", "Preserve claim status and citations when using this context."],
  };
}

export type { EvidenceStatus, KnowledgeKind, KnowledgeRecord, KnowledgeSearchOptions, KnowledgeSearchResult } from "./types";
