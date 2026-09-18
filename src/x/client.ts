import { BudgetLimitError, BudgetManager } from "./budget.js";

interface XUrlEntity {
  url?: string;
  expanded_url?: string;
  unwound_url?: string;
}

export interface XApiPost {
  id: string;
  text: string;
  author_id?: string;
  username?: string;
  created_at?: string;
  conversation_id?: string;
  in_reply_to_user_id?: string;
  public_metrics?: {
    like_count?: number;
    reply_count?: number;
    repost_count?: number;
    retweet_count?: number;
    quote_count?: number;
    bookmark_count?: number;
    impression_count?: number;
  };
  entities?: { urls?: XUrlEntity[] };
}

export interface XSearchResponse {
  data?: XApiPost[];
  meta?: {
    newest_id?: string;
    oldest_id?: string;
    next_token?: string;
    result_count?: number;
  };
  errors?: Array<{ title?: string; detail?: string; type?: string; status?: number }>;
}

export interface SearchOptions {
  query: string;
  maxResults: number;
  nextToken?: string;
  startTime?: string;
}

export class XApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly retryable: boolean,
  ) {
    super(message);
    this.name = "XApiError";
  }
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function errorMessage(payload: unknown, fallback: string): string {
  if (!payload || typeof payload !== "object") return fallback;
  const object = payload as { detail?: unknown; title?: unknown; errors?: unknown };
  if (typeof object.detail === "string") return object.detail;
  if (typeof object.title === "string") return object.title;
  if (Array.isArray(object.errors)) {
    const messages = object.errors
      .map((entry) => entry && typeof entry === "object" ? (entry as { detail?: unknown }).detail : undefined)
      .filter((entry): entry is string => typeof entry === "string");
    if (messages.length) return messages.join("; ");
  }
  return fallback;
}

export class XClient {
  constructor(
    private readonly bearerToken: string,
    private readonly baseUrl = "https://api.x.com",
    private readonly fetcher: typeof fetch = fetch,
  ) {
    if (!bearerToken.trim()) throw new Error("X_BEARER_TOKEN is required for live collection");
  }

  async searchRecent(options: SearchOptions, budget: BudgetManager): Promise<XSearchResponse> {
    const url = new URL("/2/tweets/search/recent", this.baseUrl);
    url.searchParams.set("query", options.query);
    url.searchParams.set("max_results", String(options.maxResults));
    // The current OpenAPI contract names this parameter `post.fields`.
    // Identity/reference fields are returned when available; requesting author
    // expansion would add separately billed User reads.
    url.searchParams.set(
      "post.fields",
      "id,text,created_at,conversation_id,public_metrics,entities,lang",
    );
    url.searchParams.set("sort_order", "relevancy");
    if (options.nextToken) url.searchParams.set("next_token", options.nextToken);
    if (options.startTime) url.searchParams.set("start_time", options.startTime);

    const maxAttempts = 3;
    let lastError: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      budget.recordAttempt();
      try {
        const response = await this.fetcher(url, {
          headers: {
            Authorization: `Bearer ${this.bearerToken}`,
            "User-Agent": "jev-atlas/0.1",
          },
          signal: AbortSignal.timeout(30_000),
        });
        const payload = await response.json().catch(() => ({})) as unknown;
        if (response.ok) return payload as XSearchResponse;

        const retryable = response.status === 429 || response.status >= 500;
        const message = errorMessage(payload, `X API returned HTTP ${response.status}`);
        if (!retryable || attempt === maxAttempts) {
          throw new XApiError(message, response.status, retryable);
        }

        const resetSeconds = Number(response.headers.get("x-rate-limit-reset"));
        const resetDelay = Number.isFinite(resetSeconds) ? resetSeconds * 1000 - Date.now() : 0;
        const backoff = Math.max(500 * 2 ** (attempt - 1), resetDelay);
        if (backoff > 30_000) {
          throw new XApiError(`${message}. Rate-limit reset is too far away; rerun to resume later.`, response.status, true);
        }
        await wait(backoff);
      } catch (error) {
        if (error instanceof BudgetLimitError || error instanceof XApiError) throw error;
        lastError = error;
        if (attempt === maxAttempts) break;
        await wait(500 * 2 ** (attempt - 1));
      }
    }
    throw new XApiError(`X API request failed after bounded retries: ${String(lastError)}`, 0, true);
  }
}
