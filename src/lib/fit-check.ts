import * as z from "zod/v4";
import { OPPORTUNITY_LENSES, OPPORTUNITY_LENS_IDS, type OpportunityLensId } from "@/knowledge/lenses";
import { assessJevFit, searchKnowledge } from "@/knowledge/repository";
import type { JevFitAssessment, KnowledgeKind, KnowledgeRecord } from "@/knowledge/types";
import {
  type FitCheckDecisionPoint,
  type FitCheckRelatedRecord,
  type FitCheckResult,
  type FitVerdict,
} from "./fit-check-result";

// The result contract and its renderer live in the client-safe module; server
// callers keep importing them from here.
export * from "./fit-check-result";

/**
 * Ordered gateway model ids. Index 0 is tried first; the rest are fallbacks.
 * Plain model strings resolve through the Vercel AI Gateway, so no provider SDK
 * and no API key ever appears in this file.
 */
export const FIT_CHECK_MODELS = ["google/gemini-2.5-flash-lite", "openai/gpt-5.6-luna"] as const;

/** Whole-request budget, shared across the primary and fallback attempts. */
export const FIT_CHECK_TIMEOUT_MS = 12_000;

/** Kinds used as grounding; also the only records the result may link to. */
const GROUNDING_KINDS: KnowledgeKind[] = ["pattern", "project", "opportunity"];
const GROUNDING_LIMIT = 8;

/**
 * A backstop on prompt size, not a public bound. It sits above the MCP tool's
 * own 5,000-character schema plus its stack list, so nothing a caller sends
 * within its declared limit is silently truncated. The website's tighter
 * `FIT_CHECK_MAX_LENGTH` is enforced by the route, which rejects rather than trims.
 */
const MAX_PROMPT_LENGTH = 7_000;

const MAX_DECISION_POINTS = 6;
const MAX_LIST_ITEMS = 6;
const MAX_OPTIONS = 8;

/**
 * The wire schema is deliberately unconstrained beyond shape: a model that
 * overruns a length hint should be trimmed, not thrown away. Bounds are applied
 * in `postValidate` instead, where overrun degrades one field rather than
 * collapsing the whole request to rules mode.
 */
const modelDecisionPointSchema = z.object({
  step: z.string(),
  primitive: z.enum(["Choice", "Score", "Noul"]),
  question: z.string(),
  options: z.array(z.string()),
  scale: z.string(),
  whyJev: z.string(),
  lens: z.string(),
});

export const fitCheckModelSchema = z.object({
  verdict: z.enum(["strong", "promising", "unclear", "weak"]),
  headline: z.string(),
  decisionPoints: z.array(modelDecisionPointSchema),
  keepInCode: z.array(z.string()),
  keepInLlm: z.array(z.string()),
  firstExperiment: z.string(),
  relatedRecordIds: z.array(z.string()),
});

export type FitCheckModelOutput = z.infer<typeof fitCheckModelSchema>;

export interface FitCheckGenerateInput {
  model: string;
  system: string;
  prompt: string;
  signal: AbortSignal;
}

/** Injected so tests can exercise post-validation without a network call. */
export type FitCheckGenerate = (input: FitCheckGenerateInput) => Promise<unknown>;

export interface FitCheckOptions {
  generate?: FitCheckGenerate;
  /** False forces the deterministic path (rate limit, or an explicit rules-only call). */
  allowModel?: boolean;
  /** Why the model pass was skipped, surfaced to the page. */
  skipReason?: string;
  env?: Record<string, string | undefined>;
  models?: readonly string[];
  timeoutMs?: number;
}

/**
 * True when the AI Gateway can authenticate, by key or by Vercel OIDC. On a Vercel
 * deployment the OIDC token arrives per request rather than in the environment, so
 * `VERCEL` alone is enough to try; a rejected call still falls back to rules.
 */
export function isFitCheckModelConfigured(env: Record<string, string | undefined> = process.env): boolean {
  return Boolean(env.AI_GATEWAY_API_KEY || env.VERCEL_OIDC_TOKEN || env.VERCEL === "1");
}

