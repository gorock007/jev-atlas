# Visual wayfinding: mind map, three.js hero, simpler navigation
status: done
agent: claude fable
brief: handoffs/briefs/2026-09-19-2240-visual-wayfinding.md

## What the user asked
Make a first-time visitor understand Jev and where to go from pictures: an interactive mind map (homepage + top of /start), a three.js hero scene, small Choice / Score / Noul diagrams, a top nav of 5 links plus "More", and a re-ordered homepage with fewer words. No questions were needed, so this was built straight through.

## What changed
- **Mind map** (`AtlasMindmap`): dark panel, left-to-right curved branches, one hue per branch. Root → What Jev is · What's proven · What people built · What you could build · Will it fit my workflow? · For your agent. The tree is built by `buildMindmap(records)` from the knowledge records; every count is derived, every node is a real link, claims and projects are grouped by evidence status (a vendor claim sits under `Vendor Claim` and each leaf repeats its status). Circles fold/unfold (click, Enter, Space; `aria-expanded`), plus "Unfold all" / "Reset". Lenses unfold to their blueprints. Label widths are measured in the browser after an estimated server render. Under 640px it becomes a nested `<details>` list (works without JS). Links inside the SVG do client-side navigation (checked).
- **Hero scene**: many inputs stream into a "Jev" core and leave as three typed answers — a pick-one row, a dial, a probability bar — which re-resolve every ~3.4s. A static SVG poster is server-rendered in a fixed 4:3 frame; three.js (separate chunk via `next/dynamic`, `ssr:false`) only draws the moving parts on a transparent canvas over it. Loaded on idle, only if WebGL exists and reduced motion is off; pauses off-screen and when the tab is hidden; DPR capped at 2; context loss falls back to the poster.
- **Primitive diagrams**: three small static SVGs (Choice / Score / Noul) with one line each, labelled as illustrative values. Used on the homepage and in a new "Three question types" section on /start.
- **Nav**: Start here · Build ideas (/map) · Fit check · Claims · For agents + "More" (Projects, Patterns, Ideas, Evidence, Library). "More" is a native `<details>` (opens without JS; closes on Escape, outside click, navigation). "The atlas" link dropped — the masthead is the home link. Nav type size raised slightly now there is room. Mobile panel lists the five, then the More group in two columns. No route removed or renamed.
- **Homepage order**: hero + scene → Jev in one picture (video slot + diagrams) → mind map → nine lenses → fit-check prompt → MCP (shortened) → corpus numbers → search. The deck now says what Jev is in one sentence.
- **Removed from the homepage** (all still reachable via the map/nav): the evidence-status trust line (folded into the corpus footnote), the "Explore the index" strip, "Browse by signal", the "Field synthesis / Intelligence that decides" block, the 3-claim ledger aside, the corpus track line, the "picked for validation" note, the "What this evidence set cost" table (kept as one spend figure in corpus numbers), "What people have actually built" list, the methodology list, and the MCP "without the atlas" paragraph. Search stays because the header Search button targets `/#research-search`.
- **Video slot**: renders `<video>` (webm if present + mp4, poster) only when `public/media/jev-in-60s.mp4` exists at build time. Those files appeared in the checkout during this task, so the current build includes the video; I did not create or touch them.
- /start: mind map directly under the header; anchors `#primitives`, `#shape`, `#is-not` (exported as `START_ANCHORS`, which the test checks).

## Files
- src/knowledge/mindmap.ts — created
- test/mindmap.test.ts — created
- src/components/atlas-mindmap.tsx — created
- src/components/atlas-mindmap.module.css — created
- src/components/hero-geometry.ts — created
- src/components/hero-visual.tsx — created
- src/components/hero-visual.module.css — created
- src/components/hero-scene.tsx — created
- src/components/primitive-diagrams.tsx — created
- src/components/primitive-diagrams.module.css — created
- src/components/home.module.css — created
- src/app/page.tsx — modified
- src/app/start/page.tsx — modified
- src/components/app-navigation.tsx — modified (shared)
- src/app/globals.css — modified (shared)

Not mine, leave out of this commit: `public/`, `video/` (the hyperframes worker).

## Checks run
- `npm run check`: typecheck clean, 39/39 tests pass (3 new in `test/mindmap.test.ts`: counts match the repository, every claim/project/opportunity appears once with its status, every href resolves to a page or route handler), production build succeeds.
- Browser pass against `next start` (production CSP) at 1440×900 and 375×812, on `/` and `/start`:
  - No CSP violations from the site. The only violations logged were `font-src data:` ×3, which also appear on the untouched `/claims` page — they come from the Grammarly extension in that browser, not from this work. No `next.config.ts` change was needed; three.js needs no `blob:`/worker.
  - No inline `style` attributes or `<style>` tags from these components (only Next's route announcer and the extension).
  - Layout shift 0.0000 on all four loads. CTA row bottom: 592px at 1440×900, 487px at 375×812 — headline and CTAs are above the fold in both. No horizontal page scroll at 375.
  - Reduced motion emulated: no canvas, the three.js chunk is not fetched, poster shown.
  - Scene seen running (answers changing between captures); hidden tab keeps it paused.
  - Keyboard unfold, More menu, mobile list open/close, SVG link navigation all exercised.
- Not checked: Safari and Firefox; a real phone; a machine without WebGL (code path only); screen-reader output; the `<video>` slot visually (confirmed only that the built HTML contains it); tablet widths between 640 and 1000px were not screenshotted.

## Notes for Jarvis
- Shared-file edits: `globals.css` — added `.nav-more*` and `.mobile-nav-more` rules, changed `.desktop-nav` gap/font-size and the mobile nav link rule (numbers removed), and **deleted 144 rules used only by the old homepage** (`atlas-strip`, `atlas-board`, `topic-index`, `atlas-feature`, `atlas-metrics`, `claim-ranking`, `corpus-*`, `picked-*`, `benchmark-*`, `ranked-list`, `methodology-*`, `findings-section`, `home-trust-line`, `mcp-compare`, `section-heading`, `home-index`, `home-agent*`, `atlas-hero`). I grepped each prefix first: none is used outside the old `page.tsx`. File went 37KB → 22KB. If you'd rather keep that out of this commit, the page works either way. `app-navigation.tsx` as described above. `layout.tsx` untouched.
- Spotted, out of scope: the footer in `src/app/layout.tsx` hard-codes "165 posts · 9 claims · 31 hypotheses" (corpus is now 431 posts). The homepage spend figure shows $1.22 from `loadRunSummary()`, while OPEN.md records US$1.65 — the old page showed the same number, so it's a data question, not a display one.
- A dev server was already running on :3000 (not mine; I left it). My `next start` on :3100 is stopped.
- URLs to look at: `/` (hero scene, diagrams, video, mind map — try unfolding "Vendor Claim" and a lens, then "Unfold all"), `/start` (map at top, then `/start#primitives`, `/start#is-not`), any page for the nav + "More" menu, and `/` at 375px for the list version of the map and the mobile menu. With reduced motion on, the hero should be a still.
- Suggested commit: `feat: mind map, three.js hero, primitive diagrams, and a five-link nav`
