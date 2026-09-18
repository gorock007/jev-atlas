import { loadKnowledgeRecords } from "@/knowledge/repository";
import { idSlug } from "@/knowledge/paths";
import type { KnowledgeKind, KnowledgeRecord } from "@/knowledge/types";

let cached: Promise<KnowledgeRecord[]> | null = null;

/** One knowledge load per build, shared by every route that renders records. */
export function atlasRecords(): Promise<KnowledgeRecord[]> {
  cached ??= loadKnowledgeRecords();
  return cached;
}

export async function recordsOfKind(kind: KnowledgeKind): Promise<KnowledgeRecord[]> {
  return (await atlasRecords()).filter((record) => record.kind === kind);
}

export async function recordSlugs(kind: KnowledgeKind): Promise<Array<{ slug: string }>> {
  return (await recordsOfKind(kind)).map((record) => ({ slug: idSlug(record.id) }));
}

export async function recordBySlug(kind: KnowledgeKind, slug: string): Promise<KnowledgeRecord | null> {
  return (await recordsOfKind(kind)).find((record) => idSlug(record.id) === slug) ?? null;
}
