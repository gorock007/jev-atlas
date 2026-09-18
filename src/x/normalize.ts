import type { RawPost } from "../types.js";
import { extractLinks } from "../processing/links.js";
import type { XApiPost } from "./client.js";

function numberOrZero(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function nullableNumber(value: number | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function normalizePost(post: XApiPost, querySource: string, collectedAt: string): RawPost {
  const entityUrls = (post.entities?.urls ?? [])
    .map((entity) => entity.unwound_url ?? entity.expanded_url ?? entity.url)
    .filter((url): url is string => typeof url === "string");
  const metrics = post.public_metrics;
  const username = post.username ?? null;

  return {
    id: post.id,
    text: post.text,
    author_id: post.author_id ?? null,
    username,
    author_name: null,
    created_at: post.created_at ?? null,
    url: username ? `https://x.com/${username}/status/${post.id}` : `https://x.com/i/web/status/${post.id}`,
    conversation_id: post.conversation_id ?? null,
    in_reply_to_user_id: post.in_reply_to_user_id ?? null,
    metrics: {
      likes: numberOrZero(metrics?.like_count),
      replies: numberOrZero(metrics?.reply_count),
      reposts: numberOrZero(metrics?.repost_count ?? metrics?.retweet_count),
      quotes: numberOrZero(metrics?.quote_count),
      bookmarks: nullableNumber(metrics?.bookmark_count),
      impressions: nullableNumber(metrics?.impression_count),
    },
    links: extractLinks(post.text, entityUrls),
    query_source: querySource,
    collected_at: collectedAt,
  };
}
