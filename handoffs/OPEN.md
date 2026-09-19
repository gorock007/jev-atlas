# Open items

Jarvis reads this first, every session, and keeps it current. One line per
item; an item goes in when it opens and comes out when it's done. Don't
rebuild "what's pending" by searching the handoff folders.

Jarvis session: 2b33bb90-8d47-4390-b30d-dd1484366462
Usage band: green (assumed; user said not to worry, 2026-09-19) — green <50%, amber 50%+ (no fable for workers), red 75%+ (new heavy work to Codex)

Other live terminals in this workspace that are NOT Jarvis workers: 9392c2d0 ("Build from PRD", the earlier Codex session), e3e98662 (untitled). Leave them alone.

## Questions for the user
- 2026-09-19 · bookmarks · Chrome extension is not connected, and X bookmarks need user-login (the app bearer token cannot read them). User to reconnect the Claude Chrome extension, or paste the bookmarked links.
- 2026-09-18 · domain · user is looking for one; will report back. Then: wire in Vercel + NEXT_PUBLIC_SITE_URL.

## Running workers
- 2026-09-19 1240 · claude/opus · term 91383e2d-507c-4d71-bb85-18f3acf68dae · handoffs/briefs/2026-09-19-1240-fit-checker.md · fit-checker
- 2026-09-19 1255 · claude/sonnet · term 958c6e9e-4b52-4c03-b01d-e692c4ccf305 · handoffs/briefs/2026-09-19-1255-new-projects.md · new-projects (after merge: Jarvis runs `npm run analyze && npm run report`)

## Waiting on Jarvis
- After fit-checker merges: confirm AI Gateway auth works on the deployment (OIDC, else create AI_GATEWAY_API_KEY and add via `vercel env`), then test /fit live.

## Decisions
- Fit checker provider: Vercel AI Gateway, `google/gemini-2.5-flash-lite` (fallback `openai/gpt-5.6-luna`), ~US$0.0006/check; no auto top-up so credits are the hard ceiling.
- X collection ceiling: A$4 (~US$2.60) per run. 2026-09-19 run spent US$0.83 → 301 posts, 133 retained. Old run states backed up in the session scratchpad.

## To-do
- "Jev Weekly": weekly collection under the A$4 ceiling + what's-new diff + a repeatable post format.
- Fold bookmark resources into the catalog once readable.
- Revisit hook noise: ~/.claude/settings.json points 7 hooks at a missing revisit-hook binary (built copy under revist/.build/.../release). User to choose.
