import Link from "next/link";
import { loadDocument, RESEARCH_DOCUMENTS } from "@/lib/research-data";
import { UiIcon } from "@/components/ui-icon";

export const metadata = { title: "Library" };

export default async function LibraryPage() {
  const documents = await Promise.all(RESEARCH_DOCUMENTS.map((document) => loadDocument(document.slug)));
  const available = documents.filter((document) => document !== null);
  const totalMinutes = available.reduce((sum, document) => sum + document.readingMinutes, 0);

  return (
    <div className="mx-auto max-w-[1400px] px-5 py-10 sm:px-10 sm:py-14 lg:px-16 lg:py-18">
      <header className="grid gap-10 border-b border-ink/15 pb-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent"><UiIcon name="books" size={14} /> Research library</div>
          <h1 className="mt-5 max-w-[12ch] text-4xl font-semibold leading-none tracking-[-0.055em] text-ink sm:text-5xl">Every artifact, in one reading room.</h1>
        </div>
        <div className="flex gap-10 lg:justify-self-end"><div><span className="font-mono text-3xl tracking-[-0.06em] text-ink">{available.length}</span><span className="mt-1 block text-xs text-muted">Documents</span></div><div><span className="font-mono text-3xl tracking-[-0.06em] text-ink">{totalMinutes}</span><span className="mt-1 block text-xs text-muted">Minutes total</span></div></div>
      </header>

      <div className="py-8">
        {available.map((document, index) => (
          <Link key={document.slug} href={`/research/${document.slug}`} className="group grid gap-4 border-b border-ink/12 py-7 transition-transform duration-300 hover:translate-x-1 sm:grid-cols-[3rem_0.8fr_1.2fr_auto] sm:items-center">
            <span className="font-mono text-[9px] text-muted">{String(index + 1).padStart(2, "0")}</span>
            <div className="flex items-start gap-3"><UiIcon name="article" size={17} className="mt-0.5 shrink-0 text-accent" /><div><p className="font-mono text-[8px] uppercase tracking-[0.14em] text-accent">{document.eyebrow}</p><h2 className="mt-2 text-lg font-semibold tracking-[-0.03em] text-ink">{document.title}</h2></div></div>
            <p className="max-w-[55ch] text-sm leading-6 text-muted">{document.description}</p>
            <div className="flex items-center gap-4 sm:justify-end"><span className="font-mono text-[9px] text-muted">{document.readingMinutes} min</span><UiIcon name="arrow-right" size={16} className="text-muted transition-transform group-hover:translate-x-1 group-hover:text-ink" /></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
