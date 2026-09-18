import Link from "next/link";
import { loadAnalysis } from "@/lib/research-data";
import { knowledgeSlug } from "@/knowledge/paths";
import { safeHref } from "@/lib/format";
import { UiIcon } from "@/components/ui-icon";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const analysis = await loadAnalysis();
  const projects = analysis?.projects ?? [];
  const actual = projects.filter((project) => project.status === "ACTUALLY BUILT");
  const proposed = projects.filter((project) => project.status === "PROPOSED");

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-18">
      <header className="grid gap-8 border-b border-ink/15 pb-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Ecosystem activity</p>
          <h1 className="mt-5 max-w-[13ch] text-4xl font-semibold leading-none tracking-[-0.055em] text-ink sm:text-5xl">Located work, separated from proposals.</h1>
        </div>
        <p className="max-w-[55ch] text-sm leading-6 text-muted lg:justify-self-end">“Actually built” means a public repository, demo, integration, or direct builder demonstration was located. It does not imply production validation.</p>
      </header>

      <section className="py-12">
        <div className="mb-6 flex items-baseline justify-between border-b border-ink/15 pb-4">
          <h2 className="text-xl font-semibold tracking-[-0.035em] text-ink">Actually built</h2>
          <span className="font-mono text-[10px] text-muted">{actual.length} located</span>
        </div>
        <div className="divide-y divide-ink/10">
          {actual.map((project, index) => (
            <article key={project.name} className="grid gap-5 py-8 lg:grid-cols-[3rem_0.65fr_1.35fr]">
              <span className="font-mono text-[10px] text-muted">{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="text-xl font-semibold tracking-[-0.035em] text-ink">
                  <Link href={`/projects/${knowledgeSlug(project.name)}`} className="hover:text-accent">{project.name}</Link>
                </h3>
                <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.14em] text-accent">{project.builder}</p>
                <div className="mt-5 flex flex-col items-start gap-3">
                  <Link href={`/projects/${knowledgeSlug(project.name)}`} className="inline-flex items-center gap-1.5 border-b border-ink/25 pb-1 text-xs font-medium text-ink hover:border-accent hover:text-accent">Read the case study <UiIcon name="arrow-right" size={12} /></Link>
                  <a href={safeHref(project.repositoryOrDemo ?? project.source)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 border-b border-ink/25 pb-1 text-xs font-medium text-ink hover:border-accent hover:text-accent">Open source <UiIcon name="arrow-out" size={13} /></a>
                </div>
              </div>
              <dl className="grid gap-5 sm:grid-cols-2">
                <div><dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">What it is</dt><dd className="mt-2 text-sm leading-6 text-ink">{project.description}</dd></div>
                <div><dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">Jev’s role</dt><dd className="mt-2 text-sm leading-6 text-ink">{project.jevRole}</dd></div>
                <div><dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">Architecture</dt><dd className="mt-2 text-sm leading-6 text-muted">{project.architecture}</dd></div>
                <div><dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">Why it matters</dt><dd className="mt-2 text-sm leading-6 text-muted">{project.insight}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      {proposed.length ? (
        <section className="border-t border-ink/15 py-12">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
            <div><p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Proposed</p><h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-ink">Architectures still looking for proof.</h2></div>
            <div className="divide-y divide-ink/10 border-t border-ink/10">
              {proposed.map((project) => (
                <div key={project.name} className="py-6">
                  <h3 className="font-semibold tracking-[-0.025em] text-ink">
                    <Link href={`/projects/${knowledgeSlug(project.name)}`} className="hover:text-accent">{project.name}</Link>
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{project.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
