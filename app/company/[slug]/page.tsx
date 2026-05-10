import { notFound } from "next/navigation";
import MarketingInfoPage from "@/components/MarketingInfoPage";
import { companyPages } from "@/lib/marketingContent";

export function generateStaticParams() {
  return Object.keys(companyPages).map((slug) => ({ slug }));
}

export default function CompanyPage({ params }: { params: { slug: string } }) {
  const content = companyPages[params.slug];

  if (!content) {
    notFound();
  }

  return <MarketingInfoPage content={content} />;
}
