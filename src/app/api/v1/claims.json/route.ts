import { loadKnowledgeRecords } from "@/knowledge/repository";

export const dynamic = "force-static";

export async function GET() {
  const records = await loadKnowledgeRecords();
  return Response.json({ data: records.filter((record) => record.kind === "claim") }, { headers: { "Cache-Control": "public, max-age=300, s-maxage=3600" } });
}
