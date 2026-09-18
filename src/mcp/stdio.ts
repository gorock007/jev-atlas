#!/usr/bin/env node
/**
 * Local stdio entry point for Jev Atlas MCP.
 *
 * Identical read-only surface to the remote Streamable HTTP endpoint at /mcp;
 * it exists so an agent can use the atlas without the Next.js server running.
 * It reads the generated research artifacts from disk and makes no network
 * calls, so it never touches the X API or a TypeSafe credential.
 */
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createJevMcpServer } from "./server.js";

const server = await createJevMcpServer();

serveStdio(() => server, {
  onerror: (error) => {
    process.stderr.write(`[jev-atlas] ${error.message}\n`);
  },
});
