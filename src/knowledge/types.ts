import type { ClaimStatus } from "@/types";

export const KNOWLEDGE_KINDS = [
  "overview",
  "claim",
  "project",
  "pattern",
  "opportunity",
  "evidence",
  "document",
] as const;

export type KnowledgeKind = (typeof KNOWLEDGE_KINDS)[number];

export type EvidenceStatus = ClaimStatus | "Official Documentation" | "Observed" | "Authored Hypothesis" | "Source Evidence";

export interface KnowledgeSource {
  url: string;
  label: string;
  sourceClass: "official" | "repository" | "social" | "research";
}

export interface KnowledgeRecord {
  id: string;
  kind: KnowledgeKind;
  title: string;
  summary: string;
  body: string;
  status: EvidenceStatus;
  tags: string[];
  sources: KnowledgeSource[];
  canonicalPath: string;
  generatedAt: string;
  lastVerifiedAt: string;
  limitations: string[];
  relatedIds: string[];
  metadata: Record<string, string | number | boolean | null | string[]>;
}

export interface KnowledgeManifest {
  name: "Jev Atlas";
  schemaVersion: "1.0.0";
  generatedAt: string;
  lastVerifiedAt: string;
  recordCount: number;
  counts: Record<KnowledgeKind, number>;
  interfaces: {
    website: string;
    llms: string;
    llmsFull: string;
    mcp: string;
    api: string;
  };
}

export interface KnowledgeSearchOptions {
  query: string;
  kinds?: KnowledgeKind[];
  statuses?: EvidenceStatus[];
  limit?: number;
}

export interface KnowledgeSearchResult {
  score: number;
  record: KnowledgeRecord;
}

export interface JevFitAssessment {
  fit: "strong" | "promising" | "unclear" | "weak";
  summary: string;
  positiveSignals: string[];
  nonFitSignals: string[];
  candidateDecisionPoints: Array<{
    title: string;
    primitive: "Choice" | "Score" | "Noul" | "Mixed";
    reason: string;
  }>;
  keepDeterministic: string[];
  validationSteps: string[];
  caveats: string[];
  relatedRecordIds: string[];
}
