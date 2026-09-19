import type { MetadataRoute } from "next";
import { ADDRESSABLE_KINDS } from "@/knowledge/paths";
import { atlasRecords } from "@/lib/atlas";
import { RESEARCH_DOCUMENTS } from "@/lib/research-data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/u, "") ?? "http://localhost:3000";
  const routes = ["", "/start", "/fit", "/claims", "/projects", "/patterns", "/ideas", "/map", "/evidence", "/library", "/agent"];
  const records = (await atlasRecords()).filter((record) => ADDRESSABLE_KINDS.includes(record.kind));
  return [
    ...routes.map((route) => ({ url: `${baseUrl}${route}`, changeFrequency: "weekly" as const, priority: route === "" ? 1 : .8 })),
    ...RESEARCH_DOCUMENTS.map((document) => ({ url: `${baseUrl}/research/${document.slug}`, changeFrequency: "monthly" as const, priority: .65 })),
    ...records.map((record) => ({ url: `${baseUrl}${record.canonicalPath}`, changeFrequency: "monthly" as const, priority: .6 })),
  ];
}
