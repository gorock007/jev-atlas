import assert from "node:assert/strict";
import test from "node:test";
import {
  breakdown,
  clampInput,
  compareDecisionCost,
  costPerDecision,
  DAYS_PER_MONTH,
  DECISION_BATCH,
  formatCount,
  formatRatio,
  formatUsd,
  INPUT_LIMITS,
  parseAmount,
  VENDOR_INPUT_PRICE_PER_M,
} from "../src/lib/decision-cost.js";

const DEFAULTS = {
  decisionsPerDay: 50_000,
  inputTokensPerDecision: 800,
  pricePerMillionInputTokens: VENDOR_INPUT_PRICE_PER_M,
  currentCostPerDecision: 0.0012,
};

test("cost per decision is tokens over a million times the per-million price", () => {
  assert.equal(costPerDecision(1_000_000, 0.042), 0.042);
  assert.equal(costPerDecision(500_000, 0.042), 0.021);
  assert.equal(costPerDecision(0, 0.042), 0);
  assert.equal(costPerDecision(800, 0), 0);
  // 800 tokens at $0.042/M is 3.36e-5 dollars; floating point needs a tolerance.
  assert.ok(Math.abs(costPerDecision(800, VENDOR_INPUT_PRICE_PER_M) - 0.0000336) < 1e-12);
});

test("a breakdown spreads one per-decision cost over day, month, and batch", () => {
  const result = breakdown(0.002, 1_000);
  assert.equal(result.perDecision, 0.002);
  assert.equal(result.perDay, 2);
  assert.equal(result.perMonth, 2 * DAYS_PER_MONTH);
  assert.equal(result.perBatch, 0.002 * DECISION_BATCH);
});

test("the comparison prices both sides off the same decision volume", () => {
  const result = compareDecisionCost(DEFAULTS);
  assert.ok(Math.abs(result.priced.perDecision - 0.0000336) < 1e-12);
  assert.ok(Math.abs(result.priced.perDay - 1.68) < 1e-9);
  assert.ok(Math.abs(result.priced.perMonth - 50.4) < 1e-9);
  assert.ok(Math.abs(result.priced.perBatch - 0.336) < 1e-9);
  assert.equal(result.current.perDecision, 0.0012);
  assert.ok(Math.abs(result.current.perDay - 60) < 1e-9);
});

test("the ratio is how many priced decisions fit in one current decision", () => {
  const result = compareDecisionCost({ ...DEFAULTS, inputTokensPerDecision: 1_000_000, pricePerMillionInputTokens: 1, currentCostPerDecision: 4 });
  assert.equal(result.ratio, 4);
  assert.deepEqual(result.share, { priced: 0.25, current: 1 });
});

test("a missing side leaves the ratio undefined rather than infinite", () => {
  assert.equal(compareDecisionCost({ ...DEFAULTS, currentCostPerDecision: 0 }).ratio, null);
  assert.equal(compareDecisionCost({ ...DEFAULTS, inputTokensPerDecision: 0 }).ratio, null);
  const empty = compareDecisionCost({ decisionsPerDay: 0, inputTokensPerDecision: 0, pricePerMillionInputTokens: 0, currentCostPerDecision: 0 });
  assert.deepEqual(empty.share, { priced: 0, current: 0 });
  assert.equal(empty.priced.perMonth, 0);
});

test("bars are drawn as a share of the longer one, and the longer one is full width", () => {
  const cheaper = compareDecisionCost({ ...DEFAULTS, currentCostPerDecision: 0.0000168 });
  assert.equal(cheaper.share.priced, 1);
  assert.ok(Math.abs(cheaper.share.current - 0.5) < 1e-9);
});

test("nonsense input is clamped instead of reaching the arithmetic", () => {
  assert.equal(clampInput(Number.NaN, 10), 0);
  assert.equal(clampInput(-5, 10), 0);
  assert.equal(clampInput(Number.POSITIVE_INFINITY, 10), 10);
  assert.equal(clampInput(4, 10), 4);
  const absurd = compareDecisionCost({ ...DEFAULTS, decisionsPerDay: Number.POSITIVE_INFINITY });
  assert.equal(absurd.priced.perDay, absurd.priced.perDecision * INPUT_LIMITS.decisionsPerDay);
});

test("an empty field reads as zero, not as a stray number", () => {
  assert.equal(parseAmount("", 100), 0);
  assert.equal(parseAmount("   ", 100), 0);
  assert.equal(parseAmount("abc", 100), 0);
  assert.equal(parseAmount("12", 100), 12);
  assert.equal(parseAmount("50,000", 1_000_000), 50_000);
  assert.equal(parseAmount("0.042", 100), 0.042);
  assert.equal(parseAmount("999999", 100), 100);
});

test("money keeps two significant digits rather than rounding a sub-cent price to zero", () => {
  assert.equal(formatUsd(0), "$0.00");
  assert.equal(formatUsd(-3), "$0.00");
  assert.equal(formatUsd(0.0000336), "$0.000034");
  assert.equal(formatUsd(0.0012), "$0.0012");
  assert.equal(formatUsd(1.5), "$1.50");
  assert.equal(formatUsd(1234.5), "$1,234.50");
  assert.equal(formatUsd(1234567.891), "$1,234,567.89");
});

test("counts are grouped and ratios read as a multiple", () => {
  assert.equal(formatCount(0), "0");
  assert.equal(formatCount(50_000), "50,000");
  assert.equal(formatRatio(null), null);
  assert.equal(formatRatio(0), null);
  assert.equal(formatRatio(1.42), "1.4×");
  assert.equal(formatRatio(35.7), "36×");
});

test("the vendor price is the one constant the page defaults to", () => {
  assert.equal(VENDOR_INPUT_PRICE_PER_M, 0.042);
});
