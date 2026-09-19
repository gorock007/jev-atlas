import Link from "next/link";
import { CopyMcpConfig } from "@/components/copy-mcp-config";
import { ResearchSearch, type SearchItem } from "@/components/research-search";
import { UiIcon } from "@/components/ui-icon";
import { OPPORTUNITY_LENSES } from "@/knowledge/lenses";
import { loadAnalysis, loadProcessedPosts, loadRunSummary, RESEARCH_DOCUMENTS } from "@/lib/research-data";
import { formatCategory, safeHref } from "@/lib/format";

export const dynamic = "force-static";

/** The three MCP tools that answer the questions an agent cannot answer on its own. */
const AGENT_TOOLS = [
  ["assess_jev_fit", "Is this workload actually a bounded semantic decision, and where does it stop?"],
  ["get_build_blueprint", "Open an authored opportunity with its architecture, MVP, experiment, and unknowns."],
  ["trace_jev_claim", "Check a claim's evidence status, counterarguments, open questions, and sources."],
];

export default async function OverviewPage() {
  const [analysis, posts, runSummary] = await Promise.all([loadAnalysis(), loadProcessedPosts(), loadRunSummary()]);

  if (!analysis) {
    return (
      <div className="site-container py-24">
        <p className="atlas-label text-accent">Dataset unavailable</p>
        <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-none tracking-[-0.05em]">Generate the research index first.</h1>
        <p className="mt-5 text-sm text-muted">Run <code>npm run research</code>, then refresh this page.</p>
      </div>
    );
  }

  const categories = Object.entries(analysis.categoryCounts).sort((a, b) => b[1] - a[1]);
  const topCategories = categories.slice(0, 6);
  const actualProjects = analysis.projects.filter((project) => project.status === "ACTUALLY BUILT");
  const topIdeas = [...analysis.ideas].sort((a, b) => b.indieFit - a.indieFit || b.confidence.localeCompare(a.confidence)).slice(0, 5);
  const lensCounts = OPPORTUNITY_LENSES.map((lens) => ({ lens, count: analysis.ideas.filter((idea) => idea.lens === lens.id).length }));
  const demonstratedClaims = analysis.claims.filter((claim) => claim.status === "Demonstrated").length;
  const vendorClaims = analysis.claims.filter((claim) => claim.status === "Vendor Claim").length;
  const searchItems: SearchItem[] = [
    ...analysis.claims.map((claim, index) => ({ id: `claim-${index}`, type: "Claim", title: claim.claim, description: claim.evidence, href: "/claims", tags: [claim.status] })),
    ...analysis.projects.map((project, index) => ({ id: `project-${index}`, type: "Project", title: project.name, description: project.description, href: "/projects", tags: [project.status, project.jevRole] })),
    ...analysis.ideas.map((idea, index) => ({ id: `idea-${index}`, type: "Idea", title: idea.name, description: idea.product, href: "/ideas", tags: [idea.confidence, idea.whyJev] })),
    ...analysis.topEvidence.map((evidence, index) => ({ id: `evidence-${index}`, type: "Evidence", title: `${evidence.categories.map(formatCategory).join(", ")} source — relevance ${evidence.relevance}`, description: evidence.themes.length ? `Themes: ${evidence.themes.join(" · ")}` : evidence.scoreReasons.join(" · "), href: "/evidence", tags: [...evidence.categories, ...evidence.themes] })),
    ...RESEARCH_DOCUMENTS.map((document) => ({ id: `document-${document.slug}`, type: "Document", title: document.title, description: document.description, href: `/research/${document.slug}`, tags: [document.eyebrow] })),
  ];

  return (
    <div>
      <section className="site-container atlas-hero">
        <p className="atlas-kicker">An independent, evidence-checked field guide to Jev</p>
        <h1>What can you actually build with Jev?</h1>
        <p className="atlas-deck">
          {analysis.ideas.length} build blueprints drawn from the public record, {analysis.claims.length} claims sorted by what has been
          demonstrated and what is still a vendor claim, and an MCP endpoint your coding agent can read directly.
        </p>

        <div className="home-cta-row">
          <Link href="/map" className="home-cta-primary">See what to build <span aria-hidden="true">→</span></Link>
          <Link href="/start" className="home-cta-secondary">Jev in 60 seconds</Link>
          <Link href="/fit" className="home-cta-secondary">Will it help my workflow?</Link>
          <Link href="/agent" className="atlas-text-link">Connect your agent <span>→</span></Link>
        </div>

        <div className="home-trust-line">
          <span className="atlas-label">Evidence status</span>
          <p>
            Of {analysis.claims.length} tracked claims, <strong>{demonstratedClaims}</strong> are demonstrated by located work and{" "}
            <strong>{vendorClaims}</strong> remain vendor claims. Status is recorded per claim and never upgraded by repetition.
          </p>
          <Link href="/claims" className="atlas-text-link">Claims ledger <span>→</span></Link>
        </div>

        <div className="lens-strip">
          <div className="lens-strip-head">
            <p className="atlas-label">Nine lenses · what a workload needs before Jev fits</p>
            <Link href="/map" className="atlas-text-link">Open the opportunity map <span>→</span></Link>
          </div>
          <ul aria-label="Opportunity lenses">
            {lensCounts.map(({ lens, count }, index) => (
              <li key={lens.id}>
                <Link href={`/map#${lens.id}`}>
                  <b>{String(index + 1).padStart(2, "0")}</b>
                  <span>{lens.title}</span>
                  <em>{count} {count === 1 ? "blueprint" : "blueprints"}</em>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="site-container home-agent-invite">
        <div className="home-agent-intro">
          <p className="atlas-label"><span>01</span> Agent interface · MCP</p>
          <h2>Don’t make your agent guess about Jev.</h2>
          <p>The same normalized claims, projects, patterns, opportunities, evidence status, and sources that power this website, over one public read-only endpoint.</p>
          <Link href="/agent" className="atlas-text-link">See the full agent interface <span>→</span></Link>
        </div>

        <div className="home-agent-panel">
          <div className="mcp-compare">
            <div>
              <p className="atlas-label">Without the atlas</p>
              <p>Your agent answers from whatever it absorbed before Jev existed, or reads vendor pages and cannot tell a located demonstration from launch copy.</p>
            </div>
            <div>
              <p className="atlas-label">With the atlas</p>
              <ul>
                {AGENT_TOOLS.map(([tool, note]) => (
                  <li key={tool}><code>{tool}</code><span>{note}</span></li>
                ))}
              </ul>
            </div>
          </div>
          <CopyMcpConfig />
        </div>
      </section>

      <section className="site-container home-index">
        <div className="atlas-strip" aria-label="Research layers">
          <span>Explore the index</span>
          {[
            ["Claims", analysis.claims.length, "/claims"],
            ["Projects", analysis.projects.length, "/projects"],
            ["Patterns", analysis.patterns.length, "/research/architecture-patterns"],
            ["Ideas", analysis.ideas.length, "/ideas"],
            ["Documents", RESEARCH_DOCUMENTS.length, "/library"],
          ].map(([label, count, href], index) => (
            <Link key={String(label)} href={String(href)}><b>{String(index + 1).padStart(2, "0")}</b><span>{label}</span><em>{count}</em></Link>
          ))}
        </div>

        <div className="atlas-board">
          <aside className="topic-index">
            <p className="atlas-label">Browse by signal</p>
            <ol>
              {topCategories.map(([category, count], index) => (
                <li key={category}><Link href="/evidence"><b>{String(index + 1).padStart(2, "0")}</b><span>{formatCategory(category)}</span><em>{count}</em></Link></li>
              ))}
            </ol>
            <Link href="/evidence" className="atlas-text-link">View all evidence <span>→</span></Link>
          </aside>

          <div className="atlas-feature">
            <p className="atlas-label"><span>02</span> Field synthesis</p>
            <div className="atlas-feature-copy">
              <h2>Intelligence that decides, mapped.</h2>
              <p>What Jev is, what TypeSafe claims, what developers have actually built, and where the architecture gets interesting.</p>
              <Link href="/research/report" className="atlas-text-link">Read the full report <span>→</span></Link>
            </div>
            <div className="atlas-metrics">
              <div><strong>{analysis.dataset.totalPosts}</strong><span>unique posts</span></div>
              <div><strong>{analysis.dataset.retainedPosts}</strong><span>retained sources</span></div>
              <div><strong>{analysis.claims.length}</strong><span>claims tracked</span></div>
              <div><strong>{analysis.ideas.length}</strong><span>build hypotheses</span></div>
            </div>
          </div>

          <aside className="claim-ranking">
            <div className="claim-ranking-head"><span>Claims ledger</span><span>Status</span></div>
            <ol>
              {analysis.claims.slice(0, 3).map((claim, index) => (
                <li key={claim.claim}><b>{String(index + 1).padStart(2, "0")}</b><Link href="/claims">{claim.claim}</Link><em>{claim.status}</em></li>
              ))}
            </ol>
            <Link href="/claims" className="atlas-text-link">View all {analysis.claims.length} claims <span>→</span></Link>
          </aside>
        </div>

        <div className="corpus-line">
          <span className="atlas-label">Research corpus</span>
          <div className="corpus-track" aria-hidden="true">{Array.from({ length: 13 }, (_, index) => <i key={index} />)}</div>
          <strong>{analysis.dataset.totalPosts}<small>posts<br />indexed</small></strong>
        </div>
      </section>

      <section className="site-container picked-note">
        <div className="picked-mark" aria-hidden="true">✦</div>
        <div className="picked-label"><span>This hypothesis was picked</span><span>for validation</span></div>
        <div className="picked-copy">
          <p>{topIdeas[0]?.confidence} confidence / indie fit {topIdeas[0]?.indieFit} of 10</p>
          <h2>{topIdeas[0]?.name}</h2>
          <span>{topIdeas[0]?.product}</span>
        </div>
        <Link href="/ideas">Open the idea <UiIcon name="arrow-right" size={15} /></Link>
      </section>

      <ResearchSearch items={searchItems} />

      <section className="site-container benchmark-section">
        <div className="benchmark-intro">
          <p className="atlas-label">The research run</p>
          <h2>What this evidence set cost.</h2>
          <p>Three capped collection passes gathered the launch-period conversation, then a local pipeline classified and synthesized the retained material.</p>
        </div>
        <div className="benchmark-table">
          {[
            ["Collection", `${runSummary.returnedPosts}`, "resources returned", `${runSummary.requests} requests`],
            ["Deduplication", `${analysis.dataset.totalPosts}`, "unique posts", `${runSummary.runs} capped runs`],
            ["Estimated API spend", `$${runSummary.estimatedSpendUsd.toFixed(2)}`, "total collection", `$${(runSummary.estimatedSpendUsd / Math.max(1, analysis.dataset.totalPosts)).toFixed(3)} / post`],
          ].map(([label, value, caption, relative], index) => (
            <div className="benchmark-row" key={label}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <div><h3>{label}</h3><span>{caption}</span></div>
              <strong>{value}</strong>
              <em>{relative}</em>
            </div>
          ))}
          <p className="benchmark-note">Costs are estimates based on provider pricing at collection time. They cover X API retrieval only, not analysis or development time.</p>
        </div>
      </section>

      <section className="site-container findings-section">
        <div className="section-heading">
          <p className="atlas-label">03 Located work</p>
          <h2>What people have actually built.</h2>
          <p>Public repositories, demonstrations, and integrations—kept separate from proposals and launch copy.</p>
        </div>
        <div className="ranked-list">
          {actualProjects.slice(0, 5).map((project, index) => (
            <a key={project.name} href={safeHref(project.source)} target="_blank" rel="noreferrer">
              <b>{String(index + 1).padStart(2, "0")}</b><h3>{project.name}</h3><p>{project.insight}</p><span>Open ↗</span>
            </a>
          ))}
          <Link href="/projects" className="atlas-text-link">View the project index <span>→</span></Link>
        </div>
      </section>

      <section className="site-container methodology-section">
        <div className="methodology-intro">
          <p className="atlas-label">About &amp; methodology</p>
          <h2>How a noisy launch conversation became a navigable atlas.</h2>
          <p>The pipeline preserves sources, separates evidence levels, and keeps unanswered questions visible next to conclusions.</p>
        </div>
        <ol className="methodology-list">
          {RESEARCH_DOCUMENTS.slice(0, 4).map((document, index) => (
            <li key={document.slug}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <div><h3><Link href={`/research/${document.slug}`}>{document.title}</Link></h3><p>{document.description}</p></div>
            </li>
          ))}
          <p className="methodology-note">This is a launch-period, English-only, query-conditioned sample. Heuristic scores organize attention; they are not objective quality labels. The local dataset contains {posts.length} processed records.</p>
        </ol>
      </section>
    </div>
  );
}
