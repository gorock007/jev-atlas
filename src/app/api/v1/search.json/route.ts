import { KNOWLEDGE_KINDS, type KnowledgeKind } from "@/knowledge/types";
import { loadKnowledgeRecords, searchKnowledge } from "@/knowledge/repository";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  if (!query) return Response.json({ error: "The q search parameter is required." }, { status: 400 });
  const requestedKinds = url.searchParams.getAll("kind").filter((kind): kind is KnowledgeKind => KNOWLEDGE_KINDS.includes(kind as KnowledgeKind));
  const limit = Number.parseInt(url.searchParams.get("limit") ?? "10", 10);
  const records = await loadKnowledgeRecords();
  const results = searchKnowledge(records, { query, ...(requestedKinds.length ? { kinds: requestedKinds } : {}), limit: Number.isFinite(limit) ? limit : 10 });
  return Response.json({ query, count: results.length, data: results }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
}
