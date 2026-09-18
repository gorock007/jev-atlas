#!/usr/bin/env node
import "dotenv/config";
import { collect, type CollectConfig } from "./x/collector.js";
import { XClient } from "./x/client.js";
import { buildQueries } from "./x/queries.js";
import { formatUsd, X_PRICING } from "./x/pricing.js";
import { processPosts } from "./processing/process.js";
import { analyzeResearch } from "./research/analyze.js";
import { generateReport } from "./reporting/report.js";
import { buildConversationQueries } from "./x/conversations.js";
import { buildAdaptiveQueries } from "./x/queries.js";
import { readJsonLines } from "./utils/files.js";
import type { ProcessedPost } from "./types.js";
import { resolve } from "node:path";

interface ParsedArgs {
  command: string;
  budgetUsd: number;
  maxPosts: number;
  maxRequests: number;
  since?: string;
  queries: string[];
  dryRun: boolean;
  relevanceThreshold: number;
  highValueThreshold: number;
  pageSize: number;
}

function usage(): string {
  return `Jev X Research Engine

Usage:
  npm run research:dry
  npm run collect -- --budget-usd 3 --max-posts 750 --max-requests 50 --since 2026-09-15
  npm run collect -- --budget-usd 1 --query "Jev agent routing"
  npm run process
  npm run analyze
  npm run report
  npm run research
  npm run explore -- --budget-usd 0.60
  npm run expand -- --budget-usd 0.15

Options:
  --budget-usd <number>          Hard user budget, default 3, maximum 5
  --max-posts <integer>         Maximum returned posts, default 750
  --max-requests <integer>      Maximum API attempts including retries, default 50
  --since <YYYY-MM-DD>          Start date inside recent search's seven-day window
  --query <query>               Custom query; may be repeated
  --relevance-threshold <0-100> Retention threshold, default 60
  --high-value-threshold <0-100> High-value threshold, default 85
  --page-size <10-100>          Maximum posts per query page, default 25
  --dry-run                     Plan only; makes zero X API calls
`;
}

