# Open items

Jarvis reads this first, every session, and keeps it current. One line per
item; an item goes in when it opens and comes out when it's done. Don't
rebuild "what's pending" by searching the handoff folders.

Jarvis session: 2b33bb90-8d47-4390-b30d-dd1484366462
Usage band: green (assumed; user said not to worry, 2026-09-19) — green <50%, amber 50%+ (no fable for workers), red 75%+ (new heavy work to Codex)

Other live terminals in this workspace that are NOT Jarvis workers: 9392c2d0 ("Build from PRD", the earlier Codex session), e3e98662 (untitled). Leave them alone.

## Questions for the user
- 2026-09-19 · fit checker · AI Gateway refuses requests until a credit card is on file for team gorock007-s-team (error customer_verification_required). User adds the card at vercel.com → AI → add credit card (keep auto top-up OFF); then Jarvis re-tests /api/v1/fit-check. Until then /fit serves the rules result with an honest note.
- 2026-09-18 · domain · user is looking for one; will report back. Then: wire in Vercel + NEXT_PUBLIC_SITE_URL.

## Running workers
- 2026-09-19 1520 · claude/sonnet · term 6bdf5c9b-43bc-45c0-8f3b-192ec2cfe380 · handoffs/briefs/2026-09-19-1520-located-work-2.md · located-work-2 (after merge: Jarvis runs analyze + report; decide where the LangChain/OpenRouter/Register sources go)

## Waiting on Jarvis
- After the card is added: POST the live fit-check and confirm mode:"model"; eyeball /fit at 375px.

## Decisions
- Fit checker provider: Vercel AI Gateway, `google/gemini-2.5-flash-lite` (fallback `openai/gpt-5.6-luna`), ~US$0.0006/check; no auto top-up so credits are the hard ceiling.
- X collection ceiling: A$4 (~US$2.60) per run. 2026-09-19: three passes, US$1.65 total (~A$2.55) → 431 posts, 155 retained. Do not collect again today. Old run states backed up in the session scratchpad.

## To-do
- "Jev Weekly": weekly collection under the A$4 ceiling + what's-new diff + a repeatable post format.
- Revisit hook noise: ~/.claude/settings.json points 7 hooks at a missing revisit-hook binary (built copy under revist/.build/.../release). User to choose.
