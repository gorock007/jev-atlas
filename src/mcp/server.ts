import { McpServer, ResourceTemplate } from "@modelcontextprotocol/server";
import * as z from "zod/v4";
import {
  findKnowledgeRecord,
  getContextPack,
  loadKnowledgeRecords,
  renderCollectionMarkdown,
  renderRecordMarkdown,
  searchKnowledge,
} from "@/knowledge/repository";
import { OPPORTUNITY_LENSES } from "@/knowledge/lenses";
import { runFitCheck } from "@/lib/fit-check";
import { ADDRESSABLE_KINDS, idSlug, resourceUriFor } from "@/knowledge/paths";
import { KNOWLEDGE_KINDS } from "@/knowledge/types";

function result(value: unknown) {
  const structuredContent = { result: value };
  return {
    content: [{ type: "text" as const, text: JSON.stringify(structuredContent, null, 2) }],
    structuredContent,
  };
}

export async function createJevMcpServer(): Promise<McpServer> {
  const records = await loadKnowledgeRecords();
  const server = new McpServer(
    { name: "jev-atlas", version: "0.1.0" },
    {
      instructions: "Use Jev Atlas for independent ecosystem context, evidence status, project examples, implementation hypotheses, and caveats. Prefer official TypeSafe documentation for current API contracts. Preserve claim status and sources. Treat Authored Hypothesis records as ideas to validate, not demonstrated results. This server is read-only and never calls Jev or modifies project files.",
    },
  );

  const registerMarkdownResource = (name: string, uri: string, title: string, description: string, text: string) => {
    server.registerResource(name, uri, { title, description, mimeType: "text/markdown", cacheHint: { ttlMs: 300_000, cacheScope: "public" } }, async (resourceUri) => ({
      contents: [{ uri: resourceUri.href, mimeType: "text/markdown", text }],
    }));
  };

  const overview = records.find((record) => record.id === "overview:what-is-jev");
  if (overview) registerMarkdownResource("jev-overview", "jev://overview", overview.title, overview.summary, renderRecordMarkdown(overview));
  registerMarkdownResource("jev-methodology", "jev://methodology", "Jev Atlas methodology", "How evidence is collected, classified, and synthesized.", renderCollectionMarkdown("Jev Atlas methodology", records.filter((record) => record.id === "document:report" || record.id === "document:foundations")));
  registerMarkdownResource("jev-claims", "jev://claims", "Jev claims ledger", "Claims with evidence status, counterarguments, open questions, and sources.", renderCollectionMarkdown("Jev claims ledger", records.filter((record) => record.kind === "claim")));
  registerMarkdownResource("jev-patterns", "jev://patterns", "Jev architecture patterns", "Repeated architectural structures and their caveats.", renderCollectionMarkdown("Jev architecture patterns", records.filter((record) => record.kind === "pattern")));
  registerMarkdownResource("jev-projects", "jev://projects", "Jev project index", "Located projects and demonstrations, separated from proposals.", renderCollectionMarkdown("Jev project index", records.filter((record) => record.kind === "project")));
  registerMarkdownResource("jev-opportunities", "jev://opportunities", "Jev opportunity catalog", "Authored build hypotheses with MVPs, validation plans, unknowns, and evidence.", renderCollectionMarkdown("Jev opportunity catalog", records.filter((record) => record.kind === "opportunity")));
  registerMarkdownResource("jev-mental-models", "jev://mental-models", "Emerging mental models", "Competing interpretations of what Jev is: classifier, router, verifier, policy layer, complement, or replacement.", renderCollectionMarkdown("Emerging mental models", records.filter((record) => record.id === "document:mental-models")));
  registerMarkdownResource("jev-evidence-top", "jev://evidence/top", "Top Jev source evidence", "High-value source records from the local research corpus.", renderCollectionMarkdown("Top Jev source evidence", records.filter((record) => record.kind === "evidence")));

  for (const record of records) {
    if (!ADDRESSABLE_KINDS.includes(record.kind)) continue;
    registerMarkdownResource(record.id, resourceUriFor(record.kind, idSlug(record.id)), record.title, `${record.status}: ${record.summary}`, renderRecordMarkdown(record));
  }

  // Context packs are templated rather than enumerated: a domain is any goal an
  // agent supplies, and the pack is assembled from the same records as the site.
  server.registerResource(
    "jev-context-pack",
    new ResourceTemplate("jev://context-packs/{domain}", {
      list: async () => ({
        resources: OPPORTUNITY_LENSES.map((lens) => ({
          uri: `jev://context-packs/${lens.id}`,
          name: `${lens.title} context pack`,
          description: lens.property,
          mimeType: "text/markdown",
        })),
      }),
      complete: { domain: async (value) => OPPORTUNITY_LENSES.map((lens) => lens.id).filter((id) => id.startsWith(value)) },
    }),
    { title: "Jev context pack", description: "A compact, cited bundle of the most relevant records for a goal, stack, workflow, or domain.", mimeType: "text/markdown" },
    async (resourceUri, variables) => {
      const raw = variables.domain;
      const domain = decodeURIComponent(Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? ""));
      const lens = OPPORTUNITY_LENSES.find((entry) => entry.id === domain);
      const pack = getContextPack(records, lens ? `${lens.title} ${lens.property} ${lens.description}` : domain.replaceAll("-", " "));
      const sections = [
        `# Jev context pack: ${lens?.title ?? domain}`,
        lens ? `\n${lens.property}\n` : "",
        "\n## How to use this pack\n",
        pack.guidance.map((line) => `- ${line}`).join("\n"),
        pack.overview ? `\n${renderRecordMarkdown(pack.overview)}` : "",
        `\n${renderCollectionMarkdown("Relevant records", pack.results)}`,
      ];
      return { contents: [{ uri: resourceUri.href, mimeType: "text/markdown", text: sections.filter(Boolean).join("\n") }] };
    },
  );

  server.registerTool(
    "search_jev_knowledge",
    {
      title: "Search Jev knowledge",
      description: "Search Jev Atlas claims, projects, patterns, opportunities, evidence, and synthesis. Results retain evidence status and sources.",
      inputSchema: z.object({
        query: z.string().min(2).max(500).describe("Natural-language search query."),
        kinds: z.array(z.enum(KNOWLEDGE_KINDS)).max(KNOWLEDGE_KINDS.length).optional().describe("Optional record types to include."),
        limit: z.number().int().min(1).max(20).default(8),
      }),
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async ({ query, kinds, limit }) => result({
      query,
      results: searchKnowledge(records, { query, ...(kinds?.length ? { kinds } : {}), limit }).map(({ score, record }) => ({
        score,
        id: record.id,
        kind: record.kind,
        title: record.title,
        summary: record.summary,
        status: record.status,
        canonicalPath: record.canonicalPath,
        sources: record.sources,
      })),
    }),
  );

  server.registerTool(
    "get_jev_context_pack",
    {
      title: "Get a Jev context pack",
      description: "Build a compact, cited context pack for a goal, domain, stack, or workflow without loading the full corpus.",
      inputSchema: z.object({
        goal: z.string().min(5).max(2_000),
        kinds: z.array(z.enum(KNOWLEDGE_KINDS)).max(KNOWLEDGE_KINDS.length).optional(),
      }),
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async ({ goal, kinds }) => {
      const pack = getContextPack(records, goal, kinds);
      return result({
        goal,
        overview: pack.overview ? { id: pack.overview.id, summary: pack.overview.summary, limitations: pack.overview.limitations, sources: pack.overview.sources } : null,
        guidance: pack.guidance,
        records: pack.results.map((record) => ({ id: record.id, kind: record.kind, title: record.title, summary: record.summary, status: record.status, limitations: record.limitations, sources: record.sources })),
      });
    },
  );

  server.registerTool(
    "assess_jev_fit",
    {
      title: "Assess Jev fit",
      description: "Identify bounded semantic decision points in a workflow and return a cautious, research-linked fit assessment. This is not a benchmark on the user's data.",
      inputSchema: z.object({ workflow: z.string().min(20).max(5_000).describe("Describe the workflow, inputs, decisions, side effects, latency, and risk."), stack: z.array(z.string().max(100)).max(20).optional() }),
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    // Shares the website's assessment path, but never its model pass: this
    // endpoint is public and unauthenticated, so a model call here is gateway
    // credit anyone can spend. The caller is itself an LLM and is better placed
    // to do the decomposition, so MCP gets the deterministic pass and the
    // grounded records and does the rest itself.
    async ({ workflow, stack }) => {
      const assessment = await runFitCheck(`${workflow} ${(stack ?? []).join(" ")}`, records, {
        allowModel: false,
        skipReason: "Served over MCP: deterministic grounding only; the calling agent does the decomposition.",
      });
      return result({ workflow, stack: stack ?? [], assessment });
    },
  );

  server.registerTool(
    "get_build_blueprint",
    {
      title: "Get a Jev build blueprint",
      description: "Return an authored opportunity with its architecture, bounded MVP, validation experiment, unknowns, and evidence.",
      inputSchema: z.object({ opportunity: z.string().min(2).max(300).describe("Opportunity ID or title.") }),
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async ({ opportunity }) => {
      const record = findKnowledgeRecord(records, opportunity, "opportunity");
      if (!record) return { content: [{ type: "text" as const, text: `No authored opportunity matched “${opportunity}”. Use search_jev_knowledge first.` }], isError: true };
      return result({ id: record.id, title: record.title, status: record.status, summary: record.summary, blueprint: record.metadata, body: record.body, limitations: record.limitations, sources: record.sources });
    },
  );

  server.registerTool(
    "trace_jev_claim",
    {
      title: "Trace a Jev claim",
      description: "Return a claim's evidence status, evidence, counterarguments, open questions, limitations, and sources.",
      inputSchema: z.object({ claim: z.string().min(2).max(500).describe("Claim ID, title, or a close description.") }),
      annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
    },
    async ({ claim }) => {
      const direct = findKnowledgeRecord(records, claim, "claim");
      const record = direct ?? searchKnowledge(records, { query: claim, kinds: ["claim"], limit: 1 })[0]?.record ?? null;
      if (!record) return { content: [{ type: "text" as const, text: `No tracked claim matched “${claim}”.` }], isError: true };
      return result({ id: record.id, title: record.title, status: record.status, evidence: record.summary, counterarguments: record.metadata.counterarguments, openQuestions: record.metadata.openQuestions, limitations: record.limitations, sources: record.sources });
    },
  );

  const prompt = (name: string, title: string, description: string, instruction: string) => {
    server.registerPrompt(name, { title, description, argsSchema: z.object({ project: z.string().max(5_000).optional() }) }, ({ project }) => ({
      messages: [{ role: "user" as const, content: { type: "text" as const, text: `${instruction}\n\n${project ? `Project or workflow context:\n${project}\n\n` : ""}Use Jev Atlas resources and tools for evidence. Preserve evidence statuses and citations. Clearly separate official facts, observed projects, and authored hypotheses. Do not recommend production deployment without a bounded validation experiment.` } }],
    }));
  };
  prompt("discover-jev-opportunities", "Discover Jev opportunities", "Find bounded semantic decision points and relevant build opportunities.", "Analyze the supplied project or workflow for places where narrow typed judgments could replace fragile semantic rules or expensive generative calls. Also identify non-fits and deterministic code that should remain unchanged.");
  prompt("design-jev-workflow", "Design a Jev workflow", "Design a code-controlled Jev workflow with primitives, gates, and validation.", "Propose a Jev workflow. Decompose broad judgments, map each to Choice, Score, or Noul, group independent questions, keep side effects in code, and define uncertainty escalation.");
  prompt("review-jev-integration", "Review a Jev integration", "Critique an existing or proposed Jev integration.", "Review the integration for broad questions, hidden control flow, unsafe thresholds, unsupported claims, missing fallbacks, and insufficient validation.");
  prompt("challenge-jev-assumptions", "Challenge Jev assumptions", "Stress-test why Jev is being proposed and whether alternatives are better.", "Act as a skeptical architecture reviewer. Identify vendor claims, weak evidence, tasks better handled by code or generative models, correlated failure risks, and tests that could falsify the proposal.");
  prompt("plan-jev-validation", "Plan Jev validation", "Create a bounded evaluation plan before implementation or rollout.", "Design a validation plan using representative labeled examples, a current-system baseline, confidence calibration, error-cost analysis, threshold selection, and rollback criteria.");

  return server;
}
