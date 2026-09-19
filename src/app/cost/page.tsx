import Link from "next/link";
import { DecisionCostCalculator } from "@/components/decision-cost-calculator";
import { UiIcon } from "@/components/ui-icon";
import { collectionPath } from "@/knowledge/paths";
import { atlasRecords } from "@/lib/atlas";
import { VENDOR_INPUT_PRICE_PER_M } from "@/lib/decision-cost";

export const metadata = {
  title: "What would the decisions cost?",
  description:
    "A plain calculator for a stream of typed decisions: volume, input tokens, and price per million, against what one decision costs you today. The input price is a vendor claim, and every number is editable.",
};
export const dynamic = "force-static";

const NEXT_STEPS = [
  { href: "/fit", title: "Fit check", note: "Whether there are bounded decisions in your workflow at all." },
  { href: "/guide", title: "Ask Jev well", note: "Seven techniques, including the ones that shrink the token count." },
  { href: "/claims", title: "Claims ledger", note: "What is demonstrated, what is only stated, and by whom." },
];

const READ_IT_WITH = [
  {
    heading: "The price is a vendor claim",
    note: "TypeSafe publishes a low input-token price and no metered output charge. Nobody here has verified an invoice against it, and a published list price is not the price you are quoted. Edit the field.",
  },
  {
    heading: "Token counts are yours to measure",
    note: "The default of 800 input tokens is a placeholder. Your real number depends on how much state you send, how long the option list is, and how much evidence rides along with the question. Measure it on your own traffic.",
  },
  {
    heading: "Volume is the variable that moves",
    note: "Cheap calls change what is worth judging, not just what an existing judgment costs. The interesting question is usually how many things you would start deciding, not how much the current ones get cheaper.",
  },
  {
    heading: "Latency and accuracy are not priced here",
    note: "This page multiplies four numbers. It says nothing about how fast an answer comes back, how often it is right, or what a wrong one costs downstream.",
  },
];

export default async function CostPage() {
  const records = await atlasRecords();
  const pricingClaim = records.find((record) => record.kind === "claim" && /input-token price|token charge/iu.test(record.title));

  return (
    <div className="mx-auto max-w-[1100px] px-5 py-10 sm:px-10 sm:py-14 lg:py-18">
      <header className="border-b border-ink/15 pb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Decision cost</p>
        <h1 className="mt-5 max-w-[16ch] text-4xl font-semibold leading-none tracking-[-0.055em] text-ink sm:text-5xl lg:text-6xl">What would the decisions cost?</h1>
        <p className="mt-6 max-w-[64ch] text-base leading-7 text-muted">
          The argument for a cheap judgment layer is an arithmetic one: at ${VENDOR_INPUT_PRICE_PER_M} per million input tokens, judging every item in a stream stops being a budget question. This works that arithmetic out with your numbers, so you can see the size of it rather than take it on faith.
        </p>
        <p className="mt-5 max-w-[64ch] text-xs leading-5 text-muted">
          Four inputs, all editable, all multiplied in the browser. Nothing is sent anywhere and nothing is stored.
        </p>
      </header>

      <section className="border-b border-ink/15 py-10" aria-label="Decision cost calculator">
        <DecisionCostCalculator claimHref={pricingClaim?.canonicalPath ?? collectionPath("claim")} />
      </section>

      <section className="border-b border-ink/15 py-12">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">How to read the number</h2>
        <div className="mt-7 grid gap-px bg-ink/10 sm:grid-cols-2">
          {READ_IT_WITH.map(({ heading, note }) => (
            <div key={heading} className="grid gap-2 bg-paper p-5">
              <h3 className="font-serif text-xl leading-tight tracking-[-0.02em] text-ink">{heading}</h3>
              <p className="text-sm leading-6 text-muted">{note}</p>
            </div>
          ))}
        </div>
        {pricingClaim ? (
          <Link href={pricingClaim.canonicalPath} className="mt-7 inline-flex items-center gap-1.5 border-b border-ink/25 pb-1 text-sm font-medium text-ink hover:border-accent hover:text-accent">
            Read the pricing claim and its caveats <UiIcon name="arrow-right" size={13} />
          </Link>
        ) : null}
      </section>

      <section className="py-12">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Where to go next</h2>
        <div className="mt-7 grid gap-px bg-ink/10 sm:grid-cols-3">
          {NEXT_STEPS.map(({ href, title, note }) => (
            <Link key={href} href={href} className="grid gap-2 bg-paper p-5 transition-colors hover:bg-shell/70">
              <span className="text-sm font-semibold text-ink">{title}</span>
              <span className="text-xs leading-5 text-muted">{note}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
