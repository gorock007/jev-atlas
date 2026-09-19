# Homepage explainer video: silent autoplaying loop
status: done
agent: claude fable
brief: handoffs/briefs/2026-09-19-2240-visual-wayfinding.md (follow-up sent over the terminal)

## What the user asked
The homepage `<video>` is a silent seamless loop: make it muted, looping, inline and autoplaying with `preload="metadata"`, controls off by default, webm before mp4, and no autoplay under `prefers-reduced-motion` (poster with controls instead). Play only while in view if cheap. Touch only the files that render the video.

## What changed
- The video moved into a small client component, `ExplainerVideo`, because reduced motion and in-view playback both need the browser. `page.tsx` still decides at build time whether the files exist and passes the sources (webm first, then mp4).
- Rendered attributes: `muted loop playsInline preload="metadata"`, poster, no controls.
- **Playback is started from script rather than by the `autoPlay` attribute.** An IntersectionObserver plays the video when at least a quarter of it is on screen and pauses it when it leaves — that was cheap, so it's in. Doing it this way also means a reduced-motion visitor never gets a frame of motion before the page hydrates, which the bare attribute could not guarantee. The visible result is the same as `autoPlay`: it starts by itself.
- Under reduced motion it never starts on its own: it stays on the poster and shows controls. It follows a live change of the setting. If the browser refuses `play()` (battery saver, policy), it also falls back to poster with controls.
- Without JavaScript the visitor sees the poster as a still, with no controls.

## Files
- src/components/explainer-video.tsx — created
- src/app/page.tsx — modified

## Checks run
- `npm run check`: typecheck clean, 39/39 tests pass, production build succeeds. (First run failed typecheck on the optional `className` prop under `exactOptionalPropertyTypes`; fixed.)
- Built HTML: `<video … muted loop playsInline preload="metadata" poster=…>` with the webm `<source>` before the mp4.
- Browser, against `next start` (production CSP) at 1440×900:
  - At the top of the page (video off screen): paused at 0.
  - Scrolled into view: playing, `currentTime` advancing (2.81s → 4.32s), muted, looping, no controls, source chosen `jev-in-60s.webm`.
  - Scrolled away: paused.
  - Reduced motion emulated: paused at 0, controls shown.
  - No CSP violations from the site in any of those states; layout shift 0. `/media/jev-in-60s.webm` is served as `video/webm` with `Accept-Ranges: bytes`.
- Not checked: Safari/iOS (where inline muted autoplay rules are strictest) and Firefox; a real phone; low-power mode; 375px was not re-screenshotted for this change.

## Notes for Jarvis
- No shared files touched. `home.module.css` unchanged — the existing `.video` class is passed through.
- Observation, not changed: the video is capped at 60rem wide and left-aligned, so at 1440 there is empty space to its right in the "Jev in one picture" section.
- Suggested commit: `feat: autoplay the explainer loop in view, honouring reduced motion`
