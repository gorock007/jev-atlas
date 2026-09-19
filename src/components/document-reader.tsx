import Link from "next/link";
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { LoadedDocument } from "@/lib/research-data";
import { UiIcon } from "@/components/ui-icon";
import { safeMarkdownHref } from "@/lib/format";

function textFromNode(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textFromNode).join("");
  if (node && typeof node === "object" && "props" in node) return textFromNode((node as { props: { children?: ReactNode } }).props.children ?? "");
  return "";
}

function slugify(value: string): string {
  return value.toLocaleLowerCase().replace(/[`*_]/gu, "").replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "");
}

export function DocumentReader({ document }: { document: LoadedDocument }) {
  return (
    <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-10 sm:py-12 lg:px-16">
      <Link href="/library" className="inline-flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-ink">
        <UiIcon name="arrow-left" size={13} /> Back to library
      </Link>
      <header className="mt-8 grid gap-8 border-b border-ink/15 pb-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">{document.eyebrow}</p>
          <h1 className="mt-5 max-w-[15ch] text-4xl font-semibold leading-none tracking-[-0.055em] text-ink sm:text-5xl">{document.title}</h1>
        </div>
        <div className="lg:justify-self-end">
          <p className="max-w-[52ch] text-sm leading-6 text-muted">{document.description}</p>
          <div className="mt-4 flex gap-5 font-mono text-[9px] uppercase tracking-[0.14em] text-muted"><span>{document.readingMinutes} min read</span><span>{document.headings.filter((heading) => heading.level === 2).length} sections</span></div>
        </div>
      </header>

      <div className="grid gap-14 pt-10 xl:grid-cols-[minmax(0,1fr)_15rem] xl:gap-20">
        <article className="research-prose min-w-0 max-w-[78ch]">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => <h2 id={slugify(textFromNode(children))}>{children}</h2>,
              h3: ({ children }) => <h3 id={slugify(textFromNode(children))}>{children}</h3>,
              a: ({ href, children }) => {
                const safe = safeMarkdownHref(href);
                if (!safe) return <>{children}</>;
                const external = safe.startsWith("http://") || safe.startsWith("https://");
                return <a href={safe} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>{children}{external ? <UiIcon name="arrow-out" size={11} className="ml-1 inline -translate-y-px" /> : null}</a>;
              },
            }}
          >
            {document.markdown}
          </ReactMarkdown>
        </article>

        <aside className="hidden xl:block">
          <div className="sticky top-8 border-l border-ink/15 pl-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-accent">On this page</p>
            <nav className="mt-4 space-y-1.5" aria-label="Table of contents">
              {document.headings.map((heading) => (
                <a key={`${heading.level}-${heading.id}`} href={`#${heading.id}`} className={`block text-xs leading-5 text-muted transition-colors hover:text-ink ${heading.level === 3 ? "pl-3" : "font-medium"}`}>{heading.title}</a>
              ))}
            </nav>
          </div>
        </aside>
      </div>
    </div>
  );
}
