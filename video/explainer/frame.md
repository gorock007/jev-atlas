# Design spec — Jev Atlas motion assets

Brand truth for both compositions in `video/`. Derived from the site's tokens
(`src/app/globals.css`); the site is the reference, this file is the copy the
compositions build from.

## Palette (exact, do not invent)

| Token       | Hex       | Use                                           |
| ----------- | --------- | --------------------------------------------- |
| paper       | `#fffefb` | canvas, card fills                            |
| shell       | `#f4f3ef` | recessed panels, inactive fills               |
| ink         | `#121212` | body and display text, heavy rules            |
| muted       | `#65635f` | secondary text (AA on paper: 5.9:1)           |
| line        | `#d9d8d3` | hairlines, card borders                       |
| accent      | `#d62f12` | one red — the single thing the eye lands on   |
| accent-soft | `#f8ded7` | accent fill behind a value, never behind text |

Light canvas, all the way through. No dark scenes, no gradients over the whole
frame, no glow. Structure carries the design: rules, borders, registration
marks — the way the site does it.

`#8a8882` from the site is **not** used for text here; it fails AA at video
sizes. Use `muted`.

## Type

- **Display — EB Garamond 400.** The site sets Iowan Old Style / Baskerville at
  weight 400 with tight tracking; EB Garamond is the nearest oldstyle serif the
  renderer pre-bundles, so it embeds offline with no font fetch. Uppercase,
  `letter-spacing: -0.045em` at display sizes.
- **Labels, captions, data — IBM Plex Mono 400 / 700.** Stands in for the site's
  SFMono stack. Always uppercase with `letter-spacing: 0.06em` for labels and
  captions; sentence case only inside code/data panels.
- Never two sans. Never a third family.

## Scale (authored at 1920×1080, delivered at 1280×720)

| Role                  | Size            |
| --------------------- | --------------- |
| Burned-in caption     | 40px mono       |
| Column / card title   | 26px mono       |
| Card body, data rows  | 30px mono       |
| Answer value (serif)  | 64–76px serif   |
| Small label, counters | 22px mono       |

## Motion

- One paused GSAP timeline, seek-safe, finite repeats.
- Entrances 0.4–0.7s; rules draw with `scaleX`, cards arrive on `y` + `opacity`.
- Ambient: the registration grid drifts and the accent marks breathe slowly, so
  a held frame is never dead. Nothing pulses fast enough to read as a UI.
- The piece **loops**: t=0 and t=end are the same empty stage with the same
  chrome, so the seam is invisible.

## Do / don't

- **Do** keep every statement factual and interface-level: what Jev's shape is.
- **Don't** show speed, price, accuracy, or benchmark numbers. The one number on
  screen is an illustrative score inside an example panel, labelled as such.
- **Don't** use TypeSafe's logo, wordmark, or colors, or imply affiliation.
- **Don't** use stock footage, photography, or generated imagery. Type and rules
  only.
- **Don't** quote any post text.
