import { formatCategory, safeHref } from "@/lib/format";
import { UiIcon } from "@/components/ui-icon";
import type { ResearchAnalysis } from "@/types";

/**
 * The published view of the corpus. It cites each high-signal post by link and
 * by the derived signals that made it rank, and never reproduces post text:
 * X's Developer Agreement restricts redistributing Post content.
 */
export function EvidenceCitations({ evidence }: { evidence: ResearchAnalysis["topEvidence"] }) {
  if (!evidence.length) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-medium text-ink">No evidence index available.</p>
        <p className="mt-1 text-xs text-muted">Run <code>npm run research</code> to generate it.</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
        <span>{evidence.length} highest-signal sources</span>
        <span>Sorted by research value</span>
      </div>
      <div className="mt-3 divide-y divide-ink/10 border-y border-ink/12">
        {evidence.map((entry, index) => (
          <article key={entry.url} className="grid gap-5 py-6 lg:grid-cols-[5rem_minmax(0,1fr)_12rem]">
            <div>
              <span className={`font-mono text-2xl font-medium tracking-[-0.06em] ${entry.relevance >= 75 ? "text-accent" : "text-ink"}`}>{entry.relevance}</span>
              <span className="mt-1 block font-mono text-[8px] uppercase tracking-[0.12em] text-muted">Relevance</span>
            </div>
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">Source {String(index + 1).padStart(2, "0")}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {entry.categories.map((item) => <span key={item} className="rounded-full border border-ink/12 px-2 py-1 font-mono text-[8px] uppercase tracking-[0.1em] text-muted">{formatCategory(item)}</span>)}
              </div>
              {entry.themes.length ? <p className="mt-3 text-[11px] leading-5 text-muted">Themes: {entry.themes.join(" · ")}</p> : null}
              {entry.scoreReasons.length ? <p className="mt-2 text-[11px] leading-5 text-muted">Why it ranked: {entry.scoreReasons.join(" · ")}</p> : null}
            </div>
            <div className="flex flex-row gap-5 lg:flex-col lg:items-end lg:text-right">
              <div><span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">Depth</span><strong className="ml-2 font-mono text-xs text-ink">{entry.technicalDepth}</strong></div>
              <div><span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">Build</span><strong className="ml-2 font-mono text-xs text-ink">{entry.buildPotential}</strong></div>
              <a href={safeHref(entry.url)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 border-b border-ink/25 pb-1 text-xs font-medium text-ink hover:border-accent hover:text-accent">Read on X <UiIcon name="arrow-out" size={12} /></a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
