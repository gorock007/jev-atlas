import type { OpportunityLensId } from "./knowledge/lenses.js";

export interface PublicMetrics {
  likes: number;
  replies: number;
  reposts: number;
  quotes: number;
  bookmarks: number | null;
  impressions: number | null;
}

export interface RawPost {
  id: string;
  text: string;
  author_id: string | null;
  username: string | null;
  author_name: string | null;
  created_at: string | null;
  url: string;
  conversation_id: string | null;
  in_reply_to_user_id: string | null;
  metrics: PublicMetrics;
  links: string[];
  query_source: string;
  collected_at: string;
}

export const CATEGORIES = [
  "ANNOUNCEMENT", "TECHNICAL_EXPLANATION", "ARCHITECTURE", "DEMO", "CODE",
  "PROJECT", "EXPERIMENT", "USE_CASE", "PRODUCT_IDEA", "AGENT_INFRASTRUCTURE",
  "ROUTING", "CLASSIFICATION", "VERIFICATION", "AUTOMATION", "BENCHMARK",
  "PERFORMANCE", "COST", "CRITICISM", "LIMITATION", "COMPARISON", "SPECULATION",
  "QUESTION", "OTHER",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface ProcessedPost {
  post: RawPost;
  categories: Category[];
  relevance_score: number;
  novelty_score: number;
  technical_depth: number;
  build_potential: number;
  score_reasons: string[];
  summary: string;
  key_claims: string[];
  linked_projects: string[];
  themes: string[];
}

export interface QueryProgress {
  nextToken: string | null;
  completed: boolean;
  consecutiveLowYieldPages: number;
  pages: number;
}

export interface RunState {
  version: 1;
  runId: string;
  createdAt: string;
  updatedAt: string;
  configFingerprint: string;
  budgetUsd: number;
  safeCeilingUsd: number;
  estimatedSpendUsd: number;
  requestCount: number;
  postsFetched: number;
  uniquePosts: number;
  relevantPosts: number;
  highValuePosts: number;
  warnedAt80Percent: boolean;
  currentQueryIndex: number;
  queries: Record<string, QueryProgress>;
  stopReason: string | null;
}

export type ClaimStatus = "Demonstrated" | "Plausible" | "Speculative" | "Vendor Claim" | "Disputed";

export interface ResearchClaim {
  claim: string;
  status: ClaimStatus;
  evidence: string;
  sources: string[];
  counterarguments: string;
  openQuestions: string;
}

export interface ProjectFinding {
  name: string;
  builder: string;
  status: "ACTUALLY BUILT" | "PROPOSED";
  source: string;
  description: string;
  jevRole: string;
  architecture: string;
  insight: string;
  repositoryOrDemo: string | null;
}

export interface PatternFinding {
  name: string;
  description: string;
  evidence: string[];
  caveat: string;
}

export interface BuildIdea {
  name: string;
  /** Authored editorial grouping by the property of Jev the idea depends on. */
  lens: OpportunityLensId;
  problem: string;
  product: string;
  whyJev: string;
  architecture: string;
  currentAlternative: string;
  advantage: string;
  mvp: string;
  validation: string;
  evidence: string[];
  unknowns: string;
  confidence: "LOW" | "MEDIUM" | "HIGH";
  confidenceReason: string;
  indieFit: number;
}

export interface ResearchAnalysis {
  generatedAt: string;
  dataset: {
    totalPosts: number;
    retainedPosts: number;
    analyzedPosts: number;
    highValuePosts: number;
  };
  categoryCounts: Record<string, number>;
  claims: ResearchClaim[];
  projects: ProjectFinding[];
  patterns: PatternFinding[];
  ideas: BuildIdea[];
  topEvidence: Array<{
    url: string;
    summary: string;
    relevance: number;
    categories: Category[];
  }>;
}
