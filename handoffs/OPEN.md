# Open items

Jarvis reads this first, every session, and keeps it current. One line per
item; an item goes in when it opens and comes out when it's done. Don't
rebuild "what's pending" by searching the handoff folders. Before Jarvis
stops, this file must hold everything a fresh session needs: `jarvis watch`
may `/clear` Jarvis after a long idle.

Jarvis session: <terminal id — `handoffs/bin/jarvis start` writes it>
Usage band: <green | amber | red> — `handoffs/bin/jarvis status` writes it from the statusline reading

Other live terminals in this workspace that are NOT Jarvis workers: 9392c2d0 ("Build from PRD", the earlier Codex session), e3e98662 (untitled). Leave them alone.

## Questions for the user
<!-- - <date> · <slug> · Q1 …  (batched from worker handoffs; remove when answered and passed back) -->

## Running workers
<!-- `jarvis spawn` adds: - <date HH:MM> · claude/claude-opus-5-5 high · term <id> · handoffs/briefs/<file>.md -->
<!-- `jarvis merge` removes the line -->

## Waiting on Jarvis
<!-- - handoff to review: handoffs/<file>.md · migration to apply · release to cut -->
- /fit model pass confirmed live 2026-09-19 (gemini-2.5-flash-lite). Still to eyeball: /fit at 375px.

## Decisions
- Canonical site: https://jev.gorock.sh (verified 2026-09-19; NEXT_PUBLIC_SITE_URL production). jev-atlas.vercel.app keeps working. MCP: https://jev.gorock.sh/mcp
- Fit checker provider: Vercel AI Gateway, `google/gemini-2.5-flash-lite` (fallback `openai/gpt-5.6-luna`), ~US$0.0006/check; no auto top-up so credits are the hard ceiling.
- X collection ceiling: A$4 (~US$2.60) per run. 2026-09-19: three passes, US$1.65 total (~A$2.55) → 431 posts, 155 retained. Do not collect again today. Old run states backed up in the session scratchpad.

## To-do
<!-- - next things to brief, in order; briefs queued behind the Claude cap go here -->
- Visual redesign shipped 2026-09-19 (mind map, three.js hero, explainer loop, 5-link nav). User to eyeball Safari/iPhone: hero scene, muted autoplay, mobile map list. /map is still a long list — candidate for the same visual treatment.
- Homepage spend figure shows $1.22 from loadRunSummary() vs US$1.65 recorded here (run states were moved aside); reconcile before quoting a cost publicly.
- Launch clip for X/LinkedIn: video/out/jev-atlas-launch.mp4 (1080², 15 s).
- Fit-check limiter is per-instance (audit finding, medium): credits are hard-capped with auto top-up off, so worst case is rules fallback. If abuse shows up, add a Vercel Firewall rate-limit rule on /api/v1/fit-check or a shared store.
- OpenCode note: exact-edit brief in one file worked first try (muse-spark, ~7 min). Good for this shape of task.
- "Jev Weekly": weekly collection under the A$4 ceiling + what's-new diff + a repeatable post format.
- Revisit hook noise: ~/.claude/settings.json points 7 hooks at a missing revisit-hook binary (built copy under revist/.build/.../release). User to choose.
