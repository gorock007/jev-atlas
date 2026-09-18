import { createHash, randomUUID } from "node:crypto";
import { resolve } from "node:path";
import type { RawPost, RunState } from "../types.js";
import { scorePost } from "../processing/relevance.js";
import { appendJsonLines, readJson, readJsonLines, writeJsonAtomic } from "../utils/files.js";
import { BudgetLimitError, BudgetManager } from "./budget.js";
import { XClient } from "./client.js";
import { normalizePost } from "./normalize.js";
import type { ResearchQuery } from "./queries.js";
import { formatUsd } from "./pricing.js";

export interface CollectConfig {
  budgetUsd: number;
  maxPosts: number;
  maxRequests: number;
  since?: string;
  relevanceThreshold: number;
  highValueThreshold: number;
  queries: ResearchQuery[];
  rootDir?: string;
  pageSize?: number;
  statePath?: string;
}

const RAW_PATH = "data/raw/posts.jsonl";
const SEEN_PATH = "data/seen-posts.json";
const STATE_PATH = "data/run-state.json";

function fingerprint(config: CollectConfig): string {
  const material = JSON.stringify({
    budgetUsd: config.budgetUsd,
    maxPosts: config.maxPosts,
    maxRequests: config.maxRequests,
    since: config.since ?? null,
    relevanceThreshold: config.relevanceThreshold,
    highValueThreshold: config.highValueThreshold,
    queries: config.queries,
    pageSize: config.pageSize ?? 25,
    statePath: config.statePath ?? STATE_PATH,
  });
  return createHash("sha256").update(material).digest("hex").slice(0, 16);
}

// Accept checkpoints created before page-size portfolio allocation was added.
function legacyFingerprint(config: CollectConfig): string {
  const material = JSON.stringify({
    budgetUsd: config.budgetUsd,
    maxPosts: config.maxPosts,
    maxRequests: config.maxRequests,
    since: config.since ?? null,
    relevanceThreshold: config.relevanceThreshold,
    highValueThreshold: config.highValueThreshold,
    queries: config.queries,
  });
  return createHash("sha256").update(material).digest("hex").slice(0, 16);
}

function initialState(config: CollectConfig, configFingerprint: string): RunState {
  const now = new Date().toISOString();
  return {
    version: 1,
    runId: randomUUID(),
    createdAt: now,
    updatedAt: now,
    configFingerprint,
    budgetUsd: config.budgetUsd,
    safeCeilingUsd: config.budgetUsd * 0.9,
    estimatedSpendUsd: 0,
    requestCount: 0,
    postsFetched: 0,
    uniquePosts: 0,
    relevantPosts: 0,
    highValuePosts: 0,
    warnedAt80Percent: false,
    currentQueryIndex: 0,
    queries: Object.fromEntries(config.queries.map(({ name }) => [name, {
      nextToken: null,
      completed: false,
      consecutiveLowYieldPages: 0,
      pages: 0,
    }])),
    stopReason: null,
  };
}

function sinceToStartTime(since: string | undefined): string | undefined {
  if (!since) return undefined;
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(since)) throw new Error("--since must use YYYY-MM-DD format");
  const date = new Date(`${since}T00:00:00.000Z`);
  if (Number.isNaN(date.valueOf())) throw new Error("--since is not a valid date");
  const now = Date.now();
  if (date.valueOf() > now) throw new Error("--since cannot be in the future");
  if (date.valueOf() < now - 7 * 24 * 60 * 60 * 1000) {
    throw new Error("--since is older than the seven-day recent-search window; full-archive search is not enabled");
  }
  return date.toISOString();
}

function printProgress(state: RunState, budget: BudgetManager, config: CollectConfig): void {
  const snapshot = budget.snapshot();
  console.log([
    "",
    "Jev Research Run",
    `Budget:              ${formatUsd(config.budgetUsd)} (safe ceiling ${formatUsd(snapshot.safeCeilingUsd)})`,
    `Estimated spend:     ${formatUsd(snapshot.estimatedSpendUsd)}`,
    `Remaining:           ${formatUsd(snapshot.remainingUsd)}`,
    `Requests:            ${snapshot.requestCount} / ${config.maxRequests}`,
    `Posts fetched:       ${snapshot.postsFetched} / ${config.maxPosts}`,
    `Unique posts:        ${state.uniquePosts}`,
    `Relevant posts:      ${state.relevantPosts}`,
    `High-value posts:    ${state.highValuePosts}`,
  ].join("\n"));
}

