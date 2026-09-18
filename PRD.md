# PRD — Jev Atlas research engine

## 1. Overview

Build a local research engine that uses the official X API to investigate the emerging ecosystem around **Jev by TypeSafe AI**.

This is not intended to be a generic Twitter/X scraper.

The system should intelligently discover, collect, filter, organize, and analyze high-value conversations about Jev while operating under a strict X API budget.

The final objective is to answer:

> What is happening around Jev right now, what are developers learning and building with it, and what new products or software architectures become possible because of it?

The system should turn the X conversation into structured research and then use that research to generate grounded product ideas, experiments, architecture patterns, and opportunities.

The primary optimization target is:

**INSIGHT PER API DOLLAR**

not:

**NUMBER OF POSTS COLLECTED**

---

## 2. Background

Jev is a model released by TypeSafe AI around the idea of fast, typed, probabilistic decisions rather than traditional text generation.

The emerging design space may include areas such as:

- agent routing
- classification
- verification
- tool selection
- scoring
- workflow decisions
- probabilistic software
- agent control loops
- large numbers of small AI decisions

However, the research system must not assume these are the only applications.

The purpose of this project is specifically to discover what developers are actually doing, discussing, criticizing, experimenting with, and proposing.

---

## 3. Core Research Question

The project should ultimately help answer:

> What becomes possible when software can make extremely cheap, fast, intelligent, typed decisions everywhere?

Secondary questions:

1. What exactly is Jev?
2. What is technically different about it?
3. What does TypeSafe claim?
4. What has independently been demonstrated?
5. How are developers thinking about it?
6. What are people building?
7. What experiments are appearing?
8. What criticisms are emerging?
9. What limitations have developers encountered?
10. What architecture patterns are emerging?
11. What does Jev replace?
12. What does Jev complement?
13. What does Jev make economically feasible?
14. What could one developer build with it?
15. What entirely new product categories could emerge?

---

## 4. Product Goals

The application must:

1. Research official Jev/TypeSafe material.
2. Search X through the official X API.
3. Discover relevant Jev conversations.
4. Spend no more than a user-defined API budget.
5. Prioritize high-information posts.
6. Remove irrelevant noise.
7. Detect duplicate posts.
8. Selectively investigate important conversations.
9. Identify projects and experiments.
10. Identify technical arguments and criticisms.
11. Extract important claims.
12. Cluster recurring ideas.
13. Identify emerging mental models.
14. Generate grounded product opportunities.
15. Produce a comprehensive Markdown research report.
16. Preserve source links for verification.
17. Cache collected data for repeated offline analysis.

---

## 5. Non-Goals

The system is NOT:

- a generic X scraper
- an engagement analytics dashboard
- a social media scheduler
- a sentiment-analysis product
- an X monitoring SaaS
- an X clone
- a follower-growth tool
- a mass archival system
- a tool for downloading every post mentioning Jev

Do not optimize for dataset size.

---

## 6. Target User

Initial user:

A technical indie developer interested in:

- AI agents
- developer tooling
- agent infrastructure
- macOS/iOS utilities
- productivity software
- SaaS
- AI-native products
- open-source experimentation

The research should therefore eventually translate ecosystem observations into technically feasible build opportunities.

---

## 7. High-Level Architecture

```text
                OFFICIAL SOURCES
                      │
                      ▼
              Jev Foundations
                      │
                      │
X API ────────► Discovery Engine
                      │
                      ▼
                Raw X Dataset
                      │
                      ▼
              Deduplication
                      │
                      ▼
             Relevance Filter
                      │
              ┌───────┴───────┐
              ▼               ▼
          Low Value        High Value
           Ignore              │
                               ▼
                    Conversation Expansion
                               │
                               ▼
                       Research Dataset
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
            Claims          Projects         Patterns
              │                │                │
              └────────────────┼────────────────┘
                               ▼
                         AI Analysis
                               │
                               ▼
                     Opportunity Engine
                               │
                               ▼
                        JEV-REPORT.md
```

Collection and analysis MUST remain separate.

X API access should only be necessary during collection.

Analysis should operate primarily against locally cached data.

---

## 8. Technology

Preferred implementation:

