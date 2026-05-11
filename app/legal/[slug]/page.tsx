import { notFound } from "next/navigation";
import LegalDocumentPage from "@/components/LegalDocumentPage";
import { legalPages } from "@/lib/marketingContent";

export function generateStaticParams() {
  return Object.keys(legalPages).map((slug) => ({ slug }));
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = legalPages[slug];

  if (!content) {
    notFound();
  }

  return <LegalDocumentPage content={content} slug={slug} />;
}