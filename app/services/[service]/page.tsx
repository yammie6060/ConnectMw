import { notFound } from "next/navigation";
import MarketingInfoPage from "@/components/MarketingInfoPage";
import { servicePages } from "@/lib/marketingContent";

export function generateStaticParams() {
  return Object.keys(servicePages).map((service) => ({ service }));
}

export default function ServicePage({ params }: { params: { service: string } }) {
  const content = servicePages[params.service];

  if (!content) {
    notFound();
  }

  return <MarketingInfoPage content={content} />;
}
