"use client";

import { ArrowSquareOutIcon, MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { CATEGORIES, type ProcessedPost } from "@/types";
import { formatCategory } from "@/lib/format";

export function EvidenceExplorer({ posts }: { posts: ProcessedPost[] }) {
  const [query, setQuery] = useState("");
  const [minimum, setMinimum] = useState(60);
  const [category, setCategory] = useState("All");
  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return posts.filter((entry) => entry.relevance_score >= minimum && (category === "All" || entry.categories.includes(category as (typeof CATEGORIES)[number])) && (!needle || `${entry.post.text} ${entry.summary} ${entry.categories.join(" ")} ${entry.themes.join(" ")}`.toLocaleLowerCase().includes(needle)));
  }, [category, minimum, posts, query]);

  return (
    <div className="py-8">
      <div className="grid gap-4 border-b border-ink/15 pb-5 lg:grid-cols-[1fr_auto_auto] lg:items-end">
        <label className="flex items-center gap-2 border-b border-ink/30 px-1 py-2 focus-within:border-accent lg:max-w-md">
          <MagnifyingGlassIcon size={16} className="shrink-0 text-muted" />
          <span className="sr-only">Search posts</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search post text, themes, categories" className="min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-muted/65 focus:outline-none" />
        </label>
        <label className="grid gap-1.5"><span className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">Minimum relevance</span><select value={minimum} onChange={(event) => setMinimum(Number(event.target.value))} className="border border-ink/15 bg-transparent px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"><option value={0}>All scores</option><option value={40}>40 · Possibly relevant</option><option value={60}>60 · Retain</option><option value={75}>75 · Analyze</option><option value={85}>85 · Investigate</option></select></label>
        <label className="grid gap-1.5"><span className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">Category</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="border border-ink/15 bg-transparent px-3 py-2 text-xs text-ink focus:border-accent focus:outline-none"><option value="All">All categories</option>{CATEGORIES.map((item) => <option key={item} value={item}>{formatCategory(item)}</option>)}</select></label>
      </div>

      <div className="mt-5 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-muted"><span>{filtered.length} of {posts.length} posts</span><span>Sorted by research value</span></div>
      <div className="mt-3 divide-y divide-ink/10 border-y border-ink/12">
        {filtered.map((entry) => (
          <article key={entry.post.id} className="grid gap-5 py-6 lg:grid-cols-[5rem_minmax(0,1fr)_12rem]">
            <div>
              <span className={`font-mono text-2xl font-medium tracking-[-0.06em] ${entry.relevance_score >= 75 ? "text-accent" : "text-ink"}`}>{entry.relevance_score}</span>
              <span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.12em] text-muted">Relevance</span>
            </div>
            <div className="min-w-0">
              <p className="max-w-[80ch] whitespace-pre-line text-sm leading-6 text-ink">{entry.post.text}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">{entry.categories.map((item) => <span key={item} className="rounded-full border border-ink/12 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-muted">{formatCategory(item)}</span>)}</div>
              {entry.score_reasons.length ? <p className="mt-3 text-[11px] leading-5 text-muted">Why it ranked: {entry.score_reasons.join(" · ")}</p> : null}
            </div>
            <div className="flex flex-row gap-5 lg:flex-col lg:items-end lg:text-right">
              <div><span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">Depth</span><strong className="ml-2 font-mono text-xs text-ink">{entry.technical_depth}</strong></div>
              <div><span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">Build</span><strong className="ml-2 font-mono text-xs text-ink">{entry.build_potential}</strong></div>
              <a href={entry.post.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 border-b border-ink/25 pb-1 text-xs font-medium text-ink hover:border-accent hover:text-accent">Open on X <ArrowSquareOutIcon size={12} /></a>
            </div>
          </article>
        ))}
        {!filtered.length ? <div className="py-20 text-center"><p className="text-sm font-medium text-ink">No evidence matches this view.</p><p className="mt-1 text-xs text-muted">Lower the threshold or remove a filter.</p></div> : null}
      </div>
    </div>
  );
}
