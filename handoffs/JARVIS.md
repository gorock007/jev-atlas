# Jarvis in Jev Atlas

Only Jarvis reads this file. Workers follow `AGENTS.md`. The mechanics are in
the `jarvis:run` skill, and this file holds what's true for this project.
Where the two disagree, this file wins.

## What only Jarvis does

- **Git.** Review each handoff, then `handoffs/bin/jarvis merge <handoff>`.
  It commits exactly the listed files plus the handoff move and `OPEN.md`,
  pushes, and closes every worker of the brief,
  checking each one exited. Push without asking.
- **The merge gate.** Workers run only targeted checks. You run the heavy
  suites (Docker, e2e, the full suite) once for the integration candidate:
  after merging a wave, or before merging a handoff that touches what they
  cover. Run them through the repo's wrapped scripts or
  `handoffs/bin/jarvis lock <class> --reuse -- <command>`, and put the result
  in the merge message or `OPEN.md`.
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
handoffs/bin/jarvis close <terminal>         # cancel a worker: close, verify, record
handoffs/bin/jarvis doctor                   # every live agent and terminal here, and why
handoffs/bin/jarvis resources                # who holds each heavy-suite lease, who waits
handoffs/bin/jarvis usage --days 7           # coordinating vs building, per-worker $, waste signals
handoffs/bin/jarvis sessions                 # the Claude sessions counting toward the caps
handoffs/bin/jarvis budget <terminal>        # a worker's budget use; with values, raise its limits
```

When `status` or `start` ends with a `doctor:` line, act on it: run
`jarvis doctor`, then `jarvis doctor --apply` if it lists only finished and
lost things. Details: the `jarvis:run` skill's `references/lifecycle.md`.

`jarvis watch` runs in its own plain terminal (no model, no tokens). It
wakes you when a handoff lands, or when a worker hits a usage limit, sits at
a trust or approval prompt, or shows the same screen for `JARVIS_STALL_MIN`
minutes without a handoff. It `/clear`s you first when you've been idle for more than
`JARVIS_IDLE_MIN` minutes. So **don't sleep-loop or poll on a timer**. Before
you stop, make sure `OPEN.md` says everything the next session needs to know.

## Budget rules

- **Fable is off.** Never put `fable` in a brief on your own. A top-tier
  brief (undecided shape, unknown cause, ambiguous spec, security-sensitive)
  goes to Codex `gpt-6-astra`. `fable` runs only when the user authorizes
  that one brief by typing `handoffs/bin/jarvis fable allow <brief>` in their
  own terminal, once. `spawn` refuses it otherwise, `--force` included. A
  brief that came back with questions doesn't move up a tier.
- **Caps:** at most 4 Claude sessions machine-wide (every repo, the user's
  own included, Jarvis sessions not counted), 3 in this checkout
  (`JARVIS_MAX_CLAUDE`, Jarvis included) and 2 Opus workers (Jarvis doesn't
  count). `jarvis spawn` refuses past any of them, and `jarvis
  sessions` shows who holds a slot. Queue the brief under **To-do** or route
  it to OpenCode or Codex, which don't count. `--force` passes the caps and
  is logged: only when the user told you to spend.
- **Band** comes from the machine-wide statusline reading. It's amber at
  `JARVIS_AMBER`%, when the burn rate is on pace to use the whole 5-hour
  window, or when the reading is missing or stale. It's red at `JARVIS_RED`%
  or on a limit message. `jarvis spawn` enforces both: amber lowers the caps
  to 3 machine-wide and 2 Opus, and red to 2 and 0 Opus, with new top and
  workhorse work going to Codex.
- **Budgets:** each worker has 90 working minutes, $15 est., 300k context,
  6 failed test runs and 2 attempts per brief (`jarvis.conf`; a brief's
  `budget:` line overrides them). Past one, the watcher asks it once for a
  partial handoff, then presses Escape; nothing is closed. You get a
  `[jarvis watch]` message. A brief that hit its budget is respawned only
  after you sharpen or split it, with `--after <its handoff>`.
  `handoffs/bin/jarvis budget <terminal> usd=30` raises one worker's limit
  when the work is on track.
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
