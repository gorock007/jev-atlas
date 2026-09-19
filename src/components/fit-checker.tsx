"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { CopyContext } from "@/components/copy-context";
import { StatusChip } from "@/components/record-chrome";
import { UiIcon } from "@/components/ui-icon";
import { FIT_CHECK_MAX_LENGTH, FIT_CHECK_MIN_LENGTH, renderFitCheckMarkdown, type FitCheckResult, type FitPrimitive, type FitVerdict } from "@/lib/fit-check-result";

const EXAMPLES = [
  {
    label: "Support triage",
    text: "Every inbound support email lands in one shared inbox. A person reads it, decides which of six teams owns it, whether it is urgent, and whether the customer is angry enough to need a manager. Roughly 900 emails a day. Replies are drafted by hand afterwards.",
  },
  {
    label: "Agent tool gating",
    text: "A coding agent in our CI can run shell commands, edit files, and open pull requests. Right now an allowlist of command prefixes decides what it may do, and it keeps getting bypassed by commands we did not anticipate. We want to decide per call whether the action is safe, and stop for a human when it is not.",
  },
  {
    label: "Content moderation",
    text: "User-submitted listings are published instantly and reviewed later. Moderators check for prohibited items, misleading pricing, and contact details hidden in the description. About 40,000 listings a week, and we only manage to review a few thousand of them.",
  },
] as const;

const VERDICT_COPY: Record<FitVerdict, { label: string; note: string }> = {
  strong: { label: "Strong signal", note: "Several bounded decisions are visible in this workflow." },
  promising: { label: "Promising", note: "Parts of this fit once the broad task is decomposed." },
  unclear: { label: "Unclear", note: "One possible signal, but the decision boundary needs work." },
  weak: { label: "Weak signal", note: "No bounded decision surfaced from this description yet." },
};

const PRIMITIVE_NOTE: Record<FitPrimitive, string> = {
  Choice: "One option from a bounded set",
  Score: "A calibrated number on a stated scale",
  Noul: "The probability of a yes/no condition",
  Mixed: "Still to be decomposed into one primitive",
};

function VerdictBar({ verdict }: { verdict: FitVerdict }) {
  const strong = verdict === "strong" || verdict === "promising";
  return (
    <div className={`flex flex-wrap items-baseline gap-x-4 gap-y-2 border-l-2 pl-4 ${strong ? "border-ink" : "border-ink/25"}`}>
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent">{VERDICT_COPY[verdict].label}</p>
      <p className="text-xs leading-5 text-muted">{VERDICT_COPY[verdict].note}</p>
    </div>
  );
}

function DecisionCard({ point, index }: { point: FitCheckResult["decisionPoints"][number]; index: number }) {
  return (
    <li className="grid gap-3 bg-paper p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-mono text-[10px] text-muted">{String(index + 1).padStart(2, "0")}</span>
        <span className="rounded-full bg-ink px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-paper">{point.primitive}</span>
        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">{PRIMITIVE_NOTE[point.primitive]}</span>
      </div>
      <h3 className="font-serif text-xl leading-tight tracking-[-0.02em] text-ink">{point.step}</h3>
      {point.question ? <p className="text-sm leading-6 text-ink/85">{point.question}</p> : null}
      {point.options.length ? (
        <ul className="flex flex-wrap gap-2">
          {point.options.map((option) => (
            <li key={option} className="border border-ink/20 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.08em] text-ink">{option}</li>
          ))}
        </ul>
      ) : null}
      {point.scale ? <p className="font-mono text-[10px] leading-5 text-muted">Scale · {point.scale}</p> : null}
      {point.whyJev ? <p className="text-xs leading-5 text-muted">{point.whyJev}</p> : null}
      {point.lens && point.lensTitle ? (
        <Link href={`/map#${point.lens}`} className="inline-flex w-fit items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-ink hover:text-accent">
          Lens · {point.lensTitle} <UiIcon name="arrow-right" size={11} />
        </Link>
      ) : null}
    </li>
  );
}

