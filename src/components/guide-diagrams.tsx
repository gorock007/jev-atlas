import styles from "./guide-diagrams.module.css";

/**
 * The small pictures on `/guide`. Each one draws the shape of a technique, not
 * a measurement: every number inside them is illustrative. SVG geometry is set
 * with presentation attributes and colours with CSS module classes, because the
 * site's CSP forbids inline styles.
 */

function Figure({ caption, children }: { caption: string; children: React.ReactNode }) {
  return (
    <figure className={styles.figure}>
      {children}
      <figcaption>{caption}</figcaption>
    </figure>
  );
}

/** A stack of bars standing in for an option list. */
function OptionStack({ x, y, widths, className }: { x: number; y: number; widths: number[]; className: string | undefined }) {
  return (
    <g>
      {widths.map((width, index) => (
        <rect key={index} x={x} y={y + index * 12} width={width} height="8" className={className} />
      ))}
    </g>
  );
}

const STEP_X = [120, 220, 320] as const;

/** 1 · An option list built once goes stale; one rebuilt each step cannot. */
export function RebuiltOptionsDiagram() {
  return (
    <Figure caption="Illustrative. The list on top was built before the first step and reused; the list below is regenerated from the current state each time, so it can never name something that has gone.">
      <svg viewBox="0 0 400 176" role="img" aria-label="Two lanes. In the top lane one option list is built at step one and carried to steps two and three, where it is crossed out as stale. In the bottom lane a fresh list is built at every step.">
        <text x="0" y="12" className={styles.lane}>Built once</text>
        {STEP_X.map((x, index) => (
          <g key={x}>
            <OptionStack x={x} y={22} widths={[62, 48, 56]} className={index === 0 ? styles.ink : styles.faint} />
            {index > 0 ? (
              <>
                <path d={`M${x + 4} 24L${x + 58} 52`} className={styles.cross} />
                <path d={`M${x + 58} 24L${x + 4} 52`} className={styles.cross} />
              </>
            ) : null}
            {index > 0 ? <path d={`M${x - 30} 38H${x - 6}`} className={styles.dashed} /> : null}
          </g>
        ))}
        <text x="0" y="46" className={styles.value}>stale</text>

        <path d="M0 78H400" className={styles.rule} />

        <text x="0" y="100" className={styles.lane}>Rebuilt each</text>
        <text x="0" y="112" className={styles.lane}>step</text>
        <OptionStack x={STEP_X[0]} y={116} widths={[62, 48, 56]} className={styles.ink} />
        <OptionStack x={STEP_X[1]} y={116} widths={[44, 62, 38]} className={styles.ink} />
        <OptionStack x={STEP_X[2]} y={116} widths={[56, 30, 62]} className={styles.accent} />

        {STEP_X.map((x, index) => (
          <text key={x} x={x} y="170" className={styles.tick}>step {index + 1}</text>
        ))}
      </svg>
    </Figure>
  );
}

/** 2 · Questions in one batch cannot read each other, so the lookup happens first. */
export function ParallelQuestionsDiagram() {
  return (
    <Figure caption="Illustrative. Chaining three questions because the second needs the first costs three round trips. Fetching what they share in your own code first lets all three go in one.">
      <svg viewBox="0 0 400 180" role="img" aria-label="Above, three questions in a chain, each waiting for the previous answer, labelled three round trips. Below, one lookup in your code followed by three questions asked together, labelled one round trip.">
        <text x="0" y="12" className={styles.lane}>Chained</text>
        {[0, 112, 224].map((x, index) => (
          <g key={x}>
            <rect x={x} y="24" width="88" height="26" className={styles.outline} />
            <text x={x + 44} y="41" textAnchor="middle" className={styles.value}>question {index + 1}</text>
            {index < 2 ? <path d={`M${x + 88} 37H${x + 108}`} className={styles.rule} /> : null}
          </g>
        ))}
        <text x="400" y="41" textAnchor="end" className={styles.strong}>3 trips</text>

        <path d="M0 74H400" className={styles.rule} />

        <text x="0" y="96" className={styles.lane}>Fetch, then ask together</text>
        <rect x="0" y="118" width="88" height="26" className={styles.outline} />
        <text x="44" y="135" textAnchor="middle" className={styles.value}>lookup</text>
        <path d="M88 131H108" className={styles.rule} />
        <path d="M112 102V162" className={styles.marker} />
        {[104, 124, 144].map((y, index) => (
          <g key={y}>
            <rect x="120" y={y} width="88" height="16" className={styles.outline} />
            <text x="164" y={y + 11} textAnchor="middle" className={styles.value}>question {index + 1}</text>
          </g>
        ))}
        <text x="400" y="135" textAnchor="end" className={styles.strong}>1 trip</text>
      </svg>
    </Figure>
  );
}

