# Jev Foundations

Last researched: 2026-09-18

This document is a source-classified starting point. It intentionally separates TypeSafe's claims from independently demonstrated behavior.

## FACT

- TypeSafe exposes Jev as a decision model accepting shared `state` plus named questions. Its documented question primitives are `noul` (a Boolean probability), `choice` (one option and a distribution), and `score` (a position over ordered levels). Source: [TypeSafe quick start](https://docs.typesafe.ai/introduction/quickstart) and [primitives documentation](https://docs.typesafe.ai/primitives).
- Vercel AI Gateway added `typesafe-ai/jev` support on 2026-09-16 through AI SDK 7's experimental `evaluate` API. Source: [Vercel announcement](https://vercel.com/changelog/typesafe-ai-jev-now-available-on-ai-gateway).
- TypeSafe calls this category “System One Models” and calls its training method “Reinforcement Learning for Calibrated Decisions” (RLCD). These names and the existence of the published interfaces are facts; their performance implications remain vendor claims. Source: [TypeSafe launch post](https://typesafe.ai/blog/introducing-system-one-models-and-jev).

## VENDOR CLAIM

- TypeSafe describes Jev as machine-native intelligence that returns typed decisions and calibrated confidence rather than generating prose. Source: [TypeSafe home page](https://typesafe.ai/).
- TypeSafe reports up to 193.6× lower latency and 444.6× lower cost than LLMs on its workflow evaluations. These are vendor-reported benchmark results, not independent findings. Source: [TypeSafe home page](https://typesafe.ai/).
- TypeSafe markets “zero hallucinations.” That wording is not treated as an independently established reliability property; a typed output can still be a wrong decision. Source: [TypeSafe home page](https://typesafe.ai/).
- TypeSafe reports pricing of $42 per billion input tokens ($0.042 per million) and no metered output-token charge. Pricing may change and should be checked before use. Source: [TypeSafe home page](https://typesafe.ai/).

## INDEPENDENT OBSERVATION

- A third-party Home Assistant integration uses Jev decisions as sensors and automation actions, including frequent evaluation with a local daily token-budget guard. This is evidence of an actual integration, not proof of vendor benchmark claims. Source: [HA-Jev repository](https://github.com/AboveColin/HA-Jev).
- A third-party MCP server exposes the native TypeSafe evaluation API to coding agents and preserves probabilities in machine-readable results. Source: [typesafe-mcp repository](https://github.com/itsmostafa/typesafe-mcp).

## OPINION

- Jev is best evaluated initially as a complement to generative models—a router, verifier, policy-like decision layer, or frequent classifier—rather than as a general replacement for models that must synthesize text or code. This is an engineering interpretation, not a settled fact.

## SPECULATION

- If its latency, cost, and calibration properties hold across real workloads, Jev may make architectures with tens or hundreds of semantic decisions per event practical. This requires workload-specific validation.

## UNKNOWN

- Independent accuracy, calibration, drift, and latency measurements across representative production workloads.
- Failure behavior under adversarial, ambiguous, multilingual, or distribution-shifted state.
- Exact model architecture and how RLCD differs technically from other calibration/training methods beyond TypeSafe's public description.
- Long-run pricing and operational limits outside the currently published API constraints.
