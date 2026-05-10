import MarketingInfoPage from "@/components/MarketingInfoPage";
import { standalonePages } from "@/lib/marketingContent";

export default function AboutPage() {
  return <MarketingInfoPage content={standalonePages.about} />;
}