export async function collect(config: CollectConfig, client: XClient): Promise<RunState> {
  const root = config.rootDir ?? process.cwd();
  const rawPath = resolve(root, RAW_PATH);
  const seenPath = resolve(root, SEEN_PATH);
  const statePath = resolve(root, config.statePath ?? STATE_PATH);
  const expectedFingerprint = fingerprint(config);
  let state = await readJson<RunState | null>(statePath, null);
  if (state && state.configFingerprint !== expectedFingerprint && state.configFingerprint !== legacyFingerprint(config)) {
    throw new Error("Existing run state uses different collection settings. Move data/run-state.json aside to start a fresh run.");
  }
  state ??= initialState(config, expectedFingerprint);
  const seen = new Set(await readJson<string[]>(seenPath, []));
  // Raw JSONL is written before the checkpoint. Unioning it here repairs a
  // crash that happened after append but before the seen-ID file was replaced.
  for (const post of await readJsonLines<RawPost>(rawPath)) seen.add(post.id);
  state.uniquePosts = seen.size;
  const budget = new BudgetManager(config.budgetUsd, config.maxPosts, config.maxRequests, {
    estimatedSpendUsd: state.estimatedSpendUsd,
    requestCount: state.requestCount,
    postsFetched: state.postsFetched,
  });
  const startTime = sinceToStartTime(config.since);

  console.log(state.requestCount > 0 ? `Resuming run ${state.runId}` : `Starting run ${state.runId}`);
  printProgress(state, budget, config);

  outer: for (let index = state.currentQueryIndex; index < config.queries.length; index += 1) {
    const researchQuery = config.queries[index];
    if (!researchQuery) continue;
    const progress = state.queries[researchQuery.name];
    if (!progress || progress.completed) continue;
    state.currentQueryIndex = index;

    while (!progress.completed) {
      const maxResults = budget.getNextPageSize(config.pageSize ?? 25);
      if (maxResults === 0) {
        state.stopReason = budget.limitReason() ?? "budget";
        break outer;
      }

      console.log(`\nQuery: ${researchQuery.name} — ${researchQuery.query}`);
      const reservation = budget.reservePage(maxResults);
      let response;
      try {
        response = await client.searchRecent({
          query: researchQuery.query,
          maxResults,
          ...(progress.nextToken ? { nextToken: progress.nextToken } : {}),
          ...(startTime ? { startTime } : {}),
        }, budget);
      } catch (error) {
        budget.release(reservation);
        state.requestCount = budget.snapshot().requestCount;
        state.estimatedSpendUsd = budget.snapshot().estimatedSpendUsd;
        state.postsFetched = budget.snapshot().postsFetched;
        state.updatedAt = new Date().toISOString();
        await writeJsonAtomic(statePath, state);
        if (error instanceof BudgetLimitError) {
          state.stopReason = error.reason;
          break outer;
        }
        throw error;
      }

      const returned = response.data ?? [];
      budget.settlePage(reservation, returned.length);
      const collectedAt = new Date().toISOString();
      const normalized = returned.map((post) => normalizePost(post, researchQuery.name, collectedAt));
      const fresh: RawPost[] = [];
      let relevantThisPage = 0;
      for (const post of normalized) {
        if (seen.has(post.id)) continue;
        seen.add(post.id);
        fresh.push(post);
        const score = scorePost(post).relevance;
        if (score >= config.relevanceThreshold) {
          relevantThisPage += 1;
          state.relevantPosts += 1;
        }
        if (score >= config.highValueThreshold) state.highValuePosts += 1;
      }

      await appendJsonLines(rawPath, fresh);
      state.postsFetched = budget.snapshot().postsFetched;
      state.requestCount = budget.snapshot().requestCount;
      state.estimatedSpendUsd = budget.snapshot().estimatedSpendUsd;
      state.uniquePosts = seen.size;
      progress.pages += 1;
      progress.nextToken = response.meta?.next_token ?? null;
      progress.consecutiveLowYieldPages = relevantThisPage < 2
        ? progress.consecutiveLowYieldPages + 1
        : 0;
      progress.completed = !progress.nextToken || progress.consecutiveLowYieldPages >= 2;
      if (progress.completed) state.currentQueryIndex = index + 1;
      state.updatedAt = new Date().toISOString();

      const percent = budget.snapshot().percentOfSafeCeiling;
      if (percent >= 0.8 && !state.warnedAt80Percent) {
        console.warn("WARNING: 80% of the internal safe API ceiling consumed");
        state.warnedAt80Percent = true;
      }

      await writeJsonAtomic(seenPath, [...seen]);
      await writeJsonAtomic(statePath, state);
      console.log(`Page: ${returned.length} fetched, ${fresh.length} new, ${relevantThisPage} relevant`);
      printProgress(state, budget, config);
    }
  }

  if (!state.stopReason && state.currentQueryIndex >= config.queries.length) state.stopReason = "complete";
  state.requestCount = budget.snapshot().requestCount;
  state.estimatedSpendUsd = budget.snapshot().estimatedSpendUsd;
  state.postsFetched = budget.snapshot().postsFetched;
  state.updatedAt = new Date().toISOString();
  await writeJsonAtomic(statePath, state);
  if (state.stopReason !== "complete") console.log(`\nBUDGET LIMIT REACHED (${state.stopReason}). Stopping X collection.`);
  else console.log("\nCollection complete.");
  return state;
}
