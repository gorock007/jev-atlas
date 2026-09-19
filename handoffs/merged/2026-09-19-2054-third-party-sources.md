# Add three third-party sources as claim evidence
status: done
agent: opencode muse-spark
brief: handoffs/briefs/2026-09-19-1720-third-party-sources.md
## What the user asked
Add LangChain, OpenRouter, and The Register URLs as claim evidence in `deriveClaims` per exact edits.
## What changed
Added LANGCHAIN, OPENROUTER, THE_REGISTER constants; wired them into latency, pricing, complement-layer, and verification claims with updated evidence/counterargument text. No status values changed.
## Files
- src/research/analyze.ts — modified
## Checks run
`npm run typecheck && npm test 2>&1 | tail -6` — green (typecheck clean, 32 pass / 0 fail). Did not run analyze/report/research/collect/explore/expand per brief.
## Questions for the user
None.
## Notes for Jarvis
Only shared-file concern: none (analyze.ts is not in the shared-file list). Suggested commit message: "Add third-party sources as claim evidence in deriveClaims".
