# Add four located builds and one independent speed report
worker: claude
model: opus
effort: high
started: 2026-09-20 00:10 · terminal: 9d7f56aa-84fa-4954-aae2-ffb84b6abe2d

## Goal
`deriveProjects` gains three located builds and one demo, and the speed claim
gains one independent report as evidence **without changing its status**.
Done: `npm run check` green, and the new items follow the exact shape of the
entries added in `handoffs/merged/` for briefs `2026-09-19-1255-new-projects`
and `2026-09-19-1720-third-party-sources` (read those handoffs first — copy
that pattern, including how constants for source URLs are declared).

## Context — sources already verified by Jarvis (use only these facts)
1. **Browser Use · jev-ultrafast** — https://github.com/browser-use/jev-ultrafast ,
   report https://github.com/browser-use/jev-ultrafast/blob/main/docs/performance.md .
   Publisher: Browser Use (third party, not TypeSafe). Jev picks the next action
   and target from a list of page controls rebuilt every step; a small LLM only
   fills text inputs; outcome is verified separately after DONE. Report states a
   7.07 s Google Flights run with 17 Jev requests, median browser protocol calls
   1,092 → 101 and median task time 25% lower after runtime changes (same
   models). Timing excludes browser setup and post-run verification; it finds
   results, it does not book. **Do not state the $0.0039 figure as fact** — it
   appears only in the author's X post, not in the report.
2. **1k Papers** (Hassan El Mghari) — https://1kpapers.com . 1,018 AI papers
   classified against 24 topics with Jev after an LLM summarised them.
   Cost/latency figures are self-reported and the original post was not opened:
   describe the build, mark figures as self-reported, or omit them.
3. **Inbox triage demo** (Riley Brown) — secondary confirmation only
   (listed on https://madewithjev.com). Add as a demo with that caveat, or
   leave out if the existing entries have no way to express "secondary source".
4. **Independent speed report** — https://x.com/fazxes/status/2100300097695232164
   (Vercel engineer) and https://x.com/rauchg/status/2100307962262872105 .
   One workload (safety classification), compared with one model, no published
   method. Add as evidence on the speed claim with a counterpoint saying exactly
   that. **The claim stays `Vendor Claim`.** Cite by link; no post text.

## Scope
- May touch: `src/research/analyze.ts`, tests under `test/` that count projects/claims.
- Must not touch: `data/**`, `research/**` (Jarvis regenerates them), everything else.

## Checks
`npm run check 2>&1 | tail -30`. In the handoff, tell Jarvis to run
`npm run analyze && npm run report && npm run research`.

## Questions first
Put every question in one first handoff (`status: blocked`) and stop. If you have no questions, build straight through.
