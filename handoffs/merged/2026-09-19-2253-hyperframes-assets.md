# Hyperframes assets: "Jev in 60 seconds" loop and a launch clip
status: done
agent: claude opus
brief: handoffs/briefs/2026-09-19-2240-hyperframes-assets.md

## What the user asked

Two rendered motion assets made with HyperFrames: a silent, loopable 16:9 site
explainer with burned-in captions for `public/media/`, and a square 12–18s
launch clip for X/LinkedIn that ends on `jev.gorock.sh`.

## What changed

Two HyperFrames projects under `video/`, rendered to four delivered files.
Nothing outside `video/**` and `public/media/**` was touched. The brief was
complete enough to build straight through, so there was no blocked handoff.

**Asset 1 — site explainer, `public/media/jev-in-60s.mp4` + `.webm` + poster.**
24.0s, 1280×720, 30fps, silent, loops. A diagram that builds left to right
across four beats and then clears back to the empty stage, so the first and
last frames are the same and the loop seam is invisible:

1. an APPLICATION STATE card arrives — "your app already has the state";
2. a hairline fans right into three narrow questions;
3. each resolves into its typed answer — CHOICE (one bounded option), SCORE (a
   tick landing on a 0–1 scale), NOUL (a yes/no probability bar);
4. connectors drop into a DETERMINISTIC APPLICATION CODE band: threshold →
   route, else → queue for review, log value · confidence · time.

Captions are on-screen mono uppercase text in a band at the bottom, one per
beat. Every line is taken from `/start` (`src/app/start/page.tsx`). The only
numbers on screen are the illustrative 0.82 / 0.91 answers, under a column
header that reads "TYPED ANSWERS · EXAMPLE VALUES". No speed, price, accuracy
or benchmark figures; no TypeSafe mark; no post text.

**Asset 2 — launch clip, `video/out/jev-atlas-launch.mp4`.** 15.0s, 1080×1080,
30fps, silent. Four beats: the question ("What can you actually build with
Jev?"), what the atlas holds (build blueprints / claims ledger / MCP
endpoint), the signature idea (DEMONSTRATED vs VENDOR CLAIM, with a red rule
locking under the vendor card — "a vendor claim stays a vendor claim"), then a
held close on the mark and the address. `JEV.GOROCK.SH` also sits in a footer
that is on screen for the entire clip, so an autoplay that stops early still
shows it. It carries no counts, since those drift whenever the corpus is
regenerated, and closes on "Not affiliated with or endorsed by TypeSafe AI."

Both match the site's tokens exactly (paper `#fffefb`, ink `#121212`, muted
`#65635f`, line `#d9d8d3`, accent `#d62f12`, accent-soft `#f8ded7`). Display
type is EB Garamond 400 — the nearest oldstyle serif the renderer embeds
deterministically, standing in for the site's Iowan Old Style — against IBM
Plex Mono for labels and captions, standing in for the SFMono stack. No stock
footage, no generated imagery, no audio in either piece.

## Files

