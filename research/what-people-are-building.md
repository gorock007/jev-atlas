# What People Are Building

“Actually built” means a public repository, demo, integration, or direct builder demonstration was located. It does not imply production validation.

## ACTUALLY BUILT

### HA-Jev

- **Builder:** AboveColin
- **Source:** [source](https://github.com/AboveColin/HA-Jev)
- **What was built:** A Home Assistant custom integration exposing Jev evaluations as sensors and automation actions.
- **Jev's role:** Repeated state classification and typed automation decisions.
- **Architecture:** Home Assistant state → TypeSafe evaluation → sensor/action result with a local token-budget guard.
- **Interesting insight:** Decision models can act as a semantic layer inside an existing event-driven rules engine.
- **Repository / demo:** [source](https://github.com/AboveColin/HA-Jev)

### typesafe-mcp

- **Builder:** itsmostafa
- **Source:** [source](https://github.com/itsmostafa/typesafe-mcp)
- **What was built:** An MCP server exposing TypeSafe evaluation to coding agents.
- **Jev's role:** Machine-readable decisions and probabilities available as agent tools.
- **Architecture:** MCP client → server tool → TypeSafe API → typed response.
- **Interesting insight:** The probability-bearing result can be preserved through agent infrastructure instead of flattened to prose.
- **Repository / demo:** [source](https://github.com/itsmostafa/typesafe-mcp)

### MAGI System on Jev

- **Builder:** hide-G
- **Source:** [source](https://x.com/i/web/status/2100695580096016611)
- **What was built:** An open-source three-sage voting experiment inspired by Neon Genesis Evangelion.
- **Jev's role:** Independent probabilistic judgments combined through majority voting.
- **Architecture:** Question → three Jev evaluations → deterministic aggregation → decision.
- **Interesting insight:** Cheap typed judgments invite ensemble and quorum experiments, though correlated errors still need measurement.
- **Repository / demo:** [source](https://github.com/hide-G/magi-system-on-jev)

### Goblin HR

- **Builder:** Kostysh
- **Source:** [source](https://x.com/i/web/status/2100386714250354786)
- **What was built:** A small inspectable demo that evaluates candidates for an impossible mission.
- **Jev's role:** Scores/selects candidates while deterministic TypeScript assembles the party.
- **Architecture:** Mission state → candidate decisions → deterministic application logic.
- **Interesting insight:** Keeping selection probabilistic and execution deterministic makes the boundary easy to inspect.
- **Repository / demo:** [source](https://goblin-hr.kostysh.chatgpt.site/)

### Axon Work integration

- **Builder:** Axon Work author
- **Source:** [source](https://x.com/i/web/status/2100166309405413785)
- **What was built:** The author states that Axon Work uses Jev-style model decisions with a skill/action harness.
- **Jev's role:** Decision layer feeding an action-delivery harness.
- **Architecture:** Model decision → skill chain → action harness.
- **Interesting insight:** A decision model can be invisible infrastructure beneath a workflow product.
- **Repository / demo:** [source](https://axon123.com)

## PROPOSED

### Confidence-gated agent control loops

- **Builder:** Developer discussion
- **Source:** [source](https://x.com/i/web/status/2099928060644749682)
- **What was built:** Use Jev repeatedly to route, verify, and decide whether an agent should continue or escalate.
- **Jev's role:** Low-latency control decisions between generative steps.
- **Architecture:** Agent state → route/verify/continue decisions → deterministic controller → next step.
- **Interesting insight:** The potential is fewer unnecessary generative calls, not simply replacing one model endpoint.
- **Repository / demo:** Not independently located
