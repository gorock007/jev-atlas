const URL_PATTERN = /https?:\/\/[^\s<>"')\]]+/giu;

/**
 * Entity URLs come from the API response rather than our own regex, so they are
 * checked too. Everything here is eventually rendered as an href on a public
 * page; only http(s) may reach that point.
 */
export function isSafeHttpUrl(value: string): boolean {
  try {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

export function extractLinks(text: string, entityUrls: string[] = []): string[] {
  const textUrls = text.match(URL_PATTERN) ?? [];
  return [...new Set([...entityUrls, ...textUrls].map((url) => url.replace(/[.,!?;:]+$/u, "")))].filter(isSafeHttpUrl);
}

export function projectLinks(links: string[]): string[] {
  return links.filter((link) => /github\.com|gitlab\.com|codeberg\.org|demo|\.dev\b|\.app\b/iu.test(link));
}
