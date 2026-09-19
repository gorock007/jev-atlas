import Link from "next/link";
import { FitChecker } from "@/components/fit-checker";
import { UiIcon } from "@/components/ui-icon";

export const metadata = {
  title: "Will Jev help my workflow?",
  description: "Paste a workflow and get a decomposition into candidate Choice, Score, and Noul decision points, with what should stay in code and what should stay with a generative model.",
};

const NEXT_STEPS = [
  { href: "/map", title: "Opportunity map", note: "The nine lenses, and what a workload needs before Jev fits." },
  { href: "/patterns", title: "Architecture patterns", note: "The structures builders converge on, each with its caveat." },
  { href: "/start", title: "Jev in 60 seconds", note: "What the primitives are, and where the boundary with code sits." },
];

export default function FitPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-5 py-10 sm:px-10 sm:py-14 lg:py-18">
      <header className="border-b border-ink/15 pb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Fit check</p>
        <h1 className="mt-5 max-w-[18ch] text-4xl font-semibold leading-none tracking-[-0.055em] text-ink sm:text-5xl lg:text-6xl">Will Jev help my workflow?</h1>
        <p className="mt-6 max-w-[64ch] text-base leading-7 text-muted">
          Describe what actually happens today. This returns the bounded decisions inside it — the ones a typed judgment could answer — alongside what should stay deterministic and what still needs a generative model.
        </p>
        <p className="mt-5 max-w-[64ch] text-xs leading-5 text-muted">
          It is a decomposition exercise grounded in this atlas, not a benchmark. Nothing here measures how Jev would perform on your data, and the answer is a hypothesis to test rather than a result. Your text is not stored or logged.
        </p>
      </header>

      <FitChecker />

      <section className="border-t border-ink/15 py-12">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Where to go next</h2>
        <div className="mt-7 grid gap-px bg-ink/10 sm:grid-cols-3">
          {NEXT_STEPS.map(({ href, title, note }) => (
            <Link key={href} href={href} className="grid gap-2 bg-paper p-5 transition-colors hover:bg-shell/70">
              <span className="text-sm font-semibold text-ink">{title}</span>
              <span className="text-xs leading-5 text-muted">{note}</span>
            </Link>
          ))}
        </div>
        <Link href="/agent" className="mt-7 inline-flex items-center gap-1.5 border-b border-ink/25 pb-1 text-sm font-medium text-ink hover:border-accent hover:text-accent">
          Run the same assessment from your agent over MCP <UiIcon name="arrow-right" size={13} />
        </Link>
      </section>
    </div>
  );
}
