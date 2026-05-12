import { notFound } from "next/navigation";
import MarketingInfoPage from "@/components/MarketingInfoPage";
import { companyPages } from "@/lib/marketingContent";

export function generateStaticParams() {
  return Object.keys(companyPages).map((slug) => ({ slug }));
}

export default async function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const content = companyPages[slug];

  if (!content) {
    notFound();
  }

  return <MarketingInfoPage content={content} />;
}
