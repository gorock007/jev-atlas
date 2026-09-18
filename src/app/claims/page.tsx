import { ClaimsExplorer } from "@/components/claims-explorer";
import { loadAnalysis } from "@/lib/research-data";

export const metadata = { title: "Claims" };

export default async function ClaimsPage() {
  const analysis = await loadAnalysis();
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-18">
      <header className="grid gap-8 border-b border-ink/15 pb-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Evidence ledger</p>
          <h1 className="mt-5 max-w-[12ch] text-4xl font-semibold leading-none tracking-[-0.055em] text-ink sm:text-5xl">Claims under examination.</h1>
        </div>
        <p className="max-w-[55ch] text-sm leading-6 text-muted lg:justify-self-end">Every important statement carries a status, source trail, counterargument, and unresolved question. Frequency is never treated as proof.</p>
      </header>
      {analysis ? <ClaimsExplorer claims={analysis.claims} /> : <p className="py-16 text-sm text-muted">Run `npm run research` to generate the claims ledger.</p>}
    </div>
  );
}
