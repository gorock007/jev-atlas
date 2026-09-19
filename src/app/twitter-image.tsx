import { loadAnalysis } from "@/lib/research-data";
import { defaultSocialCardCopy, renderSocialCard, SOCIAL_CARD_CONTENT_TYPE, SOCIAL_CARD_SIZE } from "@/lib/social-card";

export const alt = "Jev Atlas · Independent field guide";
export const size = SOCIAL_CARD_SIZE;
export const contentType = SOCIAL_CARD_CONTENT_TYPE;

export default async function Image() {
  const analysis = await loadAnalysis();
  return renderSocialCard(defaultSocialCardCopy(analysis));
}
