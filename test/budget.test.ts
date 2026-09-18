import assert from "node:assert/strict";
import test from "node:test";
import { BudgetLimitError, BudgetManager } from "../src/x/budget.js";

test("uses a 10% safety margin and sizes pages to the remaining budget", () => {
  const budget = new BudgetManager(1, 750, 50);
  assert.equal(budget.safeCeilingUsd, 0.9);
  assert.equal(budget.getNextPageSize(), 100);
  const reservation = budget.reservePage(100);
  budget.recordAttempt();
  budget.settlePage(reservation, 100);
  assert.equal(budget.snapshot().estimatedSpendUsd, 0.5);
  assert.equal(budget.getNextPageSize(), 80);
});

test("will not start an API page if fewer than ten worst-case reads fit", () => {
  const budget = new BudgetManager(0.1, 100, 10, { estimatedSpendUsd: 0.045 });
  assert.equal(budget.getNextPageSize(), 0);
  assert.equal(budget.limitReason(), "budget");
});

test("counts retry attempts against the hard request ceiling", () => {
  const budget = new BudgetManager(3, 750, 1);
  budget.recordAttempt();
  assert.throws(() => budget.recordAttempt(), (error) => error instanceof BudgetLimitError && error.reason === "requests");
});
