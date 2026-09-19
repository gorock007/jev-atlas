import styles from "./primitive-diagrams.module.css";

const CHOICE_OPTIONS = [
  { label: "billing", p: 0.07 },
  { label: "outage", p: 0.81 },
  { label: "sales", p: 0.04 },
  { label: "other", p: 0.08 },
];
const SCORE_VALUE = 7.4;
const NOUL_VALUE = 0.93;
const NOUL_THRESHOLD = 0.8;

function ChoiceDiagram() {
  return (
    <svg viewBox="0 0 260 132" role="img" aria-label="Example Choice: the question “which queue?” with four options. Outage is picked at 0.81.">
      <text x="0" y="12" className={styles.question}>Which queue?</text>
      {CHOICE_OPTIONS.map((option, index) => {
        const y = 28 + index * 26;
        const picked = option.p === Math.max(...CHOICE_OPTIONS.map((entry) => entry.p));
        return (
          <g key={option.label}>
            <rect x="0" y={y} width="12" height="12" className={picked ? styles.fill : styles.box} />
            <text x="22" y={y + 10} className={picked ? styles.strong : styles.text}>{option.label}</text>
            <rect x="92" y={y + 3} width="128" height="6" className={styles.track} />
            <rect x="92" y={y + 3} width={128 * option.p} height="6" className={picked ? styles.fill : styles.ink} />
            <text x="260" y={y + 10} textAnchor="end" className={styles.number}>{option.p.toFixed(2)}</text>
          </g>
        );
      })}
    </svg>
  );
}

function ScoreDiagram() {
  const x = 10 + (SCORE_VALUE / 10) * 240;
  return (
    <svg viewBox="0 0 260 132" role="img" aria-label={`Example Score: “how urgent?” placed at ${SCORE_VALUE} on a scale from 0 to 10.`}>
      <text x="0" y="12" className={styles.question}>How urgent?</text>
      <path d="M10 84H250" className={styles.axis} />
      {Array.from({ length: 11 }, (_, tick) => <path key={tick} d={`M${10 + tick * 24} ${tick % 5 === 0 ? 74 : 79}V84`} className={styles.axis} />)}
      <text x="10" y="104" textAnchor="middle" className={styles.number}>0</text>
      <text x="130" y="104" textAnchor="middle" className={styles.number}>5</text>
      <text x="250" y="104" textAnchor="middle" className={styles.number}>10</text>
      <path d={`M${x} 84V52`} className={styles.marker} />
      <circle cx={x} cy="84" r="4.5" className={styles.fill} />
      <text x={x} y="44" textAnchor="middle" className={styles.strong}>{SCORE_VALUE}</text>
    </svg>
  );
}

function NoulDiagram() {
  const threshold = 10 + NOUL_THRESHOLD * 240;
  return (
    <svg viewBox="0 0 260 132" role="img" aria-label={`Example Noul: “is this spam?” answered with a probability of ${NOUL_VALUE}, above a threshold your code set at ${NOUL_THRESHOLD}.`}>
      <text x="0" y="12" className={styles.question}>Is this spam?</text>
      <rect x="10" y="62" width="240" height="18" className={styles.box} />
      <rect x="10" y="62" width={240 * NOUL_VALUE} height="18" className={styles.fill} />
      <path d={`M${threshold} 52V90`} className={styles.threshold} />
      <text x={threshold} y="44" textAnchor="middle" className={styles.number}>your threshold</text>
      <text x="10" y="104" className={styles.number}>no</text>
      <text x="250" y="104" textAnchor="end" className={styles.number}>yes</text>
      <text x="130" y="104" textAnchor="middle" className={styles.strong}>{NOUL_VALUE}</text>
    </svg>
  );
}

const PRIMITIVES = [
  { name: "Choice", line: "Picks one option from a list you define, with a probability for each.", Diagram: ChoiceDiagram },
  { name: "Score", line: "Places something on an ordered scale you define.", Diagram: ScoreDiagram },
  { name: "Noul", line: "Gives the probability that a yes-or-no statement is true.", Diagram: NoulDiagram },
];

/** The three typed questions, each as one small picture. The values are illustrative. */
export function PrimitiveDiagrams() {
  return (
    <div className={styles.wrap}>
      <ul className={styles.grid}>
        {PRIMITIVES.map(({ name, line, Diagram }) => (
          <li key={name}>
            <Diagram />
            <h3>{name}</h3>
            <p>{line}</p>
          </li>
        ))}
      </ul>
      <p className={styles.note}>Example questions and values, drawn to show the shape of each answer. They are not measurements.</p>
    </div>
  );
}
