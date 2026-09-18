import { notFound } from "next/navigation";
import { Limitations, RecordFooter, RecordHeader, RelatedRecords, Sources, StatusChip } from "@/components/record-chrome";
import { atlasRecords, recordBySlug, recordSlugs } from "@/lib/atlas";
import { relatedRecords, renderRecordMarkdown } from "@/knowledge/repository";
import { knowledgeSlug } from "@/knowledge/paths";
import { loadAnalysis } from "@/lib/research-data";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return recordSlugs("pattern");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const record = await recordBySlug("pattern", (await params).slug);
  return record ? { title: record.title, description: record.summary } : { title: "Pattern not found" };
}

export default async function PatternPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [record, analysis, all] = await Promise.all([recordBySlug("pattern", slug), loadAnalysis(), atlasRecords()]);
  if (!record) notFound();
  const pattern = analysis?.patterns.find((entry) => knowledgeSlug(entry.name) === slug);
  if (!pattern) notFound();

  return (
    <article className="mx-auto max-w-[900px] px-5 py-10 sm:px-10 sm:py-14 lg:py-18">
      <RecordHeader
        eyebrow="Architecture pattern"
        title={pattern.name}
        deck={pattern.description}
        chips={<StatusChip status={record.status} />}
        backHref="/patterns"
        backLabel="All patterns"
      />

      <section className="mt-9">
        <h2 className="font-mono text-[9px] uppercase tracking-[0.15em] text-accent">What the pattern does</h2>
        <p className="mt-3 text-base leading-7 text-ink">{pattern.description}</p>
      </section>

      <section className="mt-8 border-l-2 border-accent bg-shell/60 p-5">
        <h2 className="font-mono text-[9px] uppercase tracking-[0.15em] text-accent">Caveat</h2>
        <p className="mt-3 text-sm leading-6 text-ink/85">{pattern.caveat}</p>
      </section>

      <p className="mt-8 text-xs leading-5 text-muted">
        Patterns are recurring shapes observed across the collected material. A repeated shape is evidence that developers converge on it, not evidence that it performs well in production.
      </p>

      <Sources sources={record.sources} />
      <Limitations items={record.limitations} />
      <RelatedRecords records={relatedRecords(record, all, { kinds: ["project", "opportunity", "claim"] })} title="Where this pattern appears" />
      <RecordFooter record={record} context={renderRecordMarkdown(record)} />
    </article>
  );
}
