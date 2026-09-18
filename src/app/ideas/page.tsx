import Link from "next/link";
import { IdeasExplorer } from "@/components/ideas-explorer";
import { UiIcon } from "@/components/ui-icon";
import { loadAnalysis } from "@/lib/research-data";

export const metadata = { title: "Ideas" };

export default async function IdeasPage() {
  const analysis = await loadAnalysis();
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-18">
      <header className="grid gap-8 border-b border-ink/15 pb-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Design space</p>
          <h1 className="mt-5 max-w-[13ch] text-4xl font-semibold leading-none tracking-[-0.055em] text-ink sm:text-5xl">Products shaped by cheap decisions.</h1>
        </div>
        <div className="max-w-[55ch] lg:justify-self-end">
          <p className="text-sm leading-6 text-muted">These are research hypotheses, not a startup-idea dump. Each includes a specific Jev advantage, a 1–7 day MVP, a validation experiment, evidence, and unknowns.</p>
          <Link href="/map" className="mt-4 inline-flex items-center gap-1.5 border-b border-ink/25 pb-1 text-xs font-medium text-ink hover:border-accent hover:text-accent">See them on the opportunity map <UiIcon name="arrow-right" size={12} /></Link>
        </div>
      </header>
      {analysis ? <IdeasExplorer ideas={analysis.ideas} /> : <p className="py-16 text-sm text-muted">Run `npm run research` to generate the idea catalog.</p>}
    </div>
  );
}
