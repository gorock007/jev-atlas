/**
 * Public X pay-per-use prices verified 2026-09-18.
 * Source: https://docs.x.com/x-api/getting-started/pricing
 * Recheck before paid collection: X explicitly says prices may change.
 */
export const X_PRICING = {
  verifiedAt: "2026-09-18",
  postReadUsd: 0.005,
  userReadUsd: 0.01,
  safetyFactor: 0.9,
} as const;

export function estimatePostReadCost(postCount: number): number {
  return postCount * X_PRICING.postReadUsd;
}

export function formatUsd(value: number): string {
  return `$${value.toFixed(2)}`;
}
