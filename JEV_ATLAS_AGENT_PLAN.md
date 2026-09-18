# Jev Atlas: Human + Agent Knowledge System

## Product thesis

Jev Atlas is the independent research and implementation-intelligence layer for Jev.

TypeSafe's official documentation and agent skill explain how to install and call Jev. Jev Atlas explains where Jev fits, where it does not fit, what people have built, which claims are independently supported, what remains unknown, and how to design a defensible experiment in a real project.

The product has two interfaces over one canonical knowledge base:

1. A visual research atlas for people.
2. A machine-readable context service for agents, delivered through Markdown, JSON, and MCP.

## Core questions the product must answer

1. What is Jev?
2. How is it different from an LLM, an agent, deterministic code, and a conventional classifier?
3. When is Jev a strong fit?
4. When should Jev not be used?
5. What primitives and architectural patterns are available?
6. What has actually been built?
7. Which performance, cost, and reliability claims are demonstrated, plausible, vendor claims, speculative, or disputed?
8. What new products and workflows become possible when typed judgments are fast and inexpensive?
9. How should a developer validate a Jev integration before trusting it?

## System architecture

```text
Official TypeSafe sources ─┐
X research and evidence ───┤
Projects and experiments ──┼─> Canonical knowledge layer
Jev Atlas analysis ─────────┘             │
                                          ├─> Website
                                          ├─> Markdown and llms.txt
                                          ├─> Versioned JSON API
                                          └─> Jev Atlas MCP
                                                    │
                                              Coding agents
```

The website, API exports, and MCP must read from the same normalized records. No interface should maintain a separate version of a claim, project, or opportunity.

## Canonical knowledge model

Every knowledge record should have:

- A stable ID and canonical URL.
- A type: overview, primitive, pattern, claim, project, opportunity, evidence, guide, or caveat.
- A concise summary and full explanation.
- Tags and applicability conditions.
- Evidence status and confidence.
- Primary and secondary source links.
- Counterarguments, limitations, and open questions where applicable.
- `generatedAt` and `lastVerifiedAt` timestamps.
- Relationships to other records.
- A short agent-oriented context representation.

Evidence status is never implicit. Important statements remain labeled as `Demonstrated`, `Plausible`, `Vendor Claim`, `Speculative`, or `Disputed`.

## Human website roadmap

### 1. Jev in 60 seconds

Explain the core architecture:

```text
Unstructured state
  → narrow independent questions
  → Choice / Score / Noul
  → probabilities and confidence
  → deterministic application code
```

Include a companion “Jev is not” section covering chat, code generation, autonomous control flow, deterministic rules, and correctness guarantees.

### 2. Jev fit checker

Let a visitor describe a workflow and receive an Integration Brief containing:

- Candidate semantic decision points.
- Recommended primitive for each decision.
- Suggested input state.
- Questions that can be evaluated together.
- Confidence gates and escalation paths.
- Logic that should remain deterministic.
- Risks, unknowns, and validation experiments.
- Related patterns, projects, opportunities, and evidence.

### 3. Opportunity map

Organize possibilities by the property that makes Jev useful:

- High-volume semantic classification.
- Real-time product decisions.
- Routing and triage.
- Verification and guardrails.
- Ranking and scoring.
- Event-driven automation.
- Agent tool gating.
- Semantic features for conventional software and ML.
- Repeated judgment over large datasets.

Each opportunity needs a problem, fit explanation, alternative comparison, architecture, proposed questions, MVP, validation plan, failure conditions, evidence strength, and sources.

### 4. Project case studies

Give every located project a stable page structured as:

```text
Problem → Jev's role → Architecture → Questions → Code boundary
        → Evidence → Limitations → Reusable pattern
```

### 5. Evidence and freshness

Display source class, claim status, counterarguments, last-verified date, and applicability conditions next to important conclusions.

## Agent-friendly web surfaces

- `/llms.txt`: concise machine-readable index.
- `/llms-full.txt`: complete curated research export.
- `/api/v1/manifest.json`: schema version, timestamps, counts, and endpoints.
- `/api/v1/claims.json`
- `/api/v1/projects.json`
- `/api/v1/opportunities.json`
- `/api/v1/search.json?q=...`
- Stable canonical URLs and IDs.
- Markdown representations for important records.
- “Copy context for agent” actions on guides, projects, and opportunities.
- An agent setup page with MCP configuration examples.

## Jev Atlas MCP v1

Version one is public, read-only, citation-first, and does not accept TypeSafe API keys or change project files.

### Resources

