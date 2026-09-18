export const OPPORTUNITY_LENS_IDS = [
  "high-volume-classification",
  "real-time-decisions",
  "routing-and-triage",
  "verification-and-guardrails",
  "ranking-and-scoring",
  "event-driven-automation",
  "agent-tool-gating",
  "semantic-features",
  "repeated-judgment-at-scale",
] as const;

export type OpportunityLensId = (typeof OPPORTUNITY_LENS_IDS)[number];

export interface OpportunityLens {
  id: OpportunityLensId;
  title: string;
  /** The property of Jev that makes this group of opportunities interesting. */
  property: string;
  description: string;
}

/**
 * The opportunity map is organised by the property that makes Jev useful, not
 * by product category. A lens is an authored editorial classification; it is
 * not evidence that any opportunity in it has been validated.
 */
export const OPPORTUNITY_LENSES: OpportunityLens[] = [
  {
    id: "high-volume-classification",
    title: "High-volume semantic classification",
    property: "A typed label costs far less than generated prose, so labelling everything becomes affordable.",
    description: "Workloads where every item in a large, continuous stream needs a category before anything else can happen.",
  },
  {
    id: "real-time-decisions",
    title: "Real-time product decisions",
    property: "Latency low enough to sit in a request path rather than a background job.",
    description: "Decisions a user is waiting on, where a generative round trip would be felt as lag.",
  },
  {
    id: "routing-and-triage",
    title: "Routing and triage",
    property: "A bounded Choice with a confidence score is exactly the shape a router needs.",
    description: "Sending work to the right model, queue, team, or handler, with an explicit escalation path when confidence is low.",
  },
  {
    id: "verification-and-guardrails",
    title: "Verification and guardrails",
    property: "An independent second judgment is cheap enough to run on every output.",
    description: "Checking another system's work before it reaches a user, a customer, or a production branch.",
  },
  {
    id: "ranking-and-scoring",
    title: "Ranking and scoring",
    property: "Score returns a calibrated number that ordinary code can sort, threshold, and audit.",
    description: "Ordering, sampling, and prioritising when there is more candidate work than budget to process it.",
  },
  {
    id: "event-driven-automation",
    title: "Event-driven automation",
    property: "A decision per event is viable when each decision costs a fraction of a generative call.",
    description: "Reacting to webhooks, device state, failures, and schedules without writing brittle rule trees.",
  },
  {
    id: "agent-tool-gating",
    title: "Agent tool gating",
    property: "Agents need typed permission decisions that the agent itself does not control.",
    description: "Deciding what an autonomous loop may do next, and when a human or a stricter model has to intervene.",
  },
  {
    id: "semantic-features",
    title: "Semantic features for conventional software",
    property: "Probabilities become ordinary values that existing code and models can consume.",
    description: "Exposing typed judgments as predicates, features, and SDK primitives inside systems that stay deterministic.",
  },
  {
    id: "repeated-judgment-at-scale",
    title: "Repeated judgment over large datasets",
    property: "The same narrow question asked thousands of times, where per-call cost dominates feasibility.",
    description: "Batch and corpus-wide work that was previously too expensive to judge semantically at all.",
  },
];

const LENS_BY_ID = new Map(OPPORTUNITY_LENSES.map((lens) => [lens.id, lens]));

export function findLens(id: string): OpportunityLens | null {
  return LENS_BY_ID.get(id as OpportunityLensId) ?? null;
}
