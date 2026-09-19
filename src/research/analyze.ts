import { resolve } from "node:path";
import type {
  Category,
  PatternFinding,
  ProcessedPost,
  ProjectFinding,
  ResearchAnalysis,
  ResearchClaim,
} from "../types.js";
import { readJsonLines, writeJsonAtomic, writeTextAtomic } from "../utils/files.js";
import { BUILD_IDEAS } from "./catalog.js";

const OFFICIAL_DOCS = "https://docs.typesafe.ai/primitives";
const OFFICIAL_LAUNCH = "https://typesafe.ai/blog/introducing-system-one-models-and-jev";
const VERCEL = "https://vercel.com/changelog/typesafe-ai-jev-now-available-on-ai-gateway";
const LANGCHAIN = "https://www.langchain.com/blog/building-a-harness-with-jev";
const OPENROUTER = "https://openrouter.ai/typesafe/jev-latest";
const THE_REGISTER = "https://www.theregister.com/ai-and-ml/2026/09/16/typesafe-ai-debuts-model-for-machines-that-plays-doom/5296711";

function mdLink(url: string, label = "source"): string {
  return `[${label}](${url})`;
}

function firstEvidence(posts: ProcessedPost[], pattern: RegExp): string | undefined {
  return posts.find((entry) => pattern.test(entry.post.text))?.post.url;
}

function sources(urls: string[]): string {
  return [...new Set(urls)].map((url, index) => mdLink(url, `source ${index + 1}`)).join(", ");
}

