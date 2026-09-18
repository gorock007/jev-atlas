import Link from "next/link";
import { OPPORTUNITY_LENSES } from "@/knowledge/lenses";
import { knowledgeSlug } from "@/knowledge/paths";
import { loadAnalysis } from "@/lib/research-data";
import type { BuildIdea } from "@/types";

export const metadata = { title: "Opportunity map", description: "The Jev design space organised by the property that makes Jev useful." };
export const dynamic = "force-static";

function confidenceTone(confidence: BuildIdea["confidence"]): string {
  if (confidence === "HIGH") return "bg-ink text-paper";
  if (confidence === "MEDIUM") return "border border-ink/25 text-ink";
  return "border border-ink/15 text-muted";
}

export default async function OpportunityMapPage() {
  const analysis = await loadAnalysis();
  const ideas = analysis?.ideas ?? [];
  const grouped = OPPORTUNITY_LENSES.map((lens) => ({
    lens,
    ideas: ideas.filter((idea) => idea.lens === lens.id).sort((a, b) => b.indieFit - a.indieFit || a.name.localeCompare(b.name)),
  }));

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-18">
      <header className="grid gap-8 border-b border-ink/15 pb-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Opportunity map</p>
          <h1 className="mt-5 max-w-[15ch] text-4xl font-semibold leading-none tracking-[-0.055em] text-ink sm:text-5xl">Organised by what makes Jev useful.</h1>
        </div>
        <p className="max-w-[55ch] text-sm leading-6 text-muted lg:justify-self-end">
          Not by industry or product category — by the property a workload has to exhibit before a typed judgment beats a generative call or a rule tree. If your workload does not sit under one of these nine headings, Jev is probably the wrong tool.
        </p>
      </header>

      <nav aria-label="Jump to a lens" className="flex flex-wrap gap-2 border-b border-ink/15 py-6">
        {grouped.map(({ lens, ideas: entries }) => (
          <a key={lens.id} href={`#${lens.id}`} className="rounded-full border border-ink/15 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted hover:border-accent hover:text-accent">
            {lens.title} <span className="ml-1 opacity-60">{entries.length}</span>
          </a>
        ))}
      </nav>

      {grouped.map(({ lens, ideas: entries }, index) => (
        <section key={lens.id} id={lens.id} className="scroll-mt-24 border-b border-ink/10 py-11">
          <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="font-mono text-[10px] text-muted">{String(index + 1).padStart(2, "0")}</p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.04em] text-ink">{lens.title}</h2>
              <p className="mt-4 text-sm leading-6 text-ink/85">{lens.property}</p>
              <p className="mt-3 text-xs leading-5 text-muted">{lens.description}</p>
              <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.12em] text-accent">{entries.length} hypotheses</p>
            </div>

            <ul className="grid gap-px bg-ink/10 sm:grid-cols-2">
              {entries.map((idea) => (
                <li key={idea.name} className="bg-paper">
                  <Link href={`/ideas/${knowledgeSlug(idea.name)}`} className="grid h-full gap-3 p-5 transition-colors hover:bg-shell/70">
                    <span className="flex items-start justify-between gap-3">
                      <span className="text-sm font-semibold leading-snug text-ink">{idea.name}</span>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.1em] ${confidenceTone(idea.confidence)}`}>{idea.confidence}</span>
                    </span>
                    <span className="text-xs leading-5 text-muted">{idea.product}</span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">Indie fit {idea.indieFit}/10</span>
                  </Link>
                </li>
              ))}
              {!entries.length ? <li className="bg-paper p-5 text-xs text-muted">No hypotheses catalogued under this lens yet.</li> : null}
            </ul>
          </div>
        </section>
      ))}

      <p className="py-10 text-xs leading-5 text-muted">
        Every entry on this map is an authored hypothesis, not a validated product. Lens assignment is an editorial judgment about which property of Jev the idea depends on most.
      </p>
    </div>
  );
}
