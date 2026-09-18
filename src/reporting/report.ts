import { resolve } from "node:path";
import type { BuildIdea, ResearchAnalysis } from "../types.js";
import { readJson, writeTextAtomic } from "../utils/files.js";
import { analyzeResearch } from "../research/analyze.js";

function link(url: string, label = "source"): string {
  return `[${label}](${url})`;
}

function ideaList(ideas: BuildIdea[], count: number): string {
  return [...ideas]
    .sort((a, b) => b.indieFit - a.indieFit || a.name.localeCompare(b.name))
    .slice(0, count)
    .map((idea) => `- **${idea.name}:** ${idea.product} _Why Jev:_ ${idea.whyJev} (${idea.confidence})`)
    .join("\n");
}

function evidenceList(analysis: ResearchAnalysis, count = 8): string {
  return analysis.topEvidence.slice(0, count).map((item) =>
    `- ${item.summary} — ${link(item.url, `X post; heuristic relevance ${item.relevance}`)}`,
  ).join("\n");
}

function renderReport(analysis: ResearchAnalysis): string {
  const d = analysis.dataset;
  const actual = analysis.projects.filter((project) => project.status === "ACTUALLY BUILT");
  const proposed = analysis.projects.filter((project) => project.status === "PROPOSED");
  const claims = analysis.claims;
  const claim = (fragment: string) => claims.find((item) => item.claim.toLocaleLowerCase().includes(fragment)) ?? claims[0];
  const speed = claim("faster");
  const price = claim("price");
  const verification = claim("independently verified");
  const topCategories = Object.entries(analysis.categoryCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return `# Jev Research Report

Generated: ${analysis.generatedAt}

## Executive Summary

Jev is best understood as a machine-facing decision model: software supplies state and named questions, then receives constrained choices, scores, Boolean probabilities, and confidence rather than generated prose. The near-term opportunity is not a better chatbot. It is a control layer that can sit inside agent loops, event pipelines, and ordinary applications wherever software currently relies on brittle rules or expensive generative calls.

The evidence is still early. The cached X sample contains **${d.totalPosts} unique posts**, of which **${d.retainedPosts}** met the relevance threshold, **${d.analyzedPosts}** met the deeper-analysis band, and **${d.highValuePosts}** met the conversation-expansion threshold. Discussion is launch-heavy and repeatedly echoes TypeSafe's claims. Public code and demos demonstrate that integration is possible; they do not yet independently validate the headline latency, cost, calibration, or reliability claims.

The strongest build thesis is **probabilistic judgment plus deterministic execution**. Jev selects or scores; ordinary code enforces permissions, thresholds, budgets, and effects. The most compelling products make tens or hundreds of decisions per workflow and invoke expensive models or humans only for ambiguous cases.

## What Jev Actually Is

TypeSafe's public API accepts shared state plus named questions. The documented primitives are **noul** for a Boolean probability, **choice** for a selected option and distribution, and **score** for a position over ordered levels. That interface is directly verifiable in the [official primitives documentation](https://docs.typesafe.ai/primitives).

Jev does not generate the text, code, or explanation that a conventional generative model would. It returns a schema-constrained decision that application code can consume. This removes free-form parsing from that boundary, but a valid typed decision can still be wrong.

## System One Models

“System One Models” is TypeSafe's name for this model category, and “Reinforcement Learning for Calibrated Decisions” (RLCD) is its name for the training approach. The existence of the interface and terminology is factual; claimed performance consequences remain vendor claims. See the [TypeSafe launch article](https://typesafe.ai/blog/introducing-system-one-models-and-jev).

The useful engineering distinction is narrower: a bounded decision API has different ergonomics and economics from a text-generation API. Whether that warrants a durable new model category will depend on independent comparisons with compact classifiers, rules, embeddings, and constrained LLM outputs.

## How Jev Works

At the public API level:

1. Application code assembles state.
2. It asks one or more typed questions.
3. Jev returns typed decisions and probability/confidence information.
4. Deterministic code interprets thresholds, applies policy, and executes—or declines to execute—an action.

The exact model architecture and the technical details that distinguish RLCD from adjacent calibration methods are not established by the sources reviewed here.

## How Jev Differs From Traditional LLM Usage

Traditional automation often follows **state → prompt → generated text/JSON → parse → validate → action**. A Jev-shaped path is **state → typed probabilistic decision → policy code → action**.

That changes the failure surface. Invalid prose and parser failures shrink, while classification error, calibration, threshold selection, distribution shift, and correlated decisions become central. Jev is therefore a replacement for some bounded LLM calls, not for tasks that fundamentally require authored language, code, or long-form synthesis.

## What TypeSafe Claims

- **Latency:** ${speed?.evidence ?? "TypeSafe publishes large speed improvements on its own evaluations."} Status: **${speed?.status ?? "Vendor Claim"}**. Sources: ${(speed?.sources ?? []).map((url) => link(url)).join(", ")}.
- **Economics:** ${price?.evidence ?? "TypeSafe publishes low input pricing and no metered output charge."} Status: **${price?.status ?? "Vendor Claim"}**. Sources: ${(price?.sources ?? []).map((url) => link(url)).join(", ")}.
- **Calibration and reliability:** TypeSafe describes calibrated confidence and markets “zero hallucinations.” Typed output is demonstrated; workload-level calibration and error rates are not independently established.

## What Has Been Independently Demonstrated

- The documented Choice, Score, and Noul interface exists.
- Vercel added **typesafe-ai/jev** through AI Gateway's evaluation interface. See the [Vercel announcement](https://vercel.com/changelog/typesafe-ai-jev-now-available-on-ai-gateway).
- Public integrations and demos exist: ${actual.map((project) => link(project.repositoryOrDemo ?? project.source, project.name)).join(", ")}.
- ${verification?.evidence ?? "No independent reproduction of the headline benchmark range was found in the cached research."}

## What Developers Think

The sample is dominated by four ideas: Jev as a typed classifier, agent router, probabilistic rule primitive, and cheap control layer around LLMs. Observed categories were ${topCategories.map(([name, count]) => `${name} (${count})`).join(", ")}.

Enthusiasm focuses on moving intelligence from a visible chat surface into invisible software infrastructure. Skepticism is less developed, but the strongest criticism is methodological: launch figures are largely repeated rather than reproduced, and “zero hallucinations” can obscure schema-valid wrong decisions.

## What People Are Building

${actual.map((project) => `- **${project.name}:** ${project.description} ${link(project.source)}`).join("\n")}

Proposals are tracked separately:

${proposed.map((project) => `- **${project.name}:** ${project.description} ${link(project.source)}`).join("\n") || "- No additional proposals met the evidence threshold."}

## Interesting Experiments

- **MAGI-style quorum:** three probabilistic judges feed deterministic majority logic. It is useful for studying whether repeated decisions add diversity or merely correlated confidence.
- **Goblin HR:** Jev evaluates candidates while TypeScript assembles the final team, making the model/code boundary inspectable.
- **Doom demonstration:** launch discussion points to fast game decisions, but the collected posts do not constitute a reproducible benchmark.
- **Home Assistant:** frequent state evaluation with explicit token-budget protection is a practical test of continuous decisions.

## Technical Discussions

The most substantive technical question is not whether Jev can return a typed value—it can—but how to govern that value. Production designs need threshold versioning, evaluation sets, distribution-shift monitoring, deterministic policy limits, traceable fallbacks, and cost/latency measurement at the full-workflow level.

Selected high-signal cached evidence:

${evidenceList(analysis)}

## Criticism

- Most X discussion restates launch material; repetition is not corroboration.
- A constrained schema prevents malformed free text, not incorrect decisions.
- Comparisons against “LLMs” may hide task-definition, model-selection, batching, and accuracy differences.
- Many proposed uses can already be served by rules, embeddings, or conventional classifiers.
- Network calls inside high-frequency loops can add operational risk even if inference is fast.

## Limitations

- Recent-search data covers a short launch-period window and is conditioned by the selected queries.
- Author identity was not expanded because user reads are separately billed; missing authors remain unknown.
- The current sample is English-only and excludes retweets.
- Linked projects were verified where a direct public repository or demo was located; product claims were not treated as performance evidence.
- Independent Jev accuracy, calibration, drift, adversarial behavior, and p95 latency remain open.

## Emerging Mental Models

1. **Typed classifier:** labels and scores replace prose.
2. **Agent router:** choices select a model, tool, specialist, or next step.
3. **Policy/decision engine:** probabilities become predicates inside ordinary code.
4. **Verifier:** confidence determines accept, retry, check, or escalate.
5. **Intelligent switch statement:** semantic branching becomes cheap enough to appear throughout a codebase.
6. **Machine-to-machine intelligence:** the result is designed for software consumption, not a human reader.

The central disagreement is replacement versus complement. The evidence favors replacement for bounded decision calls and complementarity for generative workflows.

## Emerging Architecture Patterns

${analysis.patterns.map((pattern) => `### ${pattern.name}\n\n${pattern.description} **Caveat:** ${pattern.caveat}`).join("\n\n")}

## Intelligence Everywhere

The novel design space begins when one request can afford many judgments:

- **10 decisions/request:** route, check risk, choose tools, and set fallback policy.
- **100 decisions/request:** score candidate memories, claims, records, files, or UI actions independently.
- **1,000 decisions/request:** continuous event filtering, test exploration, observability sampling, or simulation control—provided batching, limits, and latency actually support it.
- **Continuous decisions:** home state, desktop activity, notifications, webhooks, and agent traces become streams of semantic events.

This is a hypothesis to benchmark, not an established production capability.

## New Design Space

Cheap typed judgment makes software architectures more granular. Instead of giving an agent broad authority, systems can make many narrow decisions and attach deterministic policy to each one. Instead of sending every candidate to a premium model, a cascade can spend more only when uncertainty is high. Instead of one global “AI confidence,” each action can expose its own decision contract.

The key engineering artifact becomes a **decision trace**: state version, question schema, distribution, threshold policy, selected action, fallback, and eventual outcome.

## Surprising Use Cases

- Semantic admission control for an LLM context window.
- Intelligent OpenTelemetry trace sampling.
- A macOS activity timeline based on event-boundary decisions rather than screenshots.
- Confidence-aware retry policies for distributed systems.
- Adaptive selection of UI test scenarios.
- Background-task scheduling based on user and device context.
- Decision quorums for multi-agent systems.

## Jev-Native Products

### Products That Would Be Stupid With LLM Economics But Make Sense With Jev

These products depend on dense decision frequency rather than swapping one API provider:

${analysis.ideas.filter((idea) => /every|continuous|hundreds|thousands|many|per event|per trace|per notification/iu.test(`${idea.whyJev} ${idea.product} ${idea.architecture}`)).slice(0, 12).map((idea) => `- **${idea.name}:** ${idea.advantage}`).join("\n")}

Their feasibility still depends on measuring total end-to-end latency, error rates, batching behavior, and cost.

## Build Ideas

Thirty grounded hypotheses are fully specified in [build-ideas.md](./build-ideas.md). Highest indie-fit options:

${ideaList(analysis.ideas, 10)}

## Best Small Experiments

1. **Decision Regression Harness (1–3 days):** fixtures, probability tolerances, and CI diffs. Validate whether typed outputs are materially easier to test than generated JSON.
2. **MCP Capability Router (2–4 days):** hide irrelevant tools before each turn. Measure context tokens and tool-selection errors.
3. **Agent Loop Stopper (3–5 days):** replay agent traces and compare fixed step limits with continue/verify/stop decisions.
4. **Home Assistant shadow mode (2–4 days):** log proposed actions without executing. Measure override rate and daily cost.
5. **Context Admission Controller (3–7 days):** compare Jev scoring with embedding top-k on repository file selection.

## Open Questions

- How well calibrated are probabilities on independent, domain-specific datasets?
- What accuracy is achieved at the published latency and cost levels?
- How does performance change as many questions are evaluated against one state?
- Are repeated Jev calls sufficiently independent for quorum architectures?
- What monitoring detects decision drift without ground truth on every event?
- When do rules, embeddings, or compact local classifiers remain superior?
- Which API limits and batching patterns govern high-frequency production use?
- How should teams version thresholds when model behavior changes?
- Can sensitive state be minimized or processed locally enough for desktop and enterprise use?
- Which early integrations retain real users after launch-week experimentation?

## Sources

Primary and implementation sources:

- [TypeSafe quick start](https://docs.typesafe.ai/introduction/quickstart)
- [TypeSafe primitives](https://docs.typesafe.ai/primitives)
- [TypeSafe launch article](https://typesafe.ai/blog/introducing-system-one-models-and-jev)
- [TypeSafe website and current public pricing](https://typesafe.ai/)
- [Vercel AI Gateway announcement](https://vercel.com/changelog/typesafe-ai-jev-now-available-on-ai-gateway)
- [HA-Jev repository](https://github.com/AboveColin/HA-Jev)
- [typesafe-mcp repository](https://github.com/itsmostafa/typesafe-mcp)
- [MAGI System on Jev repository](https://github.com/hide-G/magi-system-on-jev)
- [Goblin HR demo](https://goblin-hr.kostysh.chatgpt.site/)

X sources are preserved individually in **data/raw/posts.jsonl**, **data/processed/posts.jsonl**, and the evidence sections above. Source-quality labels and detailed claims are in [claims.md](./claims.md).`;
}

export async function generateReport(rootDir = process.cwd()): Promise<ResearchAnalysis> {
  const analysisPath = resolve(rootDir, "data/processed/analysis.json");
  let analysis = await readJson<ResearchAnalysis | null>(analysisPath, null);
  if (!analysis) analysis = await analyzeResearch(rootDir);
  await writeTextAtomic(resolve(rootDir, "research/JEV-REPORT.md"), renderReport(analysis));
  return analysis;
}
