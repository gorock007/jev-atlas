"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { StatusChip } from "@/components/record-chrome";
import { UiIcon } from "@/components/ui-icon";
import {
  compareDecisionCost,
  DAYS_PER_MONTH,
  DECISION_BATCH,
  formatCount,
  formatRatio,
  formatUsd,
  INPUT_LIMITS,
  parseAmount,
  VENDOR_INPUT_PRICE_PER_M,
  VENDOR_PRICE_SOURCE_URL,
} from "@/lib/decision-cost";
import styles from "./decision-cost-calculator.module.css";

/** Starting values: a mid-sized stream of small decisions, priced against a typical LLM call. */
const DEFAULTS = {
  decisionsPerDay: "50000",
  inputTokensPerDecision: "800",
  price: String(VENDOR_INPUT_PRICE_PER_M),
  current: "0.0012",
};

/** Bar geometry in the SVG's own units; the viewBox scales it to the column. */
const BAR = { left: 120, width: 356, height: 16, rows: [26, 58] } as const;

function Bar({ y, label, share, value, className }: { y: number; label: string; share: number; value: string; className: string | undefined }) {
  const width = share > 0 ? Math.max(BAR.width * share, 2) : 0;
  return (
    <g>
      <text x="0" y={y + 12} className={styles.chartLabel}>{label}</text>
      <rect x={BAR.left} y={y} width={BAR.width} height={BAR.height} className={styles.barTrack} />
      {width > 0 ? <rect x={BAR.left} y={y} width={width} height={BAR.height} className={className} /> : null}
      <text x={BAR.left + BAR.width} y={y - 5} textAnchor="end" className={styles.chartValue}>{value}</text>
    </g>
  );
}

