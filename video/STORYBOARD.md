---
message: "Jev answers narrow questions with typed values; your code stays in charge"
aspect: 16x9 + 1x1
mode: autonomous
---

# Jev Atlas motion assets

Two pieces. Design truth: `explainer/frame.md`, `launch/frame.md`. Every line of
on-screen copy below is drawn from `/start` (`src/app/start/page.tsx`) or the
README — no speed, price, or benchmark numbers anywhere.

## Frame 1 — Site explainer · 24s · silent · loops

src: `explainer/index.html` · 1920×1080 authored, delivered 1280×720
Shape: a diagram that accumulates left→right across four beats, then clears.
Rules: `waterfall-entry` (caption lines), `svg-path-draw` (connector rules),
`spring-pop-entrance` (answer values), `sine-wave-loop` (ambient grid drift).

- 00.0–01.0 Empty stage: paper, top bar, caption rule. **This is also the last frame** — the loop seam.
- 01.0–06.0 **State arrives.** Card slides in left: APPLICATION STATE, five generic field rows.
  Caption: "WHATEVER YOUR APPLICATION ALREADY HAS — A MESSAGE, A DIFF, AN EVENT, A ROW."
- 06.0–10.5 **It splits.** A hairline fans right into three narrow question rows.
  Caption: "BROKEN INTO NARROW QUESTIONS, EACH ANSWERABLE ON ITS OWN."
- 10.5–17.0 **Typed answers.** Each question resolves in its own slot, staggered:
  CHOICE (one of N, red marker), SCORE (tick lands on a 0–1 scale), NOUL (yes/no bar fills).
  Caption: "A BOUNDED OPTION, A CALIBRATED NUMBER, OR A PROBABILITY."
- 17.0–22.0 **Code takes over.** Three connectors drop into a full-width band:
  threshold → route, else → queue for review, log value + confidence.
  Caption: "ORDINARY VALUES YOUR CODE CAN THRESHOLD, LOG, AND TEST."
- 22.0–24.0 **Clear.** Everything lifts out in one beat back to the empty stage.

## Frame 2 — Launch clip · 15s · silent · X / LinkedIn

src: `launch/index.html` · 1080×1080
Rules: `waterfall-entry` (open), `nudge-curve` (headline moves up), `svg-path-draw`
(column rules), `spring-pop-entrance` (evidence stamp).

- 00.0–04.0 Kicker "AN INDEPENDENT, EVIDENCE-FIRST FIELD GUIDE"; headline whips in over three lines:
  WHAT CAN / YOU ACTUALLY / BUILD WITH JEV?
- 04.0–08.0 Headline lifts to the top rule; three index rows step in —
  01 BUILD BLUEPRINTS · 02 CLAIMS LEDGER · 03 MCP ENDPOINT, each with its one-line note.
- 08.0–12.0 The signature idea: two columns, DEMONSTRATED | VENDOR CLAIM. A claim card
  lands in the right column and a red rule locks under it.
  Line: "A VENDOR CLAIM STAYS A VENDOR CLAIM."
- 12.0–15.0 Close held on the mark: J · JEV ATLAS · accent rule · JEV.GOROCK.SH.
