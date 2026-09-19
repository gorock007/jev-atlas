# Visual wayfinding: mind map, three.js hero, simpler navigation
worker: claude
model: fable
effort: high
started: 2026-09-19 22:40 · terminal: adab8cfe-6782-4938-9009-b7ceaa68ae08

## Goal
A first-time visitor understands what Jev is and where to go within ten
seconds, from pictures rather than paragraphs. Today the site is well set but
is all text: 11 top-nav links, no diagram anywhere, a homepage that stacks six
unrelated blocks at the same visual weight, and nothing that explains Jev
itself above the fold. Done means: (1) an interactive **mind map** of the atlas
on the homepage and as the top of `/start`; (2) a **three.js hero scene**;
(3) small **primitive diagrams** for Choice / Score / Noul; (4) a top nav of at
most 5 links plus a "More" menu; (5) a homepage with a clear order and
noticeably fewer words. `npm run check` green, works at 375px, and respects
`prefers-reduced-motion`.

## Context
- Read `node_modules/next/dist/docs/` for anything Next-specific (AGENTS.md).
- Load the `frontend-design:frontend-design` skill before designing. Keep the
  existing identity: warm paper background, serif display, mono labels, the
  single red accent. This is an upgrade of that language, not a new brand.
- Screenshots of the current site and the user's reference image are attached
  to your prompt. The reference is a dark, left-to-right mind map with curved
  coloured branches. **Use it as a reference for form only** — do not copy its
  wording or its title card (it is LangChain's).
- `three@0.186` and `@types/three` are already installed by Jarvis. Do not add
  other dependencies; if you truly need one, ask in a blocked handoff.
- CSP (`next.config.ts`): `script-src 'self' 'unsafe-inline'`, `style-src
  'self'`, `img-src 'self' data:`, `connect-src 'self'`. **`style-src 'self'`
  blocks inline `style=""` attributes and injected `<style>`** — position SVG
  with attributes/classes, not inline styles, and verify in a real browser
  that the console shows no CSP violations. If three.js needs `blob:` or
  `worker-src`, make the minimal `next.config.ts` change and name it; keep
  `test/security.test.ts` passing.

### Mind map (the centrepiece)
- New client component `src/components/atlas-mindmap.tsx`, pure SVG (not
  three.js), on a dark panel like the reference. Root "Jev Atlas" → branches:
  *What Jev is* (not an LLM; state + typed questions; Choice / Score / Noul;
  many questions in parallel) · *What's proven* (claims grouped by evidence
  status, status label always shown) · *What people built* (projects) ·
  *What you could build* (the nine lenses, blueprint counts) · *Will it fit my
  workflow?* (/fit) · *For your agent* (/agent, MCP).
- **Data-driven**: a server component builds the tree from the knowledge layer
  (`src/knowledge/repository.ts`, `src/knowledge/lenses.ts`) and hrefs from
  `src/knowledge/paths.ts`; counts must never be hard-coded. Every leaf is a
  real link. A vendor claim shows as `Vendor Claim` (project rule).
- Branches expand/collapse; keyboard reachable; links work without JS
  (render the tree as nested lists, enhance to SVG). Under 640px render the
  nested collapsible list instead of the wide canvas.

### Hero scene
- `src/components/hero-scene.tsx`, loaded with `next/dynamic` (`ssr:false`) so
  three.js stays out of the initial bundle. Concept: many small inputs flow in
  and resolve into three typed outputs (a pick-one, a dial, a probability) —
  "intelligence that decides", not a generic particle blob. Quiet, paper-toned,
  one red accent. Pause when off-screen or tab hidden, cap DPR at 2, static
  SVG/poster fallback for reduced-motion and no-WebGL. It must not push the
  headline or CTAs below the fold at 1440×900 or 375×812.

### Navigation and homepage
- Top nav: **Start here · Build ideas (/map) · Fit check · Claims · For
  agents**, plus "More" (Projects, Patterns, Ideas, Evidence, Library). No
  route is removed or renamed; sitemap and `paths.ts` untouched.
- Homepage order: hero + scene → "Jev in one picture" (three primitive
  diagrams, one line each) → mind map → nine lenses → fit-check prompt →
  MCP section (shortened) → corpus numbers. Cut or merge the "Explore the
  index / Field synthesis" block; say what you removed in the handoff.
- A reserved slot: the homepage "Jev in one picture" section must render
  `<video>` from `/media/jev-in-60s.webm` + `.mp4` with poster
  `/media/jev-in-60s-poster.jpg` **only if** `public/media/jev-in-60s.mp4`
  exists at build time (check with `fs.existsSync` in the server component).
  Another worker is producing those files; do not create them.

## Scope
- May touch: `src/app/page.tsx`, `src/app/start/**`, `src/components/atlas-mindmap.tsx`,
  `src/components/hero-scene.tsx`, new files under `src/components/`,
  a new `src/knowledge/mindmap.ts`, `test/mindmap.test.ts`, `next.config.ts` (CSP, minimal).
- Must not touch: `public/media/**`, `video/**`, `data/**`, `research/**`, `src/lib/fit-check*`,
  `src/mcp/**`, `package.json`, `package-lock.json`, `.env*`.
- Shared files (edit minimally, name in handoff): `src/app/globals.css`,
  `src/components/app-navigation.tsx`, `src/app/layout.tsx`.

## Phases
1. `src/knowledge/mindmap.ts` tree builder + test (counts match repository; every href resolves; statuses preserved).
2. Mind map component, no-JS and mobile fallbacks.
3. Hero scene + primitive diagrams.
4. Nav consolidation and homepage re-order.
5. Browser pass at 1440 and 375: no CSP violations, no layout shift from the scene, reduced-motion checked.

## Checks
`npm run check 2>&1 | tail -30`. List in the handoff the URLs to look at and what you did not verify.

## Questions first
Put every question in one first handoff (`status: blocked`) and stop. After
the answers arrive on your terminal, build every phase through to done
without stopping again. If you have no questions, build straight through.
