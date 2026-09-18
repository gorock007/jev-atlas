export function formatCategory(category: string): string {
  return category.toLocaleLowerCase().split("_").map((word) => word[0]?.toLocaleUpperCase() + word.slice(1)).join(" ");
}
