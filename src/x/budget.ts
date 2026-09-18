import { estimatePostReadCost, X_PRICING } from "./pricing.js";

export type StopReason = "budget" | "posts" | "requests";

export class BudgetLimitError extends Error {
  constructor(public readonly reason: StopReason, message: string) {
    super(message);
    this.name = "BudgetLimitError";
  }
}

export interface BudgetSnapshot {
  budgetUsd: number;
  safeCeilingUsd: number;
  estimatedSpendUsd: number;
  reservedUsd: number;
  requestCount: number;
  postsFetched: number;
  remainingUsd: number;
  percentOfSafeCeiling: number;
}

export class BudgetManager {
  readonly safeCeilingUsd: number;
  private estimatedSpendUsd: number;
  private reservedUsd = 0;
  private requestCount: number;
  private postsFetched: number;

  constructor(
    readonly budgetUsd: number,
    readonly maxPosts: number,
    readonly maxRequests: number,
    initial: { estimatedSpendUsd?: number; requestCount?: number; postsFetched?: number } = {},
  ) {
    if (!Number.isFinite(budgetUsd) || budgetUsd <= 0 || budgetUsd > 5) {
      throw new Error("--budget-usd must be greater than 0 and no more than 5");
    }
    if (!Number.isInteger(maxPosts) || maxPosts < 10) throw new Error("--max-posts must be an integer of at least 10 (X's minimum page size)");
    if (!Number.isInteger(maxRequests) || maxRequests < 1) throw new Error("--max-requests must be a positive integer");
    this.safeCeilingUsd = budgetUsd * X_PRICING.safetyFactor;
    this.estimatedSpendUsd = initial.estimatedSpendUsd ?? 0;
    this.requestCount = initial.requestCount ?? 0;
    this.postsFetched = initial.postsFetched ?? 0;
  }

  getNextPageSize(preferred = 100): number {
    if (this.requestCount >= this.maxRequests) return 0;
    const postsLeft = this.maxPosts - this.postsFetched;
    const affordable = Math.floor(
      (this.safeCeilingUsd - this.estimatedSpendUsd - this.reservedUsd + 1e-9) /
      X_PRICING.postReadUsd,
    );
    const size = Math.min(preferred, postsLeft, affordable);
    return size >= 10 ? size : 0;
  }

  reservePage(maxResults: number): number {
    if (this.postsFetched >= this.maxPosts) throw new BudgetLimitError("posts", "Post limit reached");
    if (this.requestCount >= this.maxRequests) throw new BudgetLimitError("requests", "Request limit reached");
    if (!Number.isInteger(maxResults) || maxResults < 10 || maxResults > 100) {
      throw new Error("X recent search requires max_results between 10 and 100");
    }
    const reservation = estimatePostReadCost(maxResults);
    if (this.estimatedSpendUsd + this.reservedUsd + reservation > this.safeCeilingUsd + 1e-9) {
      throw new BudgetLimitError("budget", "Safe budget ceiling reached");
    }
    this.reservedUsd += reservation;
    return reservation;
  }

  recordAttempt(): void {
    if (this.requestCount >= this.maxRequests) {
      throw new BudgetLimitError("requests", "Request limit reached before API attempt");
    }
    this.requestCount += 1;
  }

  settlePage(reservation: number, returnedPosts: number): void {
    this.reservedUsd = Math.max(0, this.reservedUsd - reservation);
    this.estimatedSpendUsd += estimatePostReadCost(returnedPosts);
    this.postsFetched += returnedPosts;
  }

  release(reservation: number): void {
    this.reservedUsd = Math.max(0, this.reservedUsd - reservation);
  }

  limitReason(): StopReason | null {
    if (this.maxPosts - this.postsFetched < 10) return "posts";
    if (this.requestCount >= this.maxRequests) return "requests";
    if (this.getNextPageSize() === 0) return "budget";
    return null;
  }

  snapshot(): BudgetSnapshot {
    return {
      budgetUsd: this.budgetUsd,
      safeCeilingUsd: this.safeCeilingUsd,
      estimatedSpendUsd: this.estimatedSpendUsd,
      reservedUsd: this.reservedUsd,
      requestCount: this.requestCount,
      postsFetched: this.postsFetched,
      remainingUsd: Math.max(0, this.budgetUsd - this.estimatedSpendUsd),
      percentOfSafeCeiling: this.safeCeilingUsd === 0 ? 1 : this.estimatedSpendUsd / this.safeCeilingUsd,
    };
  }
}