- TypeScript
- Node.js
- official X API
- local JSONL/JSON storage initially
- Markdown output

Do not introduce a database unless the implementation genuinely benefits from one.

The first version should remain simple enough to run locally.

---

## 9. Environment

Credentials must be provided through environment variables.

Example:

```bash
X_BEARER_TOKEN=
```

Never:

- commit credentials
- print full credentials
- hard-code credentials

Provide:

```text
.env.example
```

Ensure `.env` is gitignored.

---

## 10. Official Source Research

Before collecting X data, research current official sources.

Prioritize:

- TypeSafe AI
- Jev documentation
- Jev API documentation
- TypeSafe technical material
- TypeSafe GitHub repositories
- official demos
- launch material
- relevant Vercel integration documentation
- relevant official SDK documentation

Understand concepts including:

- Jev
- System One Models
- typed decisions
- calibrated probabilities
- Choice
- Score
- Boolean decisions
- RLCD
- latency
- pricing
- parallel decisions
- routing
- verification
- classification

Create:

```text
research/jev-foundations.md
```

Separate information into:

```text
FACT
VENDOR CLAIM
INDEPENDENT OBSERVATION
OPINION
SPECULATION
UNKNOWN
```

Never present TypeSafe marketing claims as independently established facts.

---

## 11. X API Research

Use only supported X API functionality.

Before implementation, inspect CURRENT official X API documentation.

Do not guess:

- endpoints
- pricing
- pagination behavior
- rate limits
- available fields
- search operators
- billing behavior

---

## 12. Initial Search Strategy

Start with highly targeted queries.

Possible starting concepts:

```text
"Jev" "TypeSafe AI"
"Jev" typesafe
"Jev model" typesafe
"Jev" agent
"Jev" routing
"Jev" benchmark
"Jev" classifier
"Jev" github
"Jev" demo
"Jev" experiment
"Jev" latency
"Jev" verification
"Jev" cost
"System One Models" typesafe
"RLCD" typesafe
```

These are starting points, not a fixed exhaustive query list.

---

## 13. Official Account Discovery

Reliably identify:

- TypeSafe AI official X account
- relevant founders
- relevant engineers/team members

Do not guess handles.

Prioritize:

- launch posts
- technical explanations
- demos
- replies explaining architecture
- discussions surrounding major posts

---

## 14. Adaptive Search

The research strategy should evolve based on discoveries.

Example:

```text
Initial discovery
       ↓
Developers repeatedly mention agent routing
       ↓
Create targeted routing queries
       ↓
Discover implementation
       ↓
Investigate implementation
```

Search should therefore have two phases:

### Phase A — Discovery

Broad but targeted searches.

### Phase B — Exploitation

Spend remaining API budget investigating promising themes.

---

## 15. API Budget

Budget management is a HARD requirement.

Default:

```text
$3 USD
```

Configurable maximum:

```text
$5 USD
```

CLI:

```bash
--budget-usd
```

Example:

```bash
npm run collect -- \
  --budget-usd 3 \
  --max-posts 750 \
  --max-requests 50
```

The collector must stop when ANY configured hard limit is reached.

---

## 16. Budget Safety

Implement three independent limits:

```text
--budget-usd
--max-posts
--max-requests
```

Whichever occurs first terminates additional collection.

These are safety ceilings, not targets.

The system does NOT need to consume the full allowance.

---

## 17. Pricing Awareness

Before implementation, research current X API pricing.

Create:

```text
src/x/pricing.ts
```

The system should estimate usage conservatively.

If authoritative real-time billing/usage information is programmatically available, use it where practical.

Otherwise maintain an estimated cost.

Never intentionally exceed the configured budget.

If exact billing cannot be guaranteed, leave a safety margin.

For example:

```text
Configured budget: $3.00
Internal safe ceiling: $2.70
```

The exact safety strategy should be determined based on current X billing behavior.

---

## 18. Budget Reporting

During collection display:

```text
Jev Research Run

Budget:              $3.00
Estimated spend:     $0.82
Remaining:           $2.18

Requests:            11 / 50
Posts fetched:       312 / 750
Unique posts:        241
Relevant posts:      96
High-value posts:    31
```

At approximately 80%:

