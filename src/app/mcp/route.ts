import { createMcpHandler } from "@modelcontextprotocol/server";
import { createJevMcpServer } from "@/mcp/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createMcpHandler(() => createJevMcpServer(), { legacy: "stateless" });

function rejectCrossOrigin(request: Request): Response | null {
  const origin = request.headers.get("origin");
  if (!origin) return null;
  return new URL(origin).host === new URL(request.url).host ? null : new Response("Cross-origin MCP requests are not allowed.", { status: 403 });
}

async function serve(request: Request) {
  return rejectCrossOrigin(request) ?? handler.fetch(request);
}

export const GET = serve;
export const POST = serve;
export const DELETE = serve;
