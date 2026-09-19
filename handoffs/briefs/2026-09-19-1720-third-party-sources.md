# Add three third-party sources as claim evidence (exact edits given)
agent: opencode (free tier) · fallback: claude sonnet

Edit ONE file only: `src/research/analyze.ts`, inside `deriveClaims`. Do not touch
any other file. Do not run `npm run analyze|report|research|collect|explore|expand`.
Never read anything under `data/`. Do not change any `status:` value.

1. Below the existing `const VERCEL = …` line near the top, add:
```ts
const LANGCHAIN = "https://www.langchain.com/blog/building-a-harness-with-jev";
const OPENROUTER = "https://openrouter.ai/typesafe/jev-latest";
const THE_REGISTER = "https://www.theregister.com/ai-and-ml/2026/09/16/typesafe-ai-debuts-model-for-machines-that-plays-doom/5296711";
```
2. Claim "TypeSafe reports Jev as materially faster…" (stays `Vendor Claim`):
   - `sources:` becomes `[OFFICIAL_LAUNCH, THE_REGISTER, ...(latency ? [latency] : [])]`
   - append to `evidence` string: ` Trade press (The Register) relays the same vendor figures without independent measurement.`
3. Claim "TypeSafe reports a low input-token price…" (stays `Vendor Claim`):
   - `sources:` becomes `["https://typesafe.ai/", THE_REGISTER, ...(cost ? [cost] : [])]`
4. Claim "The strongest near-term architecture is Jev as a complement and control layer…" (stays `Plausible`):
   - `evidence` becomes: `"Jev produces decisions rather than prose; Vercel and OpenRouter expose it through evaluation-oriented endpoints, and LangChain documents it as a routing and guardrail layer inside its own harness."`
   - `sources:` becomes `[VERCEL, OPENROUTER, LANGCHAIN, OFFICIAL_DOCS]`
   - append to `counterarguments`: ` Platform and framework integrations are partner announcements, not independent evaluations.`
5. Claim "Headline benchmark and reliability claims remain insufficiently independently verified." (stays `Plausible`):
   - `sources:` becomes `[...(skepticism ? [skepticism] : []), THE_REGISTER, OFFICIAL_LAUNCH]`

Done: `npm run typecheck && npm test 2>&1 | tail -6` green. Write the handoff per
AGENTS.md (file list = that one file). No questions expected.
