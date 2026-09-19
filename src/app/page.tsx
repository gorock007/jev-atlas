import { existsSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { AtlasMindmap } from "@/components/atlas-mindmap";
import { CopyMcpConfig } from "@/components/copy-mcp-config";
import { HeroVisual } from "@/components/hero-visual";
import home from "@/components/home.module.css";
import { PrimitiveDiagrams } from "@/components/primitive-diagrams";
import { ResearchSearch, type SearchItem } from "@/components/research-search";
import { OPPORTUNITY_LENSES } from "@/knowledge/lenses";
import { buildMindmap } from "@/knowledge/mindmap";
import { atlasRecords } from "@/lib/atlas";
import { loadAnalysis, loadRunSummary, RESEARCH_DOCUMENTS } from "@/lib/research-data";
import { formatCategory } from "@/lib/format";

export const dynamic = "force-static";

/** The three MCP tools that answer the questions an agent cannot answer on its own. */
const AGENT_TOOLS = [
  ["assess_jev_fit", "Is this workload a bounded semantic decision, and where does it stop?"],
  ["get_build_blueprint", "An authored opportunity with its architecture, MVP, and unknowns."],
  ["trace_jev_claim", "A claim's evidence status, counterarguments, and sources."],
];

/** The explainer is produced separately; the slot stays empty until its file is in the build. */
function explainerSources(): Array<{ src: string; type: string }> | null {
  const has = (file: string) => existsSync(join(process.cwd(), "public", "media", file));
  if (!has("jev-in-60s.mp4")) return null;
  return [
    ...(has("jev-in-60s.webm") ? [{ src: "/media/jev-in-60s.webm", type: "video/webm" }] : []),
    { src: "/media/jev-in-60s.mp4", type: "video/mp4" },
  ];
}

export default async function OverviewPage() {
  const [analysis, records, runSummary] = await Promise.all([loadAnalysis(), atlasRecords(), loadRunSummary()]);

  if (!analysis) {
    return (
      <div className="site-container py-24">
        <p className="atlas-label text-accent">Dataset unavailable</p>
        <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-none tracking-[-0.05em]">Generate the research index first.</h1>
        <p className="mt-5 text-sm text-muted">Run <code>npm run research</code>, then refresh this page.</p>
      </div>
    );
  }

  const lensCounts = OPPORTUNITY_LENSES.map((lens) => ({ lens, count: analysis.ideas.filter((idea) => idea.lens === lens.id).length }));
  const video = explainerSources();
  const searchItems: SearchItem[] = [
    ...analysis.claims.map((claim, index) => ({ id: `claim-${index}`, type: "Claim", title: claim.claim, description: claim.evidence, href: "/claims", tags: [claim.status] })),
    ...analysis.projects.map((project, index) => ({ id: `project-${index}`, type: "Project", title: project.name, description: project.description, href: "/projects", tags: [project.status, project.jevRole] })),
    ...analysis.ideas.map((idea, index) => ({ id: `idea-${index}`, type: "Idea", title: idea.name, description: idea.product, href: "/ideas", tags: [idea.confidence, idea.whyJev] })),
    ...analysis.topEvidence.map((evidence, index) => ({ id: `evidence-${index}`, type: "Evidence", title: `${evidence.categories.map(formatCategory).join(", ")} source — relevance ${evidence.relevance}`, description: evidence.themes.length ? `Themes: ${evidence.themes.join(" · ")}` : evidence.scoreReasons.join(" · "), href: "/evidence", tags: [...evidence.categories, ...evidence.themes] })),
    ...RESEARCH_DOCUMENTS.map((document) => ({ id: `document-${document.slug}`, type: "Document", title: document.title, description: document.description, href: `/research/${document.slug}`, tags: [document.eyebrow] })),
  ];

  return (
    <div>
      <section className={`site-container ${home.hero}`}>
        <div className={home.heroCopy}>
          <p className="atlas-kicker">An independent, evidence-checked field guide to Jev</p>
          <h1>What can you actually build with Jev?</h1>
          <p className="atlas-deck">
            Jev is a fast model that answers narrow, typed questions for your code. This atlas maps what it is, what is proven, and {analysis.ideas.length} things you could build.
          </p>
          <div className={`home-cta-row ${home.ctas}`}>
            <Link href="/map" className="home-cta-primary">See what to build <span aria-hidden="true">→</span></Link>
            <Link href="/start" className="home-cta-secondary">Jev in 60 seconds</Link>
            <Link href="/fit" className="home-cta-secondary">Will it help my workflow?</Link>
            <Link href="/agent" className="atlas-text-link">Connect your agent <span>→</span></Link>
          </div>
        </div>
        <div className={home.heroVisual}><HeroVisual /></div>
      </section>

      <section className={`site-container ${home.section}`}>
        <div className={home.sectionHead}>
          <h2>Jev in one picture</h2>
          <p>Your code asks a narrow question about whatever state it has. Jev answers in one of three typed shapes.</p>
        </div>
        {video ? (
          <video className={home.video} controls playsInline preload="none" poster="/media/jev-in-60s-poster.jpg" aria-label="Jev in 60 seconds, an animated explainer">
            {video.map((source) => <source key={source.src} src={source.src} type={source.type} />)}
          </video>
        ) : null}
        <PrimitiveDiagrams />
      </section>

      <section className={`site-container ${home.section}`}>
        <div className={home.sectionHead}>
          <h2>The whole atlas on one map</h2>
          <p>{records.length} records, sorted by the question you came with. Follow a branch to the page behind it.</p>
        </div>
        <AtlasMindmap tree={buildMindmap(records)} />
      </section>

      <section className={`site-container ${home.section}`}>
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

      <section className={`site-container ${home.section}`}>
        <div className={home.fit}>
          <div>
            <h2>Will Jev fit your workflow?</h2>
            <p>Describe it in a sentence or two. The fit check names the decisions Jev could take, and the parts that should stay ordinary code.</p>
          </div>
          <Link href="/fit" className="home-cta-primary">Check a workflow <span aria-hidden="true">→</span></Link>
        </div>
      </section>

      <section className={`site-container ${home.section} ${home.agent}`}>
        <div className={home.sectionHead}>
          <h2>Don’t make your agent guess about Jev.</h2>
          <p>The records behind this site, with their evidence status and sources, over one public read-only MCP endpoint.</p>
          <Link href="/agent" className="atlas-text-link">See the full agent interface <span>→</span></Link>
        </div>
        <div>
          <ul className={home.tools}>
            {AGENT_TOOLS.map(([tool, note]) => <li key={tool}><code>{tool}</code><span>{note}</span></li>)}
          </ul>
          <CopyMcpConfig />
        </div>
      </section>

      <section className={`site-container ${home.section}`}>
        <dl className={home.corpus}>
          <div><dd>{analysis.dataset.totalPosts}</dd><dt>posts collected</dt></div>
          <div><dd>{analysis.dataset.retainedPosts}</dd><dt>kept as sources</dt></div>
          <div><dd>{analysis.claims.length}</dd><dt>claims tracked</dt></div>
          <div><dd>{analysis.ideas.length}</dd><dt>build blueprints</dt></div>
          <div><dd>${runSummary.estimatedSpendUsd.toFixed(2)}</dd><dt>estimated collection cost</dt></div>
        </dl>
        <div className={home.corpusFoot}>
          <p>A launch-period, English-only sample. A claim’s status is recorded per claim and never upgraded by repetition.</p>
          <Link href="/research/report" className="atlas-text-link">Read the full report <span>→</span></Link>
        </div>
      </section>

      <ResearchSearch items={searchItems} />
    </div>
  );
}