function Column({ title, note, items, tone }: { title: string; note: string; items: string[]; tone: "ink" | "muted" }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className={`font-mono text-[10px] uppercase tracking-[0.18em] ${tone === "ink" ? "text-accent" : "text-muted"}`}>{title}</h3>
      <p className="mt-2 text-xs leading-5 text-muted">{note}</p>
      <ul className="mt-5 grid gap-4">
        {items.map((item) => (
          <li key={item} className={`border-l-2 pl-4 text-sm leading-6 ${tone === "ink" ? "border-ink text-ink" : "border-ink/20 text-muted"}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function FitChecker() {
  const [workflow, setWorkflow] = useState("");
  const [state, setState] = useState<"idle" | "running">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<FitCheckResult | null>(null);
  const [assessed, setAssessed] = useState("");
  const resultRef = useRef<HTMLDivElement>(null);

  const trimmed = workflow.trim();
  const tooShort = trimmed.length > 0 && trimmed.length < FIT_CHECK_MIN_LENGTH;
  const ready = trimmed.length >= FIT_CHECK_MIN_LENGTH && trimmed.length <= FIT_CHECK_MAX_LENGTH;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!ready || state === "running") return;
    setState("running");
    setError(null);
    try {
      const response = await fetch("/api/v1/fit-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflow: trimmed }),
      });
      const payload = (await response.json()) as { result?: FitCheckResult; error?: string };
      if (!response.ok || !payload.result) {
        setError(payload.error ?? "The fit check could not be completed. Try again.");
      } else {
        setResult(payload.result);
        setAssessed(trimmed);
        window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
      }
    } catch {
      setError("The fit check could not be reached. Check your connection and try again.");
    }
    setState("idle");
  }

  return (
    <div>
      <form onSubmit={submit} className="border-b border-ink/15 py-10">
        <label htmlFor="fit-workflow" className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Describe the workflow</label>
        <p className="mt-3 max-w-[64ch] text-sm leading-6 text-muted">
          Plain prose is fine. The more you say about the inputs, the decisions a person currently makes, the volume, and what happens afterwards, the more specific the decomposition.
        </p>
        <textarea
          id="fit-workflow"
          value={workflow}
          onChange={(event) => setWorkflow(event.target.value.slice(0, FIT_CHECK_MAX_LENGTH))}
          rows={7}
          placeholder="Every inbound support email lands in one shared inbox, and a person decides which team owns it…"
          className="mt-6 w-full resize-y border border-ink/20 bg-paper p-4 text-sm leading-6 text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-accent"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">Try one</span>
            {EXAMPLES.map((example) => (
              <button
                key={example.label}
                type="button"
                onClick={() => setWorkflow(example.text)}
                className="border border-ink/20 bg-paper px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink transition-colors hover:border-accent hover:text-accent"
              >
                {example.label}
              </button>
            ))}
          </div>
          <span className="font-mono text-[9px] tracking-[0.1em] text-muted">{trimmed.length} / {FIT_CHECK_MAX_LENGTH}</span>
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={!ready || state === "running"}
            className="inline-flex items-center gap-2.5 bg-ink px-5 py-3.5 font-mono text-[10px] uppercase tracking-[0.12em] text-paper transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:bg-ink/25"
          >
            {state === "running" ? "Checking…" : "Check the fit"} <span aria-hidden="true">→</span>
          </button>
          {tooShort ? <span className="text-xs text-muted">At least {FIT_CHECK_MIN_LENGTH} characters.</span> : null}
          {error ? <span role="alert" className="text-xs text-accent">{error}</span> : null}
        </div>
        <p aria-live="polite" className="sr-only">{state === "running" ? "Running the fit check" : result ? "Fit check complete" : ""}</p>
      </form>

      {result ? (
        <div ref={resultRef}>
          <section className="border-b border-ink/15 py-12">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-[60ch]">
                <VerdictBar verdict={result.verdict} />
                <p className="mt-6 font-serif text-2xl leading-[1.25] tracking-[-0.03em] text-ink sm:text-3xl">{result.headline}</p>
              </div>
              <CopyContext context={renderFitCheckMarkdown(assessed, result)} label="Copy result as markdown" />
            </div>
            {result.mode === "rules" ? (
              <p className="mt-7 border-l-2 border-accent/40 bg-accent-soft/40 p-4 text-xs leading-5 text-ink/85">
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#7a3b23]">Rules-only result</span>
                <br />
                {result.reason} The keyword pass names the primitive it matched; it does not read your workflow the way the model pass does.
              </p>
            ) : null}
          </section>

          {result.decisionPoints.length ? (
            <section className="border-b border-ink/15 py-12">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Candidate decision points</h2>
              <p className="mt-3 max-w-[64ch] text-sm leading-6 text-muted">
                Each of these is a narrow question a typed judgment could answer. None of them is validated — they are where an experiment would start.
              </p>
              <ol className="mt-7 grid gap-px bg-ink/10">
                {result.decisionPoints.map((point, index) => <DecisionCard key={`${point.step}-${index}`} point={point} index={index} />)}
              </ol>
            </section>
          ) : null}

          <section className="border-b border-ink/15 py-12">
            <div className="grid gap-10 lg:grid-cols-2">
              <Column title="Keep in code" note="Deterministic by necessity: reproducible, auditable, and never probabilistic." items={result.keepInCode} tone="ink" />
              <Column title="Keep in a generative model" note="Open-ended work that a narrow typed judgment cannot do." items={result.keepInLlm} tone="muted" />
            </div>
          </section>

          {result.firstExperiment ? (
            <section className="border-b border-ink/15 py-12">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">First experiment</h2>
              <p className="mt-6 max-w-[72ch] font-serif text-lg leading-[1.6] text-ink/90">{result.firstExperiment}</p>
            </section>
          ) : null}

          {result.relatedRecords.length ? (
            <section className="border-b border-ink/15 py-12">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Related atlas records</h2>
              <p className="mt-3 max-w-[64ch] text-sm leading-6 text-muted">
                Surfaced by search, not asserted as support. Each record keeps the evidence status it was recorded with.
              </p>
              <ul className="mt-6 divide-y divide-ink/10 border-t border-ink/15">
                {result.relatedRecords.map((record) => (
                  <li key={record.id}>
                    <Link href={record.canonicalPath} className="grid gap-1.5 py-4 transition-all duration-200 hover:pl-1">
                      <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">{record.title} <StatusChip status={record.status} /></span>
                      <span className="text-xs leading-5 text-muted">{record.summary}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {result.signals.positive.length || result.signals.nonFit.length ? (
            <section className="border-b border-ink/15 py-12">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">What the deterministic pass saw</h2>
              <div className="mt-6 grid gap-8 lg:grid-cols-2">
                <ul className="grid gap-3">
                  {result.signals.positive.map((signal) => <li key={signal} className="text-xs leading-5 text-ink/80">{signal}</li>)}
                </ul>
                <ul className="grid gap-3">
                  {result.signals.nonFit.map((signal) => <li key={signal} className="text-xs leading-5 text-muted">{signal}</li>)}
                </ul>
              </div>
            </section>
          ) : null}

          <section className="py-12">
            <div className="border-l-2 border-ink/25 bg-shell/60 p-5">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">Caveats</h2>
              <ul className="mt-4 grid gap-2.5">
                {result.caveats.map((caveat) => <li key={caveat} className="text-xs leading-5 text-ink/80">{caveat}</li>)}
              </ul>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
