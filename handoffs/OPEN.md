# Open items

Jarvis reads this first, every session, and keeps it current. One line per
item; an item goes in when it opens and comes out when it's done. Don't
rebuild "what's pending" by searching the handoff folders.

Jarvis session: 2b33bb90-8d47-4390-b30d-dd1484366462
Usage band: green (assumed — Jarvis cannot run /usage itself; user to confirm the %) — green <50%, amber 50%+ (no fable for workers), red 75%+ (new heavy work to Codex)

Other live terminals in this workspace that are NOT Jarvis workers: 9392c2d0 ("Build from PRD", the earlier Codex session), e3e98662 (untitled). Leave them alone.

## Questions for the user
- 2026-09-18 1651 · plan · Q1 Fit checker needs a model pass to be worth sharing (the offline heuristic returns one generic decision point). OK to add an LLM call behind it (API key + per-use cost, rate-limited)? Which provider/budget?
- 2026-09-18 1651 · plan · Q2 Buy a domain (jevatlas.com / .dev, ~$12/yr)? MCP URLs are sticky, so decide before promoting the endpoint.
- 2026-09-18 1651 · plan · Q3 Budget ceiling for a fresh X collection + a weekly refresh cadence?
- 2026-09-18 1651 · ops · Q4 Current /usage % so the band is real, not assumed.

## Running workers
- 2026-09-18 1651 · claude/sonnet · term 73bdc9f4-5678-4f3a-bebb-5e81fee61503 · handoffs/briefs/2026-09-18-1651-social-card.md · social-card
- 2026-09-18 1651 · claude/opus · term 1c4c6d59-a4cc-4014-ac8c-922ccc894a64 · handoffs/briefs/2026-09-18-1651-homepage-builder-frame.md · homepage-builder-frame

## Waiting on Jarvis
- After both merge: deploy is automatic on push to main (Vercel Git integration) — verify https://jev-atlas.vercel.app and run an X card check.

## To-do
- Fit checker page (Phase 4): deterministic retrieval stays as grounding; model pass does the decomposition, constrained to retrieved records. Blocked on Q1. Split into a fable design brief + opus build brief.
- "Jev Weekly": collection cadence + what's-new diff + a repeatable post format. Blocked on Q3.
- Custom domain wiring in Vercel + NEXT_PUBLIC_SITE_URL update. Blocked on Q2.
- Revisit hook noise: ~/.claude/settings.json points 7 hooks at a revisit-hook binary missing from Revisit.app/Contents/Helpers (built copy exists under revist/.build/.../release). User to choose: copy in, fix Revisit build, or repoint.