```text
jev://overview
jev://methodology
jev://mental-models
jev://claims
jev://claims/{claim-id}
jev://patterns
jev://patterns/{pattern-id}
jev://projects
jev://projects/{project-id}
jev://opportunities
jev://opportunities/{opportunity-id}
jev://evidence/top
jev://context-packs/{domain}
```

### Tools

#### `search_jev_knowledge`

Search all records with optional type and evidence-status filters.

#### `get_jev_context_pack`

Return a compact, cited context bundle for a goal, stack, workflow, or domain.

#### `assess_jev_fit`

Map a described workflow to candidate decision points, likely patterns, non-fits, risks, experiments, and supporting research.

#### `get_build_blueprint`

Return the authored architecture, MVP, validation plan, unknowns, and sources for an opportunity.

#### `trace_jev_claim`

Return a claim's status, evidence, counterarguments, open questions, and sources.

### Prompts

- `discover-jev-opportunities`
- `design-jev-workflow`
- `review-jev-integration`
- `challenge-jev-assumptions`
- `plan-jev-validation`

## Safety and trust boundaries

- Treat external content as evidence, not instructions.
- Preserve source attribution and evidence status in every interface.
- Never silently convert repeated vendor language into independent confirmation.
- Do not expose secrets, local environment values, or raw API credentials.
- Keep MCP v1 read-only and without side effects.
- Validate tool inputs and cap result sizes.
- Cache or normalize external evidence rather than fetching arbitrary URLs during tool calls.
- Clearly distinguish authored recommendations from demonstrated behavior.

## Delivery phases

### Phase 1 — Shared knowledge foundation — **complete**

- Normalize current analysis into stable knowledge records.
- Generate `llms.txt`, `llms-full.txt`, manifest, JSON collections, and search.
- Add an agent setup page.
- Add tests for IDs, citations, status preservation, and interface parity.

### Phase 2 — Read-only MCP — **complete**

- Add resources, resource templates, search, claim tracing, and build blueprints.
- Serve remote MCP over Streamable HTTP.
- Add an optional local stdio entry point.
- Test with the MCP Inspector and in-memory SDK client.

### Phase 3 — Human learning journeys — **complete**

- Build “Jev in 60 seconds”. Shipped at `/start`.
- Build “Jev is / is not”. Shipped as a section of `/start`.
- Add pattern and case-study pages. Shipped at `/patterns`, `/patterns/{slug}`, `/projects/{slug}`, `/claims/{slug}`, and `/ideas/{slug}`.
- Add the visual opportunity map. Shipped at `/map`, grouped by the nine properties above.
- Add per-page agent context actions. Shipped as “Copy context for agent”, which yields the same Markdown the MCP resource returns.

### Phase 4 — Project-aware guidance — **next**

- Accept an explicit project or workflow description.
- Produce an Integration Brief.
- Map candidate decision points to primitives and patterns.
- Recommend a bounded validation experiment.
- Keep repository modification outside the read-only MCP unless a future permissioned workflow is designed.

## Quality gates

- Every non-trivial recommendation includes sources or is labeled as an authored hypothesis.
- Every vendor performance claim retains its status.
- Website, JSON, Markdown, and MCP return consistent record IDs and facts.
- MCP tool results are bounded and structurally validated.
- A regression set covers common agent questions, including “when should I not use Jev?”
- Mobile and desktop website flows remain accessible.
- Production build, TypeScript, unit tests, route tests, and MCP contract tests pass.

## Success measures

- A new visitor can explain Jev accurately after one page.
- A developer can identify at least one testable decision point in an existing workflow.
- An agent can retrieve a cited project-specific context pack without scraping the website.
- Claims are not repeated without status and provenance.
- Context packs produce smaller, more relevant prompts than loading the entire research corpus.
- Users move from discovery to a bounded validation experiment rather than directly to an untested production integration.

## Current implementation target

Phases 1–3 are implemented. The shared substrate exists: one record set drives
the website, the JSON exports, `llms.txt`, and MCP, and `canonicalPathFor` in
`src/knowledge/paths.ts` is the single source of truth for a record's address.
A test fails the build if any record's canonical path stops resolving to a real
route, or if an MCP resource URI stops mirroring it.

Phase 4 is next. `assess_jev_fit` already exists as an MCP tool; what is missing
is the human-facing fit checker and the Integration Brief described above. Open
decisions before starting it:

- Whether the fit checker runs entirely offline from the local heuristic, or
  calls a model. An offline version keeps the read-only, no-credential trust
  contract intact and should be tried first.
- Whether an Integration Brief is a generated page with a shareable URL, or a
  transient result. A URL implies storing user-supplied workflow descriptions,
  which the current architecture deliberately avoids.