```text
WARNING: 80% API budget consumed
```

Near the safety ceiling, stop low-priority discovery.

At the hard/safe limit:

```text
BUDGET LIMIT REACHED
Stopping X collection.
```

---

## 19. Dry Run

Implement:

```bash
--dry-run
```

Dry run must make ZERO paid X API calls.

It should show the planned queries, strategy, configured limits, and estimated maximum spend.

---

## 20. Date Filtering

Implement:

```bash
--since
```

Example:

```bash
--since 2026-09-15
```

Focus primarily on the period surrounding Jev's public emergence.

Older posts can be collected when necessary for technical context.

---

## 21. Custom Queries

Support:

```bash
--query
```

Example:

```bash
npm run collect -- \
  --budget-usd 1 \
  --query "Jev agent routing"
```

This allows future targeted research without changing source code.

---

## 22. Raw Data Schema

Store raw results in:

```text
data/raw/posts.jsonl
```

Suggested structure:

```json
{
  "id": "",
  "text": "",
  "author_id": "",
  "username": "",
  "author_name": "",
  "created_at": "",
  "url": "",
  "conversation_id": "",
  "in_reply_to_user_id": "",
  "metrics": {
    "likes": 0,
    "replies": 0,
    "reposts": 0,
    "quotes": 0,
    "bookmarks": null,
    "impressions": null
  },
  "query_source": "",
  "collected_at": ""
}
```

Gracefully handle unavailable API fields.

Never fabricate missing data.

---

## 23. Deduplication

Deduplicate primarily using X post ID.

Maintain persistent seen IDs.

Suggested:

```text
data/seen-posts.json
```

Do not repeatedly analyze the same post.

Where technically possible, avoid paying to retrieve known information again.

---

## 24. Relevance Engine

Every retrieved post should receive a local relevance score from 0–100.

Signals include:

- genuinely about TypeSafe Jev
- technical explanation
- architecture discussion
- code
- GitHub link
- demo
- project
- benchmark
- implementation
- experiment
- unusual use case
- meaningful criticism
- comparison
- limitation
- performance observation
- developer experience
- TypeSafe team explanation

Suggested interpretation:

```text
0–39   Noise
40–59  Possibly relevant
60–74  Retain
75–84  Analyze
85–100 Candidate for deeper investigation
```

Thresholds should be configurable.

---

## 25. Engagement Is Not Relevance

Do NOT rank posts primarily by likes/reposts.

A technical post with 7 likes may have significantly higher research value than a generic launch reaction with thousands of likes.

Engagement should only be a secondary signal.

---

## 26. Noise Filtering

Explicitly deprioritize generic reactions such as:

```text
huge
wow
🔥
game changer
can't wait
this is insane
AI is moving fast
```

unless they contain additional substantive information.

---

## 27. Conversation Expansion

Do NOT retrieve every reply.

Only expand conversations around high-value posts.

Suggested condition:

```text
relevance >= 85
```

AND at least one:

```text
CODE
PROJECT
EXPERIMENT
BENCHMARK
ARCHITECTURE
CRITICISM
USE_CASE
GITHUB
TECHNICAL_DISCUSSION
```

---

## 28. External Links

Extract URLs from important posts.

Relevant destinations may include:

- GitHub
- documentation
- blog posts
- demos
- benchmarks
- project websites

Research those sources independently where appropriate.

Never assume an X author's description of a linked source is accurate.

---

## 29. Classification

Each retained post/conversation can have multiple classifications:

```text
ANNOUNCEMENT
TECHNICAL_EXPLANATION
ARCHITECTURE
DEMO
CODE
PROJECT
EXPERIMENT
USE_CASE
PRODUCT_IDEA
AGENT_INFRASTRUCTURE
ROUTING
CLASSIFICATION
VERIFICATION
AUTOMATION
BENCHMARK
PERFORMANCE
COST
CRITICISM
LIMITATION
COMPARISON
SPECULATION
QUESTION
OTHER
```

---

## 30. Research Scores

Useful heuristic scores:

```text
relevance_score
novelty_score
technical_depth
build_potential
```

Range: 0–100.

These must explicitly be treated as research heuristics rather than objective measurements.

