import type { KnowledgeKind } from "./types";

/** Canonical list route for each record kind. */
const COLLECTION_PATH: Record<KnowledgeKind, string> = {
  overview: "/start",
  claim: "/claims",
  project: "/projects",
  pattern: "/patterns",
  opportunity: "/ideas",
  evidence: "/evidence",
  document: "/research",
};

/** Kinds that have a stable per-record page and a per-record MCP resource. */
export const ADDRESSABLE_KINDS: KnowledgeKind[] = ["claim", "project", "pattern", "opportunity"];

export function knowledgeSlug(value: string): string {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-|-$/gu, "");
}

/** The id part after `kind:`. Slugs are generated from titles, so they never contain a colon. */
export function idSlug(id: string): string {
  return id.slice(id.indexOf(":") + 1);
}

export function knowledgeId(kind: KnowledgeKind, title: string): string {
  return `${kind}:${knowledgeSlug(title)}`;
}

export function collectionPath(kind: KnowledgeKind): string {
  return COLLECTION_PATH[kind];
}

/**
 * The single source of truth for a record's canonical URL. The website routes,
 * the JSON exports, the llms.txt index, and the MCP resource URIs all derive
 * from this so no interface can drift into its own address for a record.
 */
export function canonicalPathFor(kind: KnowledgeKind, slug: string): string {
  if (kind === "document") return `/research/${slug}`;
  if (ADDRESSABLE_KINDS.includes(kind)) return `${COLLECTION_PATH[kind]}/${slug}`;
  return COLLECTION_PATH[kind];
}

/** MCP resource URI for an addressable record, mirroring its website path. */
export function resourceUriFor(kind: KnowledgeKind, slug: string): string {
  const collection = kind === "opportunity" ? "opportunities" : `${kind}s`;
  return `jev://${collection}/${slug}`;
}
