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

### ProgressGate

- **Builder:** AshutoshVJTI
- **Source:** [source](https://github.com/AshutoshVJTI/progressgate)
- **What was built:** An npm package that detects semantic stagnation in agent tool-calling loops, published with tests, a quickstart, and a live demo build.
- **Jev's role:** One Jev systemOne call per check returns six atomic signals (assumption contradicted, strategy novelty, material progress, and others); Jev never executes or blocks a tool call itself.
- **Architecture:** Agent trajectory → Jev semantic signals → deterministic hysteresis policy in application code → CONTINUE/WARN/REPLAN/HALT decision.
- **Interesting insight:** Keeping the halt decision in a deterministic policy layer, with a fail-open default on Jev/network errors, means an API outage cannot itself look like agent stagnation.
- **Repository / demo:** [source](https://github.com/AshutoshVJTI/progressgate)

### chess-jev

- **Builder:** gopalanj
- **Source:** [source](https://github.com/gopalanj/chess-jev)
- **What was built:** A chess move scorer with a working FastAPI/uvicorn server, browser UI, and test suite; its primary scoring backends are local fine-tuned models, with Jev wired in as one optional hosted backend.
- **Jev's role:** An optional CHESS_JEV_SCORER=typesafe backend that posts board state and move candidates to TypeSafe's hosted System One API and falls back to a local model on error.
- **Architecture:** Board state → candidate move generation → scorer router (local MiniLM/byte model, hosted Jev, or heuristic fallback) → ranked move.
- **Interesting insight:** The repository explicitly disclaims being 'TypeSafe Jev' or 'OpenJev' — Jev appears only as a pluggable hosted option behind locally trained defaults, not the core of the product.
- **Repository / demo:** [source](https://github.com/gopalanj/chess-jev)

### TypeSafe Agent Skills

- **Builder:** TypeSafe (vendor)
- **Source:** [source](https://github.com/typesafe-ai/skills)
- **What was built:** TypeSafe's own published Claude Code plugin and skills.sh package that teaches coding agents to design and wire up Jev workflows.
- **Jev's role:** The skill's entire purpose is composing typed Jev judgments (Choice, Score, Noul) into agent-written code.
- **Architecture:** Agent skill install (plugin marketplace or skills.sh) → SKILL.md instructions → agent composes TypeSafe API calls in the user's codebase.
- **Interesting insight:** Vendor-authored, so it demonstrates TypeSafe's own recommended integration pattern rather than independent adoption evidence.
- **Repository / demo:** [source](https://github.com/typesafe-ai/skills)

### Jev Playground

- **Builder:** Unknown (no linked repo)
- **Source:** [source](https://jevtypesafe.vercel.app/)
- **What was built:** A live, interactive hosted demo with three preset use cases (Support Router, Compare & Choose, Content Triage) that runs real text through Jev and renders the typed judgments and computed routing.
- **Jev's role:** Every threshold, route, and explanation shown is computed by the demo's own application code from Jev's Choice/Score/Noul judgments, not by Jev directly.
- **Architecture:** Free-text customer request → Jev typed judgment call → client-side thresholding and routing display.
- **Interesting insight:** The page has no visible link to a GitHub repository or builder identity, so it reads as a demo of the interface pattern rather than an attributable third-party build.
- **Repository / demo:** Not independently located

## PROPOSED

### Confidence-gated agent control loops

- **Builder:** Developer discussion
- **Source:** [source](https://x.com/i/web/status/2099928060644749682)
- **What was built:** Use Jev repeatedly to route, verify, and decide whether an agent should continue or escalate.
- **Jev's role:** Low-latency control decisions between generative steps.
- **Architecture:** Agent state → route/verify/continue decisions → deterministic controller → next step.
- **Interesting insight:** The potential is fewer unnecessary generative calls, not simply replacing one model endpoint.
- **Repository / demo:** Not independently located
