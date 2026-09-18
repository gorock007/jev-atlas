import { KNOWLEDGE_KINDS, type KnowledgeKind } from "@/knowledge/types";
import { loadKnowledgeRecords, searchKnowledge } from "@/knowledge/repository";

/** Matches the MCP tool's bound, so neither interface is the cheap way in. */
const MAX_QUERY_LENGTH = 500;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";
  if (!query) return Response.json({ error: "The q search parameter is required." }, { status: 400 });
  // Scoring tokenizes the query against every record, so an unbounded q is a
  // cheap amplification vector on a public endpoint.
  if (query.length > MAX_QUERY_LENGTH) {
    return Response.json({ error: `The q search parameter must be ${MAX_QUERY_LENGTH} characters or fewer.` }, { status: 400 });
  }
  const requestedKinds = url.searchParams.getAll("kind").filter((kind): kind is KnowledgeKind => KNOWLEDGE_KINDS.includes(kind as KnowledgeKind));
  const limit = Number.parseInt(url.searchParams.get("limit") ?? "10", 10);
  const records = await loadKnowledgeRecords();
  const results = searchKnowledge(records, { query, ...(requestedKinds.length ? { kinds: requestedKinds } : {}), limit: Number.isFinite(limit) ? limit : 10 });
  return Response.json({ query, count: results.length, data: results }, { headers: { "Cache-Control": "public, max-age=60, s-maxage=300" } });
}
