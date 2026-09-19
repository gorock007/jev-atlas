import { recordBySlug, recordSlugs } from "@/lib/atlas";
import { defaultSocialCardCopy, recordSocialCardCopy, renderSocialCard, SOCIAL_CARD_CONTENT_TYPE, SOCIAL_CARD_SIZE } from "@/lib/social-card";
import { loadAnalysis } from "@/lib/research-data";

export const alt = "Jev Atlas · Architecture pattern";
export const size = SOCIAL_CARD_SIZE;
export const contentType = SOCIAL_CARD_CONTENT_TYPE;

export async function generateStaticParams() {
  return recordSlugs("pattern");
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const record = await recordBySlug("pattern", slug);
  if (!record) return renderSocialCard(defaultSocialCardCopy(await loadAnalysis()));
  return renderSocialCard(recordSocialCardCopy(record));
}
