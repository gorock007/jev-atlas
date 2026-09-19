import Link from "next/link";
import {
  BeforeAfter,
  BoundaryPicture,
  ConfidenceDiagram,
  ParallelQuestionsDiagram,
  RebuiltOptionsDiagram,
  ShortlistFunnelDiagram,
} from "@/components/guide-diagrams";
import { UiIcon } from "@/components/ui-icon";

export const metadata = {
  title: "Ask Jev well",
  description:
    "Seven practical techniques for asking a typed judgment model good questions: rebuild the options, ask independent questions together, put the requirement in the text, pass evidence rather than summaries, measure what confidence is worth, narrow long lists in stages, and verify outcomes in code.",
};
export const dynamic = "force-static";

interface Source {
  label: string;
  href: string;
  external?: boolean;
}

const JEV_ULTRAFAST = "https://github.com/browser-use/jev-ultrafast";

function SourceLinks({ sources }: { sources: Source[] }) {
  return (
    <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
      {sources.map((source) =>
        source.external ? (
          <li key={source.href}>
            <a href={source.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink hover:text-accent">
              {source.label} <UiIcon name="arrow-out" size={11} />
            </a>
          </li>
        ) : (
          <li key={source.href}>
            <Link href={source.href} className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-ink hover:text-accent">
              {source.label} <UiIcon name="arrow-right" size={11} />
            </Link>
          </li>
        ),
      )}
    </ul>
  );
}

function Technique({ index, heading, children }: { index: number; heading: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-ink/15 py-12">
      <div className="grid gap-x-10 gap-y-6 lg:grid-cols-[4rem_1fr]">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">{String(index).padStart(2, "0")}</p>
        <div>
          <h2 className="max-w-[26ch] font-serif text-2xl leading-tight tracking-[-0.035em] text-ink sm:text-3xl">{heading}</h2>
          {children}
        </div>
      </div>
    </section>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return <div className="mt-5 grid max-w-[68ch] gap-4 text-sm leading-7 text-muted">{children}</div>;
}

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-[1100px] px-5 py-10 sm:px-10 sm:py-14 lg:py-18">
      <header className="border-b border-ink/15 pb-10">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">Practice</p>
        <h1 className="mt-5 max-w-[14ch] text-4xl font-semibold leading-none tracking-[-0.055em] text-ink sm:text-5xl lg:text-6xl">Ask Jev well.</h1>
        <p className="mt-6 max-w-[64ch] text-base leading-7 text-muted">
          A typed answer arrives in the right shape whether or not the question deserved it. These seven techniques are about the part the type system cannot check: what you put in the question, what you leave in your own code, and what you check afterwards.
        </p>
        <p className="mt-5 max-w-[64ch] text-xs leading-5 text-muted">
          Written here in our own words, with the source for each one listed underneath. TypeSafe&rsquo;s documentation is the authority on the current API; this page is about how to use it well.
        </p>
      </header>

      <Technique index={1} heading="Rebuild the option list from the current state at every step.">
        <Body>
          <p>
            An option list is a snapshot. Build it once at the start of a multi-step run and it starts drifting away from reality immediately — the row got archived, the button moved, the ticket was closed by someone else. The answer will still be well-typed, and it will still name something that is no longer there.
          </p>
          <p>
            Browser Use&rsquo;s jev-ultrafast regenerates the list of page controls before every decision, so the model only ever picks among things that exist right now. Regenerating costs you one cheap step and removes a whole class of failure that is otherwise very hard to see in a log.
          </p>
        </Body>
        <RebuiltOptionsDiagram />
        <SourceLinks sources={[{ label: "Browser Use · jev-ultrafast", href: JEV_ULTRAFAST, external: true }, { label: "Case study in this atlas", href: "/projects/jev-ultrafast" }]} />
      </Technique>

      <Technique index={2} heading="Send independent questions together; fetch first, then ask.">
        <Body>
          <p>
            Questions asked in one batch cannot read each other&rsquo;s answers. That is the whole rule, and most of the mistakes come from forgetting it: a second question written as though the first one already answered it simply gets no answer to work from.
          </p>
          <p>
            So split the work in two. Anything one question needs from another is a lookup, and lookups belong in your code, before the batch. What is left is genuinely independent, and all of it goes in a single round trip instead of a chain of them.
          </p>
        </Body>
        <ParallelQuestionsDiagram />
        <SourceLinks sources={[{ label: "TypeSafe docs · Parallel questions", href: "https://docs.typesafe.ai/cookbooks/parallel_questions", external: true }, { label: "Parallel decision matrix", href: "/patterns/parallel-decision-matrix" }]} />
      </Technique>

      <Technique index={3} heading="Put the real requirement in the question, and describe every option.">
        <Body>
          <p>
            The model reads what you wrote. It does not read the variable holding the option, the enum it came from, or the comment above the function. An option called <code className="font-mono text-[0.85em] text-ink">tier_2</code> carries no meaning at all; &ldquo;needs a specialist, not the general queue&rdquo; carries the meaning you actually had in mind.
          </p>
          <p>
            The same is true of the question itself. Whatever rule a trained person would apply — the deadline, the exception, the thing that makes this a borderline case — belongs in the sentence. If you find yourself explaining the answer afterwards, that explanation was the question.
          </p>
        </Body>
        <BeforeAfter
          before={{
            code: 'question: "classify"\noptions: ["tier_1", "tier_2", "tier_3"]',
            note: "Three identifiers and a verb. Nothing here says what separates one tier from the next, so the answer is a guess dressed as a category.",
          }}
          after={{
            code: 'question: "Who should handle this? Anything\nabout billing goes to accounts even if it\nalso mentions a bug."\noptions: [\n  "front line — answerable from the help centre",\n  "specialist — needs someone who knows the product",\n  "accounts — anything touching money or invoices",\n]',
            note: "The requirement and the tie-break are in the text, and each option says what it means. The same words are what you would give a new colleague.",
          }}
        />
        <SourceLinks sources={[{ label: "TypeSafe docs · Choice", href: "https://docs.typesafe.ai/primitives/choice", external: true }]} />
      </Technique>

      <Technique index={4} heading="Give evidence, not summaries.">
        <Body>
          <p>
            When you compress the state into one tidy paragraph before asking, you have already made the judgment — in code that nobody reviews and no test covers. Whatever your summariser dropped is now invisible to the decision that depends on it.
          </p>
          <p>
            Pass the pieces instead, as separate fields: what you found, where each piece came from, and what you looked for and did not find. The gaps matter as much as the findings, and they are the first thing a summary throws away. It also makes a wrong answer readable afterwards, because you can see exactly what the question was holding.
          </p>
        </Body>
        <BeforeAfter
          before={{
            code: 'state: {\n  summary: "Customer seems frustrated about\n    a late delivery and wants a refund.",\n}',
            note: "One sentence, already interpreted. Whether the order was actually late, and whether anyone checked, has been quietly decided upstream.",
          }}
          after={{
            code: 'state: {\n  message: "<the text, as received>",\n  orderStatus: "shipped 9 days ago, not delivered",\n  refundPolicy: "30 days, unused items",\n  priorContacts: 2,\n  notFound: ["delivery scan after leaving depot"],\n}',
            note: "Findings, their sources, and the gap all travel separately. The question can weigh them; nothing has been decided on the way in.",
          }}
        />
        <SourceLinks sources={[{ label: "Decision sidecar pattern", href: "/patterns/decision-sidecar" }, { label: "Probabilistic predicate + deterministic action", href: "/patterns/probabilistic-predicate-deterministic-action" }]} />
      </Technique>

      <Technique index={5} heading="Confidence is not accuracy; set the threshold from your own examples.">
        <Body>
          <p>
            A confidence of 0.9 is the model&rsquo;s own report about its answer. It is not a measured hit rate, and it does not mean nine out of ten answers at that level were right on your data. Picking 0.9 as a review threshold because it looks high is guessing with a decimal point in it.
          </p>
          <p>
            Label a few hundred of your own examples, bucket the answers by reported confidence, and look at how often each bucket was actually right. That table tells you where to draw the line for the cost you are willing to carry. Redraw it when the traffic changes, because the curve moves with your inputs, not with the model.
          </p>
        </Body>
        <ConfidenceDiagram />
        <SourceLinks sources={[{ label: "TypeSafe docs · Confidence", href: "https://docs.typesafe.ai/confidence", external: true }, { label: "Confidence gate pattern", href: "/patterns/confidence-gate" }]} />
      </Technique>

      <Technique index={6} heading="For big candidate lists: filter in code, Score the rest, Choice over a shortlist.">
        <Body>
          <p>
            A Choice holds up to 255 options. That is generous, and still far smaller than most real catalogues, inventories, or user lists. The answer is not a bigger question — it is three smaller stages.
          </p>
          <p>
            Cut the list with the constraints you can state exactly: availability, region, permissions, anything a <code className="font-mono text-[0.85em] text-ink">WHERE</code> clause already knows. Rank what survives with a Score. Then put the handful at the top into a Choice for the judgment that genuinely needs one. Each stage is cheaper than one enormous question and, more usefully, each can be tested on its own.
          </p>
        </Body>
        <ShortlistFunnelDiagram />
        <SourceLinks sources={[{ label: "TypeSafe docs · Choice", href: "https://docs.typesafe.ai/primitives/choice", external: true }, { label: "Cascade router pattern", href: "/patterns/cascade-router" }]} />
      </Technique>

      <Technique index={7} heading="A confident answer never proves the action happened.">
        <Body>
          <p>
            Deciding to click the button and the button having been clicked are two different facts, and only one of them is in the answer. Confidence describes the judgment, never the side effect that followed it.
          </p>
          <p>
            jev-ultrafast checks its outcome separately, after the run reports that it is done. Do the same with anything that can spend money, send something, or delete something: verify the result against the world, not against the decision. And keep the guardrails where they can be read and tested — how many attempts are allowed, how much may be spent, and where the run got to — in your code, not in the question.
          </p>
        </Body>
        <BeforeAfter
          beforeLabel="Not a check"
          afterLabel="A check"
          before={{
            code: 'if (decision.confidence > 0.95) {\n  await refund(order)\n  markComplete(order)\n}',
            note: "The confidence is about the judgment. Nothing here observes whether the refund actually went through, and the run is marked complete either way.",
          }}
          after={{
            code: 'if (decision.confidence > threshold\n    && spend.remaining() >= order.total\n    && attempts.allow(order.id)) {\n  await refund(order)\n}\nconst seen = await readRefundStatus(order.id)\nif (seen !== "settled") escalate(order, seen)',
            note: "The limits are ordinary code, and the outcome is read back from the system that owns it. The decision opens the door; it does not report what came through it.",
          }}
        />
        <SourceLinks sources={[{ label: "Browser Use · jev-ultrafast", href: JEV_ULTRAFAST, external: true }, { label: "Probabilistic predicate + deterministic action", href: "/patterns/probabilistic-predicate-deterministic-action" }]} />
      </Technique>

      <section className="border-b border-ink/15 py-12">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">Where each decision lives</h2>
        <p className="mt-5 max-w-[68ch] text-sm leading-7 text-muted">
          Every technique above is really one question asked again: which of these three columns does this belong in? Getting the split right is most of the work, and it is the part you can check without running anything.
        </p>
        <BoundaryPicture />
        <div className="mt-8 grid gap-px bg-ink/10 sm:grid-cols-2">
          <Link href="/fit" className="grid gap-2 bg-paper p-5 transition-colors hover:bg-shell/70">
            <span className="text-sm font-semibold text-ink">Fit check</span>
            <span className="text-xs leading-5 text-muted">Paste your workflow and get the split above drawn for it, decision by decision.</span>
          </Link>
          <Link href="/map" className="grid gap-2 bg-paper p-5 transition-colors hover:bg-shell/70">
            <span className="text-sm font-semibold text-ink">Opportunity map</span>
            <span className="text-xs leading-5 text-muted">The design space, grouped by the property that makes a typed judgment worth calling.</span>
          </Link>
        </div>
      </section>

      <section className="py-12">
        <h2 className="font-mono text-[9px] uppercase tracking-[0.15em] text-accent">Sources</h2>
        <ul className="mt-4 grid gap-2">
          {[
            JEV_ULTRAFAST,
            "https://docs.typesafe.ai/cookbooks/parallel_questions",
            "https://docs.typesafe.ai/primitives/choice",
            "https://docs.typesafe.ai/confidence",
          ].map((url) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs text-ink hover:text-accent">
                <span className="break-all underline decoration-ink/25 underline-offset-2">{url}</span>
                <UiIcon name="arrow-out" size={11} />
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-5 max-w-[68ch] text-xs leading-5 text-muted">
          This atlas is independent and not affiliated with TypeSafe. Where a technique comes from someone&rsquo;s published work, that work is linked above rather than restated here.
        </p>
        <Link href="/cost" className="mt-7 inline-flex items-center gap-1.5 border-b border-ink/25 pb-1 text-sm font-medium text-ink hover:border-accent hover:text-accent">
          What a stream of these decisions would cost <UiIcon name="arrow-right" size={13} />
        </Link>
      </section>
    </div>
  );
}
