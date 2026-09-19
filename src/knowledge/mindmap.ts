import { OPPORTUNITY_LENSES } from "./lenses";
import { canonicalPathFor, collectionPath } from "./paths";
import type { EvidenceStatus, KnowledgeRecord } from "./types";

/**
 * Routes that are pages rather than record collections, so `paths.ts` has no
 * entry for them. Every other href in the tree derives from `paths.ts`.
 */
const SITE_ROUTES = {
  map: "/map",
  fit: "/fit",
  guide: "/guide",
  cost: "/cost",
  agent: "/agent",
  library: "/library",
  llms: "/llms.txt",
  manifest: "/api/v1/manifest.json",
} as const;

/** Anchors on `/start` that the "What Jev is" leaves point at. */
export const START_ANCHORS = { isNot: "is-not", shape: "shape", primitives: "primitives" } as const;

/** Order in which evidence statuses are listed, strongest first. */
const STATUS_ORDER: EvidenceStatus[] = [
  "Official Documentation",
  "Demonstrated",
  "Observed",
  "Plausible",
  "Speculative",
  "Vendor Claim",
  "Disputed",
  "Authored Hypothesis",
  "Source Evidence",
];

export interface MindmapNode {
  id: string;
  label: string;
  /** Every node is a real link; a group links to the page that lists its members. */
  href: string;
  /** Evidence status, shown verbatim wherever the node is rendered. */
  status?: EvidenceStatus;
  /** Number of records the node stands for. Always derived, never authored. */
  count?: number;
  /** Whether the node starts expanded. */
  open?: boolean;
  children?: MindmapNode[];
}

function recordLeaf(record: KnowledgeRecord): MindmapNode {
  return { id: record.id, label: record.title, href: record.canonicalPath, status: record.status };
}

/** Groups records by evidence status so a status is never merged into another. */
function statusGroups(prefix: string, records: KnowledgeRecord[], href: string): MindmapNode[] {
  return STATUS_ORDER
    .map((status) => ({ status, members: records.filter((record) => record.status === status) }))
    .filter((group) => group.members.length > 0)
    .map(({ status, members }) => ({
      id: `${prefix}:${status.toLocaleLowerCase().replaceAll(" ", "-")}`,
      label: status,
      href,
      status,
      count: members.length,
      children: members.map(recordLeaf),
    }));
}

/**
 * The atlas as a tree, built from the knowledge layer. Counts come from the
 * records and hrefs from `paths.ts`, so the picture cannot drift from the index.
 */
export function buildMindmap(records: KnowledgeRecord[]): MindmapNode {
  const ofKind = (kind: KnowledgeRecord["kind"]) => records.filter((record) => record.kind === kind);
  const start = collectionPath("overview");
  const claims = ofKind("claim");
  const projects = ofKind("project");
  const opportunities = ofKind("opportunity");
  const documentRecord = (slug: string) => records.find((record) => record.id === `document:${slug}`);
  const parallel = documentRecord("mental-models");

  return {
    id: "root",
    label: "Jev Atlas",
    href: "/",
    open: true,
    children: [
      {
        id: "what",
        label: "What Jev is",
        href: start,
        open: true,
        children: [
          { id: "what:not-llm", label: "Not an LLM", href: `${start}#${START_ANCHORS.isNot}` },
          { id: "what:state", label: "State in, typed questions out", href: `${start}#${START_ANCHORS.shape}` },
          {
            id: "what:primitives",
            label: "Three question types",
            href: `${start}#${START_ANCHORS.primitives}`,
            open: true,
            children: ["Choice", "Score", "Noul"].map((name) => ({ id: `what:${name.toLocaleLowerCase()}`, label: name, href: `${start}#${START_ANCHORS.primitives}` })),
          },
          { id: "what:parallel", label: "Many questions in parallel", href: parallel?.canonicalPath ?? canonicalPathFor("document", "mental-models") },
          { id: "what:guide", label: "Ask Jev well", href: SITE_ROUTES.guide },
          { id: "what:library", label: "Research library", href: SITE_ROUTES.library, count: ofKind("document").length },
        ],
      },
      {
        id: "proven",
        label: "What's proven",
        href: collectionPath("claim"),
        count: claims.length,
        open: true,
        children: [
          ...statusGroups("proven", claims, collectionPath("claim")),
          { id: "proven:evidence", label: "Source Evidence", href: collectionPath("evidence"), status: "Source Evidence", count: ofKind("evidence").length },
        ],
      },
      {
        id: "built",
        label: "What people built",
        href: collectionPath("project"),
        count: projects.length,
        open: true,
        children: statusGroups("built", projects, collectionPath("project")),
      },
      {
        id: "build",
        label: "What you could build",
        href: SITE_ROUTES.map,
        count: opportunities.length,
        open: true,
        children: OPPORTUNITY_LENSES.map((lens) => {
          const members = opportunities.filter((record) => record.metadata.lens === lens.id);
          return { id: `lens:${lens.id}`, label: lens.title, href: `${SITE_ROUTES.map}#${lens.id}`, count: members.length, children: members.map(recordLeaf) };
        }),
      },
      {
        id: "fit",
        label: "Will it fit my workflow?",
        href: SITE_ROUTES.fit,
        open: true,
        children: [
          { id: "fit:check", label: "Check a workflow", href: SITE_ROUTES.fit },
          { id: "fit:patterns", label: "Architecture patterns", href: collectionPath("pattern"), count: ofKind("pattern").length },
          { id: "fit:cost", label: "What the decisions cost", href: SITE_ROUTES.cost },
        ],
      },
      {
        id: "agent",
        label: "For your agent",
        href: SITE_ROUTES.agent,
        open: true,
        children: [
          { id: "agent:mcp", label: "Connect over MCP", href: SITE_ROUTES.agent },
          { id: "agent:llms", label: "llms.txt", href: SITE_ROUTES.llms },
          { id: "agent:manifest", label: "JSON manifest", href: SITE_ROUTES.manifest, count: records.length },
        ],
      },
    ],
  };
}

export function flattenMindmap(node: MindmapNode): MindmapNode[] {
  return [node, ...(node.children ?? []).flatMap(flattenMindmap)];
}