---

## 31. Processed Dataset

Create:

```text
data/processed/posts.jsonl
```

Processed records may contain:

```json
{
  "post": {},
  "categories": [],
  "relevance_score": 91,
  "novelty_score": 77,
  "technical_depth": 88,
  "build_potential": 83,
  "summary": "",
  "key_claims": [],
  "linked_projects": [],
  "themes": []
}
```

---

## 32. Checkpointing

Collection MUST be resumable.

After each successful page/request persist:

- retrieved posts
- seen IDs
- completed queries
- pagination state
- estimated spend
- request count
- relevant-post count

Suggested:

```text
data/run-state.json
```

If the process crashes, it should resume rather than restart unnecessarily.

---

## 33. Diminishing Return Detection

Do not continue a query merely because budget remains.

Track:

```text
unique relevant posts / request
```

and where possible:

```text
unique relevant posts / estimated dollar
```

Stop paginating when marginal research value becomes poor.

---

## 34. Research Claims

Create:

```text
research/claims.md
```

For each important claim include:

- Claim
- Sources
- Evidence
- Status: Demonstrated / Plausible / Speculative / Vendor Claim / Disputed
- Counterarguments
- Open Questions

Repeated claims must not automatically become facts.

---

## 35. What People Are Building

Create:

```text
research/what-people-are-building.md
```

Separate:

```text
ACTUALLY BUILT
```

from:

```text
PROPOSED
```

For actual projects capture:

- Project
- Builder
- Source
- What Was Built
- Jev's Role
- Architecture
- Why Jev?
- Interesting Insight
- Repository / Demo

---

## 36. Mental Models

Create:

```text
research/mental-models.md
```

Investigate whether developers conceptualize Jev as:

- classifier
- LLM replacement
- LLM complement
- agent router
- policy engine
- AI decision layer
- verifier
- probabilistic rules engine
- intelligent switch statement
- machine-to-machine intelligence
- something else

Identify disagreements and represent competing interpretations fairly.

---

## 37. Emerging Architecture Patterns

Look for repeated architectures such as routing, verification loops, event classification, agent control, and decision layers.

Create:

```text
research/architecture-patterns.md
```

Do not limit research to predefined examples.

---

## 38. New Design Space

Investigate the implications of replacing:

```text
STATE
↓
LLM
↓
TEXT
↓
PARSE
↓
VALIDATE
↓
ACTION
```

with something closer to:

```text
STATE
↓
TYPED DECISION
↓
PROBABILITY
↓
CODE
↓
ACTION
```

Ask:

> What changes when intelligent judgment becomes another cheap software primitive?

---

## 39. Intelligence Everywhere

Specifically investigate systems requiring:

```text
10 decisions/request
100 decisions/request
1,000 decisions/request
continuous decisions
decisions per event
decisions per user action
decisions inside agent loops
```

Look for applications that would be economically or technically unattractive using traditional LLM calls.

---

## 40. Jev-Native Products

Create a dedicated research section:

```text
Products That Would Be Stupid With LLM Economics But Make Sense With Jev
```

The purpose is to find products where frequent intelligent decisions are fundamental to the architecture.

Do not simply replace GPT with Jev.

Look for applications whose architecture changes because cheap decision intelligence exists.

---

## 41. Opportunity Generation

Create:

```text
research/build-ideas.md
```

Generate at least 30 grounded ideas.

For each include:

- Idea
- Problem
- Product
- Why Jev?
- Architecture
- Current Alternative
- Jev Advantage
- MVP that one developer could prototype in 1–7 days
- Validation Experiment
- Evidence
- Unknowns
- Confidence: LOW / MEDIUM / HIGH with explanation

Ideas must be inspired by actual research.

---

## 42. Idea Quality

Avoid generic ideas such as AI task managers, chatbots, writing assistants, or note-taking apps unless the Jev architecture fundamentally changes the product.

Ask:

> Why does this product become meaningfully more interesting specifically because Jev exists?

If there is no strong answer, reject the idea.

---

## 43. Personal Build Opportunities

Create:

```text
research/build-opportunities.md
```

Prioritize opportunities suitable for one technical indie developer interested in:

