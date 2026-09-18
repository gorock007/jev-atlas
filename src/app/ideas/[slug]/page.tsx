import { notFound } from "next/navigation";
import Link from "next/link";
import { Field, Limitations, RecordFooter, RecordHeader, RelatedRecords, Sources, StatusChip } from "@/components/record-chrome";
import { atlasRecords, recordBySlug, recordSlugs } from "@/lib/atlas";
import { relatedRecords, renderRecordMarkdown } from "@/knowledge/repository";
import { findLens } from "@/knowledge/lenses";
import { knowledgeSlug } from "@/knowledge/paths";
import { loadAnalysis } from "@/lib/research-data";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return recordSlugs("opportunity");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const record = await recordBySlug("opportunity", (await params).slug);
  return record ? { title: record.title, description: record.summary } : { title: "Idea not found" };
}

export default async function IdeaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [record, analysis, all] = await Promise.all([recordBySlug("opportunity", slug), loadAnalysis(), atlasRecords()]);
  if (!record) notFound();
  const idea = analysis?.ideas.find((entry) => knowledgeSlug(entry.name) === slug);
  if (!idea) notFound();
  const lens = findLens(idea.lens);

  return (
    <article className="mx-auto max-w-[900px] px-5 py-10 sm:px-10 sm:py-14 lg:py-18">
      <RecordHeader
        eyebrow="Build blueprint"
        title={idea.name}
        deck={idea.product}
        chips={
          <>
            <StatusChip status={record.status} />
            {lens ? <Link href={`/map#${lens.id}`} className="rounded-full border border-ink/15 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-muted hover:border-accent hover:text-accent">{lens.title}</Link> : null}
            <span className="rounded-full border border-accent/35 px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] text-accent">{idea.confidence} confidence</span>
            <span className="font-mono text-[9px] text-muted">Indie fit {idea.indieFit}/10</span>
          </>
        }
        backHref="/ideas"
        backLabel="All ideas"
      />

      <dl className="mt-9 grid gap-x-10 gap-y-7 sm:grid-cols-2">
        <Field label="Problem" value={idea.problem} />
        <Field label="Why Jev" value={idea.whyJev} />
        <Field label="Architecture" value={idea.architecture} />
        <Field label="Current alternative" value={idea.currentAlternative} />
        <Field label="Jev advantage" value={idea.advantage} />
        <Field label="Unknowns" value={idea.unknowns} />
      </dl>

      <div className="mt-9 grid gap-6 border-l-2 border-accent bg-shell/60 p-6 sm:grid-cols-2">
        <Field label="1–7 day MVP" value={idea.mvp} />
        <Field label="Validation experiment" value={idea.validation} />
      </div>

      <p className="mt-6 text-sm leading-6 text-muted"><strong className="font-semibold text-ink">Why this confidence:</strong> {idea.confidenceReason}</p>

      <p className="mt-8 border-t border-ink/15 pt-6 text-xs leading-5 text-muted">
        This is an authored hypothesis derived from the research corpus. Nothing here demonstrates product demand, or that Jev performs well on this particular workload. Run the validation experiment before building past the MVP.
      </p>

      <Sources sources={record.sources} />
      <Limitations items={record.limitations} />
      <RelatedRecords records={relatedRecords(record, all, { kinds: ["pattern", "project", "claim"] })} title="Supporting research" />
      <RecordFooter record={record} context={renderRecordMarkdown(record)} />
    </article>
  );
}
