import Link from "next/link";
import { UiIcon } from "@/components/ui-icon";
import { knowledgeSlug } from "@/knowledge/paths";
import { loadAnalysis } from "@/lib/research-data";

export const metadata = { title: "Patterns", description: "Repeated architectural structures observed across Jev integrations." };
export const dynamic = "force-static";

export default async function PatternsPage() {
  const analysis = await loadAnalysis();
  const patterns = analysis?.patterns ?? [];

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-18">
      <header className="grid gap-8 border-b border-ink/15 pb-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Repeated structures</p>
          <h1 className="mt-5 max-w-[14ch] text-4xl font-semibold leading-none tracking-[-0.055em] text-ink sm:text-5xl">The shapes people keep building.</h1>
        </div>
        <p className="max-w-[55ch] text-sm leading-6 text-muted lg:justify-self-end">
          Each pattern appeared more than once across the collected material. Convergence shows what feels natural to build; it is not a measurement of how well the shape performs under load.
        </p>
      </header>

      <div className="divide-y divide-ink/10">
        {patterns.map((pattern, index) => (
          <article key={pattern.name} className="grid gap-5 py-9 lg:grid-cols-[3rem_0.7fr_1.3fr]">
            <span className="font-mono text-[10px] text-muted">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h2 className="text-xl font-semibold tracking-[-0.035em] text-ink">
                <Link href={`/patterns/${knowledgeSlug(pattern.name)}`} className="hover:text-accent">{pattern.name}</Link>
              </h2>
              <Link href={`/patterns/${knowledgeSlug(pattern.name)}`} className="mt-4 inline-flex items-center gap-1.5 border-b border-ink/25 pb-1 text-xs font-medium text-ink hover:border-accent hover:text-accent">
                Open pattern <UiIcon name="arrow-right" size={12} />
              </Link>
            </div>
            <div>
              <p className="text-sm leading-6 text-ink">{pattern.description}</p>
              <p className="mt-4 border-l-2 border-ink/20 pl-4 text-xs leading-5 text-muted"><strong className="font-semibold text-ink">Caveat.</strong> {pattern.caveat}</p>
            </div>
          </article>
        ))}
      </div>

      {!patterns.length ? <p className="py-16 text-sm text-muted">Run <code>npm run research</code> to generate the pattern index.</p> : null}
    </div>
  );
}