- AI agents
- developer tools
- agent infrastructure
- macOS
- iOS
- productivity
- SaaS
- open source

Prefer opportunities that:

- can be prototyped quickly
- don't require large proprietary datasets
- don't require large teams
- don't require enterprise contracts for initial validation
- have a visually compelling demo
- can potentially be open sourced
- demonstrate something genuinely different

Avoid merely building a Jev wrapper.

Jev should ideally be invisible infrastructure.

---

## 44. Research Report

Generate:

```text
research/JEV-REPORT.md
```

Required structure:

```markdown
# Jev Research Report

## Executive Summary
## What Jev Actually Is
## System One Models
## How Jev Works
## How Jev Differs From Traditional LLM Usage
## What TypeSafe Claims
## What Has Been Independently Demonstrated
## What Developers Think
## What People Are Building
## Interesting Experiments
## Technical Discussions
## Criticism
## Limitations
## Emerging Mental Models
## Emerging Architecture Patterns
## Intelligence Everywhere
## New Design Space
## Surprising Use Cases
## Jev-Native Products
## Build Ideas
## Best Small Experiments
## Open Questions
## Sources
```

---

## 45. Citations

Every important research claim should trace back to its source.

Prefer original sources:

- X post
- GitHub repository
- official documentation
- technical article
- demo

Do not fabricate citations.

If something cannot be verified, explicitly state that.

---

## 46. Source Quality

Use this rough contextual hierarchy:

```text
Official documentation
        ↓
Actual code/repository
        ↓
Demonstrated experiment
        ↓
Technical explanation
        ↓
Developer observation
        ↓
Opinion
        ↓
Speculation
```

A repository demonstrating behavior can be stronger evidence than marketing documentation claiming behavior.

---

## 47. CLI

Desired commands:

```bash
npm run research:dry
```

```bash
npm run collect -- \
  --budget-usd 3 \
  --max-posts 750 \
  --max-requests 50 \
  --since 2026-09-15
```

Then:

```bash
npm run process
npm run analyze
npm run report
```

Potential convenience command:

```bash
npm run research
```

which runs the appropriate pipeline while preserving budget controls.

---

## 48. Suggested Repository Structure

```text
jev-research/

├── src/
│   ├── x/
│   │   ├── client.ts
│   │   ├── pricing.ts
│   │   ├── queries.ts
│   │   ├── collector.ts
│   │   ├── conversations.ts
│   │   └── budget.ts
│   ├── processing/
│   │   ├── deduplicate.ts
│   │   ├── relevance.ts
│   │   ├── classify.ts
│   │   └── links.ts
│   ├── research/
│   │   ├── claims.ts
│   │   ├── projects.ts
│   │   ├── patterns.ts
│   │   ├── mental-models.ts
│   │   ├── opportunities.ts
│   │   └── ideas.ts
│   ├── reporting/
│   │   └── report.ts
│   └── utils/
├── data/
│   ├── raw/
│   │   └── posts.jsonl
│   ├── processed/
│   │   └── posts.jsonl
│   ├── seen-posts.json
│   └── run-state.json
├── research/
│   ├── jev-foundations.md
│   ├── claims.md
│   ├── what-people-are-building.md
│   ├── mental-models.md
│   ├── architecture-patterns.md
│   ├── build-ideas.md
│   ├── build-opportunities.md
│   └── JEV-REPORT.md
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── PRD.md
```

The implementation may adjust this structure if there is a clear technical reason.

---

## 49. Logging

Collection should provide understandable progress including current query, fetched/new/relevant/high-value counts, total unique posts, requests used, and estimated spend.

---

## 50. Failure Handling

The application should gracefully handle:

- rate limits
- temporary X API errors
- network failures
- invalid credentials
- unavailable fields
- malformed responses
- duplicate data
- deleted posts
- unavailable conversations
- API changes

Use exponential backoff where appropriate.

Do NOT retry indefinitely.

Retries must also respect budget/request limits.

---

## 51. Cost Protection

No component should be capable of silently making unlimited API requests.

Every paid X API request must pass through the centralized budget manager.

```text
REQUEST
   ↓
Budget Manager
   ↓
Can request proceed?
   ↓
YES ──► X API
NO  ──► STOP
```

