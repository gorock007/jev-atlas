# Hyperframes assets: "Jev in 60 seconds" loop and a launch clip
worker: claude
model: opus  # media normally goes to Codex; the hyperframes skills only exist as a Claude Code plugin, so this one stays on Claude
effort: high
started: 2026-09-19 22:40 · terminal: e1f67088-60dd-4cbf-87b2-01eecae06c41

## Goal
Two rendered motion assets made with Hyperframes (load the
`hyperframes:hyperframes` skill first, then `hyperframes:motion-graphics` and
whatever it routes you to):
1. **Site explainer** — silent, loopable, 16:9, 20–30 s, captions burned in as
   on-screen text: a workflow arrives → it breaks into small decisions →
   each is answered as Choice (pick one of N), Score (a number on a scale),
   Noul (probability of yes/no) → the answers drive ordinary code. Output:
   `public/media/jev-in-60s.mp4` (H.264, ≤ 2.5 MB), `public/media/jev-in-60s.webm`
   (≤ 2 MB), `public/media/jev-in-60s-poster.jpg` (≤ 120 KB), 1280×720.
2. **Launch clip** for X/LinkedIn — 1:1 1080×1080, 12–18 s, ends on
   `jev.gorock.sh`. Output: `video/out/jev-atlas-launch.mp4` (not served by the
   site; add `video/out/` to nothing — just report its path and size).
Done means the files exist at those paths within the size limits, play in
Chrome and Safari, and the composition sources are committed-ready under `video/`.

## Context
- Visual language must match the site: open https://jev.gorock.sh and read
  `src/app/globals.css` for the tokens (warm paper background, serif display,
  mono uppercase labels, one red accent). No stock footage, no AI-generated
  imagery, no music in asset 1.
- **Facts only.** Say what Jev's interface is; do not show speed, price or
  benchmark numbers (they are Vendor Claims and an asset can't carry the label
  well). Do not use TypeSafe's logo or imply affiliation. No X post text.
- A design worker is rebuilding the homepage in parallel and will mount asset 1
  automatically if the mp4 exists. You never edit app code.
- `ffmpeg` is at `/opt/homebrew/bin/ffmpeg`. Use `npx hyperframes` (not
  installed globally); do not add it to the repo's `package.json` — keep any
  project-local install inside `video/` with its own package.json.

## Scope
- May touch: `video/**` (new), `public/media/**` (new).
- Must not touch: everything else, including `src/**`, root `package.json`,
  `package-lock.json`, `.gitignore`, `.env*`, `data/**`.
- Shared files: none. If `video/node_modules` needs ignoring, say so in the
  handoff and Jarvis will edit `.gitignore`.

## Phases
1. Storyboard both pieces (in `video/STORYBOARD.md`, ≤ 40 lines).
2. Build and render asset 1; compress to the limits; poster from a strong frame.
3. Build and render asset 2.
4. Check the first/last frames of asset 1 loop cleanly; extract 4 stills per
   asset into `video/out/stills/` and look at them before handing off.

## Checks
`ls -la public/media video/out` with sizes; `ffprobe` duration/codec per file.
`npm run check` is not required (no app code), but confirm `git status` shows
changes only under `video/` and `public/media/`.

## Questions first
Put every question in one first handoff (`status: blocked`) and stop. After
the answers arrive on your terminal, build every phase through to done
without stopping again. If you have no questions, build straight through.
