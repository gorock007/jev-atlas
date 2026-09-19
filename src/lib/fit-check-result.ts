import type { OpportunityLensId } from "@/knowledge/lenses";
import type { EvidenceStatus, JevFitAssessment, KnowledgeKind } from "@/knowledge/types";

/**
 * The client-safe half of the fit check: the result contract, its bounds, and
 * the markdown renderer. `fit-check.ts` reaches the knowledge repository and so
 * pulls `node:fs`; the browser component may only import from here, and
 * re-exports keep one import path for server callers.
 */

export const FIT_CHECK_MIN_LENGTH = 20;
export const FIT_CHECK_MAX_LENGTH = 2_000;

export type FitVerdict = JevFitAssessment["fit"];
export type FitPrimitive = "Choice" | "Score" | "Noul" | "Mixed";
export type FitCheckMode = "model" | "rules";

export interface FitCheckDecisionPoint {
  step: string;
  primitive: FitPrimitive;
  /** The narrow question to ask. Empty in rules mode, where none was authored. */
  question: string;
  /** Bounded Choice options. Empty for Score and Noul. */
  options: string[];
  /** The Score range or Noul condition. Empty for Choice. */
  scale: string;
  whyJev: string;
  lens: OpportunityLensId | null;
  lensTitle: string | null;
}

export interface FitCheckRelatedRecord {
  id: string;
  kind: KnowledgeKind;
  title: string;
  summary: string;
  status: EvidenceStatus;
  canonicalPath: string;
}

export interface FitCheckResult {
  mode: FitCheckMode;
  /** The gateway model that answered, or null in rules mode. */
  model: string | null;
  /** Why the deterministic path was used. Null when a model answered. */
  reason: string | null;
  verdict: FitVerdict;
  headline: string;
  decisionPoints: FitCheckDecisionPoint[];
  keepInCode: string[];
  keepInLlm: string[];
  firstExperiment: string;
  relatedRecords: FitCheckRelatedRecord[];
  caveats: string[];
  signals: { positive: string[]; nonFit: string[] };
}

/** The copy-to-clipboard payload, and the same text the MCP tool can hand an agent. */
export function renderFitCheckMarkdown(workflow: string, result: FitCheckResult): string {
  const points = result.decisionPoints.map((point, index) => {
    const detail = point.options.length ? `Options: ${point.options.join(" · ")}` : point.scale ? `Scale: ${point.scale}` : "";
    return [
      `### ${index + 1}. ${point.step} — ${point.primitive}`,
      point.question ? `**Question:** ${point.question}` : "",
      detail,
      point.whyJev,
      point.lensTitle ? `_Lens: ${point.lensTitle}_` : "",
    ].filter(Boolean).join("\n\n");
  });
  const related = result.relatedRecords.map((record) => `- [${record.title}](https://jev-atlas.vercel.app${record.canonicalPath}) — ${record.status}`);
  return [
    "# Jev fit check",
    `- Verdict: **${result.verdict}**`,
    `- Mode: ${result.mode === "model" ? `model pass (${result.model})` : "deterministic rules only"}`,
    "",
    `> ${result.headline}`,
    "",
    "## Workflow assessed",
    "",
    workflow.trim(),
    "",
    "## Decision points",
    "",
    points.length ? points.join("\n\n") : "No bounded decision point was identified.",
    "",
    "## Keep in code",
    "",
    result.keepInCode.map((item) => `- ${item}`).join("\n") || "- (none listed)",
    "",
    "## Keep in a generative model",
    "",
    result.keepInLlm.map((item) => `- ${item}`).join("\n") || "- (none listed)",
    "",
    "## First experiment",
    "",
    result.firstExperiment,
    "",
    "## Related atlas records",
    "",
    related.join("\n") || "- (none matched)",
    "",
    "## Caveats",
    "",
    result.caveats.map((item) => `- ${item}`).join("\n"),
  ].join("\n");
}
