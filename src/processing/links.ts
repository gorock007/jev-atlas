const URL_PATTERN = /https?:\/\/[^\s<>"')\]]+/giu;

export function extractLinks(text: string, entityUrls: string[] = []): string[] {
  const textUrls = text.match(URL_PATTERN) ?? [];
  return [...new Set([...entityUrls, ...textUrls].map((url) => url.replace(/[.,!?;:]+$/u, "")))];
}

export function projectLinks(links: string[]): string[] {
  return links.filter((link) => /github\.com|gitlab\.com|codeberg\.org|demo|\.dev\b|\.app\b/iu.test(link));
}
