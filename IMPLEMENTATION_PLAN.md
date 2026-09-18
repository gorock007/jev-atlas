# Jev Atlas — Engine Implementation Plan

Last verified: 2026-09-18

## Architecture

The application is a local TypeScript CLI with four deliberately separate stages:

1. `collect` queries the official X API and writes immutable raw JSONL records.
2. `process` performs deterministic, offline scoring, classification, link extraction, and deduplication.
3. `analyze` converts processed records into evidence-oriented research artifacts.
4. `report` composes the artifacts into `research/JEV-REPORT.md`.

All paid requests must go through one `BudgetManager`. Collection checkpoints after every successful page so it can resume without replaying completed work. JSON/JSONL is sufficient for V1 and keeps the collected evidence inspectable.

## Verified X API strategy

- Use `GET https://api.x.com/2/tweets/search/recent` with app-only Bearer authentication.
- The recent-search endpoint currently covers the previous seven days. `start_time` must fall inside that window.
- Request 10–100 posts per page and paginate with `next_token`.
- Request the currently allowed explicit post fields needed for research: `id,text,created_at,conversation_id,public_metrics,entities,lang`. Preserve identity/reference fields returned by the base post schema when available.
- Avoid author/username expansion by default because X currently prices User reads separately. If username or other author metadata is unavailable, store `null` and do not fabricate it.
- Use focused queries and `-is:retweet`. Conversation expansion will use a targeted `conversation_id:<id>` recent-search query only after a local high-value gate.
- Respect the documented 450 requests / 15 minutes app limit, though the CLI's much smaller `--max-requests` ceiling should normally stop first.

Sources:

- [Recent search API reference](https://docs.x.com/x-api/posts/search-recent-posts)
- [Search query guide](https://docs.x.com/x-api/posts/search/integrate/build-a-query)
- [Search pagination](https://docs.x.com/x-api/posts/search/integrate/paginate)
- [X API rate limits](https://docs.x.com/x-api/fundamentals/rate-limits)

## Pricing assumptions

Current public pay-per-use documentation lists:

- Post read: **$0.005 per returned resource**.
- User read: **$0.010 per returned resource**.
- Reads are deduplicated within a UTC day, but X calls this a soft guarantee.
- `GET /2/usage/credits` returns the current payer credit balance.
- The Developer Console supports a billing-cycle spending limit.

The code keeps pricing constants isolated in `src/x/pricing.ts`, dates them, and treats local spend as a conservative estimate rather than authoritative billing. Prices can change; they must be rechecked before a real run if the verification date is stale.

Source: [X API pay-per-usage pricing](https://docs.x.com/x-api/getting-started/pricing)

## Budget enforcement

- Default user budget: $3.00; accepted range: greater than $0 and no more than $5.00.
- Internal safe ceiling: 90% of the configured budget.
- Before every paid request, reserve the worst-case cost of the requested page (`max_results × post-read price`) plus any explicitly requested expansions.
- Choose page size from remaining safe budget and remaining post allowance. Never request fewer than the API minimum of 10; stop if ten worst-case post reads cannot fit.
- After a response, settle the reservation using returned resource counts. The estimate intentionally ignores X's soft same-day deduplication discount.
- Count every attempt against `--max-requests`, including retries, so retry paths cannot bypass safety controls.
- Emit an 80% warning once, then stop at any budget, post, or request ceiling.
- `--dry-run` never instantiates an authenticated network client and makes zero X calls.
- Recommend also setting an account-level spending limit in the X Developer Console; a local estimator cannot provide an authoritative cross-application billing cap.

## Search strategy

Phase A uses a small set of high-precision Jev/TypeSafe queries rather than one broad `Jev` query. Queries are ordered by likely information gain: canonical identity, technical model terms, implementations, performance/limitations, then use cases.

Phase B derives narrow build, evidence, criticism, and control-layer queries from category/theme frequencies in the cached results. The query portfolio defaults to 25-post pages so the first broad query cannot consume the whole budget. Pagination for a query stops when any ceiling is reached, no token remains, or two consecutive pages have poor marginal yield.

## Storage and resume strategy

- `data/raw/posts.jsonl`: append-only normalized API records.
- `data/seen-posts.json`: persistent unique IDs.
- `data/run-state.json`: versioned run configuration, query completion, pagination tokens, counts, estimates, and timestamps.
- `data/processed/posts.jsonl`: fully regenerable offline output.

Each successful page is normalized and appended first, then seen IDs and run state are atomically replaced. A saved pagination token is only advanced after raw persistence succeeds. Resume refuses materially incompatible limits/query sets unless a fresh run is explicitly requested in a future phase.

## Analysis strategy

The first processor is deterministic and explainable. It combines TypeSafe/Jev identity signals, technical vocabulary, source/code links, substantive length, and low-weight engagement; it strongly penalizes generic reaction-only posts. It outputs relevance, novelty, technical depth, and build-potential heuristics with matched reasons and multi-label categories.

The V1 analyzer is deterministic and extractive. It emits source-linked claims with explicit statuses, counterarguments, and open questions; separates located projects from proposals; derives mental models and architecture patterns; and renders 30+ curated, evidence-linked build hypotheses. An optional model provider could deepen synthesis later, but no model-generated statement may become evidence without a source record.

## Implementation phases

1. Repository scaffold, typed schemas, config, CLI parser, and tests.
2. Central budget manager, dated pricing constants, and zero-call dry run.
3. X recent-search client with bounded retries and helpful auth/rate-limit failures.
4. Targeted collector, normalization, JSONL persistence, deduplication, checkpoint/resume, progress reporting, and diminishing-return stop.
5. Offline relevance/classification/link processing and fixture tests.
6. Selective conversation expansion and adaptive queries. **Implemented.**
7. Evidence extraction, project/experiment detection, architecture patterns, 30+ opportunities, and report generation. **Implemented.**

8. Shared knowledge layer, llms.txt/JSON exports, and the agent setup page. **Implemented.**
9. Read-only MCP over Streamable HTTP and a local stdio entry point. **Implemented.**
10. Human learning journeys: `/start`, the pattern and case-study pages, the opportunity map, and per-record agent context actions. **Implemented.**

Phases 1–10 are implemented. Automated tests never make a paid request; live collection only occurs through explicit `collect`, `explore`, or `expand` commands and the centralized budget manager.

## Risks and unknowns

- Prices are mutable and the Developer Console is described by X as the definitive current source. Public documentation was verified on the date above, but an authenticated console price cannot be verified without the user's account.
- X's public documentation says reads are billed per resource returned. It does not promise that local estimates and the account ledger update atomically, so the safety margin and console spending limit remain important.
- The usage credit endpoint reports total balance, not a per-run reservation or authoritative per-request invoice.
- Recent search cannot retrieve material older than seven days. Full-archive search is a separate endpoint and should only be enabled after its availability and economics are confirmed for the user's account.
- Post-level `username` appears in the current response schema but may be unavailable on some access paths. V1 stores missing author metadata as `null` rather than triggering paid user lookups.
- Official TypeSafe performance, cost, calibration, and “zero hallucinations” statements are vendor claims until independently demonstrated.
