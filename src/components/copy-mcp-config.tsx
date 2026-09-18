"use client";

import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";

export function CopyMcpConfig() {
  const [origin, setOrigin] = useState("https://YOUR-DOMAIN");
  const [copied, setCopied] = useState(false);

  useEffect(() => setOrigin(window.location.origin), []);
  const endpoint = `${origin}/mcp`;
  const snippet = useMemo(() => JSON.stringify({ mcpServers: { "jev-atlas": { url: endpoint } } }, null, 2), [endpoint]);

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_800);
  }

  return (
    <div className="mcp-config">
      <div className="mcp-config-head">
        <span>Remote MCP configuration</span>
        <button type="button" onClick={() => copy(snippet)} aria-label="Copy MCP configuration">
          {copied ? <CheckIcon size={14} weight="bold" /> : <CopyIcon size={14} />}
          <span aria-live="polite">{copied ? "Copied" : "Copy config"}</span>
        </button>
      </div>
      <pre><code>{snippet}</code></pre>
      <div className="mcp-endpoint-row">
        <span>Endpoint</span>
        <code>{endpoint}</code>
        <button type="button" onClick={() => copy(endpoint)} aria-label="Copy MCP endpoint"><CopyIcon size={13} /></button>
      </div>
      <p>Client configuration formats vary. Use this endpoint anywhere your agent accepts a remote Streamable HTTP MCP server.</p>
    </div>
  );
}
