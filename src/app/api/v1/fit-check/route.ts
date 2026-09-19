import { atlasRecords } from "@/lib/atlas";
import { FIT_CHECK_MAX_LENGTH, FIT_CHECK_MIN_LENGTH, runFitCheck } from "@/lib/fit-check";

export const dynamic = "force-dynamic";

/** Per-IP budgets. Exceeding one degrades to the rules result, never to an error. */
const PER_MINUTE = 5;
const PER_DAY = 30;
const MINUTE_MS = 60_000;
const DAY_MS = 86_400_000;

interface Window { start: number; count: number }
interface Budget { minute: Window; day: Window }

/**
 * In-memory and therefore per-instance: this is a courtesy budget that keeps one
 * visitor from draining the gateway, not a security control. A serverless fleet
 * enforces it per lambda, which is the trade accepted for having no store.
 */
const budgets = new Map<string, Budget>();

function tick(window: Window, now: number, span: number, limit: number): boolean {
  if (now - window.start >= span) {
    window.start = now;
    window.count = 0;
  }
  window.count += 1;
  return window.count <= limit;
}

/** Prunes idle entries so a long-lived instance cannot grow the map without bound. */
function sweep(now: number) {
  if (budgets.size < 5_000) return;
  for (const [key, budget] of budgets) if (now - budget.day.start >= DAY_MS) budgets.delete(key);
}

function allow(key: string, now: number): { ok: boolean; reason: string } {
  const budget = budgets.get(key) ?? { minute: { start: now, count: 0 }, day: { start: now, count: 0 } };
  budgets.set(key, budget);
  sweep(now);
  const minute = tick(budget.minute, now, MINUTE_MS, PER_MINUTE);
  const day = tick(budget.day, now, DAY_MS, PER_DAY);
  if (!minute) return { ok: false, reason: `This address has run more than ${PER_MINUTE} model checks in a minute, so this is the deterministic rules result. Try again shortly.` };
  if (!day) return { ok: false, reason: `This address has run more than ${PER_DAY} model checks today, so this is the deterministic rules result.` };
  return { ok: true, reason: "" };
}

/** Left-most forwarded hop, which is what Vercel sets for the client. */
function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

const NO_STORE = { "Cache-Control": "no-store", "Content-Type": "application/json" } as const;

function bad(error: string) {
  return Response.json({ error }, { status: 400, headers: NO_STORE });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return bad("The request body must be JSON.");
  }
  const workflow = (body as { workflow?: unknown } | null)?.workflow;
  if (typeof workflow !== "string") return bad("The workflow field is required and must be a string.");
  const trimmed = workflow.trim();
  // Bounded for the same reason the search endpoint is: an unbounded body on a
  // public endpoint is a cheap way to spend someone else's model budget.
  if (trimmed.length < FIT_CHECK_MIN_LENGTH) return bad(`The workflow field must be at least ${FIT_CHECK_MIN_LENGTH} characters.`);
  if (trimmed.length > FIT_CHECK_MAX_LENGTH) return bad(`The workflow field must be ${FIT_CHECK_MAX_LENGTH} characters or fewer.`);

  const gate = allow(clientKey(request), Date.now());
  const records = await atlasRecords();
  // The workflow text is never logged, echoed into an error, or persisted.
  const result = await runFitCheck(trimmed, records, gate.ok ? {} : { allowModel: false, skipReason: gate.reason });
  return Response.json({ result }, { headers: NO_STORE });
}

export function GET() {
  return Response.json({ error: "Use POST with a JSON body: { \"workflow\": \"…\" }." }, { status: 405, headers: NO_STORE });
}
