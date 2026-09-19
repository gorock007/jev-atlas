# Open items

Jarvis reads this first, every session, and keeps it current. One line per
item; an item goes in when it opens and comes out when it's done. Don't
rebuild "what's pending" by searching the handoff folders.

Jarvis session: 2b33bb90-8d47-4390-b30d-dd1484366462
Usage band: green (assumed; user said not to worry, 2026-09-19) — green <50%, amber 50%+ (no fable for workers), red 75%+ (new heavy work to Codex)

Other live terminals in this workspace that are NOT Jarvis workers: 9392c2d0 ("Build from PRD", the earlier Codex session), e3e98662 (untitled). Leave them alone.

## Questions for the user

## Running workers
- 2026-09-20 0900 · codex/gpt-5.6-sol · term 5b6d4d54-3396-49bb-b341-4d807e99cdc1 · handoffs/briefs/2026-09-20-0900-hardening.md · hardening
- 2026-09-20 0900 · claude/sonnet · term 960239c5-0340-49de-b3ad-5f217dccc9a1 · handoffs/briefs/2026-09-20-0900-readme.md · readme

## Waiting on Jarvis
- /fit model pass confirmed live 2026-09-19 (gemini-2.5-flash-lite). Still to eyeball: /fit at 375px.

## Decisions
- Canonical site: https://jev.gorock.sh (verified 2026-09-19; NEXT_PUBLIC_SITE_URL production). jev-atlas.vercel.app keeps working. MCP: https://jev.gorock.sh/mcp
- Fit checker provider: Vercel AI Gateway, `google/gemini-2.5-flash-lite` (fallback `openai/gpt-5.6-luna`), ~US$0.0006/check; no auto top-up so credits are the hard ceiling.
- X collection ceiling: A$4 (~US$2.60) per run. 2026-09-19: three passes, US$1.65 total (~A$2.55) → 431 posts, 155 retained. Do not collect again today. Old run states backed up in the session scratchpad.

## To-do
- Fit-check limiter is per-instance (audit finding, medium): credits are hard-capped with auto top-up off, so worst case is rules fallback. If abuse shows up, add a Vercel Firewall rate-limit rule on /api/v1/fit-check or a shared store.
- OpenCode note: exact-edit brief in one file worked first try (muse-spark, ~7 min). Good for this shape of task.
- "Jev Weekly": weekly collection under the A$4 ceiling + what's-new diff + a repeatable post format.
- Revisit hook noise: ~/.claude/settings.json points 7 hooks at a missing revisit-hook binary (built copy under revist/.build/.../release). User to choose.