export function DecisionCostCalculator({ claimHref }: { claimHref: string }) {
  const ids = useId();
  const [decisionsPerDay, setDecisionsPerDay] = useState(DEFAULTS.decisionsPerDay);
  const [tokens, setTokens] = useState(DEFAULTS.inputTokensPerDecision);
  const [price, setPrice] = useState(DEFAULTS.price);
  const [current, setCurrent] = useState(DEFAULTS.current);

  const result = useMemo(
    () =>
      compareDecisionCost({
        decisionsPerDay: parseAmount(decisionsPerDay, INPUT_LIMITS.decisionsPerDay),
        inputTokensPerDecision: parseAmount(tokens, INPUT_LIMITS.inputTokensPerDecision),
        pricePerMillionInputTokens: parseAmount(price, INPUT_LIMITS.pricePerMillionInputTokens),
        currentCostPerDecision: parseAmount(current, INPUT_LIMITS.currentCostPerDecision),
      }),
    [decisionsPerDay, tokens, price, current],
  );

  const volume = formatCount(parseAmount(decisionsPerDay, INPUT_LIMITS.decisionsPerDay));
  const ratio = formatRatio(result.ratio);
  const priceIsVendorDefault = parseAmount(price, INPUT_LIMITS.pricePerMillionInputTokens) === VENDOR_INPUT_PRICE_PER_M;

  return (
    <div>
      <div className={styles.fields}>
        <div className={styles.field}>
          <label htmlFor={`${ids}-volume`}>Decisions per day</label>
          <input
            id={`${ids}-volume`}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={decisionsPerDay}
            onChange={(event) => setDecisionsPerDay(event.target.value)}
          />
          <p>How many times a day this judgment gets made — every item in the stream, not just the ones a person sees today.</p>
        </div>

        <div className={styles.field}>
          <label htmlFor={`${ids}-tokens`}>Input tokens per decision</label>
          <input
            id={`${ids}-tokens`}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            value={tokens}
            onChange={(event) => setTokens(event.target.value)}
          />
          <p>The state you send with the question: the text, the option list, and any evidence fields. Output is not metered, so only the input side is counted here.</p>
        </div>

        <div className={styles.field}>
          <label htmlFor={`${ids}-price`}>Price per million input tokens (USD)</label>
          <div className={styles.prefix}>
            <span aria-hidden="true">$</span>
            <input
              id={`${ids}-price`}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
          <div className={styles.vendorRow}>
            <StatusChip status="Vendor Claim" />
            {priceIsVendorDefault ? null : (
              <button type="button" className={styles.reset} onClick={() => setPrice(DEFAULTS.price)}>
                Reset to ${VENDOR_INPUT_PRICE_PER_M}
              </button>
            )}
          </div>
          <p>
            ${VENDOR_INPUT_PRICE_PER_M} per million input tokens is a price TypeSafe publishes, not a bill anyone here has paid. Edit it to whatever you are actually quoted.{" "}
            <Link href={claimHref}>See the claim</Link> ·{" "}
            <a href={VENDOR_PRICE_SOURCE_URL} target="_blank" rel="noreferrer">listing</a>
          </p>
        </div>

        <div className={styles.field}>
          <label htmlFor={`${ids}-current`}>Your current cost per decision (USD)</label>
          <div className={styles.prefix}>
            <span aria-hidden="true">$</span>
            <input
              id={`${ids}-current`}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={current}
              onChange={(event) => setCurrent(event.target.value)}
            />
          </div>
          <p>Whatever one decision costs you today — a generative model call, a rules engine, or a person&rsquo;s minute priced as money. Leave it at zero to skip the comparison.</p>
        </div>
      </div>

      <div className={styles.outputs}>
        <div className={styles.output}>
          <span>Per day</span>
          <strong>{formatUsd(result.priced.perDay)}</strong>
          <em>{volume} decisions</em>
        </div>
        <div className={styles.output}>
          <span>Per month</span>
          <strong>{formatUsd(result.priced.perMonth)}</strong>
          <em>{DAYS_PER_MONTH} days at that volume</em>
        </div>
        <div className={styles.output}>
          <span>Per {formatCount(DECISION_BATCH)} decisions</span>
          <strong>{formatUsd(result.priced.perBatch)}</strong>
          <em>{formatUsd(result.priced.perDecision)} each</em>
        </div>
      </div>

      <div className={styles.chart}>
        <svg
          viewBox="0 0 476 90"
          role="img"
          aria-label={`Cost of one decision: ${formatUsd(result.priced.perDecision)} at the price entered, against ${formatUsd(result.current.perDecision)} for the current route.`}
        >
          <Bar y={BAR.rows[0]} label="At this price" share={result.share.priced} value={formatUsd(result.priced.perDecision)} className={styles.barPriced} />
          <Bar y={BAR.rows[1]} label="Today" share={result.share.current} value={formatUsd(result.current.perDecision)} className={styles.barCurrent} />
          <path d={`M${BAR.left} 20V88`} className={styles.baseline} />
        </svg>
        <p className={styles.verdict}>
          {ratio && result.ratio !== null && result.ratio > 1 ? (
            <>
              One decision at today&rsquo;s route pays for <b>{ratio}</b> decisions at the price entered — {formatUsd(result.current.perDay - result.priced.perDay)} a day of difference at {volume} decisions.
            </>
          ) : ratio && result.ratio !== null && result.ratio < 1 ? (
            <>
              Today&rsquo;s route is the cheaper of the two here, by <b>{formatRatio(1 / result.ratio)}</b> per decision.
            </>
          ) : ratio ? (
            <>Both sides cost the same per decision at these numbers.</>
          ) : (
            <>Enter a current cost per decision to compare the two.</>
          )}
        </p>
      </div>

      <p className={styles.caveat}>
        Track cost per <b>completed task</b>, not cost per call. A cheap wrong decision can cost far more than the call that made it — in retries, in the work downstream of it, and in whatever it took to notice.
      </p>

      <p className="mt-6 text-xs leading-5 text-muted">
        Arithmetic only. Nothing is sent anywhere, and nothing here measures how many tokens your questions would actually need, or how often the answers would be right.
      </p>

      <Link href="/guide" className="mt-6 inline-flex items-center gap-1.5 border-b border-ink/25 pb-1 text-sm font-medium text-ink hover:border-accent hover:text-accent">
        How to keep the token count down <UiIcon name="arrow-right" size={13} />
      </Link>
    </div>
  );
}