- video/STORYBOARD.md — created
- video/BUILD.md — created (how to re-render and re-compress both assets)
- video/explainer/AGENTS.md — created (written by `hyperframes init`)
- video/explainer/BRIEF.md — created
- video/explainer/CLAUDE.md — created (written by `hyperframes init`)
- video/explainer/frame.md — created (design spec)
- video/explainer/hyperframes.json — created
- video/explainer/index.html — created (the composition)
- video/explainer/meta.json — created
- video/explainer/package.json — created (project-local CLI pin, not the repo's)
- video/launch/AGENTS.md — created (written by `hyperframes init`)
- video/launch/BRIEF.md — created
- video/launch/CLAUDE.md — created (written by `hyperframes init`)
- video/launch/frame.md — created (design spec)
- video/launch/hyperframes.json — created
- video/launch/index.html — created (the composition)
- video/launch/meta.json — created
- video/launch/package.json — created
- video/out/jev-atlas-launch.mp4 — created (755 KB)
- video/out/stills/jev-in-60s-4.5s.jpg — created
- video/out/stills/jev-in-60s-9.0s.jpg — created
- video/out/stills/jev-in-60s-16.0s.jpg — created
- video/out/stills/jev-in-60s-20.5s.jpg — created
- video/out/stills/jev-atlas-launch-2.2s.jpg — created
- video/out/stills/jev-atlas-launch-6.5s.jpg — created
- video/out/stills/jev-atlas-launch-10.8s.jpg — created
- video/out/stills/jev-atlas-launch-14.2s.jpg — created
- public/media/jev-in-60s.mp4 — created (803 KB)
- public/media/jev-in-60s.webm — created (776 KB)
- public/media/jev-in-60s-poster.jpg — created (76 KB)

`public/` did not exist before; these three files are all it contains.

## Checks run

- `npx hyperframes check` in **both** projects: passed, 0 findings across lint,
  runtime, layout, motion and contrast. Contrast: 126/126 text checks AA in the
  explainer, 40/40 in the launch clip.
- Sizes, all inside the brief's budgets: mp4 **803 KB** (≤ 2.5 MB), webm
  **776 KB** (≤ 2 MB), poster **76 KB** (≤ 120 KB). The launch clip is 755 KB.
- `ffprobe`: `jev-in-60s.mp4` h264 High/4.0 yuv420p 1280×720 30fps 24.000s 720
  frames, faststart; `jev-in-60s.webm` vp9 yuv420p 1280×720 30fps 24.000s;
  `jev-atlas-launch.mp4` h264 High/4.0 yuv420p 1080×1080 30fps 15.000s 450
  frames; poster mjpeg 1280×720.
- Full decode of all three videos with `ffmpeg -xerror -f null -`: clean, no
  errors, expected frame counts.
- **Loop seam:** decoded frame 0 and frame 719 of the delivered mp4 and diffed
  them — both are the identical empty-stage chrome; max luma difference 17/255
  on text-edge pixels, i.e. encoder noise, not content. Confirmed visually.
- Looked at 4 extracted stills per asset from the **delivered** encodes (in
  `video/out/stills/`) plus the composition contact sheets before rendering.
- `git status` shows my changes only under `video/` and `public/`. The `src/**`
  and `handoffs/2026-09-19-2251-*` entries in the working tree belong to the
  visual-wayfinding worker, not to me.

**Not checked:** I could not get visual playback confirmed in a real browser.
Chrome's own `canPlayType` in this session returned `"probably"` for both
`video/mp4; codecs="avc1.640028"` and `video/webm; codecs="vp9"`, and the
bitstreams decode cleanly, but the automation tab's media pipeline never
started (`readyState` stayed 0 with no error, on both a plain and a
byte-range-capable local server), so no frame was actually painted. Safari was
not exercised at all. The codecs and profiles are the conservative,
universally-supported ones, but the first real playback check is the user's.

`npm run check` at the repo root was not run — the brief says it is not
required, I added no app code, and `tsconfig.json` scopes typecheck to
`src/**` and `test/**`, so nothing I wrote is in its path. Another worker has
uncommitted `src/**` edits in flight, so a root check right now would report
their state, not mine.

## Notes for Jarvis

- **No `.gitignore` change needed.** Both projects run through `npx`, so there
  is no `video/*/node_modules`, and no `renders/` or `snapshots/` directory was
  left behind. Nothing under `video/` needs ignoring.
- `hyperframes init` wrote a `CLAUDE.md` and `AGENTS.md` inside each project
  directory. They document the pinned CLI and the HyperFrames skills, and only
  load for an agent whose cwd is inside `video/explainer` or `video/launch`, so
  they do not affect workers at the repo root. Included deliberately; say if
  you would rather they were deleted.
- The 1080p render masters are **not** committed — they regenerate in about 20
  seconds and every delivered file derives from them by the exact commands in
  `video/BUILD.md`. That keeps roughly 2 MB of reproducible intermediates out
  of the repo.
- The design worker mounts `public/media/jev-in-60s.mp4` if it exists; it now
  does, with a `.webm` and a poster beside it. Suggested `<video>` order is
  webm first, mp4 second, `poster="/media/jev-in-60s-poster.jpg"`, plus
  `muted loop playsinline autoplay` — the piece is silent by design and its
  first and last frames match, so it needs no crossfade.
- Suggested commit message:
  `feat(video): add the "Jev in 60 seconds" site loop and a square launch clip`
- Nothing here needs a Jarvis-only action: no paid collection, no corpus, no
  env, no `package-lock.json`.

## Verification URLs for the user

- `npm run dev`, then <http://localhost:3000/media/jev-in-60s.mp4> and
  <http://localhost:3000/media/jev-in-60s.webm> — the explainer loop, and
  <http://localhost:3000/media/jev-in-60s-poster.jpg> — the poster frame. Once
  the homepage rebuild lands, it plays in place at <http://localhost:3000/>.
- The launch clip is not served by the site. Open it locally:
  `open video/out/jev-atlas-launch.mp4`.
- After deploy: <https://jev.gorock.sh/media/jev-in-60s.mp4> and
  <https://jev.gorock.sh/>.