function clamp(value: unknown, max: number): string {
  const text = typeof value === "string" ? value.replace(/[<>]/gu, "").replace(/\s+/gu, " ").trim() : "";
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

function clampList(values: readonly unknown[], count: number, length: number): string[] {
  return values.map((value) => clamp(value, length)).filter(Boolean).slice(0, count);
}

function toRelated(record: KnowledgeRecord): FitCheckRelatedRecord {
  return { id: record.id, kind: record.kind, title: record.title, summary: record.summary, status: record.status, canonicalPath: record.canonicalPath };
}

function lensTitleOf(id: OpportunityLensId): string {
  return OPPORTUNITY_LENSES.find((lens) => lens.id === id)?.title ?? id;
}

function buildSystemPrompt(): string {
  const lenses = OPPORTUNITY_LENSES.map((lens) => `- ${lens.id} — ${lens.title}: ${lens.property}`).join("\n");
  return [
    "You help a developer decide whether Jev, TypeSafe's System One model, belongs anywhere in a workflow they describe.",
    "",
    "Jev answers one narrow question about application state and returns a typed value with a confidence. It is not a chatbot, an agent, or a text generator. The three primitives are:",
    "- Choice: exactly one option from a bounded, enumerated set. Use it for classification, routing, and triage.",
    "- Score: a calibrated number on a stated ordered scale. Use it for ranking, severity, priority, and quality.",
    "- Noul: the probability of a stated yes/no condition. Use it for gates, guardrails, and thresholds.",
    "",
    "Opportunity lenses (use the id verbatim; pick the closest one):",
    lenses,
    "",
    "Rules you must follow:",
    "- Decompose the workflow into 2 to 6 concrete decision points that sit at named steps of THEIR workflow. Each one must be answerable from the state available at that step.",
    "- For a Choice, fill `options` with the actual bounded set and leave `scale` empty. For a Score or Noul, describe the range or the yes/no condition in `scale` and leave `options` empty.",
    "- `keepInCode` lists what must stay deterministic: side effects, exact arithmetic, authorization, retries, escalation.",
    "- `keepInLlm` lists what still needs a generative or reasoning model: drafting, summarising, open-ended planning. Say so plainly when parts of the workflow are not a Jev job.",
    "- `firstExperiment` is one paragraph: the smallest offline test that would falsify the idea, using labelled examples they already have.",
    "- `relatedRecordIds` may only contain ids from the supplied atlas records. Return an empty array rather than inventing one.",
    "",
    "You must never assert how accurate, fast, or cheap Jev is, never compare it to a named model, and never state or imply a benchmark result. Evidence status labels belong to the atlas records; do not attach a status to anything you write. Everything you produce is a hypothesis to validate, not a finding.",
    "",
    "Keep `headline` under 120 characters. Keep every other field to one or two sentences.",
  ].join("\n");
}

function buildUserPrompt(workflow: string, grounding: KnowledgeRecord[], assessment: JevFitAssessment): string {
  const records = grounding.map((record) => JSON.stringify({ id: record.id, title: record.title, status: record.status, summary: record.summary }));
  return [
    "Workflow described by the developer:",
    "<<<WORKFLOW",
    workflow,
    "WORKFLOW",
    "",
    "Atlas records retrieved for this workflow. These are the only ids you may cite; their status labels are fixed and are not yours to change:",
    records.length ? records.join("\n") : "(no atlas records matched this workflow)",
    "",
    `A deterministic keyword pass rated this "${assessment.fit}". Treat that as one weak signal, not an answer.`,
    assessment.positiveSignals.length ? `Signals it saw: ${assessment.positiveSignals.join(" ")}` : "",
    assessment.nonFitSignals.length ? `Non-fit signals it saw: ${assessment.nonFitSignals.join(" ")}` : "",
    "",
    "Return the structured assessment.",
  ].filter(Boolean).join("\n");
}

/** Default generate: one gateway call, structured output, no retries. */
async function generateWithGateway({ model, system, prompt, signal }: FitCheckGenerateInput): Promise<unknown> {
  const { generateText, Output } = await import("ai");
  const { output } = await generateText({
    model,
    system,
    prompt,
    output: Output.object({ schema: fitCheckModelSchema }),
    temperature: 0.2,
    maxOutputTokens: 1_600,
    maxRetries: 0,
    abortSignal: signal,
  });
  return output;
}

/**
 * Narrows raw model output to what the atlas can stand behind: unknown record
 * ids and unknown lenses are dropped rather than rendered, and the deterministic
 * caveats are always appended.
 */
function postValidate(output: FitCheckModelOutput, model: string, grounding: KnowledgeRecord[], assessment: JevFitAssessment): FitCheckResult {
  const allowed = new Map(grounding.map((record) => [record.id, record]));
  const lenses = new Set<string>(OPPORTUNITY_LENS_IDS);

  const decisionPoints = output.decisionPoints.slice(0, MAX_DECISION_POINTS).map((point): FitCheckDecisionPoint => {
    const lens = lenses.has(point.lens) ? (point.lens as OpportunityLensId) : null;
    const isChoice = point.primitive === "Choice";
    return {
      step: clamp(point.step, 120),
      primitive: point.primitive,
      question: clamp(point.question, 240),
      options: isChoice ? clampList(point.options, MAX_OPTIONS, 60) : [],
      scale: isChoice ? "" : clamp(point.scale, 140),
      whyJev: clamp(point.whyJev, 300),
      lens,
      lensTitle: lens ? lensTitleOf(lens) : null,
    };
  }).filter((point) => point.step.length > 0);

  const related = [...new Set(output.relatedRecordIds)].map((id) => allowed.get(id)).filter((record): record is KnowledgeRecord => record !== undefined).slice(0, GROUNDING_LIMIT);

  return {
    mode: "model",
    model,
    reason: null,
    verdict: output.verdict,
    headline: clamp(output.headline, 120) || assessment.summary,
    decisionPoints,
    keepInCode: clampList(output.keepInCode, MAX_LIST_ITEMS, 160),
    keepInLlm: clampList(output.keepInLlm, MAX_LIST_ITEMS, 160),
    firstExperiment: clamp(output.firstExperiment, 900),
    relatedRecords: (related.length ? related : grounding.slice(0, 4)).map(toRelated),
    caveats: ["This decomposition was written by a general-purpose model reading the atlas. It is a starting hypothesis, not a finding about your data.", ...assessment.caveats],
    signals: { positive: assessment.positiveSignals, nonFit: assessment.nonFitSignals },
  };
}

/** The deterministic result, shaped like the model result so the page has one view. */
function rulesResult(assessment: JevFitAssessment, grounding: KnowledgeRecord[], reason: string): FitCheckResult {
  const byId = new Map(grounding.map((record) => [record.id, record]));
  return {
    mode: "rules",
    model: null,
    reason,
    verdict: assessment.fit,
    headline: assessment.summary,
    decisionPoints: assessment.candidateDecisionPoints.slice(0, MAX_DECISION_POINTS).map((point) => ({
      step: point.title,
      primitive: point.primitive,
      question: "",
      options: [],
      scale: "",
      whyJev: point.reason,
      lens: null,
      lensTitle: null,
    })),
    keepInCode: assessment.keepDeterministic.slice(0, MAX_LIST_ITEMS),
    keepInLlm: assessment.nonFitSignals.length ? assessment.nonFitSignals.slice(0, MAX_LIST_ITEMS) : ["Open-ended drafting, summarising, and multi-step planning stay with a generative model."],
    firstExperiment: assessment.validationSteps.join(" "),
    relatedRecords: assessment.relatedRecordIds.map((id) => byId.get(id)).filter((record): record is KnowledgeRecord => record !== undefined).map(toRelated),
    caveats: assessment.caveats,
    signals: { positive: assessment.positiveSignals, nonFit: assessment.nonFitSignals },
  };
}

/**
 * The deterministic pass always runs; the model pass only decorates it. Any
 * failure — no gateway credentials, a transport error, a timeout, a schema the
 * model did not honour — returns the rules result rather than an error, so the
 * page works with no environment configured at all.
 */
export async function runFitCheck(workflow: string, records: KnowledgeRecord[], options: FitCheckOptions = {}): Promise<FitCheckResult> {
  const trimmed = workflow.trim().slice(0, MAX_PROMPT_LENGTH);
  const assessment = assessJevFit(trimmed, records);
  const grounding = searchKnowledge(records, { query: trimmed, kinds: GROUNDING_KINDS, limit: GROUNDING_LIMIT }).map((result) => result.record);

  if (options.allowModel === false) return rulesResult(assessment, grounding, options.skipReason ?? "The model pass was skipped for this request.");

  const generate = options.generate ?? generateWithGateway;
  if (!options.generate && !isFitCheckModelConfigured(options.env ?? process.env)) {
    return rulesResult(assessment, grounding, "No AI Gateway credentials are configured, so this is the deterministic rules result.");
  }

  const system = buildSystemPrompt();
  const prompt = buildUserPrompt(trimmed, grounding, assessment);
  const signal = AbortSignal.timeout(options.timeoutMs ?? FIT_CHECK_TIMEOUT_MS);

  for (const model of options.models ?? FIT_CHECK_MODELS) {
    try {
      const parsed = fitCheckModelSchema.parse(await generate({ model, system, prompt, signal }));
      const result = postValidate(parsed, model, grounding, assessment);
      // A model that produced no usable decision point is worse than the rules
      // pass, which at least names the primitive it matched.
      if (result.decisionPoints.length) return result;
    } catch {
      // Deliberately opaque: the workflow text must never reach a log line.
      if (signal.aborted) break;
    }
  }

  return rulesResult(assessment, grounding, "The model pass was unavailable for this request, so this is the deterministic rules result.");
}
