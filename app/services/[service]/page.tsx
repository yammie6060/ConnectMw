import { notFound } from "next/navigation";
import MarketingInfoPage from "@/components/MarketingInfoPage";
import { servicePages } from "@/lib/marketingContent";

export function generateStaticParams() {
  return Object.keys(servicePages).map((service) => ({ service }));
}

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  const content = servicePages[service];

  if (!content) {
    notFound();
  }

  return <MarketingInfoPage content={content} />;
}
