import { isSafeHttpUrl } from "@/processing/links";

export function formatCategory(category: string): string {
  return category.toLocaleLowerCase().split("_").map((word) => word[0]?.toLocaleUpperCase() + word.slice(1)).join(" ");
}

/**
 * Guards every href built from collected third-party content. Returns undefined
 * for anything that is not http(s), so a hostile link in a post cannot become a
 * `javascript:` href on a public page.
 */
export function safeHref(value: string | null | undefined): string | undefined {
  return value && isSafeHttpUrl(value) ? value : undefined;
}

/** Allow the deliberately small set of destinations supported in research markdown. */
export function safeMarkdownHref(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  if (isSafeHttpUrl(value)) return value;
  if (value.startsWith("#")) return value;
  if (value.startsWith("/") && !value.startsWith("//") && !/[\\\u0000-\u001f\u007f]/u.test(value)) return value;
  try {
    return new URL(value).protocol === "mailto:" ? value : undefined;
  } catch {
    return undefined;
  }
}
