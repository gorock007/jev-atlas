import Link from "next/link";
import { CopyContext } from "@/components/copy-context";
import { StatusChip } from "@/components/record-chrome";
import { UiIcon } from "@/components/ui-icon";
import { renderRecordMarkdown } from "@/knowledge/repository";
import { atlasRecords } from "@/lib/atlas";
import { loadAnalysis } from "@/lib/research-data";

export const metadata = { title: "Jev in 60 seconds", description: "What Jev is, what it is not, and where it belongs in a system." };
export const dynamic = "force-static";

const PIPELINE = [
  { step: "Unstructured state", note: "Whatever your application already has: a message, a diff, an event, a screen, a row." },
  { step: "Narrow independent questions", note: "Decomposed so each one can be answered on its own, and many can be asked at once." },
  { step: "Choice · Score · Noul", note: "The typed primitives. A bounded option, a calibrated number, or a probability." },
  { step: "Probabilities and confidence", note: "Ordinary values your code can threshold, log, compare, and regression-test." },
  { step: "Deterministic application code", note: "Policy, side effects, retries, and anything that has to be reproducible." },
];

const NEXT_STEPS = [
  { href: "/map", title: "Opportunity map", note: "The design space, grouped by the property that makes Jev useful." },
  { href: "/patterns", title: "Architecture patterns", note: "The structures developers keep converging on, with caveats." },
  { href: "/projects", title: "Case studies", note: "Work that was actually located, kept separate from proposals." },
  { href: "/agent", title: "For agents", note: "MCP endpoint, JSON exports, and llms.txt for coding agents." },
];

const IS = [
  "A fast, narrow judgment layer that application code calls like any other function.",
  "Typed output, so there is no free-form response to parse or repair.",
  "Cheap enough per call that judging every item in a stream becomes affordable.",
  "A source of probabilities that deterministic code composes into policy.",
];

const IS_NOT = [
  "Not a chat interface. There is no conversation, persona, or message history to manage.",
  "Not a code generator. It answers questions; it does not write your implementation.",
  "Not autonomous control flow. It never decides what runs next — your code does.",
  "Not a replacement for deterministic rules. Anything that must be exact stays in code.",
  "Not a correctness guarantee. A typed answer constrains the shape of a decision, not its truth.",
];

export default async function StartPage() {
  const [records, analysis] = await Promise.all([atlasRecords(), loadAnalysis()]);
  const overview = records.find((record) => record.id === "overview:what-is-jev");
  const demonstrated = (analysis?.claims ?? []).filter((claim) => claim.status === "Demonstrated");
  const vendor = (analysis?.claims ?? []).filter((claim) => claim.status === "Vendor Claim");

  return (
    <div className="mx-auto max-w-[1100px] px-5 py-10 sm:px-10 sm:py-14 lg:py-18">
      <header className="border-b border-ink/15 pb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Start here</p>
        <h1 className="mt-5 max-w-[16ch] text-4xl font-semibold leading-none tracking-[-0.055em] text-ink sm:text-5xl lg:text-6xl">Jev in 60 seconds.</h1>
        <p className="mt-6 max-w-[64ch] text-base leading-7 text-muted">
          Jev is TypeSafe’s System One model: it takes application state, answers explicit narrow questions with a typed result and a confidence, and hands the answer back to code that stays in charge of what happens next.
        </p>
        {overview ? (
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <StatusChip status={overview.status} />
            <CopyContext context={renderRecordMarkdown(overview)} />
          </div>
        ) : null}
      </header>

      <section className="border-b border-ink/15 py-12">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">The shape of an integration</h2>
        <ol className="mt-7 grid gap-px bg-ink/10">
          {PIPELINE.map((entry, index) => (
            <li key={entry.step} className="grid gap-2 bg-paper p-5 sm:grid-cols-[3rem_16rem_1fr] sm:items-baseline sm:gap-6">
              <span className="font-mono text-[10px] text-muted">{String(index + 1).padStart(2, "0")}</span>
              <span className="font-serif text-xl leading-tight tracking-[-0.02em] text-ink">{entry.step}</span>
              <span className="text-sm leading-6 text-muted">{entry.note}</span>
            </li>
          ))}
        </ol>
        <p className="mt-6 max-w-[68ch] text-xs leading-5 text-muted">
          The interesting consequence is the last row. Because the model returns a value rather than prose, the decision boundary between the model and your program is explicit — which is what makes the rest of this atlas possible to reason about.
        </p>
      </section>

      <section className="border-b border-ink/15 py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Jev is</h2>
            <ul className="mt-6 grid gap-4">
              {IS.map((item) => (
                <li key={item} className="border-l-2 border-ink pl-4 text-sm leading-6 text-ink">{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted">Jev is not</h2>
            <ul className="mt-6 grid gap-4">
              {IS_NOT.map((item) => (
                <li key={item} className="border-l-2 border-ink/20 pl-4 text-sm leading-6 text-muted">{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-b border-ink/15 py-12">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">What is actually established</h2>
        <p className="mt-4 max-w-[64ch] text-sm leading-6 text-muted">
          This atlas separates what has been demonstrated from what TypeSafe says about its own product. Both matter; they are not the same kind of statement.
        </p>
        <div className="mt-7 grid gap-8 lg:grid-cols-2">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink">Demonstrated · {demonstrated.length}</p>
            <ul className="mt-4 divide-y divide-ink/10 border-t border-ink/15">
              {demonstrated.map((claim) => <li key={claim.claim} className="py-3 text-sm leading-6 text-ink">{claim.claim}</li>)}
            </ul>
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-accent">Vendor claim · {vendor.length}</p>
            <ul className="mt-4 divide-y divide-ink/10 border-t border-ink/15">
              {vendor.map((claim) => <li key={claim.claim} className="py-3 text-sm leading-6 text-muted">{claim.claim}</li>)}
            </ul>
          </div>
        </div>
        <Link href="/claims" className="mt-7 inline-flex items-center gap-1.5 border-b border-ink/25 pb-1 text-sm font-medium text-ink hover:border-accent hover:text-accent">
          Open the full claims ledger <UiIcon name="arrow-right" size={13} />
        </Link>
      </section>

      <section className="py-12">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Where to go next</h2>
        <div className="mt-7 grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-4">
          {NEXT_STEPS.map(({ href, title, note }) => (
            <Link key={href} href={href} className="grid gap-2 bg-paper p-5 transition-colors hover:bg-shell/70">
              <span className="text-sm font-semibold text-ink">{title}</span>
              <span className="text-xs leading-5 text-muted">{note}</span>
            </Link>
          ))}
        </div>
      </section>

      {overview ? (
        <section className="border-t border-ink/15 py-8">
          <h2 className="font-mono text-[9px] uppercase tracking-[0.15em] text-accent">Official sources</h2>
          <ul className="mt-4 grid gap-2">
            {overview.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-ink hover:text-accent">
                  <span className="break-all underline decoration-ink/25 underline-offset-2">{source.url}</span>
                  <UiIcon name="arrow-out" size={11} />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-5 max-w-[68ch] text-xs leading-5 text-muted">
            TypeSafe’s documentation is the authority on the current API contract. This page explains where Jev fits; it does not restate the API.
          </p>
        </section>
      ) : null}
    </div>
  );
}
