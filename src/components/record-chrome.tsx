import Link from "next/link";
import { CopyContext } from "@/components/copy-context";
import { UiIcon } from "@/components/ui-icon";
import type { EvidenceStatus, KnowledgeRecord } from "@/knowledge/types";
import { safeHref } from "@/lib/format";

const STRONG: EvidenceStatus[] = ["Demonstrated", "Observed", "Official Documentation"];
const VENDOR: EvidenceStatus[] = ["Vendor Claim", "Disputed"];

export function StatusChip({ status }: { status: EvidenceStatus }) {
  const tone = STRONG.includes(status)
    ? "bg-ink text-paper"
    : VENDOR.includes(status)
      ? "border border-accent/35 bg-accent-soft/55 text-[#7a3b23]"
      : "border border-ink/15 bg-paper text-muted";
  return <span className={`rounded-full px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.12em] ${tone}`}>{status}</span>;
}

export function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[9px] uppercase tracking-[0.15em] text-accent">{label}</dt>
      <dd className="mt-2 text-sm leading-6 text-ink/85">{value}</dd>
    </div>
  );
}

export function RecordHeader({ eyebrow, title, deck, chips, backHref, backLabel }: {
  eyebrow: string;
  title: string;
  deck: string;
  chips?: React.ReactNode;
  backHref: string;
  backLabel: string;
}) {
  return (
    <header className="border-b border-ink/15 pb-9">
      <Link href={backHref} className="inline-flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted hover:text-accent">
        <UiIcon name="arrow-left" size={12} /> {backLabel}
      </Link>
      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
      <h1 className="mt-4 max-w-[20ch] text-3xl font-semibold leading-[1.05] tracking-[-0.05em] text-ink sm:text-4xl lg:text-5xl">{title}</h1>
      <p className="mt-5 max-w-[68ch] text-sm leading-6 text-muted">{deck}</p>
      {chips ? <div className="mt-6 flex flex-wrap items-center gap-2">{chips}</div> : null}
    </header>
  );
}

export function Sources({ sources }: { sources: KnowledgeRecord["sources"] }) {
  if (!sources.length) return null;
  return (
    <section className="mt-10 border-t border-ink/15 pt-7">
      <h2 className="font-mono text-[9px] uppercase tracking-[0.15em] text-accent">Sources</h2>
      <ul className="mt-4 grid gap-2">
        {sources.map((source) => (
          <li key={source.url}>
            <a href={safeHref(source.url)} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1.5 text-xs leading-5 text-ink hover:text-accent">
              <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">{source.sourceClass}</span>
              <span className="break-all underline decoration-ink/25 underline-offset-2">{source.url}</span>
              <UiIcon name="arrow-out" size={11} />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Limitations({ items }: { items: string[] }) {
  const shown = items.filter(Boolean);
  if (!shown.length) return null;
  return (
    <section className="mt-8 border-l-2 border-ink/25 bg-shell/60 p-5">
      <h2 className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted">Limitations</h2>
      <ul className="mt-3 grid gap-2">
        {shown.map((item) => <li key={item} className="text-xs leading-5 text-ink/80">{item}</li>)}
      </ul>
    </section>
  );
}

export function RecordFooter({ record, context }: { record: KnowledgeRecord; context: string }) {
  return (
    <footer className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-ink/15 pt-6">
      <dl className="flex flex-wrap gap-x-8 gap-y-2 font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
        <div className="flex gap-2"><dt>Record</dt><dd className="text-ink">{record.id}</dd></div>
        <div className="flex gap-2"><dt>Canonical</dt><dd className="text-ink">{record.canonicalPath}</dd></div>
        <div className="flex gap-2"><dt>Last verified</dt><dd className="text-ink">{record.lastVerifiedAt.slice(0, 10)}</dd></div>
      </dl>
      <CopyContext context={context} />
    </footer>
  );
}

export function RelatedRecords({ records, title = "Related records" }: { records: KnowledgeRecord[]; title?: string }) {
  if (!records.length) return null;
  return (
    <section className="mt-10 border-t border-ink/15 pt-7">
      <h2 className="font-mono text-[9px] uppercase tracking-[0.15em] text-accent">{title}</h2>
      <ul className="mt-4 divide-y divide-ink/10">
        {records.map((record) => (
          <li key={record.id}>
            <Link href={record.canonicalPath} className="grid gap-1 py-3 transition-all duration-200 hover:pl-1">
              <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">{record.title} <StatusChip status={record.status} /></span>
              <span className="text-xs leading-5 text-muted">{record.summary}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
