import { createMcpHandler } from "@modelcontextprotocol/server";
import { createJevMcpServer } from "@/mcp/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = createMcpHandler(() => createJevMcpServer(), { legacy: "stateless" });

const FORBIDDEN = new Response("Cross-origin MCP requests are not allowed.", { status: 403 });

function rejectCrossOrigin(request: Request): Response | null {
  const origin = request.headers.get("origin");
  // A non-browser MCP client sends no Origin at all; browsers always send one
  // on a cross-origin POST, so the absent case is not a bypass.
  if (!origin) return null;
  // `Origin: null` (sandboxed iframes, some redirects) is a literal string that
  // is not a parsable URL. Treat anything unparsable as cross-origin rather
  // than letting it throw out of the route.
  try {
    return new URL(origin).host === new URL(request.url).host ? null : FORBIDDEN.clone();
  } catch {
    return FORBIDDEN.clone();
  }
}

async function serve(request: Request) {
  return rejectCrossOrigin(request) ?? handler.fetch(request);
}

export const GET = serve;
export const POST = serve;
export const DELETE = serve;