Avoid code paths that bypass this layer.

---

## 52. Research Efficiency

Before making another X request, ask programmatically:

```text
Do we already have enough information locally?
```

Prefer local processing over another paid request whenever possible.

---

## 53. Information-Gain Strategy

The collector should behave more like a researcher than a crawler.

Example:

```text
Spend $0.40
    ↓
Learn vocabulary
    ↓
Identify important people
    ↓
Identify interesting claims
    ↓
Spend $0.80 investigating those
    ↓
Identify projects
    ↓
Spend $0.70 investigating builders
    ↓
Information gain drops
    ↓
STOP
```

Remaining budget does not need to be consumed.

---

## 54. Success Metrics

The primary success metric is:

```text
High-quality actionable insight produced per API dollar.
```

Supporting indicators:

- relevant-post ratio
- duplicate rate
- useful conversations discovered
- actual projects identified
- architecture patterns identified
- technical criticisms discovered
- source-backed product ideas generated
- API spend
- information gained per additional request

---

## 55. Example Successful Run

A successful $3 research run might produce:

```text
300–700 unique posts retrieved
100–250 genuinely relevant posts
20–50 high-value technical posts
10–20 useful conversations
5–20 actual projects/experiments
multiple competing mental models
several emerging architecture patterns
30+ grounded build ideas
```

These numbers are examples, NOT collection targets.

A smaller dataset containing stronger information is preferable.

---

## 56. Definition of Done

V1 is complete when:

- X authentication works
- current X API behavior/pricing has been verified
- budget manager works
- hard spending controls exist
- dry-run works
- targeted search works
- pagination works
- deduplication works
- checkpoint/resume works
- relevance filtering works
- conversation expansion is selective
- raw dataset is preserved
- processed dataset is generated
- research artifacts are generated
- actual builds and proposed ideas are separated
- source links are preserved
- 30+ grounded opportunities can be generated
- JEV-REPORT.md is generated
- README explains operation
- no credentials are committed

---

## 57. Implementation Instructions for Claude Code

Before writing code:

1. Read this entire PRD.
2. Inspect the existing repository.
3. Research current official X API documentation.
4. Research current official TypeSafe/Jev documentation.
5. Verify current X API pricing.
6. Identify the correct endpoints and available fields.
7. Determine how reliably API spend can be estimated/enforced.
8. Design the budget manager.
9. Design the collection pipeline.
10. Produce an implementation plan.

Do NOT immediately start building everything.

First create:

```text
IMPLEMENTATION_PLAN.md
```

Include:

- architecture
- API strategy
- pricing assumptions
- budget-enforcement strategy
- search strategy
- storage strategy
- analysis strategy
- implementation phases
- risks
- unknowns

Explicitly flag anything that cannot be verified.

Then implement incrementally.

---

## 58. Recommended Implementation Order

1. X API client + authentication.
2. Budget manager.
3. Dry-run functionality.
4. Basic targeted search.
5. Persistence + deduplication.
6. Checkpoint/resume.
7. Relevance filtering.
8. Adaptive search.
9. Selective conversation expansion.
10. External-source research.
11. Classification and claim extraction.
12. Project/experiment detection.
13. Architecture-pattern discovery.
14. Opportunity generation.
15. Final research report.

Test each phase before continuing.

---

## 59. Important Guardrails

Never:

- intentionally exceed the configured X budget
- make unlimited API calls
- blindly paginate
- collect posts simply because they mention "Jev"
- treat engagement as research quality
- treat vendor claims as proven facts
- treat repeated opinions as facts
- fabricate citations
- fabricate projects
- fabricate benchmarks
- invent API behavior
- guess current X pricing
- expose credentials
- rerun expensive collection when cached data is sufficient

---

## 60. Guiding Principle

The system should constantly optimize for:

```text
           USEFUL INSIGHT
VALUE = ───────────────────
             API COST
```

The goal is not:

> Scrape Twitter about Jev.

The goal is:

> **Use a tightly controlled amount of X API data to understand a new computing primitive, discover what developers are doing with it, identify emerging software patterns, and find products that become possible when intelligent decisions become cheap enough to exist everywhere in software.**
