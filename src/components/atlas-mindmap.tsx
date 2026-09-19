"use client";

import Link from "next/link";
import { useCallback, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { MindmapNode } from "@/knowledge/mindmap";
import styles from "./atlas-mindmap.module.css";

const ROW = 33;
const PAD_X = 28;
const PAD_Y = 34;
const GAP = 78;
const MAX_LABEL = 48;

interface PlacedNode {
  node: MindmapNode;
  depth: number;
  /** Index of the top-level branch the node belongs to; -1 for the root. */
  branch: number;
  x: number;
  y: number;
  end: number;
  open: boolean;
  parent: PlacedNode | null;
}

function shortLabel(label: string): string {
  return label.length > MAX_LABEL ? `${label.slice(0, MAX_LABEL - 1).trimEnd()}…` : label;
}

function hasChildren(node: MindmapNode): boolean {
  return Boolean(node.children?.length);
}

/** A group whose label is itself an evidence status does not repeat it. */
function statusSuffix(node: MindmapNode): string | null {
  return node.status && node.status !== node.label ? node.status : null;
}

/** Used for the server render and until the browser has measured the real text. */
function estimateWidth(node: MindmapNode, depth: number): number {
  if (depth === 0) return node.label.length * 12.4;
  const label = shortLabel(node.label).length * 7.2;
  const count = node.count === undefined ? 0 : 10 + String(node.count).length * 6.4;
  const status = statusSuffix(node);
  return label + count + (status ? 12 + status.length * 6.1 : 0);
}

function defaultExpanded(node: MindmapNode): string[] {
  return [...(node.open ? [node.id] : []), ...(node.children ?? []).flatMap(defaultExpanded)];
}

function expandableIds(node: MindmapNode): string[] {
  return hasChildren(node) ? [node.id, ...(node.children ?? []).flatMap(expandableIds)] : [];
}

function layoutTree(root: MindmapNode, expanded: Set<string>, widths: Record<string, number>) {
  const placed: PlacedNode[] = [];
  let row = 0;
  let width = 0;

  const place = (node: MindmapNode, x: number, depth: number, branch: number, parent: PlacedNode | null): PlacedNode => {
    const open = hasChildren(node) && expanded.has(node.id);
    const end = x + (widths[node.id] ?? estimateWidth(node, depth)) + (hasChildren(node) ? 16 : 4);
    const entry: PlacedNode = { node, depth, branch, x, y: 0, end, open, parent };
    placed.push(entry);
    width = Math.max(width, end);
    if (open) {
      const kids = (node.children ?? []).map((child, index) => place(child, end + GAP, depth + 1, depth === 0 ? index : branch, entry));
      entry.y = ((kids[0]?.y ?? 0) + (kids.at(-1)?.y ?? 0)) / 2;
    } else {
      entry.y = PAD_Y + row * ROW;
      row += 1;
    }
    return entry;
  };

  place(root, PAD_X, 0, -1, null);
  return { placed, width: Math.ceil(width + PAD_X + 8), height: PAD_Y + Math.max(row - 1, 0) * ROW + 26 };
}

function connector(from: PlacedNode, to: PlacedNode): string {
  const bend = (to.x - from.end) * 0.55;
  return `M${from.end} ${from.y}C${from.end + bend} ${from.y} ${to.x - bend} ${to.y} ${to.x} ${to.y}`;
}

function NodeList({ node, depth }: { node: MindmapNode; depth: number }) {
  const status = statusSuffix(node);
  const label = (
    <>
      <span className={node.status === node.label ? styles.listStatus : undefined}>{node.label}</span>
      {node.count === undefined ? null : <span className={styles.listCount}>{node.count}</span>}
      {status ? <span className={styles.listStatus}>{status}</span> : null}
    </>
  );
  if (!hasChildren(node)) return <li><Link href={node.href} className={styles.listLink}>{label}</Link></li>;
  return (
    <li>
      <details open={depth === 0}>
        <summary>{label}</summary>
        <ul>
          {depth === 0 ? null : <li><Link href={node.href} className={styles.listOpenAll}>Open the page</Link></li>}
          {(node.children ?? []).map((child) => <NodeList key={child.id} node={child} depth={depth + 1} />)}
        </ul>
      </details>
    </li>
  );
}

export function AtlasMindmap({ tree, title = "Map of the Jev Atlas" }: { tree: MindmapNode; title?: string }) {
  const initial = useMemo(() => defaultExpanded(tree), [tree]);
  const [expanded, setExpanded] = useState(() => new Set(initial));
  const [widths, setWidths] = useState<Record<string, number>>({});
  const labels = useRef(new Map<string, SVGTextElement>());

  const { placed, width, height } = useMemo(() => layoutTree(tree, expanded, widths), [tree, expanded, widths]);

  // Replace the character-count estimates with real text widths once they exist.
  useLayoutEffect(() => {
    const measured: Record<string, number> = {};
    for (const [id, element] of labels.current) {
      if (widths[id] !== undefined || !element.isConnected) continue;
      try {
        const length = element.getComputedTextLength();
        if (length > 0) measured[id] = Math.ceil(length);
      } catch {
        // Not rendered (the canvas is hidden under 640px), so the estimate stands.
      }
    }
    if (Object.keys(measured).length) setWidths((current) => ({ ...current, ...measured }));
  }, [placed, widths]);

  const toggle = useCallback((id: string) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }, []);

  const onToggleKey = (event: KeyboardEvent<SVGGElement>, id: string) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggle(id);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.toolbar}>
        <p>Open a circle to unfold a branch. Every label is a link.</p>
        <div>
          <button type="button" onClick={() => setExpanded(new Set(expandableIds(tree)))}>Unfold all</button>
          <button type="button" onClick={() => setExpanded(new Set(initial))}>Reset</button>
        </div>
      </div>

      <div className={styles.canvas} tabIndex={-1}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="group" aria-label={title}>
          {placed.map((entry) => (entry.parent ? <path key={`edge-${entry.node.id}`} d={connector(entry.parent, entry)} className={`${styles.edge} ${styles[`c${entry.branch}`] ?? ""}`} /> : null))}
          {placed.map((entry) => {
            const { node, depth } = entry;
            const tone = depth === 0 ? styles.root : styles[`c${entry.branch}`] ?? "";
            const status = statusSuffix(node);
            return (
              <g key={node.id} className={`${styles.node} ${tone}`}>
                <path d={`M${entry.x} ${entry.y}H${entry.end}`} className={styles.rule} />
                <Link href={node.href} className={styles.link} aria-label={[node.label, node.count === undefined ? "" : `${node.count} records`, status ?? ""].filter(Boolean).join(", ")}>
                  <text
                    x={entry.x}
                    y={entry.y - (depth === 0 ? 10 : 8)}
                    className={depth === 0 ? styles.rootLabel : depth === 1 ? styles.branchLabel : styles.label}
                    ref={(element) => {
                      if (element) labels.current.set(node.id, element);
                      else labels.current.delete(node.id);
                    }}
                  >
                    <tspan className={node.status === node.label ? styles.status : undefined}>{shortLabel(node.label)}</tspan>
                    {node.count === undefined ? null : <tspan dx="10" className={styles.count}>{node.count}</tspan>}
                    {status ? <tspan dx="12" className={styles.status}>{status}</tspan> : null}
                    {node.label.length > MAX_LABEL ? <title>{node.label}</title> : null}
                  </text>
                </Link>
                {hasChildren(node) ? (
                  <g
                    role="button"
                    tabIndex={0}
                    aria-expanded={entry.open}
                    aria-label={`${entry.open ? "Fold" : "Unfold"} ${node.label}`}
                    className={styles.toggle}
                    onClick={() => toggle(node.id)}
                    onKeyDown={(event) => onToggleKey(event, node.id)}
                  >
                    <circle cx={entry.end} cy={entry.y} r="13" className={styles.hit} />
                    <circle cx={entry.end} cy={entry.y} r="5.5" className={entry.open ? styles.knobOpen : styles.knob} />
                  </g>
                ) : null}
              </g>
            );
          })}
        </svg>
      </div>

      <nav className={styles.list} aria-label={title}>
        <ul><NodeList node={tree} depth={0} /></ul>
      </nav>
    </div>
  );
}
