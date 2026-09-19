import { ImageResponse } from "next/og";
import type { EvidenceStatus, KnowledgeKind } from "@/knowledge/types";
import type { ResearchAnalysis } from "@/types";

export const SOCIAL_CARD_SIZE = { width: 1200, height: 630 };
export const SOCIAL_CARD_CONTENT_TYPE = "image/png";

const PAPER = "#fffefb";
const INK = "#121212";
const ACCENT = "#d62f12";
const MUTED = "#65635f";
const RULE = "#d9d8d3";

const KIND_LABEL: Partial<Record<KnowledgeKind, string>> = {
  claim: "Evidence ledger",
  project: "Case study",
  pattern: "Architecture pattern",
  opportunity: "Build blueprint",
};

/** A very old Chrome UA makes Google Fonts serve .woff instead of .woff2, which satori can parse. */
const FONT_FETCH_UA =
  "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36";

async function fetchGoogleFont(family: string, weight: number): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}&display=swap`;
  const css = await fetch(cssUrl, { headers: { "User-Agent": FONT_FETCH_UA } }).then((res) => res.text());
  // Google returns one @font-face block per unicode-range subset; pick the block covering
  // basic Latin (U+0000-00FF) rather than the first one, which is often Cyrillic or Greek.
  const latinBlock = css.split("@font-face").find((block) => /unicode-range:\s*U\+0000-00FF/u.test(block));
  const fontUrl = latinBlock?.match(/src: url\(([^)]+)\) format\('(?:truetype|opentype|woff)'\)/u)?.[1];
  if (!fontUrl) throw new Error(`social-card: could not resolve a Latin font source for ${family} ${weight}`);
  const response = await fetch(fontUrl);
  return response.arrayBuffer();
}

let fontsPromise: Promise<Array<{ name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" }>> | null = null;

function loadSocialCardFonts() {
  fontsPromise ??= Promise.all([
    fetchGoogleFont("Source Serif 4", 700),
    fetchGoogleFont("IBM Plex Mono", 600),
  ]).then(([serif, mono]) => [
    { name: "Source Serif 4", data: serif, weight: 700 as const, style: "normal" as const },
    { name: "IBM Plex Mono", data: mono, weight: 700 as const, style: "normal" as const },
  ]);
  return fontsPromise;
}

/** Keeps long claim titles from overflowing the fixed-height card. */
export function truncateHeadline(text: string, max = 170): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1).trimEnd()}…`;
}

function headlineFontSize(text: string): number {
  if (text.length <= 40) return 72;
  if (text.length <= 70) return 58;
  if (text.length <= 110) return 46;
  return 38;
}

export interface SocialCardCopy {
  label: string;
  headline: string;
  footer: string;
}

export function defaultSocialCardCopy(analysis: ResearchAnalysis | null): SocialCardCopy {
  const ideaCount = analysis?.ideas.length ?? 31;
  const claimCount = analysis?.claims.length ?? 9;
  return {
    label: "JEV ATLAS · INDEPENDENT FIELD GUIDE",
    headline: "What can you actually build with Jev?",
    footer: `${ideaCount} build blueprints · ${claimCount} tracked claims · MCP for your coding agent`,
  };
}

export function recordSocialCardCopy(record: { kind: KnowledgeKind; title: string; status: EvidenceStatus }): SocialCardCopy {
  const kindLabel = KIND_LABEL[record.kind] ?? "Atlas record";
  return {
    label: `${kindLabel.toUpperCase()} · ${record.status.toUpperCase()}`,
    headline: truncateHeadline(record.title),
    footer: "JEV ATLAS · INDEPENDENT FIELD GUIDE",
  };
}

export async function renderSocialCard(copy: SocialCardCopy): Promise<ImageResponse> {
  const fonts = await loadSocialCardFonts();
  const headline = truncateHeadline(copy.headline);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          padding: "56px 64px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
            <span style={{ fontFamily: "Source Serif 4", fontSize: 44, color: ACCENT, lineHeight: 1 }}>J</span>
            <span style={{ fontFamily: "IBM Plex Mono", fontSize: 15, letterSpacing: 3, color: INK }}>JEV ATLAS</span>
          </div>
          <span
            style={{
              fontFamily: "IBM Plex Mono",
              fontSize: 13,
              letterSpacing: 2,
              color: ACCENT,
              textAlign: "right",
              maxWidth: 560,
            }}
          >
            {copy.label}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            flexGrow: 1,
            alignItems: "center",
            maxHeight: 340,
            overflow: "hidden",
          }}
        >
          <span
            style={{
              fontFamily: "Source Serif 4",
              fontSize: headlineFontSize(headline),
              lineHeight: 1.08,
              letterSpacing: -1,
              color: INK,
            }}
          >
            {headline}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", borderTop: `1px solid ${RULE}`, paddingTop: 22 }}>
          <span style={{ fontFamily: "IBM Plex Mono", fontSize: 14, letterSpacing: 1.5, color: MUTED }}>
            {copy.footer}
          </span>
        </div>
      </div>
    ),
    { ...SOCIAL_CARD_SIZE, fonts },
  );
}