function valueAfter(argv: string[], index: number, flag: string): string {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${flag} requires a value`);
  return value;
}

function finiteNumber(value: string, flag: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`${flag} must be a number`);
  return parsed;
}

function parseArgs(argv: string[]): ParsedArgs {
  const command = argv[0] ?? "help";
  let budgetUsd = 3;
  let maxPosts = 750;
  let maxRequests = 50;
  let since: string | undefined;
  const queries: string[] = [];
  let dryRun = false;
  let relevanceThreshold = 60;
  let highValueThreshold = 85;
  let pageSize = 25;

  for (let index = 1; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") dryRun = true;
    else if (arg === "--help" || arg === "-h") return { command: "help", budgetUsd, maxPosts, maxRequests, queries, dryRun, relevanceThreshold, highValueThreshold, pageSize };
    else if (arg === "--budget-usd") budgetUsd = finiteNumber(valueAfter(argv, index++, arg), arg);
    else if (arg === "--max-posts") maxPosts = finiteNumber(valueAfter(argv, index++, arg), arg);
    else if (arg === "--max-requests") maxRequests = finiteNumber(valueAfter(argv, index++, arg), arg);
    else if (arg === "--since") since = valueAfter(argv, index++, arg);
    else if (arg === "--query") queries.push(valueAfter(argv, index++, arg));
    else if (arg === "--relevance-threshold") relevanceThreshold = finiteNumber(valueAfter(argv, index++, arg), arg);
    else if (arg === "--high-value-threshold") highValueThreshold = finiteNumber(valueAfter(argv, index++, arg), arg);
    else if (arg === "--page-size") pageSize = finiteNumber(valueAfter(argv, index++, arg), arg);
    else throw new Error(`Unknown option: ${arg}`);
  }

  if (!Number.isInteger(maxPosts) || !Number.isInteger(maxRequests)) throw new Error("Post and request limits must be integers");
  for (const [name, value] of [["relevance", relevanceThreshold], ["high-value", highValueThreshold]] as const) {
    if (value < 0 || value > 100) throw new Error(`${name} threshold must be between 0 and 100`);
  }
  if (!Number.isInteger(pageSize) || pageSize < 10 || pageSize > 100) throw new Error("--page-size must be an integer between 10 and 100");
  return { command, budgetUsd, maxPosts, maxRequests, ...(since ? { since } : {}), queries, dryRun, relevanceThreshold, highValueThreshold, pageSize };
}

function printDryRun(config: CollectConfig): void {
  const safeCeiling = config.budgetUsd * X_PRICING.safetyFactor;
  const budgetLimitedPosts = Math.floor(safeCeiling / X_PRICING.postReadUsd);
  const requestLimitedPosts = config.maxRequests * (config.pageSize ?? 25);
  const estimatedMaxPosts = Math.min(config.maxPosts, budgetLimitedPosts, requestLimitedPosts);
  const estimatedMaxSpend = estimatedMaxPosts * X_PRICING.postReadUsd;
  console.log(`Jev Research Dry Run

ZERO paid X API calls will be made.

Configured budget:      ${formatUsd(config.budgetUsd)}
Internal safe ceiling:  ${formatUsd(safeCeiling)} (90%)
Post-read price:        $${X_PRICING.postReadUsd.toFixed(3)} per returned post
Maximum estimated spend:${formatUsd(estimatedMaxSpend)}
Maximum posts possible: ${estimatedMaxPosts} (before diminishing-return stops)
Maximum API attempts:   ${config.maxRequests}
Since:                  ${config.since ?? "X default: previous seven days"}
Pricing verified:       ${X_PRICING.verifiedAt}

Planned discovery queries:`);
  for (const [index, query] of config.queries.entries()) {
    console.log(`  ${index + 1}. [${query.name}] ${query.query}\n     ${query.rationale}`);
  }
  console.log(`\nStrategy: process each page locally, checkpoint, and stop after two low-yield pages per query or any hard ceiling.`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  if (args.command === "help") {
    console.log(usage());
    return;
  }
  if (args.command === "process") {
    const posts = await processPosts();
    const retained = posts.filter((post) => post.relevance_score >= args.relevanceThreshold).length;
    console.log(`Processed ${posts.length} unique posts; ${retained} meet relevance >= ${args.relevanceThreshold}.`);
    return;
  }
  if (args.command === "analyze") {
    const analysis = await analyzeResearch(process.cwd(), args.relevanceThreshold);
    console.log(`Analyzed ${analysis.dataset.retainedPosts} retained posts into ${analysis.claims.length} claims, ${analysis.projects.length} project findings, ${analysis.patterns.length} patterns, and ${analysis.ideas.length} build ideas.`);
    return;
  }
  if (args.command === "report") {
    const analysis = await generateReport();
    console.log(`Generated research/JEV-REPORT.md from ${analysis.dataset.totalPosts} cached posts.`);
    return;
  }
  if (!["collect", "explore", "expand"].includes(args.command)) throw new Error(`Unknown command: ${args.command}\n\n${usage()}`);

  let plannedQueries = buildQueries(args.queries);
  let statePath: string | undefined;
  if (args.command === "explore") {
    const processed = await readJsonLines<ProcessedPost>(resolve(process.cwd(), "data/processed/posts.jsonl"));
    plannedQueries = buildAdaptiveQueries(processed);
    statePath = "data/adaptive-run-state.json";
  } else if (args.command === "expand") {
    plannedQueries = await buildConversationQueries(process.cwd(), args.highValueThreshold);
    if (plannedQueries.length === 0) {
      console.log(`No conversations meet relevance >= ${args.highValueThreshold} plus the selective category gate. No X request made.`);
      return;
    }
    statePath = "data/conversation-run-state.json";
  }

  const config: CollectConfig = {
    budgetUsd: args.budgetUsd,
    maxPosts: args.maxPosts,
    maxRequests: args.maxRequests,
    ...(args.since ? { since: args.since } : {}),
    relevanceThreshold: args.relevanceThreshold,
    highValueThreshold: args.highValueThreshold,
    queries: plannedQueries,
    pageSize: args.pageSize,
    ...(statePath ? { statePath } : {}),
  };
  // Validate all hard limits even in dry-run mode.
  const { BudgetManager } = await import("./x/budget.js");
  new BudgetManager(config.budgetUsd, config.maxPosts, config.maxRequests);

  if (args.dryRun) {
    printDryRun(config);
    return;
  }
  const token = process.env.X_BEARER_TOKEN;
  if (!token) throw new Error("X_BEARER_TOKEN is missing. Copy .env.example to .env and add the token, or use --dry-run.");
  const client = process.env.X_API_BASE_URL
    ? new XClient(token, process.env.X_API_BASE_URL)
    : new XClient(token);
  await collect(config, client);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Error: ${message}`);
  process.exitCode = 1;
});
