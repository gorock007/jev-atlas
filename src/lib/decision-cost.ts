/**
 * Arithmetic behind `/cost`. Everything here is pure: no network, no clock, no
 * environment. The page is a calculator over numbers the reader types, so the
 * only defensible thing it can do is show the multiplication honestly.
 */

/**
 * TypeSafe's published input-token price for Jev, in US dollars per million
 * input tokens. This is a **Vendor Claim** — a price the vendor states, not a
 * bill anyone here has paid — and every interface that shows it says so.
 */
export const VENDOR_INPUT_PRICE_PER_M = 0.042;

/** Where the price above is published. */
export const VENDOR_PRICE_SOURCE_URL = "https://openrouter.ai/typesafe/jev-latest";

/** Days used to turn a daily figure into a monthly one. A flat month, stated rather than inferred. */
export const DAYS_PER_MONTH = 30;

/** The batch size the third output column reports. */
export const DECISION_BATCH = 10_000;

/** Ceilings that keep a typo from producing a meaningless headline number. */
export const INPUT_LIMITS = {
  decisionsPerDay: 100_000_000,
  inputTokensPerDecision: 2_000_000,
  pricePerMillionInputTokens: 1_000,
  currentCostPerDecision: 1_000,
} as const;

export interface DecisionCostInputs {
  /** How many decisions the workload makes in a day. */
  decisionsPerDay: number;
  /** Input tokens sent per decision. Output tokens are not metered for Jev. */
  inputTokensPerDecision: number;
  /** Price in US dollars per million input tokens. */
  pricePerMillionInputTokens: number;
  /** What one decision costs today, by whatever route it is made now. */
  currentCostPerDecision: number;
}

export interface DecisionCostBreakdown {
  perDecision: number;
  perDay: number;
  perMonth: number;
  perBatch: number;
}

export interface DecisionCostComparison {
  /** The cost implied by the token price and token count. */
  priced: DecisionCostBreakdown;
  /** The cost the reader says they pay today. */
  current: DecisionCostBreakdown;
  /** `current ÷ priced`, or null when either side is zero and the ratio has no meaning. */
  ratio: number | null;
  /** Each bar as a fraction of the longer one, so the comparison needs no axis. */
  share: { priced: number; current: number };
}

/**
 * Coerces anything an `<input>` can produce into a usable number. Blank text,
 * `NaN`, and negatives all become 0 rather than propagating into the output.
 */
export function clampInput(value: number, max: number): number {
  if (Number.isNaN(value) || value <= 0) return 0;
  return Math.min(value, max);
}

/** Parses the raw string an input field holds, without treating "" as 0.4 or similar. */
export function parseAmount(raw: string, max: number): number {
  const trimmed = raw.trim().replace(/,/gu, "");
  if (!trimmed) return 0;
  return clampInput(Number(trimmed), max);
}

/** Dollars for one decision, given its input tokens and the per-million price. */
export function costPerDecision(inputTokensPerDecision: number, pricePerMillionInputTokens: number): number {
  return (inputTokensPerDecision / 1_000_000) * pricePerMillionInputTokens;
}

/** Spreads one per-decision cost across a day, a month, and a fixed batch. */
export function breakdown(perDecision: number, decisionsPerDay: number): DecisionCostBreakdown {
  const perDay = perDecision * decisionsPerDay;
  return { perDecision, perDay, perMonth: perDay * DAYS_PER_MONTH, perBatch: perDecision * DECISION_BATCH };
}

/** The whole calculation, from four typed numbers to the two rows the page draws. */
export function compareDecisionCost(inputs: DecisionCostInputs): DecisionCostComparison {
  const decisionsPerDay = clampInput(inputs.decisionsPerDay, INPUT_LIMITS.decisionsPerDay);
  const tokens = clampInput(inputs.inputTokensPerDecision, INPUT_LIMITS.inputTokensPerDecision);
  const price = clampInput(inputs.pricePerMillionInputTokens, INPUT_LIMITS.pricePerMillionInputTokens);
  const currentPerDecision = clampInput(inputs.currentCostPerDecision, INPUT_LIMITS.currentCostPerDecision);

  const priced = breakdown(costPerDecision(tokens, price), decisionsPerDay);
  const current = breakdown(currentPerDecision, decisionsPerDay);
  const longest = Math.max(priced.perDecision, current.perDecision);

  return {
    priced,
    current,
    ratio: priced.perDecision > 0 && current.perDecision > 0 ? current.perDecision / priced.perDecision : null,
    share: longest > 0 ? { priced: priced.perDecision / longest, current: current.perDecision / longest } : { priced: 0, current: 0 },
  };
}

/** Groups an integer part with commas, deterministically and without a locale. */
function groupInteger(digits: string): string {
  return digits.replace(/\B(?=(\d{3})+(?!\d))/gu, ",");
}

/**
 * A dollar amount a reader can compare at a glance. Large numbers get two
 * decimals; small ones keep two significant digits instead of rounding a
 * fraction-of-a-cent price away to `$0.00`.
 */
export function formatUsd(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "$0.00";
  const decimals = value >= 1 ? 2 : value >= 0.01 ? 4 : Math.min(20, 1 - Math.floor(Math.log10(value)));
  const [whole = "0", fraction] = value.toFixed(decimals).split(".");
  return `$${groupInteger(whole)}${fraction ? `.${fraction}` : ""}`;
}

/** A plain count, grouped the same way as the money. */
export function formatCount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return "0";
  return groupInteger(Math.round(value).toString());
}

/** "18×" for a whole-ish multiple, "1.4×" when the detail matters. */
export function formatRatio(ratio: number | null): string | null {
  if (ratio === null || !Number.isFinite(ratio) || ratio <= 0) return null;
  return `${ratio >= 10 ? Math.round(ratio).toString() : ratio.toFixed(1)}×`;
}
