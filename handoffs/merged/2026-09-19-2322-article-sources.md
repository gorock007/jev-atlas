# Add three located Jev builds and one independent speed report
status: done
agent: claude opus
brief: handoffs/briefs/2026-09-20-0010-article-sources.md

## What the user asked
Add the newly verified sources to `deriveProjects` as located builds, and add the
independent speed report to the speed claim as evidence **without changing its
status**, following the shape of the entries added for briefs
`2026-09-19-1255-new-projects` and `2026-09-19-1720-third-party-sources`.

## What changed
All in `src/research/analyze.ts`.

**`deriveClaims` — speed claim (unchanged status: `Vendor Claim`).** Added two
constants, `VERCEL_ENGINEER_SPEED_REPORT` and `VERCEL_CEO_SPEED_ECHO` (declared
next to `THE_REGISTER`, same style as the third-party-sources batch), and wired
both into the "TypeSafe reports Jev as materially faster" claim. The evidence line
now notes one report from outside TypeSafe measured on the reporter's own
workload; the counterargument says exactly what the brief specified — one workload
(safety classification), one comparison model, no published method, and the
amplifying post adds reach rather than a second measurement — and states that the
status therefore stays `Vendor Claim`. No other claim, status, or source changed.

**`deriveProjects` — three new entries**, inserted immediately before the existing
`PROPOSED` entry, matching where the previous batch put its additions:

- **jev-ultrafast** (builder recorded as "Browser Use (third party, not
  TypeSafe)"). Describes the 7.07 s Google Flights run with 17 Jev requests and
  states that the timing excludes browser setup and post-run verification and that
  the run finds results rather than booking. `jevRole` records that Jev picks the
  next action and target from a control list rebuilt each step, a small LLM only
  fills text inputs, and the outcome is verified separately after DONE. The
  insight carries the report's own runtime numbers (1,092 → 101 median protocol
  calls, median task time 25% lower, same models) and says plainly that the
  per-run cost figure appears only in the author's X post, not in the report, so
  it is not carried — **the $0.0039 figure does not appear anywhere in the diff.**
- **1k Papers** (Hassan El Mghari). 1,018 papers against 24 topics, classified by
  Jev after an LLM summarised them. Cost and latency figures are **omitted**, and
  the insight says explicitly that they are self-reported and not repeated here;
  only the published corpus size and topic count are stated.
- **Inbox triage demo** (Riley Brown). Added with the secondary-source caveat
  rather than left out — see the judgement call below. `source` is
  `https://madewithjev.com`, `repositoryOrDemo` is `null`, and both the
  description and the insight say the build is confirmed at second hand only, that
  the demo was not opened, and that the entry should be upgraded on a first-hand
  look or dropped if none is available.

No X post text appears in the diff; the two X sources are cited by link only.

## Judgement calls
1. **The demo was added rather than dropped.** `ProjectFinding["status"]` is only
   `"ACTUALLY BUILT" | "PROPOSED"`, so there is no status that encodes "secondary
   source" — but the existing entries do express exactly this kind of caveat in
   prose (the Axon Work entry is author-stated, the Jev Playground and J3vRoute
   entries carry "Unknown (no linked repo)"). I followed that precedent:
   `ACTUALLY BUILT` with the evidence limit stated in plain words in two fields.
   Say the word and I will drop the entry instead.
2. **Count discrepancy in the brief.** The title says "four located builds", the
   goal says "three located builds and one demo", and the Context section lists
   three project sources plus the speed report. I built from the Context section
   ("use only these facts"): three project entries and the claim evidence. If a
   fourth source was meant to be in the list and got dropped, send it over and
   I will add it to this same handoff.

## Files
- src/research/analyze.ts — modified

## Checks run
- `npm run check` (typecheck + tests + production build) — **green**. Typecheck
  clean; `tests 39 / pass 39 / fail 0`; `next build` compiled successfully and
  prerendered 154 static pages, including the three new `/projects/<slug>` routes
  and their opengraph images.
- No test asserts an exact project or claim count (`test/research.test.ts` only
  asserts `claims.length >= 8`), so nothing under `test/` needed changing.
- Not checked: anything in a browser. `data/processed/analysis.json` and
  `research/*.md` are still the pre-change committed versions, so the new entries
  will not be visible on the site until they are regenerated — see below.

## Notes for Jarvis
- **Regenerate before deploying:** `npm run analyze && npm run report && npm run
  research`. Reserved for you per AGENTS.md; I did not run them, and I touched
  nothing under `data/**` or `research/**`.
- The new project slugs are `jev-ultrafast`, `1k-papers`, and
  `inbox-triage-demo`; none collides with an existing record id.
- No shared file was touched — `src/research/analyze.ts` is not on the shared list.
- **URLs for the user to check after regeneration + deploy:**
  - https://jev.gorock.sh/projects — the three new builds in the list
  - https://jev.gorock.sh/projects/jev-ultrafast
  - https://jev.gorock.sh/projects/1k-papers
  - https://jev.gorock.sh/projects/inbox-triage-demo
  - https://jev.gorock.sh/research/claims — the speed claim still reads
    **Vendor Claim**, now with the two extra sources and the new counterargument
- Suggested commit message:
  `feat(research): add jev-ultrafast, 1k Papers, and an inbox triage demo, and cite an independent speed report`
