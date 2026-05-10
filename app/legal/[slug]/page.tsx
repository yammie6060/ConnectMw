import { notFound } from "next/navigation";
import LegalDocumentPage from "@/components/LegalDocumentPage";
import { legalPages } from "@/lib/marketingContent";

export function generateStaticParams() {
  return Object.keys(legalPages).map((slug) => ({ slug }));
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  const content = legalPages[params.slug];

  if (!content) {
    notFound();
  }

  return <LegalDocumentPage content={content} slug={params.slug} />;
}
