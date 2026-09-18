import { notFound } from "next/navigation";
import { Limitations, RecordFooter, RecordHeader, RelatedRecords, Sources, StatusChip } from "@/components/record-chrome";
import { atlasRecords, recordBySlug, recordSlugs } from "@/lib/atlas";
import { relatedRecords, renderRecordMarkdown } from "@/knowledge/repository";
import { knowledgeSlug } from "@/knowledge/paths";
import { loadAnalysis } from "@/lib/research-data";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return recordSlugs("claim");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const record = await recordBySlug("claim", (await params).slug);
  return record ? { title: record.title, description: record.summary } : { title: "Claim not found" };
}

export default async function ClaimPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [record, analysis, all] = await Promise.all([recordBySlug("claim", slug), loadAnalysis(), atlasRecords()]);
  if (!record) notFound();
  const claim = analysis?.claims.find((entry) => knowledgeSlug(entry.claim) === slug);

  return (
    <article className="mx-auto max-w-[900px] px-5 py-10 sm:px-10 sm:py-14 lg:py-18">
      <RecordHeader
        eyebrow="Evidence ledger"
        title={record.title}
        deck={record.summary}
        chips={<><StatusChip status={record.status} /><span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">Claim {String(record.metadata.index ?? "")}</span></>}
        backHref="/claims"
        backLabel="All claims"
      />

      <section className="mt-9 grid gap-8">
        <div>
          <h2 className="font-mono text-[9px] uppercase tracking-[0.15em] text-accent">Evidence</h2>
          <p className="mt-3 text-base leading-7 text-ink">{claim?.evidence ?? record.summary}</p>
        </div>
        {claim?.counterarguments ? (
          <div>
            <h2 className="font-mono text-[9px] uppercase tracking-[0.15em] text-accent">Counterarguments</h2>
            <p className="mt-3 text-sm leading-6 text-ink/85">{claim.counterarguments}</p>
          </div>
        ) : null}
        {claim?.openQuestions ? (
          <div>
            <h2 className="font-mono text-[9px] uppercase tracking-[0.15em] text-accent">Open questions</h2>
            <p className="mt-3 text-sm leading-6 text-ink/85">{claim.openQuestions}</p>
          </div>
        ) : null}
      </section>

      <p className="mt-8 border-l-2 border-accent bg-shell/60 p-5 text-xs leading-5 text-ink/80">
        This status describes how well the claim is supported by the collected evidence, not whether it is ultimately true. A <strong className="font-semibold">Vendor Claim</strong> is a statement TypeSafe has made about its own product; repetition by others does not upgrade it.
      </p>

      <Sources sources={record.sources} />
      <Limitations items={record.limitations} />
      <RelatedRecords records={relatedRecords(record, all, { kinds: ["project", "pattern", "opportunity", "document"] })} title="Where this claim matters" />
      <RecordFooter record={record} context={renderRecordMarkdown(record)} />
    </article>
  );
}
