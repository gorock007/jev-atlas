# Reframe the homepage for builders: lead with "what can I build", keep evidence as the trust layer
status: done
agent: claude opus
brief: handoffs/briefs/2026-09-18-1651-homepage-builder-frame.md

## What the user asked
People hear about Jev constantly but do not know what to use it for. The homepage
opened as a research archive ("165 posts mapping the claims…"). Invert the order of
emphasis so a first-time visitor from X sees, within the first screen, (a) what you
can build with Jev, (b) that every claim is evidence-checked, and (c) that their
coding agent can plug in over MCP. Same content, nothing deleted.

## What changed
**Hero.** Now reads "What can you actually build with Jev?" with a deck that names the
three payoffs from live data (31 build blueprints, 9 claims sorted demonstrated vs.
vendor-claimed, an MCP endpoint). Below it a call-to-action row: a filled primary to
`/map` ("See what to build"), a hairline secondary to `/start` ("Jev in 60 seconds"),
and a text link to `/agent` ("Connect your agent").

**Trust line, above the fold.** A hairline row directly under the buttons: "Of 9
tracked claims, 3 are demonstrated by located work and 2 remain vendor claims. Status
is recorded per claim and never upgraded by repetition." → `/claims`. Evidence
discipline is visible but it is no longer the pitch.

**Lens strip, first thing under the hero.** A 3×3 hairline grid of the nine opportunity
lenses from `src/knowledge/lenses.ts`, each with its blueprint count computed from
`analysis.ideas`, each linking to `/map#<lens id>`. Counts are 2/4/5/4/3/4/5/2/2 = 31,
so the strip and the hero deck cannot drift apart. It replaces "Explore the index" as
the first strip under the hero.

**MCP section is now section 02 on the page (labelled 01).** The old `home-agent-invite`
one-liner became a full editorial section with a concrete before/after: a "Without the
atlas" panel (the agent answers from stale training data or vendor pages and cannot
tell a located demonstration from launch copy) beside a "With the atlas" panel listing
`assess_jev_fit`, `get_build_blueprint`, `trace_jev_claim` with what each answers.
`CopyMcpConfig` sits underneath so the endpoint is copyable without leaving the page,
plus a link to `/agent`.

**Re-order, nothing removed.** The old hero furniture — "Explore the index" strip, the
atlas board (browse by signal / field synthesis / claims ledger) and the corpus line —
moved into a new `home-index` section after the MCP block. `picked-note`,
`ResearchSearch` (anchor `#research-search` intact), the research-cost section,
findings and methodology all follow in their original order. The section numbering was
renumbered to match the new order: MCP is 01, field synthesis 02, located work 03.

Page is still `force-static`. No verbatim post text was added; the only external hrefs
remain the project sources, still through `safeHref`.

## Files
- src/app/page.tsx — modified
- src/app/globals.css — modified
- handoffs/2026-09-18-1708-homepage-builder-frame.md — created

## Checks run
`npm run check` → typecheck clean (`tsc --noEmit`, no errors); tests **24 passed, 0
failed**; production build compiled successfully, `/` still prerendered as static.

Visual verification: `npm run build && npx next start -p 3131`, driven through headless
Chrome over CDP at **1440px** and **375px** (full-page captures plus measured
`getBoundingClientRect`). `document.scrollWidth` equals the viewport at both widths, so
there is no horizontal overflow, and no element extends past the container. Checked
that the nine lens hrefs resolve to `/map#<id>` matching the section ids on
`src/app/map/page.tsx`, that the three CTA hrefs are `/map`, `/start`, `/agent`, and
that `#research-search` still exists. The server and the headless Chrome instance are
both stopped; port 3131 is free.

Not checked: real Safari/Firefox rendering, and hover/focus states were reasoned about
from the CSS rather than clicked through (headless capture only, no pointer).

One bug found and fixed during verification: my first `.lens-strip a { display: grid }`
rule also matched the "Open the opportunity map" link in the strip's header, which made
it overflow the right edge of the page. The cell rules are now scoped to
`.lens-strip li a`.

## Questions for the user
None — every decision needed was already settled in the brief, so I built straight
through per its "if you have no questions, build straight through".

## Notes for Jarvis
- **Shared file edited:** `src/app/globals.css`, confined to the "Homepage atlas" and
  "Search"/`home-agent-invite` areas and the three homepage media queries. I restyled
  `.home-agent-invite` in place (kept the class name, rewrote its rules) rather than
  adding a parallel class — it is used only by `src/app/page.tsx`, verified by grep, so
  no other page is affected and no dead CSS is left behind. Its `> p` / `> a` child
  selectors became `.home-agent-intro > p` / `.home-agent-panel` because the section now
  has two column wrappers.
- I did not touch `src/app/layout.tsx`, `src/lib/social-card.tsx`, any
  `opengraph-image`/`twitter-image` file, `src/knowledge/**`, `src/mcp/**`, `data/**`,
  `research/**`, or `package.json`. `git status` shows `src/app/layout.tsx` and the
  `opengraph-image`/`social-card` files as modified/untracked — those belong to the
  social-card worker, not to this handoff.
- Nothing here needs a Jarvis-only action: no collection run, no env change, no
  regenerated artifact.
- Suggested commit message:

  ```
  feat(home): lead with what you can build, keep evidence as the trust layer

  Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
  ```

## URLs for the user to look at
`npm run dev`, then, at **1440px** and **375px**:
- http://localhost:3000/ — the whole reframe: hero, CTA row, trust line, lens strip,
  then the MCP before/after, then the index/board/corpus block and everything below it.
- http://localhost:3000/map#agent-tool-gating — click any lens cell; confirm it lands on
  the right lens section with the sticky header clearing the heading.
- http://localhost:3000/start and http://localhost:3000/agent — the secondary and
  tertiary calls to action.
- http://localhost:3000/#research-search — the header search link still lands on the
  search block.

After deploy, the same five on https://jev-atlas.vercel.app.
