import { notFound } from "next/navigation";
import { Field, Limitations, RecordFooter, RecordHeader, RelatedRecords, Sources, StatusChip } from "@/components/record-chrome";
import { UiIcon } from "@/components/ui-icon";
import { atlasRecords, recordBySlug, recordSlugs } from "@/lib/atlas";
import { relatedRecords, renderRecordMarkdown } from "@/knowledge/repository";
import { knowledgeSlug } from "@/knowledge/paths";
import { safeHref } from "@/lib/format";
import { loadAnalysis } from "@/lib/research-data";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return recordSlugs("project");
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const record = await recordBySlug("project", (await params).slug);
  return record ? { title: record.title, description: record.summary } : { title: "Project not found" };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [record, analysis, all] = await Promise.all([recordBySlug("project", slug), loadAnalysis(), atlasRecords()]);
  if (!record) notFound();
  const project = analysis?.projects.find((entry) => knowledgeSlug(entry.name) === slug);
  if (!project) notFound();

  return (
    <article className="mx-auto max-w-[900px] px-5 py-10 sm:px-10 sm:py-14 lg:py-18">
      <RecordHeader
        eyebrow={project.status === "ACTUALLY BUILT" ? "Case study · located work" : "Case study · proposal"}
        title={project.name}
        deck={project.description}
        chips={<><StatusChip status={record.status} /><span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">{project.builder}</span></>}
        backHref="/projects"
        backLabel="All projects"
      />

      <dl className="mt-9 grid gap-x-10 gap-y-7 sm:grid-cols-2">
        <Field label="Problem" value={project.description} />
        <Field label="Jev’s role" value={project.jevRole} />
        <Field label="Architecture" value={project.architecture} />
        <Field label="Why it matters" value={project.insight} />
      </dl>

      <section className="mt-9 border-l-2 border-accent bg-shell/60 p-5">
        <h2 className="font-mono text-[9px] uppercase tracking-[0.15em] text-accent">Code boundary</h2>
        <p className="mt-3 text-sm leading-6 text-ink/85">
          Jev answers the bounded questions described above. Thresholds, retries, side effects, and anything that must be reproducible stay in the surrounding application code. The research record does not capture this project’s exact question set or threshold values; read the linked source before copying the architecture.
        </p>
      </section>

      {safeHref(project.repositoryOrDemo) ? (
        <a href={safeHref(project.repositoryOrDemo)} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center gap-1.5 border-b border-ink/25 pb-1 text-sm font-medium text-ink hover:border-accent hover:text-accent">
          Open the repository or demo <UiIcon name="arrow-out" size={13} />
        </a>
      ) : null}

      <Sources sources={record.sources} />
      <Limitations items={record.limitations} />
      <RelatedRecords records={relatedRecords(record, all, { kinds: ["pattern", "opportunity", "claim"] })} title="Reusable pattern and related records" />
      <RecordFooter record={record} context={renderRecordMarkdown(record)} />
    </article>
  );
}
