# Reframe the homepage for builders: lead with "what can I build", keep evidence as the trust layer
worker: claude
model: opus
effort: high
started: 2026-09-18 16:51 · terminal: 1c4c6d59-a4cc-4014-ac8c-922ccc894a64

## Goal
A first-time visitor arriving from X understands within the first screen (a)
that Jev Atlas shows what you can build with Jev, (b) that every claim is
evidence-checked, and (c) that their coding agent can plug into it over MCP.
Today the first screen reads as a research archive ("165 posts mapping the
claims, experiments, architectures, and open questions"). Same content,
inverted order of emphasis. Nothing is deleted from the site.

## Context
- The user's stated problem: people hear about Jev constantly but do not know
  what to use it for. The homepage must answer that first.
- Decisions already made (do not re-open):
  1. Hero headline direction: "What can you actually build with Jev?" with a
     deck that names the three payoffs: 31 build blueprints, claims sorted by
     what is demonstrated vs. vendor-claimed, and an MCP endpoint for agents.
     You may polish the wording; keep it plain, no hype words, no emoji.
  2. Primary call to action → `/map`. Secondary → `/start` ("Jev in 60
     seconds"). Tertiary → `/agent`.
  3. Directly under the hero: a compact strip of the nine opportunity lenses
     from `src/knowledge/lenses.ts` with their idea counts, each linking to
     `/map#<lens id>`. This replaces the current "Explore the index" strip as
     the first thing under the hero; the index strip may move lower.
  4. The existing `home-agent-invite` section (MCP) moves up to be the second
     section, and gains a concrete before/after: without the atlas an agent
     guesses about Jev; with it, it can call `assess_jev_fit`,
     `get_build_blueprint`, `trace_jev_claim`. Reuse `CopyMcpConfig` from
     `src/components/copy-mcp-config.tsx` or link to `/agent` — your call.
  5. Evidence discipline stays visible above the fold as a trust line (e.g.
     the demonstrated / vendor-claim counts), not as the pitch.
  6. The research-cost section, findings and methodology stay, lower down.
- Hard project rules (AGENTS.md): never drop evidence status; no verbatim X
  post text; external hrefs go through `safeHref` from `src/lib/format.ts`.
- Match the existing editorial style exactly: tokens and semantic classes in
  `src/app/globals.css`, serif display, mono labels, hairline rules, no
  gradients, no card shadows. Must work at 375px and 1440px.
- Keep the page `force-static` and keep `ResearchSearch` and its
  `#research-search` anchor working (the header search links to it).
- Next.js 16 has breaking changes — read `node_modules/next/dist/docs/` if
  you touch any framework API.

## Scope
- May touch: `src/app/page.tsx`, and new components under
  `src/components/home-*.tsx` if you need them.
- Must not touch: `src/app/layout.tsx`, any `opengraph-image`/`twitter-image`
  file, `src/lib/social-card.tsx` (another worker owns these right now),
  `src/knowledge/**`, `src/mcp/**`, `data/**`, `research/**`,
  `package.json`, `package-lock.json`.
- Shared files (edit minimally, name in handoff): `src/app/globals.css` —
  append new homepage classes in the "Homepage atlas" area and its two media
  queries; do not rename or restyle existing classes other pages use.

## Phases
1. Read `src/app/page.tsx`, the homepage block of `globals.css`,
   `src/knowledge/lenses.ts`, `src/app/map/page.tsx`.
2. New hero + lens strip + trust line.
3. Elevated MCP section with the before/after.
4. Re-order the remaining sections; check 375px and 1440px in a production
   build (`npm run build && npx next start -p 3131`), then stop the server.

## Checks
`npm run check 2>&1 | tail -40` — report test count and build result. In the
handoff, list the URLs and viewport widths the user should look at.

## Questions first
Put every question in one first handoff (`status: blocked`) and stop. After
the answers arrive on your terminal, build every phase through to done
without stopping again. If you have no questions, build straight through.
