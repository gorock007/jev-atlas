# Working in Jev Atlas as a worker

This repo runs the Jarvis workflow on Superset. **If you are Codex, OpenCode,
or any agent other than Claude Code, you are always a worker.** If you are
Claude Code, you are a worker when your first prompt is a task brief or points
at `handoffs/briefs/`; otherwise you are Jarvis — read `CLAUDE.md` instead.

The user talks to Jarvis, almost never to you. Never wait for the user or ask
them anything in the terminal: your questions go in your handoff file, Jarvis
batches them for the user, and the answers come back to you over this
terminal. The app lives at the repo root.

## Worker rules

Several workers edit the same checkout at once, on separate terminals. So:

- **Never commit, push, tag, or open a PR.** Jarvis does that.
- **Never run `git stash`, `git checkout --`, `git restore`, `git reset`,
  `git clean`, `git switch`, `git worktree`, or `git rebase`/`merge`.** Any of
  them silently reverts other workers' uncommitted edits. Read-only git
  (`status`, `diff`, `log`, `show`, `blame`) is fine.
- **Touch only the files your task needs.** The brief's "may touch" list is a
  hard boundary, not a hint — several workers share this checkout, and a file
  you edit outside it is someone else's work you just broke. If you must edit a shared file
  (`src/app/layout.tsx`, `src/app/globals.css`, `src/components/app-navigation.tsx`, `src/components/record-chrome.tsx`, `src/types.ts`, `src/knowledge/paths.ts`, `src/knowledge/repository.ts`, `package.json`, `.gitignore`), keep the edit minimal and name it in your handoff.
- **Your own subagents follow these same rules** — say so in their briefs.
- **Only Jarvis does these:** running any paid X collection (`npm run collect`, `explore`, `expand` — they spend real API credits); deploying to Vercel or changing its env vars; editing `package-lock.json`; touching `.env`, `.env.local`, or the local corpus (`data/raw/*.jsonl`, `data/processed/*.jsonl`, `data/seen-posts.json`, `data/*run-state.json`); and regenerating the committed `data/processed/analysis.json` and `research/*.md` (`npm run analyze` / `report` / `research`), which collide when two workers run them at once. Write what's needed (a migration
  file, a release note) but leave applying it to Jarvis and flag it in your
  handoff.
- **Ask everything once, up front.** If the task needs rulings, put all your
  questions in your first handoff with `status: blocked` and stop. After the
  answers arrive on this terminal, build every phase through to done without
  stopping again, unless something truly new comes up.
- **Verification:** the user checks work in a browser — `npm run dev` locally, then https://jev.gorock.sh once Jarvis deploys. Workers list the exact URLs to look at in the handoff; Jarvis ends each batch with that list.
- **Checks:** run `npm run check` (typecheck, tests, production build) before handing off and report the results. Say
  plainly what you didn't check.

## When you finish a task

Write one handoff file, `handoffs/YYYY-MM-DD-HHMM-<short-slug>.md`:

```markdown
# <one-line task title>
status: done | blocked | partial
agent: claude <model> | codex <model>
brief: handoffs/briefs/<the brief you worked from>.md
## What the user asked
<the request, briefly>
## What changed
<behaviour, in plain words>
## Files
- path/relative/to/repo — created | modified | deleted
## Checks run
<commands and their results; say plainly what wasn't checked>
## Questions for the user
<only when status: blocked — numbered, each answerable in a line>
## Notes for Jarvis
<things only Jarvis may do, shared-file edits, suggested commit message>
```

The file list must be complete and exact — Jarvis commits by that list, so a
missing file is left behind and an extra one drags in someone else's work.
Then say in the terminal that you've handed off, and name the file. If you get
more instructions for the same task later, update the same handoff file
instead of starting a new one.

## Project rules (apply to Jarvis and every worker)

- **No verbatim X post text in anything committed or published.** X's
  Developer Agreement restricts redistributing Post content; cite by link,
  scores, categories, and themes. `test/security.test.ts` fails the build if a
  60-character run of any cached post appears in `analysis.json`.
- **Evidence status is never dropped.** A vendor claim stays a `Vendor Claim`
  in every interface; repetition does not upgrade it.
- **One address per record.** Website routes, JSON, and MCP URIs derive from
  `src/knowledge/paths.ts`; `test/atlas.test.ts` fails if they drift.
- **Free (OpenCode) models never see** `.env`, the X bearer token, or the
  local corpus — committed files and fixtures only.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
