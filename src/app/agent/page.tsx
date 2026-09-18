import Link from "next/link";
import { CopyMcpConfig } from "@/components/copy-mcp-config";
import { getKnowledgeManifest, loadKnowledgeRecords } from "@/knowledge/repository";

export const metadata = {
  title: "For agents",
  description: "Connect an agent to the Jev Atlas research context through MCP, Markdown, or structured JSON.",
};

const tools = [
  ["search_jev_knowledge", "Find claims, projects, patterns, opportunities, evidence, and synthesis with status preserved."],
  ["get_jev_context_pack", "Retrieve a compact cited bundle for a goal without loading the entire corpus."],
  ["assess_jev_fit", "Locate bounded semantic decisions, non-fits, deterministic boundaries, and validation steps."],
  ["get_build_blueprint", "Open an authored opportunity with its architecture, MVP, experiment, and unknowns."],
  ["trace_jev_claim", "Inspect evidence status, counterarguments, open questions, and original sources."],
];

export default async function AgentPage() {
  const records = await loadKnowledgeRecords();
  const manifest = getKnowledgeManifest(records);

  return (
    <div className="site-container agent-page">
      <header className="agent-hero">
        <div>
          <p className="atlas-label text-accent">Machine interface · v0.1</p>
          <h1>Give your agent the field guide.</h1>
        </div>
        <p>Jev Atlas gives coding agents independent research, evidence status, project examples, architecture patterns, and build hypotheses—without making them scrape the visual website or load the entire corpus.</p>
      </header>

      <section className="agent-stat-strip" aria-label="Knowledge service statistics">
        <div><strong>{manifest.recordCount}</strong><span>normalized records</span></div>
        <div><strong>{manifest.counts.claim}</strong><span>tracked claims</span></div>
        <div><strong>{manifest.counts.opportunity}</strong><span>opportunities</span></div>
        <div><strong>5</strong><span>read-only tools</span></div>
      </section>

      <section className="agent-connect-section">
        <div className="agent-section-intro">
          <p className="atlas-label">01 Connect</p>
          <h2>One endpoint, bounded context.</h2>
          <p>The MCP is public and read-only. It does not call Jev, accept TypeSafe credentials, modify repositories, or execute external instructions.</p>
        </div>
        <CopyMcpConfig />
      </section>

      <section className="agent-connect-section">
        <div className="agent-section-intro">
          <p className="atlas-label">01b Local</p>
          <h2>Or run it without the site.</h2>
          <p>The same read-only surface is available over stdio, reading the generated research artifacts straight from disk. It makes no network calls.</p>
        </div>
        <div className="mcp-config">
          <div className="mcp-config-head"><span>Local stdio server</span></div>
          <pre><code>npm run mcp:stdio</code></pre>
          <p>Point any stdio-capable MCP client at this command from the repository root. Useful in CI, offline, or when the Next.js server is not running.</p>
        </div>
      </section>

      <section className="agent-surfaces">
        <div className="agent-section-intro">
          <p className="atlas-label">02 Open formats</p>
          <h2>MCP is optional.</h2>
          <p>Agents that cannot connect to MCP can consume the same canonical records as concise Markdown or versioned JSON.</p>
        </div>
        <div className="surface-list">
          <a href="/llms.txt"><b>01</b><div><h3>llms.txt</h3><p>Compact research index for discovery and selective loading.</p></div><span>TXT ↗</span></a>
          <a href="/llms-full.txt"><b>02</b><div><h3>llms-full.txt</h3><p>Complete curated export with evidence status, limitations, and sources.</p></div><span>TXT ↗</span></a>
          <a href="/api/v1/manifest.json"><b>03</b><div><h3>Knowledge manifest</h3><p>Schema version, freshness, record counts, and available interfaces.</p></div><span>JSON ↗</span></a>
          <a href="/api/v1/search.json?q=agent%20tool%20gating"><b>04</b><div><h3>Search API</h3><p>Structured lexical retrieval across the normalized knowledge layer.</p></div><span>JSON ↗</span></a>
          <a href="/sitemap.xml"><b>05</b><div><h3>Canonical URLs</h3><p>Every claim, project, pattern, and opportunity has a stable page matching its MCP resource URI.</p></div><span>XML ↗</span></a>
        </div>
      </section>

      <section className="agent-tools-section">
        <div className="agent-section-intro">
          <p className="atlas-label">03 Tools</p>
          <h2>Research before recommendation.</h2>
          <p>Tools return bounded structured results. Agents are instructed to retain claim status, separate hypotheses from observations, and propose validation before rollout.</p>
        </div>
        <ol className="agent-tool-list">
          {tools.map(([name, description], index) => <li key={name}><b>{String(index + 1).padStart(2, "0")}</b><div><code>{name}</code><p>{description}</p></div></li>)}
        </ol>
      </section>

      <section className="agent-contract">
        <div>
          <p className="atlas-label">Trust contract</p>
          <h2>Context with provenance, not an oracle.</h2>
        </div>
        <ul>
          <li><span>01</span>Official documentation remains authoritative for current API contracts.</li>
          <li><span>02</span>Vendor claims stay labeled until independent evidence changes their status.</li>
          <li><span>03</span>Authored opportunities are hypotheses to test, not guaranteed use cases.</li>
          <li><span>04</span>Typed output constrains shape; it does not guarantee semantic correctness.</li>
          <li><span>05</span>High-impact actions still require deterministic backstops and escalation.</li>
          <li><span>06</span>A record’s website page, JSON export, and MCP resource resolve to one canonical address.</li>
        </ul>
      </section>

      <div className="agent-bottom-link">
        <Link href="/research/report">Read the complete human report <span>→</span></Link>
        <span>Last verified {new Date(manifest.lastVerifiedAt).toLocaleDateString("en-AU", { dateStyle: "medium" })}</span>
      </div>
    </div>
  );
}
