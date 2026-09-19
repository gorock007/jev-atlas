# Emerging Architecture Patterns

## Decision sidecar

A typed judgment service sits beside ordinary code; code owns effects and safety boundaries.

- **Evidence:** [source 1](https://docs.typesafe.ai/primitives), [source 2](https://x.com/i/web/status/2100499596095209849), [source 3](https://x.com/i/web/status/2099928269785272613), [source 4](https://x.com/i/web/status/2100988217931809255)
- **Caveat:** The extra network hop must beat a local rule or classifier.

## Cascade router

A cheap decision chooses whether to use rules, a small model, a premium model, a specialist, or a human.

- **Evidence:** [source 1](https://x.com/i/web/status/2100078473419104388), [source 2](https://x.com/i/web/status/2100544757248278933), [source 3](https://x.com/i/web/status/2099928269785272613)
- **Caveat:** Bad routing can erase all cost savings through failures and retries.

## Confidence gate

Automation proceeds above a threshold; ambiguous cases go to another check or a person.

- **Evidence:** [source 1](https://docs.typesafe.ai/primitives)
- **Caveat:** Thresholds require workload-specific calibration and monitoring.

## Parallel decision matrix

One state is evaluated against many named questions, replacing repeated prompt/parse cycles.

- **Evidence:** [source 1](https://docs.typesafe.ai/primitives), [source 2](https://typesafe.ai/blog/introducing-system-one-models-and-jev)
- **Caveat:** Accuracy and question interactions under large batches remain unknown.

## Probabilistic predicate + deterministic action

Jev supplies fuzzy predicates while TypeScript, policies, and workflows execute constrained actions.

- **Evidence:** [source 1](https://goblin-hr.kostysh.chatgpt.site/), [source 2](https://github.com/AboveColin/HA-Jev)
- **Caveat:** Incorrect predicates are still operational errors even when outputs are valid.

## Decision quorum

Multiple typed judgments are aggregated through voting or confidence-aware stopping.

- **Evidence:** [source 1](https://github.com/hide-G/magi-system-on-jev)
- **Caveat:** Calling the same model repeatedly may produce correlated rather than independent evidence.
