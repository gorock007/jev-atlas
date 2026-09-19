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
- **What was built:** A chess move scorer with a working FastAPI/uvicorn server, browser UI, and test suite; its primary scoring backends are local fine-tuned models, with Jev wired in as one optional hosted backend. The builder also published a companion local model, ChessJev-MiniLM-v1 (huggingface.co/gopalanj/chessjev-minilm-v1): a MiniLM-L6 encoder with an attention head, full-finetuned on Apple M1 MPS against Stockfish 19 teacher labels.
- **Jev's role:** An optional CHESS_JEV_SCORER=typesafe backend that posts board state and move candidates to TypeSafe's hosted System One API and falls back to a local model on error. The Hugging Face model card itself states plainly it is not TypeSafe Jev and is not Elo-tested.
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

### jev-router

- **Builder:** gargpratyush
- **Source:** [source](https://github.com/gargpratyush/jev-router)
- **What was built:** An npm-published CLI wrapper that launches Claude Code or OpenAI Codex through a loopback proxy, with a documented test suite covering shared policy, both request formats, and decision display.
- **Jev's role:** One Jev call per fresh user turn returns task-complexity signals that pick an abstract model tier (fast/balanced/strong/long); an explicit local policy layer (explicit overrides, fail-open on error, no downgrade at low confidence) turns that into the concrete model.
- **Architecture:** User turn → loopback proxy → Jev tier recommendation → src/policy.mjs deterministic rules → concrete Claude/Codex model → forwarded request.
- **Interesting insight:** Routing is explicitly fail-open and confidence-aware in the policy code, not in Jev itself — the README states Jev failure never blocks the CLI and low confidence never triggers a downgrade.
- **Repository / demo:** [source](https://github.com/gargpratyush/jev-router)

### SemIf (formerly OpenJev)

- **Builder:** TheoLeeCJ
- **Source:** [source](https://github.com/TheoLeeCJ/SemIf)
- **What was built:** An independent open-weights reproduction of Jev's runtime-defined typed-decision interface, running a locally hosted 4B model (e.g. Qwen3.5-4B) on a consumer GPU with a browser WebGPU demo, committed benchmark runs, and row-level output data.
- **Jev's role:** None — this project does not call TypeSafe's Jev API. It reproduces the interface pattern (typed options read as native logits instead of generated text) with an open model the builder controls, and its own site benchmarks against Jev only as a published external reference point.
- **Architecture:** Runtime state + criteria + typed options → local open model forward pass → option logits read directly (no sampled answer token) → probabilities.
- **Interesting insight:** Both the GitHub README and the openjev.com site state plainly, unprompted, that the project is independent and not affiliated with or endorsed by TypeSafe — it was renamed from OpenJev to SemIf, evidence the interface pattern itself, not TypeSafe's model or brand, is what's being reproduced.
- **Repository / demo:** [source](https://github.com/TheoLeeCJ/SemIf)

### J3vRoute

- **Builder:** Unknown (no linked repo)
- **Source:** [source](https://j3vroute.agents.bakingbad.dev)
- **What was built:** A live, working single-page paper-trading demo: it simulates a virtual USDG portfolio traded across three markets on "Robinhood Chain," with fills clearly labelled as simulated (no swap is signed or broadcast).
- **Jev's role:** TypeSafe Jev selects buy, sell, or hold for all three markets in one request, then sizes each trade with a Score across five levels that sets position size (0.5-5% of gross portfolio value).
- **Architecture:** 3Route finds prices/routes on-chain → Jev decision (buy/sell/hold + sizing Score) per market → simulated fill applied to a virtual portfolio.
- **Interesting insight:** Pairs Jev's decision output directly with a routing protocol (3Route) rather than a coding agent or classifier pipeline — the trade-execution boundary (dry-run only, explicitly labelled) is kept separate from the decision boundary.
- **Repository / demo:** Not independently located

### system-one-router

- **Builder:** npm publisher (unverified identity)
- **Source:** [source](https://www.npmjs.com/package/system-one-router)
- **What was built:** A published npm extension (v0.4.5) for the Pi coding agent that adds a per-turn model router; its README states it is based on and retains attribution to an existing router, yeliu84/pi-model-router.
- **Jev's role:** An optional LLM-intent-classifier mode calls TypeSafe's System One API (model jev-latest) to categorize task intent, overriding the package's own keyword/heuristic router when configured.
- **Architecture:** User turn → optional Jev classifier call or local heuristics → high/medium/low tier → mapped to a configured concrete model per tier.
- **Interesting insight:** Jev is one swappable classifier backend behind a router that works without it (heuristics are the default) — a lower-commitment integration pattern than jev-router's Jev-only design.
- **Repository / demo:** Not independently located

### is-odd-jev

- **Builder:** npm publisher (unverified identity)
- **Source:** [source](https://www.npmjs.com/package/is-odd-jev)
- **What was built:** A published npm package (v1.1.0, zero dependencies) that answers whether a number is odd by calling a Jev Noul primitive and returning its calibrated probability instead of a bare boolean.
- **Jev's role:** The entire package: one Noul call per invocation, against api.typesafe.ai or the Vercel AI Gateway's typesafe-ai/jev model, returns { odd, p, ms, output_tokens }.
- **Architecture:** Integer input → single Noul question ("Is n odd?") → probability read from the model's own distribution, not narrated.
- **Interesting insight:** This is a joke package in the lineage of is-odd/is-odd-ai (its README says as much), but it is not a fake integration: it genuinely calls Jev's API and correctly demonstrates that Noul returns a probability rather than a confidence field bolted onto a boolean.
- **Repository / demo:** Not independently located

### jev-ultrafast

- **Builder:** Browser Use (third party, not TypeSafe)
- **Source:** [source](https://github.com/browser-use/jev-ultrafast)
- **What was built:** A browser-automation runtime from Browser Use with a published performance report (docs/performance.md). The report documents a 7.07 s Google Flights run made with 17 Jev requests; that timing excludes browser setup and post-run verification, and the run finds flight results rather than booking anything.
- **Jev's role:** Jev picks the next action and its target from a list of page controls rebuilt at every step; a small LLM is used only to fill text inputs, and the outcome is verified separately after the run reports DONE.
- **Architecture:** Page → control list rebuilt each step → Jev action + target choice → small LLM for text entry only → action → DONE → separate outcome verification.
- **Interesting insight:** The report attributes its gains to runtime changes rather than model changes: with the same models, median browser protocol calls fell from 1,092 to 101 and median task time fell 25%. The per-run cost figure circulating with this project appears only in the author's X post, not in the report, so it is not carried here.
- **Repository / demo:** [source](https://github.com/browser-use/jev-ultrafast)

### 1k Papers

- **Builder:** Hassan El Mghari
- **Source:** [source](https://1kpapers.com)
- **What was built:** A live site that classifies 1,018 AI papers against 24 topics, with Jev doing the classification after an LLM has summarised each paper.
- **Jev's role:** One typed classification per paper against a fixed 24-topic taxonomy; the LLM summary is Jev's input, not the classifier.
- **Architecture:** Paper → LLM summary → Jev classification against 24 topics → browsable topic index.
- **Interesting insight:** A bulk-classification shape rather than an agent loop: the corpus is fixed, the taxonomy is fixed, and the interesting cost question is per-item. The build's cost and latency numbers are self-reported by the author and are not repeated here; only the published corpus size and topic count are.
- **Repository / demo:** [source](https://1kpapers.com)

### Inbox triage demo

- **Builder:** Riley Brown
- **Source:** [source](https://madewithjev.com)
- **What was built:** An inbox triage demonstration attributed to Riley Brown. Confirmed at second hand only: it appears in the madewithjev.com directory of Jev builds, and the demo itself was not opened for this record.
- **Jev's role:** Typed triage judgments over incoming mail, as the directory describes it; the mechanics were not verified directly.
- **Architecture:** Incoming message → Jev triage judgment → application-side sorting, as listed rather than as inspected.
- **Interesting insight:** A directory listing is secondary evidence: it establishes that the build was claimed, not that it works as described. This entry should be upgraded on a first-hand look at the demo, or dropped if none is available.
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
