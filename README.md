# Jev Atlas

An independent, evidence-first field guide to [Jev](https://typesafe.ai), TypeSafe AI's System One model — for people and for coding agents.

TypeSafe's own docs explain how to install and call Jev. Jev Atlas covers what the docs can't: where Jev fits, where it doesn't, what people have actually built, which claims are independently supported, and what's still unknown. Every statement carries an explicit evidence status — `Demonstrated`, `Plausible`, `Vendor Claim`, `Speculative`, or `Disputed` — and repetition never upgrades a vendor claim.

> Not affiliated with or endorsed by TypeSafe AI. This is independent research.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000. The repository ships with the generated research artifacts, so the site works immediately — no API key and no collection run needed.

## Two interfaces, one knowledge layer

The website, the JSON exports, and the MCP server all read the same normalized records, so no interface can drift into its own version of a claim.

**For people** — `/start` explains Jev in 60 seconds and what it is *not*. `/map` lays out 31 build hypotheses by the property of Jev each depends on. `/patterns`, `/projects`, `/claims`, and `/ideas` give every record a stable page with sources, limitations, and related work.

**For agents** — a read-only MCP server at `/mcp`, or over stdio with `npm run mcp:stdio`. Five tools: `search_jev_knowledge`, `get_jev_context_pack`, `assess_jev_fit`, `get_build_blueprint`, `trace_jev_claim`. Without MCP, use `/llms.txt`, `/llms-full.txt`, or `/api/v1/*.json`.

The MCP server is read-only. It never calls Jev, accepts a TypeSafe credential, fetches arbitrary URLs, or modifies files.

## Regenerating the research

The offline pipeline is free to rerun against the cached corpus:

```bash
npm run research     # process → analyze → report
npm run check        # typecheck, tests, production build
```

Collecting new evidence needs an X developer app with pay-per-use credits:

```bash
cp .env.example .env          # add your app-only Bearer token
npm run research:dry          # print the query plan and max spend — zero paid calls

npm run collect -- --budget-usd 3 --max-posts 750 --max-requests 50
npm run explore -- --budget-usd 0.60 --max-posts 100 --max-requests 6
npm run expand  -- --budget-usd 0.15 --max-posts 25 --max-requests 2
```

`collect` runs the focused query portfolio, `explore` derives adaptive queries from what's already cached, and `expand` opens only conversations that pass a high-value gate. Each keeps its own checkpoint and resumes without replaying finished work.

## Budget safety

Spending controls are the point of this tool, not a footnote. Every paid request passes through one budget manager with three independent hard ceilings — spend, returned posts, and request attempts — plus:

- a 10% internal safety margin below your configured budget
- worst-case cost reserved *before* each request, settled against what actually returned
- retries counted against the request ceiling, so no retry path can bypass a limit
- dry runs that never construct an authenticated client

Public X pricing was checked on 2026-09-18 at $0.005 per returned post. Prices change — recheck [the pricing page](https://docs.x.com/x-api/getting-started/pricing) before a paid run, and set a billing-cycle limit in the X Developer Console. A local estimator cannot cap spend across applications.

## Data handling

Collected X content stays local and is gitignored: raw and processed JSONL, the analysis, the seen-post index, and run state. The `.env` file is gitignored and the token is never logged. Only derived research artifacts are committed.

## Requirements

Node.js 20.10+. An X developer app is needed only for live collection.

## Docs

- [JEV_ATLAS_AGENT_PLAN.md](./JEV_ATLAS_AGENT_PLAN.md) — product thesis, knowledge model, and roadmap
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) — API strategy, pricing assumptions, and known limitations

## License

MIT
