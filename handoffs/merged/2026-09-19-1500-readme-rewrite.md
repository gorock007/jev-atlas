# Rewrite README.md for a first-time GitHub visitor
status: done
agent: claude sonnet
brief: handoffs/briefs/2026-09-20-0900-readme.md

## What the user asked
Rewrite README.md to be scannable in 30 seconds by a first-time visitor, ≤70 lines, in a fixed
order: identity + live link + disclaimer, 4 feature bullets with live links, MCP connect snippet
and fallbacks, local run instructions, a compressed "refresh the research" section, a corrected
data-handling section, and a stack/docs/license close.

## What changed
Replaced the full README with the requested structure (60 lines). Verified against the repo:
- Live URL, tool names (`search_jev_knowledge`, `get_jev_context_pack`, `assess_jev_fit`,
  `get_build_blueprint`, `trace_jev_claim`) confirmed in `src/mcp/server.ts`.
- `/llms.txt` and `/llms-full.txt` confirmed as routes in `src/app/`.
- `AI_GATEWAY_API_KEY` fallback confirmed in `src/lib/fit-check.ts:97`.
- Stack versions (Next 16, React 19, Tailwind 4, MCP SDK v2) confirmed in `package.json`.
- Fixed the data-handling inaccuracy called out in the brief: the old README said "only derived
  research artifacts are committed" without naming which files are gitignored vs. committed. New
  text explicitly lists what's gitignored (raw/processed posts, seen-post index, run state, `.env`)
  vs. what's committed (`data/processed/analysis.json`, `research/*.md`) and what those committed
  files contain (links/scores/categories/themes, never post text), per `.gitignore` and
  `test/security.test.ts`.
- Compressed collection + budget-safety sections to the dry-run command, one `collect` example,
  and the three ceilings + 10% margin in one sentence, per the brief.

## Files
- README.md — modified

## Checks run
None required per the brief beyond proofreading; proofread the final file for line count (60,
under the 70 target) and fact accuracy against `package.json`, `src/mcp/server.ts`, `.gitignore`,
and `src/lib/fit-check.ts`. Did not run `npm run check` (not requested for a docs-only change).

## Notes for Jarvis
No shared files touched beyond README.md. Suggested commit message: `docs: rewrite README for a
first-time GitHub visitor`.
