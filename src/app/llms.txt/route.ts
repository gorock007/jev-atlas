import { buildLlmsTxt, loadKnowledgeRecords } from "@/knowledge/repository";

export const dynamic = "force-static";

export async function GET() {
  const records = await loadKnowledgeRecords();
  return new Response(buildLlmsTxt(records), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=3600" },
  });
}
