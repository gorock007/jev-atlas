# Design spec — Jev Atlas launch clip

Same brand truth as `video/explainer/frame.md`; only the scale table differs,
because this one is watched small inside a feed.

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

Light canvas throughout. No gradients across the frame, no glow, no dark scene.
`#8a8882` is not used for text; it fails AA at video sizes.

## Type

- **Display — EB Garamond 400**, uppercase, `letter-spacing: -0.05em`. Nearest
  pre-bundled oldstyle serif to the site's Iowan Old Style / Baskerville, so it
  embeds offline with no font fetch.
- **Labels, index rows, close — IBM Plex Mono 400 / 700**, uppercase,
  `letter-spacing: 0.06em`.

## Scale (authored and delivered at 1080×1080, in-feed)

In-feed playback is small, so everything is a step larger than the 16:9 piece.

| Role                | Size          |
| ------------------- | ------------- |
| Opening headline    | 118px serif   |
| Section headline    | 76px serif    |
| Index row title     | 40px mono 700 |
| Index row note      | 28px mono     |
| Kicker / label      | 26px mono     |
| Closing address     | 60px mono 700 |

## Motion

- One paused GSAP timeline, seek-safe, finite repeats.
- The open is a waterfall entry — display lines whip in from below, each before
  the last has settled. Everything after it arrives on rules drawing (`scaleX`)
  and rows stepping up on `y` + `opacity`.
- Ends held on the address for a full beat, so a feed autoplay that stops early
  still lands on it.
- Silent. No music bed, no sound marks.

## Do / don't

- **Do** state what the atlas is and what it holds, in its own words.
- **Don't** put a count, a price, a speed, or a benchmark on screen — counts
  drift every time the corpus is regenerated, and the rest are vendor claims.
- **Don't** use TypeSafe's logo, wordmark, or colors, or imply affiliation.
- **Don't** use stock footage, photography, or generated imagery.
- **Don't** quote any post text.
