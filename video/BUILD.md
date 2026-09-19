# Rebuilding the motion assets

Two HyperFrames projects, one per asset. Nothing here is installed into the
repo's own `package.json` — every command runs through `npx`, and each project
pins its own CLI version in `video/<project>/package.json`.

## 1. Site explainer → `public/media/`

```bash
cd video/explainer
npx hyperframes check                       # lint, runtime, layout, motion, contrast
npx hyperframes render --quality delivery --fps 30 --output ../out/explainer-master.mp4
```

The master is 1920×1080; the delivered files are downscaled from it, which is
what keeps the hairlines and mono text crisp at 720p:

```bash
cd "$(git rev-parse --show-toplevel)"
FF=/opt/homebrew/bin/ffmpeg
$FF -y -i video/out/explainer-master.mp4 -an -vf "scale=1280:720:flags=lanczos" \
  -c:v libx264 -profile:v high -level 4.0 -pix_fmt yuv420p -preset veryslow \
  -crf 17 -g 60 -movflags +faststart public/media/jev-in-60s.mp4
$FF -y -i video/out/explainer-master.mp4 -an -vf "scale=1280:720:flags=lanczos" \
  -c:v libvpx-vp9 -pix_fmt yuv420p -b:v 0 -crf 28 -row-mt 1 -g 60 \
  -deadline good -cpu-used 1 public/media/jev-in-60s.webm
$FF -y -ss 20.6 -i video/out/explainer-master.mp4 -frames:v 1 \
  -vf "scale=1280:720:flags=lanczos" -q:v 4 public/media/jev-in-60s-poster.jpg
```

Budgets: mp4 ≤ 2.5 MB, webm ≤ 2 MB, poster ≤ 120 KB. Current encode uses about
a third of each, so CRF has room to drop further if the poster or type ever
looks soft.

## 2. Launch clip → `video/out/jev-atlas-launch.mp4`

```bash
cd video/launch
npx hyperframes check
npx hyperframes render --quality delivery --fps 30 --output ../out/launch-master.mp4
cd "$(git rev-parse --show-toplevel)"
/opt/homebrew/bin/ffmpeg -y -i video/out/launch-master.mp4 -an \
  -c:v libx264 -profile:v high -level 4.0 -pix_fmt yuv420p -preset veryslow \
  -crf 17 -g 60 -movflags +faststart video/out/jev-atlas-launch.mp4
```

The `*-master.mp4` intermediates are not committed — they re-render in about
20 seconds and every delivered file derives from them by the commands above.

## Editing

`STORYBOARD.md` is the beat sheet for both pieces; `<project>/frame.md` is the
brand truth (palette, type, scale, the do-not list) and `<project>/BRIEF.md` is
the intent. Change the storyboard and the frame spec before the HTML.

Preview either project in the HyperFrames timeline editor:

```bash
cd video/explainer && npx hyperframes preview --background   # then --stop
```
