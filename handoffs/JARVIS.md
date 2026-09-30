# Jarvis in Jev Atlas

Only Jarvis reads this file. Workers follow `AGENTS.md`. The mechanics are in
the `jarvis:run` skill, and this file holds what's true for this project.
Where the two disagree, this file wins.

## What only Jarvis does

- **Git.** Review each handoff, then `handoffs/bin/jarvis merge <handoff>`.
  It commits exactly the listed files plus the handoff move and `OPEN.md`,
  pushes, and closes the worker. Push without asking.
- **Also only Jarvis:** running any paid X collection (`npm run collect`, `explore`, `expand` — they spend real API credits); deploying to Vercel or changing its env vars; editing `package-lock.json`; touching `.env`, `.env.local`, or the local corpus (`data/raw/*.jsonl`, `data/processed/*.jsonl`, `data/seen-posts.json`, `data/*run-state.json`); and regenerating the committed `data/processed/analysis.json` and `research/*.md` (`npm run analyze` / `report` / `research`), which collide when two workers run them at once.
- **Verification:** the user checks work in a browser — `npm run dev` locally, then https://jev.gorock.sh once Jarvis deploys. Workers list the exact URLs to look at in the handoff; Jarvis ends each batch with that list.
- **Shared files** workers must edit minimally and name in the handoff:
  `src/app/layout.tsx`, `src/app/globals.css`, `src/components/app-navigation.tsx`, `src/components/record-chrome.tsx`, `src/types.ts`, `src/knowledge/paths.ts`, `src/knowledge/repository.ts`, `package.json`, `.gitignore`
- **Never send to OpenCode's free models:** `.env`, `.env.local`, the X bearer token (`X_BEARER_TOKEN`) or any other API key (Vercel AI Gateway included); the local X corpus (`data/raw/*.jsonl`, `data/processed/*.jsonl`, `data/seen-posts.json`, `data/*run-state.json`) or any cached post text; the classification/LLM pipeline (`src/processing/`, `src/x/`); security work. Committed files and fixtures only.

## The loop

```bash
handoffs/bin/jarvis start                    # claim this terminal, then status
handoffs/bin/jarvis status                   # band, workers, new handoffs, git: one screen
handoffs/bin/jarvis spawn handoffs/briefs/<file>.md   # lint, band + cap checks, spawn, record
handoffs/bin/jarvis merge handoffs/<file>.md --check  # file list vs git status, diff stat
handoffs/bin/jarvis merge handoffs/<file>.md --outcome clean
handoffs/bin/jarvis usage --days 7           # coordinating vs building, $ per merged handoff
```

`jarvis watch` runs in its own plain terminal (no model, no tokens). It
wakes you when a handoff lands or a worker hits a usage limit, and it
`/clear`s you first when you've been idle for more than
`JARVIS_IDLE_MIN` minutes. So **don't sleep-loop or poll on a timer**. Before
you stop, make sure `OPEN.md` says everything the next session needs to know.

## Budget rules

- **Cap:** at most `JARVIS_MAX_CLAUDE` Claude sessions at once, Jarvis
  included (`handoffs/jarvis.conf`). `jarvis spawn` refuses past that. Queue
  the brief under **To-do** or route it to OpenCode or Codex. Codex and
  OpenCode don't count toward the cap.
- **Band** comes from the statusline reading. It's amber at `JARVIS_AMBER`%
  or when the burn rate is on pace to use the whole 5-hour window, and red at
  `JARVIS_RED`% or on a limit message. `jarvis spawn` enforces both: amber
  means no `fable` workers, red means new top and workhorse work goes to
  Codex.
- **One brief per phase.** A worker does one phase and hands off. The next
  phase gets a fresh worker spawned with `--after <that handoff>`. Don't
  let one session carry the whole job into 300k of context.
- **Effort:** `claude-opus-5-5` at `medium` for a tightly fenced brief,
  `high` otherwise. `sonnet` for mechanical work that OpenCode can't take.
- **Subagents** default to Sonnet (`CLAUDE_CODE_SUBAGENT_MODEL` in
  `.claude/settings.json`). Use `.claude/agents/scout.md` and
  `diff-reviewer.md` for reading and review, never for edits.
- **Security review** runs once per `jarvis merge` commit (security-guidance
  commit review, on Sonnet). The per-stop review is off in this repo
  (`ENABLE_STOP_REVIEW=0`) because workers share the checkout.

## Project rules Jarvis holds workers to

- The project rules in `AGENTS.md` (no verbatim X post text, evidence status
  never dropped, one address per record, free models never see secrets or the
  corpus) bind Jarvis as much as workers.
- A handoff with an incomplete file list, or a worker that touched git, is
  sent back before review.