/** 5 · Reported confidence against accuracy measured on your own labelled examples. */
export function ConfidenceDiagram() {
  return (
    <Figure caption="Illustrative. The dashed line is what it would mean for confidence to equal accuracy. The solid line is the sort of thing you find when you actually measure — which is why the threshold is read off your own curve, not chosen because it looks high.">
      <svg viewBox="0 0 400 178" role="img" aria-label="A plot of accuracy measured on labelled examples against reported confidence. The measured curve sits below the dashed line where confidence would equal accuracy, and a marked threshold is read off the measured curve.">
        <text x="0" y="12" className={styles.lane}>Accuracy you measured</text>
        <path d="M46 20V132H380" className={styles.rule} />
        <path d="M46 132L370 24" className={styles.dashed} />
        <path d="M46 132C110 126 170 112 210 98C260 80 330 54 370 42" className={styles.curve} />

        <path d="M290 132V64" className={styles.marker} />
        <circle cx="290" cy="64" r="4" className={styles.accent} />
        <text x="298" y="112" className={styles.strong}>threshold</text>

        <text x="40" y="136" textAnchor="end" className={styles.tick}>0%</text>
        <text x="40" y="28" textAnchor="end" className={styles.tick}>100%</text>
        <text x="46" y="148" className={styles.tick}>0.0</text>
        <text x="370" y="148" textAnchor="end" className={styles.tick}>1.0</text>
        <text x="200" y="166" textAnchor="middle" className={styles.value}>confidence the model reported</text>
      </svg>
    </Figure>
  );
}

/** 6 · A long candidate list narrowed in stages instead of in one enormous question. */
export function ShortlistFunnelDiagram() {
  return (
    <Figure caption="Illustrative counts. Each stage is cheaper than the one above it and can be tested on its own: the filter against your rules, the ranking against a held-out set, the final judgment against labelled examples.">
      <svg viewBox="0 0 400 172" role="img" aria-label="Four thousand candidates narrowed by a filter in code to one hundred and eighty, ranked by Score down to twelve, and handed to a Choice over that shortlist.">
        <text x="0" y="34" className={styles.lane}>candidates</text>
        <rect x="120" y="20" width="200" height="20" className={styles.faint} />
        <text x="328" y="34" className={styles.value}>4,000</text>

        <text x="120" y="56" className={styles.strong}>filter in code</text>

        <text x="0" y="80" className={styles.lane}>survivors</text>
        <rect x="120" y="66" width="120" height="20" className={styles.ink} />
        <text x="248" y="80" className={styles.value}>180</text>

        <text x="120" y="108" className={styles.strong}>Score</text>

        <text x="0" y="132" className={styles.lane}>shortlist</text>
        <rect x="120" y="118" width="34" height="20" className={styles.accent} />
        <text x="162" y="132" className={styles.value}>12</text>

        <text x="120" y="160" className={styles.strong}>Choice · up to 255 options</text>
      </svg>
    </Figure>
  );
}

export interface BeforeAfterSide {
  code: string;
  note: string;
}

/** A two-panel contrast for the techniques where the fix is a way of writing, not a shape. */
export function BeforeAfter({ before, after, beforeLabel = "Weaker", afterLabel = "Better" }: { before: BeforeAfterSide; after: BeforeAfterSide; beforeLabel?: string; afterLabel?: string }) {
  return (
    <div className={styles.pair}>
      <div className={styles.before}>
        <h4>{beforeLabel}</h4>
        <code>{before.code}</code>
        <p>{before.note}</p>
      </div>
      <div className={styles.after}>
        <h4>{afterLabel}</h4>
        <code>{after.code}</code>
        <p>{after.note}</p>
      </div>
    </div>
  );
}

const BOUNDARY = [
  {
    heading: "Stays in code",
    note: "Anything that has to be exact, repeatable, and reviewable.",
    items: ["Filters, joins, permissions, and arithmetic", "Retries, timeouts, and rate limits", "Spend caps and action budgets", "Saved progress, so a restart resumes", "Verifying that an action actually happened"],
    accent: false,
  },
  {
    heading: "Stays with an LLM",
    note: "Anything whose output is language a person will read.",
    items: ["Writing the reply, the summary, the diff", "Open-ended planning over many steps", "Filling in free text an interface needs", "Explaining a decision after it was made"],
    accent: false,
  },
  {
    heading: "Goes to Jev",
    note: "The narrow judgments in between, one question at a time.",
    items: ["Which of these options applies", "How far along a scale this sits", "How likely a yes-or-no statement is", "The same question asked over every item", "A gate your code thresholds and logs"],
    accent: true,
  },
];

/** The closing picture: the three places a decision can live, side by side. */
export function BoundaryPicture() {
  return (
    <div className={styles.boundary}>
      <div className={styles.boundaryGrid}>
        {BOUNDARY.map(({ heading, note, items, accent }) => (
          <div key={heading}>
            <h3>{heading}</h3>
            <p>{note}</p>
            <ul className={accent ? styles.jev : undefined}>
              {items.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <p className={styles.boundaryKey}>
        <span>The boundary is the point</span>
        <span>Each column is testable on its own</span>
      </p>
    </div>
  );
}