function deriveClaims(posts: ProcessedPost[]): ResearchClaim[] {
  const latency = firstEvidence(posts, /(?:latency|20.?200x faster|150ms|70.?500 ?ms)/iu);
  const cost = firstEvidence(posts, /(?:\$0\.042|40.?400x cheaper|output (?:is )?free)/iu);
  const routing = firstEvidence(posts, /\b(?:rout|agent|tool selection)\w*/iu);
  const skepticism = firstEvidence(posts, /(?:company'?s own|self.reported|claim|hype|misleading)/iu);
  const demos = posts.filter((entry) => entry.categories.includes("DEMO") || entry.categories.includes("CODE"));

  return [
    {
      claim: "Jev exposes constrained decision primitives for Boolean probability, choice distributions, and ordered scores.",
      status: "Demonstrated",
      evidence: "The public API documentation defines `noul`, `choice`, and `score` response shapes.",
      sources: [OFFICIAL_DOCS],
      counterarguments: "A documented interface demonstrates the contract, not the quality of decisions behind it.",
      openQuestions: "How stable are these contracts and calibration properties across model revisions?",
    },
    {
      claim: "TypeSafe reports Jev as materially faster than LLM workflows on its own evaluations.",
      status: "Vendor Claim",
      evidence: "The launch material reports large latency multiples; X discussion mostly repeats those figures. Trade press (The Register) relays the same vendor figures without independent measurement.",
      sources: [OFFICIAL_LAUNCH, THE_REGISTER, ...(latency ? [latency] : [])],
      counterarguments: "No independent benchmark in the collected dataset reproduces the headline range on representative workloads.",
      openQuestions: "What are p50/p95 latency and accuracy under equal task definitions and concurrency?",
    },
    {
      claim: "TypeSafe reports a low input-token price and no metered output-token charge for Jev.",
      status: "Vendor Claim",
      evidence: "Published pricing is echoed across launch discussion, but remains mutable vendor pricing.",
      sources: ["https://typesafe.ai/", THE_REGISTER, ...(cost ? [cost] : [])],
      counterarguments: "Application cost also includes retries, state construction, integration, and any fallback LLM calls.",
      openQuestions: "Will pricing and limits remain attractive at production volume?",
    },
    {
      claim: "Typed output removes free-form parsing but does not make wrong decisions impossible.",
      status: "Demonstrated",
      evidence: "The API contract constrains output types; correctness and calibration are separate empirical properties.",
      sources: [OFFICIAL_DOCS],
      counterarguments: "Marketing language such as “zero hallucinations” may use hallucination narrowly to mean invalid free text.",
      openQuestions: "How should incorrect but schema-valid decisions be measured and communicated?",
    },
    {
      claim: "Routing, classification, verification, and workflow control are the dominant early mental models.",
      status: "Plausible",
      evidence: "Those categories recur in the collected launch discussion and align with the documented output primitives.",
      sources: [OFFICIAL_DOCS, ...(routing ? [routing] : [])],
      counterarguments: "The sample is launch-week and query-conditioned, so repeated framing does not establish adoption.",
      openQuestions: "Which use case produces independent, reproducible value first?",
    },
    {
      claim: "Developers have published small Jev integrations and demonstrations.",
      status: "Demonstrated",
      evidence: `${demos.length} retained posts were classified as code or demos; public repositories exist for Home Assistant, MCP, and a MAGI-style experiment.`,
      sources: ["https://github.com/AboveColin/HA-Jev", "https://github.com/itsmostafa/typesafe-mcp", "https://github.com/hide-G/magi-system-on-jev"],
      counterarguments: "Existence of code is not evidence of production reliability or commercial demand.",
      openQuestions: "Which projects have active users, evaluations, and maintained integrations?",
    },
    {
      claim: "The strongest near-term architecture is Jev as a complement and control layer around generative models.",
      status: "Plausible",
      evidence: "Jev produces decisions rather than prose; Vercel and OpenRouter expose it through evaluation-oriented endpoints, and LangChain documents it as a routing and guardrail layer inside its own harness.",
      sources: [VERCEL, OPENROUTER, LANGCHAIN, OFFICIAL_DOCS],
      counterarguments: "Simple rules or conventional classifiers may be cheaper and more predictable for many bounded tasks. Platform and framework integrations are partner announcements, not independent evaluations.",
      openQuestions: "At what ambiguity and volume does Jev outperform rules, embeddings, and compact classifiers?",
    },
    {
      claim: "Cheap decision calls could make tens or hundreds of semantic judgments per event economical.",
      status: "Speculative",
      evidence: "The product design follows from published pricing and parallel question primitives, not independent production evidence.",
      sources: [OFFICIAL_LAUNCH, OFFICIAL_DOCS],
      counterarguments: "Network latency, data preparation, correlated errors, and rate limits may dominate at high decision counts.",
      openQuestions: "Does batching many questions preserve accuracy and calibration?",
    },
    {
      claim: "Headline benchmark and reliability claims remain insufficiently independently verified.",
      status: "Plausible",
      evidence: "The collected discussion overwhelmingly relays launch claims; at least one source explicitly labels the figures self-reported.",
      sources: [...(skepticism ? [skepticism] : []), THE_REGISTER, OFFICIAL_LAUNCH],
      counterarguments: "The ecosystem is only days old, so absence of independent evidence is expected rather than disconfirming.",
      openQuestions: "Who will publish the first task-matched, reproducible comparison?",
    },
  ];
}

function deriveProjects(posts: ProcessedPost[]): ProjectFinding[] {
  const find = (pattern: RegExp) => posts.find((entry) => pattern.test(entry.post.text));
  const goblin = find(/Goblin HR/iu);
  const magi = find(/MAGI system/iu);
  const axon = find(/Axon Work/iu);
  return [
    {
      name: "HA-Jev", builder: "AboveColin", status: "ACTUALLY BUILT",
      source: "https://github.com/AboveColin/HA-Jev",
      description: "A Home Assistant custom integration exposing Jev evaluations as sensors and automation actions.",
      jevRole: "Repeated state classification and typed automation decisions.",
      architecture: "Home Assistant state → TypeSafe evaluation → sensor/action result with a local token-budget guard.",
      insight: "Decision models can act as a semantic layer inside an existing event-driven rules engine.",
      repositoryOrDemo: "https://github.com/AboveColin/HA-Jev",
    },
    {
      name: "typesafe-mcp", builder: "itsmostafa", status: "ACTUALLY BUILT",
      source: "https://github.com/itsmostafa/typesafe-mcp",
      description: "An MCP server exposing TypeSafe evaluation to coding agents.",
      jevRole: "Machine-readable decisions and probabilities available as agent tools.",
      architecture: "MCP client → server tool → TypeSafe API → typed response.",
      insight: "The probability-bearing result can be preserved through agent infrastructure instead of flattened to prose.",
      repositoryOrDemo: "https://github.com/itsmostafa/typesafe-mcp",
    },
    {
      name: "MAGI System on Jev", builder: "hide-G", status: "ACTUALLY BUILT",
      source: magi?.post.url ?? "https://github.com/hide-G/magi-system-on-jev",
      description: "An open-source three-sage voting experiment inspired by Neon Genesis Evangelion.",
      jevRole: "Independent probabilistic judgments combined through majority voting.",
      architecture: "Question → three Jev evaluations → deterministic aggregation → decision.",
      insight: "Cheap typed judgments invite ensemble and quorum experiments, though correlated errors still need measurement.",
      repositoryOrDemo: "https://github.com/hide-G/magi-system-on-jev",
    },
    {
      name: "Goblin HR", builder: "Kostysh", status: "ACTUALLY BUILT",
      source: goblin?.post.url ?? "https://goblin-hr.kostysh.chatgpt.site/",
      description: "A small inspectable demo that evaluates candidates for an impossible mission.",
      jevRole: "Scores/selects candidates while deterministic TypeScript assembles the party.",
      architecture: "Mission state → candidate decisions → deterministic application logic.",
      insight: "Keeping selection probabilistic and execution deterministic makes the boundary easy to inspect.",
      repositoryOrDemo: "https://goblin-hr.kostysh.chatgpt.site/",
    },
    {
      name: "Axon Work integration", builder: "Axon Work author", status: "ACTUALLY BUILT",
      source: axon?.post.url ?? "https://axon123.com",
      description: "The author states that Axon Work uses Jev-style model decisions with a skill/action harness.",
      jevRole: "Decision layer feeding an action-delivery harness.",
      architecture: "Model decision → skill chain → action harness.",
      insight: "A decision model can be invisible infrastructure beneath a workflow product.",
      repositoryOrDemo: "https://axon123.com",
    },
    {
      name: "ProgressGate", builder: "AshutoshVJTI", status: "ACTUALLY BUILT",
      source: "https://github.com/AshutoshVJTI/progressgate",
      description: "An npm package that detects semantic stagnation in agent tool-calling loops, published with tests, a quickstart, and a live demo build.",
      jevRole: "One Jev systemOne call per check returns six atomic signals (assumption contradicted, strategy novelty, material progress, and others); Jev never executes or blocks a tool call itself.",
      architecture: "Agent trajectory → Jev semantic signals → deterministic hysteresis policy in application code → CONTINUE/WARN/REPLAN/HALT decision.",
      insight: "Keeping the halt decision in a deterministic policy layer, with a fail-open default on Jev/network errors, means an API outage cannot itself look like agent stagnation.",
      repositoryOrDemo: "https://github.com/AshutoshVJTI/progressgate",
    },
    {
      name: "chess-jev", builder: "gopalanj", status: "ACTUALLY BUILT",
      source: "https://github.com/gopalanj/chess-jev",
      description: "A chess move scorer with a working FastAPI/uvicorn server, browser UI, and test suite; its primary scoring backends are local fine-tuned models, with Jev wired in as one optional hosted backend. The builder also published a companion local model, ChessJev-MiniLM-v1 (huggingface.co/gopalanj/chessjev-minilm-v1): a MiniLM-L6 encoder with an attention head, full-finetuned on Apple M1 MPS against Stockfish 19 teacher labels.",
      jevRole: "An optional CHESS_JEV_SCORER=typesafe backend that posts board state and move candidates to TypeSafe's hosted System One API and falls back to a local model on error. The Hugging Face model card itself states plainly it is not TypeSafe Jev and is not Elo-tested.",
      architecture: "Board state → candidate move generation → scorer router (local MiniLM/byte model, hosted Jev, or heuristic fallback) → ranked move.",
      insight: "The repository explicitly disclaims being 'TypeSafe Jev' or 'OpenJev' — Jev appears only as a pluggable hosted option behind locally trained defaults, not the core of the product.",
      repositoryOrDemo: "https://github.com/gopalanj/chess-jev",
    },
    {
      name: "TypeSafe Agent Skills", builder: "TypeSafe (vendor)", status: "ACTUALLY BUILT",
      source: "https://github.com/typesafe-ai/skills",
      description: "TypeSafe's own published Claude Code plugin and skills.sh package that teaches coding agents to design and wire up Jev workflows.",
      jevRole: "The skill's entire purpose is composing typed Jev judgments (Choice, Score, Noul) into agent-written code.",
      architecture: "Agent skill install (plugin marketplace or skills.sh) → SKILL.md instructions → agent composes TypeSafe API calls in the user's codebase.",
      insight: "Vendor-authored, so it demonstrates TypeSafe's own recommended integration pattern rather than independent adoption evidence.",
      repositoryOrDemo: "https://github.com/typesafe-ai/skills",
    },
    {
      name: "Jev Playground", builder: "Unknown (no linked repo)", status: "ACTUALLY BUILT",
      source: "https://jevtypesafe.vercel.app/",
      description: "A live, interactive hosted demo with three preset use cases (Support Router, Compare & Choose, Content Triage) that runs real text through Jev and renders the typed judgments and computed routing.",
      jevRole: "Every threshold, route, and explanation shown is computed by the demo's own application code from Jev's Choice/Score/Noul judgments, not by Jev directly.",
      architecture: "Free-text customer request → Jev typed judgment call → client-side thresholding and routing display.",
      insight: "The page has no visible link to a GitHub repository or builder identity, so it reads as a demo of the interface pattern rather than an attributable third-party build.",
      repositoryOrDemo: null,
    },
    {
      name: "jev-router", builder: "gargpratyush", status: "ACTUALLY BUILT",
      source: "https://github.com/gargpratyush/jev-router",
      description: "An npm-published CLI wrapper that launches Claude Code or OpenAI Codex through a loopback proxy, with a documented test suite covering shared policy, both request formats, and decision display.",
      jevRole: "One Jev call per fresh user turn returns task-complexity signals that pick an abstract model tier (fast/balanced/strong/long); an explicit local policy layer (explicit overrides, fail-open on error, no downgrade at low confidence) turns that into the concrete model.",
      architecture: "User turn → loopback proxy → Jev tier recommendation → src/policy.mjs deterministic rules → concrete Claude/Codex model → forwarded request.",
      insight: "Routing is explicitly fail-open and confidence-aware in the policy code, not in Jev itself — the README states Jev failure never blocks the CLI and low confidence never triggers a downgrade.",
      repositoryOrDemo: "https://github.com/gargpratyush/jev-router",
    },
    {
      name: "SemIf (formerly OpenJev)", builder: "TheoLeeCJ", status: "ACTUALLY BUILT",
      source: "https://github.com/TheoLeeCJ/SemIf",
      description: "An independent open-weights reproduction of Jev's runtime-defined typed-decision interface, running a locally hosted 4B model (e.g. Qwen3.5-4B) on a consumer GPU with a browser WebGPU demo, committed benchmark runs, and row-level output data.",
      jevRole: "None — this project does not call TypeSafe's Jev API. It reproduces the interface pattern (typed options read as native logits instead of generated text) with an open model the builder controls, and its own site benchmarks against Jev only as a published external reference point.",
      architecture: "Runtime state + criteria + typed options → local open model forward pass → option logits read directly (no sampled answer token) → probabilities.",
      insight: "Both the GitHub README and the openjev.com site state plainly, unprompted, that the project is independent and not affiliated with or endorsed by TypeSafe — it was renamed from OpenJev to SemIf, evidence the interface pattern itself, not TypeSafe's model or brand, is what's being reproduced.",
      repositoryOrDemo: "https://github.com/TheoLeeCJ/SemIf",
    },
    {
      name: "J3vRoute", builder: "Unknown (no linked repo)", status: "ACTUALLY BUILT",
      source: "https://j3vroute.agents.bakingbad.dev",
      description: "A live, working single-page paper-trading demo: it simulates a virtual USDG portfolio traded across three markets on \"Robinhood Chain,\" with fills clearly labelled as simulated (no swap is signed or broadcast).",
      jevRole: "TypeSafe Jev selects buy, sell, or hold for all three markets in one request, then sizes each trade with a Score across five levels that sets position size (0.5-5% of gross portfolio value).",
      architecture: "3Route finds prices/routes on-chain → Jev decision (buy/sell/hold + sizing Score) per market → simulated fill applied to a virtual portfolio.",
      insight: "Pairs Jev's decision output directly with a routing protocol (3Route) rather than a coding agent or classifier pipeline — the trade-execution boundary (dry-run only, explicitly labelled) is kept separate from the decision boundary.",
      repositoryOrDemo: null,
    },
    {
      name: "system-one-router", builder: "npm publisher (unverified identity)", status: "ACTUALLY BUILT",
      source: "https://www.npmjs.com/package/system-one-router",
      description: "A published npm extension (v0.4.5) for the Pi coding agent that adds a per-turn model router; its README states it is based on and retains attribution to an existing router, yeliu84/pi-model-router.",
      jevRole: "An optional LLM-intent-classifier mode calls TypeSafe's System One API (model jev-latest) to categorize task intent, overriding the package's own keyword/heuristic router when configured.",
      architecture: "User turn → optional Jev classifier call or local heuristics → high/medium/low tier → mapped to a configured concrete model per tier.",
      insight: "Jev is one swappable classifier backend behind a router that works without it (heuristics are the default) — a lower-commitment integration pattern than jev-router's Jev-only design.",
      repositoryOrDemo: null,
    },
    {
      name: "is-odd-jev", builder: "npm publisher (unverified identity)", status: "ACTUALLY BUILT",
      source: "https://www.npmjs.com/package/is-odd-jev",
      description: "A published npm package (v1.1.0, zero dependencies) that answers whether a number is odd by calling a Jev Noul primitive and returning its calibrated probability instead of a bare boolean.",
      jevRole: "The entire package: one Noul call per invocation, against api.typesafe.ai or the Vercel AI Gateway's typesafe-ai/jev model, returns { odd, p, ms, output_tokens }.",
      architecture: "Integer input → single Noul question (\"Is n odd?\") → probability read from the model's own distribution, not narrated.",
      insight: "This is a joke package in the lineage of is-odd/is-odd-ai (its README says as much), but it is not a fake integration: it genuinely calls Jev's API and correctly demonstrates that Noul returns a probability rather than a confidence field bolted onto a boolean.",
      repositoryOrDemo: null,
    },
    {
      name: "Confidence-gated agent control loops", builder: "Developer discussion", status: "PROPOSED",
      source: firstEvidence(posts, /(?:agent|workflow).*(?:confidence|probabilit)|(?:confidence|probabilit).*(?:agent|workflow)/iu) ?? OFFICIAL_LAUNCH,
      description: "Use Jev repeatedly to route, verify, and decide whether an agent should continue or escalate.",
      jevRole: "Low-latency control decisions between generative steps.",
      architecture: "Agent state → route/verify/continue decisions → deterministic controller → next step.",
      insight: "The potential is fewer unnecessary generative calls, not simply replacing one model endpoint.",
      repositoryOrDemo: null,
    },
  ];
}

function derivePatterns(posts: ProcessedPost[]): PatternFinding[] {
  const urlsFor = (category: Category) => posts
    .filter((entry) => entry.categories.includes(category))
    .slice(0, 3)
    .map((entry) => entry.post.url);
  return [
    { name: "Decision sidecar", description: "A typed judgment service sits beside ordinary code; code owns effects and safety boundaries.", evidence: [OFFICIAL_DOCS, ...urlsFor("ARCHITECTURE")], caveat: "The extra network hop must beat a local rule or classifier." },
    { name: "Cascade router", description: "A cheap decision chooses whether to use rules, a small model, a premium model, a specialist, or a human.", evidence: urlsFor("ROUTING"), caveat: "Bad routing can erase all cost savings through failures and retries." },
    { name: "Confidence gate", description: "Automation proceeds above a threshold; ambiguous cases go to another check or a person.", evidence: [OFFICIAL_DOCS, ...urlsFor("VERIFICATION")], caveat: "Thresholds require workload-specific calibration and monitoring." },
    { name: "Parallel decision matrix", description: "One state is evaluated against many named questions, replacing repeated prompt/parse cycles.", evidence: [OFFICIAL_DOCS, OFFICIAL_LAUNCH], caveat: "Accuracy and question interactions under large batches remain unknown." },
    { name: "Probabilistic predicate + deterministic action", description: "Jev supplies fuzzy predicates while TypeScript, policies, and workflows execute constrained actions.", evidence: ["https://goblin-hr.kostysh.chatgpt.site/", "https://github.com/AboveColin/HA-Jev"], caveat: "Incorrect predicates are still operational errors even when outputs are valid." },
    { name: "Decision quorum", description: "Multiple typed judgments are aggregated through voting or confidence-aware stopping.", evidence: ["https://github.com/hide-G/magi-system-on-jev"], caveat: "Calling the same model repeatedly may produce correlated rather than independent evidence." },
  ];
}

function renderClaims(claims: ResearchClaim[]): string {
  return `# Research Claims\n\nGenerated from cached evidence. Repetition on X is not treated as independent corroboration.\n\n${claims.map((claim) => `## ${claim.claim}\n\n- **Status:** ${claim.status}\n- **Evidence:** ${claim.evidence}\n- **Sources:** ${sources(claim.sources)}\n- **Counterarguments:** ${claim.counterarguments}\n- **Open questions:** ${claim.openQuestions}`).join("\n\n")}`;
}

function renderProjects(projects: ProjectFinding[]): string {
  const section = (status: ProjectFinding["status"]) => projects.filter((project) => project.status === status).map((project) => `### ${project.name}\n\n- **Builder:** ${project.builder}\n- **Source:** ${mdLink(project.source)}\n- **What was built:** ${project.description}\n- **Jev's role:** ${project.jevRole}\n- **Architecture:** ${project.architecture}\n- **Interesting insight:** ${project.insight}\n- **Repository / demo:** ${project.repositoryOrDemo ? mdLink(project.repositoryOrDemo) : "Not independently located"}`).join("\n\n");
  return `# What People Are Building\n\n“Actually built” means a public repository, demo, integration, or direct builder demonstration was located. It does not imply production validation.\n\n## ACTUALLY BUILT\n\n${section("ACTUALLY BUILT")}\n\n## PROPOSED\n\n${section("PROPOSED")}`;
}

function renderMentalModels(posts: ProcessedPost[], counts: Record<string, number>): string {
  const total = Math.max(1, posts.length);
  const row = (name: string, categories: Category[], interpretation: string) => {
    const count = posts.filter((post) => categories.some((category) => post.categories.includes(category))).length;
    return `| ${name} | ${count} (${Math.round(count / total * 100)}%) | ${interpretation} |`;
  };
  return `# Emerging Mental Models\n\nThese frequencies describe the retained, query-conditioned X sample; they are not ecosystem market share. A post may count toward several models.\n\n| Mental model | Posts in retained sample | Reading |\n|---|---:|---|\n${[
    row("Typed classifier", ["CLASSIFICATION", "TECHNICAL_EXPLANATION"], "Jev replaces prose with labels, scores, and probabilities."),
    row("Agent router", ["ROUTING", "AGENT_INFRASTRUCTURE"], "Jev chooses a model, tool, specialist, or next action."),
    row("Verification gate", ["VERIFICATION"], "Jev decides whether another system's output may proceed."),
    row("Probabilistic rules engine", ["AUTOMATION", "ARCHITECTURE"], "Fuzzy predicates feed deterministic workflows."),
    row("LLM complement", ["COMPARISON", "AGENT_INFRASTRUCTURE"], "A fast control plane surrounds generative work."),
    row("LLM replacement", ["COMPARISON"], "For bounded decisions, a text-generating model may be unnecessary."),
  ].join("\n")}\n\n## Disagreements\n\n- **New model category vs specialized classifier:** TypeSafe frames System One Models as a new category; skeptics may reasonably ask for comparisons with compact classifiers and rules.\n- **No hallucinations vs schema-valid errors:** constrained output removes invented prose and parsing failures, but not incorrect choices.\n- **Replacement vs complement:** the evidence supports replacement for bounded decision calls and complementarity wherever text, code, or reasoning traces must be generated.\n\nRaw category counts are available in \`data/processed/analysis.json\` (${Object.keys(counts).length} observed categories).`;
}

function renderPatterns(patterns: PatternFinding[]): string {
  return `# Emerging Architecture Patterns\n\n${patterns.map((pattern) => `## ${pattern.name}\n\n${pattern.description}\n\n- **Evidence:** ${sources(pattern.evidence)}\n- **Caveat:** ${pattern.caveat}`).join("\n\n")}`;
}

function renderIdeas(ideas: ResearchAnalysis["ideas"]): string {
  return `# Build Ideas\n\nThese are hypotheses grounded in the documented typed-decision interface, collected X discussion, and located projects. Confidence reflects evidence and MVP tractability—not guaranteed demand.\n\n${ideas.map((item, index) => `## ${index + 1}. ${item.name}\n\n- **Problem:** ${item.problem}\n- **Product:** ${item.product}\n- **Why Jev:** ${item.whyJev}\n- **Architecture:** ${item.architecture}\n- **Current alternative:** ${item.currentAlternative}\n- **Jev advantage:** ${item.advantage}\n- **1–7 day MVP:** ${item.mvp}\n- **Validation experiment:** ${item.validation}\n- **Evidence:** ${sources(item.evidence)}\n- **Unknowns:** ${item.unknowns}\n- **Confidence:** ${item.confidence} — ${item.confidenceReason}`).join("\n\n")}`;
}

function renderOpportunities(ideas: ResearchAnalysis["ideas"]): string {
  const ranked = [...ideas].sort((a, b) => b.indieFit - a.indieFit || a.name.localeCompare(b.name)).slice(0, 10);
  return `# Personal Build Opportunities\n\nRanked for a technical indie developer: fast prototype, visible demo, little proprietary data, and a credible open-source wedge.\n\n| Rank | Opportunity | Indie fit | First proof | Confidence |\n|---:|---|---:|---|---|\n${ranked.map((item, index) => `| ${index + 1} | ${item.name} | ${item.indieFit}/10 | ${item.mvp.replace(/\|/gu, "\\|")} | ${item.confidence} |`).join("\n")}\n\n## Recommended first three\n\n1. **Decision Regression Harness** — smallest dependency surface and immediately useful to anyone evaluating Jev.\n2. **MCP Capability Router** — a visually clear agent-infrastructure demonstration with measurable token and tool-selection outcomes.\n3. **Agent Tool Firewall** — a strong macOS/open-source demo, provided deterministic policy remains the final safety boundary.`;
}

export async function analyzeResearch(rootDir = process.cwd(), relevanceThreshold = 60): Promise<ResearchAnalysis> {
  const processedPath = resolve(rootDir, "data/processed/posts.jsonl");
  const posts = await readJsonLines<ProcessedPost>(processedPath);
  const retained = posts.filter((post) => post.relevance_score >= relevanceThreshold);
  const categoryCounts: Record<string, number> = {};
  for (const entry of retained) for (const category of entry.categories) categoryCounts[category] = (categoryCounts[category] ?? 0) + 1;
  const claims = deriveClaims(retained);
  const projects = deriveProjects(retained);
  const patterns = derivePatterns(retained);
  const dynamicEvidence = retained.slice(0, 5).map((post) => post.post.url);
  const ideas = BUILD_IDEAS.map((entry) => ({ ...entry, evidence: [...new Set([...entry.evidence, ...dynamicEvidence.slice(0, 1)])] }));
  const analysis: ResearchAnalysis = {
    generatedAt: new Date().toISOString(),
    dataset: {
      totalPosts: posts.length,
      retainedPosts: retained.length,
      analyzedPosts: posts.filter((post) => post.relevance_score >= 75).length,
      highValuePosts: posts.filter((post) => post.relevance_score >= 85).length,
    },
    categoryCounts,
    claims,
    projects,
    patterns,
    ideas,
    topEvidence: retained.slice(0, 20).map((entry) => ({
      url: entry.post.url,
      relevance: entry.relevance_score,
      technicalDepth: entry.technical_depth,
      buildPotential: entry.build_potential,
      categories: entry.categories,
      themes: entry.themes,
      scoreReasons: entry.score_reasons,
    })),
  };

  await writeJsonAtomic(resolve(rootDir, "data/processed/analysis.json"), analysis);
  await Promise.all([
    writeTextAtomic(resolve(rootDir, "research/claims.md"), renderClaims(claims)),
    writeTextAtomic(resolve(rootDir, "research/what-people-are-building.md"), renderProjects(projects)),
    writeTextAtomic(resolve(rootDir, "research/mental-models.md"), renderMentalModels(retained, categoryCounts)),
    writeTextAtomic(resolve(rootDir, "research/architecture-patterns.md"), renderPatterns(patterns)),
    writeTextAtomic(resolve(rootDir, "research/build-ideas.md"), renderIdeas(ideas)),
    writeTextAtomic(resolve(rootDir, "research/build-opportunities.md"), renderOpportunities(ideas)),
  ]);
  return analysis;
}

