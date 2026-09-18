"use client";

import { ArrowRightIcon, ArrowSquareOutIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { findLens, OPPORTUNITY_LENSES } from "@/knowledge/lenses";
import { knowledgeSlug } from "@/knowledge/paths";
import { safeHref } from "@/lib/format";
import type { BuildIdea } from "@/types";

function lensTitle(idea: BuildIdea): string {
  return findLens(idea.lens)?.title ?? idea.lens;
}

export function IdeasExplorer({ ideas }: { ideas: BuildIdea[] }) {
  const [query, setQuery] = useState("");
  const [lens, setLens] = useState<string>("All");
  const [confidence, setConfidence] = useState<BuildIdea["confidence"] | "All">("All");
  const [selectedName, setSelectedName] = useState(ideas[0]?.name ?? "");
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return [...ideas]
      .filter((idea) => (lens === "All" || idea.lens === lens) && (confidence === "All" || idea.confidence === confidence) && (!needle || `${idea.name} ${idea.problem} ${idea.product} ${idea.whyJev} ${idea.architecture}`.toLocaleLowerCase().includes(needle)))
      .sort((a, b) => b.indieFit - a.indieFit || a.name.localeCompare(b.name));
  }, [confidence, ideas, lens, query]);
  const selected = filtered.find((idea) => idea.name === selectedName) ?? filtered[0];

  return (
    <div className="py-8">
      <div className="grid gap-4 border-b border-ink/15 pb-5 xl:grid-cols-[1fr_auto_auto] xl:items-end">
        <label className="flex min-w-0 items-center gap-2 border-b border-ink/30 px-1 py-2 focus-within:border-accent xl:max-w-md">
          <MagnifyingGlassIcon size={16} className="shrink-0 text-muted" />
          <span className="sr-only">Search ideas</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search problems, products, architectures" className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-muted/65 focus:outline-none" />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {["All", ...OPPORTUNITY_LENSES.map((entry) => entry.id)].map((item) => (
            <button key={item} type="button" onClick={() => setLens(item)} className={`rounded-full px-2.5 py-1.5 font-mono text-[8px] uppercase tracking-[0.1em] transition-colors active:scale-[0.98] ${lens === item ? "bg-ink text-paper" : "border border-ink/15 text-muted hover:text-ink"}`}>
              {item === "All" ? "All lenses" : findLens(item)?.title}
            </button>
          ))}
        </div>
        <select value={confidence} onChange={(event) => setConfidence(event.target.value as typeof confidence)} className="border border-ink/15 bg-transparent px-3 py-2 font-mono text-[9px] uppercase tracking-[0.12em] text-ink focus:border-accent focus:outline-none">
          <option value="All">All confidence</option><option value="HIGH">High confidence</option><option value="MEDIUM">Medium confidence</option><option value="LOW">Low confidence</option>
        </select>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(17rem,0.68fr)_minmax(28rem,1.32fr)]">
        <div className="max-h-[32rem] overflow-y-auto border-t border-ink/12 pr-2 lg:sticky lg:top-6 lg:max-h-[calc(100dvh-3rem)]">
          {filtered.map((idea, index) => (
            <button
              key={idea.name}
              type="button"
              onClick={() => setSelectedName(idea.name)}
              aria-pressed={selected?.name === idea.name}
              className={`grid w-full grid-cols-[2rem_1fr_auto] gap-2 border-b border-ink/10 py-4 text-left transition-all duration-300 hover:pl-1 active:translate-y-px ${selected?.name === idea.name ? "bg-ink/[0.045] pl-2" : ""}`}
            >
                <span className="font-mono text-[9px] text-muted">{String(index + 1).padStart(2, "0")}</span>
                <span><span className="block text-sm font-semibold text-ink">{idea.name}</span><span className="mt-1 block text-xs text-muted">{lensTitle(idea)}</span></span>
                <span className="font-mono text-[8px] text-accent">{idea.confidence}</span>
            </button>
          ))}
          {!filtered.length ? <div className="py-16 text-center"><p className="text-sm font-medium text-ink">No ideas match this view.</p><p className="mt-1 text-xs text-muted">Broaden the domain or confidence filter.</p></div> : null}
        </div>
        <div className="min-w-0">
          {selected ? <IdeaDetail idea={selected} /> : <div className="border-t border-ink/15 py-16 text-center"><p className="text-sm font-medium text-ink">No idea selected.</p><p className="mt-1 text-xs text-muted">Adjust the filters to restore the catalog.</p></div>}
        </div>
      </div>
    </div>
  );
}

function IdeaDetail({ idea }: { idea: BuildIdea }) {
  return (
    <article className="border-t border-ink/15 pt-7">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-ink px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-paper">{lensTitle(idea)}</span>
        <span className="rounded-full border border-accent/35 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-accent">{idea.confidence}</span>
        <span className="font-mono text-[9px] text-muted">Indie fit {idea.indieFit}/10</span>
      </div>
      <h2 className="mt-5 text-2xl font-semibold tracking-[-0.045em] text-ink sm:text-3xl">{idea.name}</h2>
      <p className="mt-3 max-w-[70ch] text-sm leading-6 text-muted">{idea.product}</p>
      <dl className="mt-7 grid gap-x-10 gap-y-6 sm:grid-cols-2">
        <Field label="Problem" value={idea.problem} />
        <Field label="Why Jev" value={idea.whyJev} />
        <Field label="Architecture" value={idea.architecture} />
        <Field label="Current alternative" value={idea.currentAlternative} />
        <Field label="Jev advantage" value={idea.advantage} />
        <Field label="Unknowns" value={idea.unknowns} />
      </dl>
      <div className="mt-7 grid gap-4 border-l-2 border-accent bg-shell/60 p-5 sm:grid-cols-2">
        <Field label="1–7 day MVP" value={idea.mvp} />
        <Field label="Validation experiment" value={idea.validation} />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
        <Link href={`/ideas/${knowledgeSlug(idea.name)}`} className="inline-flex items-center gap-1.5 border-b border-ink/25 pb-1 text-xs font-medium text-ink hover:border-accent hover:text-accent">
          Open the full blueprint <ArrowRightIcon size={12} />
        </Link>
        <p className="text-xs leading-5 text-muted"><strong className="font-semibold text-ink">Confidence:</strong> {idea.confidenceReason}</p>
        {idea.evidence.slice(0, 3).map((source, index) => <a key={source} href={safeHref(source)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 border-b border-ink/20 text-[11px] font-medium text-ink hover:border-accent hover:text-accent">Evidence {index + 1} <ArrowSquareOutIcon size={11} /></a>)}
      </div>
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return <div><dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-accent">{label}</dt><dd className="mt-2 text-sm leading-6 text-ink/80">{value}</dd></div>;
}
