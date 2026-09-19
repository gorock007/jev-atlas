import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DocumentReader } from "@/components/document-reader";
import { loadDocument, RESEARCH_DOCUMENTS } from "@/lib/research-data";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return RESEARCH_DOCUMENTS.map((document) => ({ slug: document.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const document = RESEARCH_DOCUMENTS.find((entry) => entry.slug === slug);
  if (!document) return {};
  return { title: document.title, description: document.description };
}

export default async function ResearchDocumentPage({ params }: Props) {
  const { slug } = await params;
  const document = await loadDocument(slug);
  if (!document) notFound();
  return <DocumentReader document={document} />;
}
