import { EvidenceCitations } from "@/components/evidence-citations";
import { EvidenceExplorer } from "@/components/evidence-explorer";
import { loadAnalysis, loadProcessedPosts } from "@/lib/research-data";

export const metadata = { title: "Evidence" };

export default async function EvidencePage() {
  const [posts, analysis] = await Promise.all([loadProcessedPosts(), loadAnalysis()]);
  // The corpus is local-only, so a deployed build has citations but no post
  // text. Browse the full dataset when it is present; cite it when it is not.
  const hasCorpus = posts.length > 0;

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-18">
      <header className="grid gap-8 border-b border-ink/15 pb-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Source browser</p>
          <h1 className="mt-5 max-w-[13ch] text-4xl font-semibold leading-none tracking-[-0.055em] text-ink sm:text-5xl">
            {hasCorpus ? "The local X dataset, made legible." : "The sources behind the analysis."}
          </h1>
        </div>
        <p className="max-w-[55ch] text-sm leading-6 text-muted lg:justify-self-end">
          Scores are transparent research heuristics. Engagement contributes only a small signal; technical specificity, code, experiments, and limitations matter more.
          {hasCorpus ? null : " Post text is not republished here — each entry links to the original."}
        </p>
      </header>
      {hasCorpus ? <EvidenceExplorer posts={posts} /> : <EvidenceCitations evidence={analysis?.topEvidence ?? []} />}
    </div>
  );
}
