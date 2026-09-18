const CLAIM_SIGNAL = /\b(?:is|are|uses?|returns?|costs?|priced?|latency|faster|cheaper|built|launched|supports?|trained|calibrat|benchmark|cannot|can't|does not|doesn't)\b/iu;

export function extractKeyClaims(text: string): string[] {
  const normalized = text.replace(/https?:\/\/\S+/giu, " ").replace(/\s+/gu, " ").trim();
  if (!normalized) return [];
  const candidates = normalized
    .split(/(?<=[.!?])\s+|\s+[—–]\s+|\n+/u)
    .map((part) => part.trim())
    .filter((part) => part.length >= 24 && CLAIM_SIGNAL.test(part));
  return [...new Set(candidates)].slice(0, 4);
}
