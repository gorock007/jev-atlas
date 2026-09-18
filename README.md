# Jev X Research Engine

A local, budget-controlled research pipeline for understanding the developer ecosystem around TypeSafe AI's Jev model. It optimizes for useful evidence per API dollar, not collection volume.

It includes a local Next.js research browser for navigating the generated evidence without opening Markdown and JSONL files manually.

The website and its agent interfaces share one canonical, evidence-aware knowledge layer. See [JEV_ATLAS_AGENT_PLAN.md](./JEV_ATLAS_AGENT_PLAN.md) for the human + agent product roadmap.

## Research website

Start the local site:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The interface includes:

- a research overview with live dataset and cost metrics
- `/start` — "Jev in 60 seconds", with an explicit "Jev is / is not" section
- cross-artifact search
- a filterable evidence-status claims ledger, with a stable page per claim
- actual projects kept separate from proposed architectures, with a case-study page each
- `/patterns` — the repeated architectural structures, with a page per pattern
- a master-detail explorer for all 31 build hypotheses, with a blueprint page each
- `/map` — the opportunity map, grouped by the property that makes Jev useful
- a searchable, scored browser for the cached X evidence
- an editorial reader for every generated Markdown artifact
- "Copy context for agent" on every record page
- responsive desktop and mobile navigation
- an agent setup page at `/agent`

Every claim, project, pattern, and opportunity has one canonical URL. The website
page, the JSON export, and the MCP resource for a record all resolve to the same
address, and a test fails the build if they drift apart.

## Agent interfaces

Start the site, then open [http://localhost:3000/agent](http://localhost:3000/agent) for the current MCP endpoint and machine-readable exports.

The read-only MCP endpoint is:

```text
http://localhost:3000/mcp
```

The same surface is available locally over stdio, without the website running:

```bash
npm run mcp:stdio
```

It exposes five tools:

- `search_jev_knowledge`
- `get_jev_context_pack`
- `assess_jev_fit`
- `get_build_blueprint`
- `trace_jev_claim`

It also exposes the overview, methodology, mental models, claims, projects, patterns, opportunities, and top evidence as resources, a resource per addressable record, and a `jev://context-packs/{domain}` template. MCP results preserve evidence status, limitations, and source links. The server does not call Jev, accept TypeSafe credentials, execute external instructions, or modify project files.

Agents without MCP support can use:

- `/llms.txt`
- `/llms-full.txt`
- `/api/v1/manifest.json`
- `/api/v1/claims.json`
- `/api/v1/projects.json`
- `/api/v1/opportunities.json`
- `/api/v1/search.json?q=agent+tool+gating`

For a production build:

```bash
npm run build
npm start
```

The site reads `data/processed/analysis.json`, `data/processed/posts.jsonl`, run checkpoints, and the `research/` Markdown files directly. After collecting new evidence, run `npm run research`, then refresh the dev server or rebuild the production site.

The current V1 supports:

- live X recent search through the official API
- three independent hard ceilings: spend, returned posts, and request attempts
- a 10% internal budget safety margin and worst-case pre-request reservations
- zero-call dry runs
- focused and custom queries
- adaptive exploitation queries derived from the cached dataset
- query-portfolio page sizing so one broad query cannot consume the entire budget
- JSONL raw storage, persistent deduplication, and checkpoint/resume
- bounded retries for rate limits and temporary failures
- diminishing-return stops
- deterministic offline relevance scoring, multi-label classification, and link extraction
- selective high-value conversation expansion
- extractive claims with explicit evidence status and counterarguments
- project, mental-model, and architecture-pattern research artifacts
- 30+ grounded build ideas and a complete Markdown report

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) for design choices and current limitations.

## Requirements

- Node.js 20.10 or newer
- An X developer app with pay-per-use credits and an app-only Bearer token for live collection

## Setup

```bash
npm install
cp .env.example .env
```

Add the Bearer token to `.env`. The file is gitignored, and the application never logs the token.

Before collecting, set a billing-cycle spending limit in the X Developer Console as an account-level backstop. Local estimates cannot account for activity from other apps using the same payer account.

## Dry run — no paid calls

```bash
npm run research:dry
```

Dry run prints the query plan, configured ceilings, current dated pricing assumption, and maximum estimated spend. It does not construct an X client or read credentials.

## Collect

```bash
npm run collect -- \
  --budget-usd 3 \
  --max-posts 750 \
  --max-requests 50 \
  --since 2026-09-15
```

Recent search currently supports the previous seven days. Omit `--since` to use X's default recent window.

Use one or more custom queries:

```bash
npm run collect -- \
  --budget-usd 1 \
  --max-posts 150 \
  --max-requests 10 \
  --query '"Jev" agent routing -is:retweet lang:en'
```

The collector resumes `data/run-state.json` only when the collection settings match. To intentionally begin a different run, archive the generated data files first.

Pages default to 25 posts so the budget is distributed across the query portfolio. Override with `--page-size 10–100`.

After the first processed dataset, run adaptive exploitation queries. This uses a separate checkpoint and ranks targeted build, evidence, criticism, and control-layer searches from local signals:

```bash
npm run explore -- \
  --budget-usd 0.60 \
  --max-posts 100 \
  --max-requests 6
```

Selectively expand only conversations that meet the high-value and category gates:

```bash
npm run expand -- \
  --budget-usd 0.15 \
  --max-posts 25 \
  --max-requests 2
```

## Process locally

```bash
npm run process
```

This reads `data/raw/posts.jsonl` and regenerates `data/processed/posts.jsonl` without an X request. Scores are transparent research heuristics, not objective measurements.

Generate all research artifacts locally:

```bash
npm run analyze
npm run report
```

Or rerun the complete offline pipeline:

```bash
npm run research
```

The final output is [research/JEV-REPORT.md](./research/JEV-REPORT.md). Supporting artifacts separate claims, actual builds, proposals, patterns, mental models, and opportunities.

## Verify

```bash
npm run check
```

No test makes a live X request.

## Cost model

Public X documentation was checked on 2026-09-18 and listed Post reads at $0.005 per returned post. The collector does not request author expansion because User reads were separately listed at $0.010 per returned user. Prices can change, so recheck the [official pricing page](https://docs.x.com/x-api/getting-started/pricing) before a paid run.

For a $3 configured budget, the engine uses a $2.70 internal safe ceiling. Before requesting a page, it reserves `max_results × $0.005`; after the response, it settles against the posts actually returned. It does not count X's same-day deduplication promise as savings because X describes that as a soft guarantee.

## Data handling

Collected X content remains local and is gitignored by default. Raw records preserve source links and missing fields remain `null`; the pipeline does not fabricate unavailable author or metric data.
