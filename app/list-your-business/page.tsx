import MarketingInfoPage from "@/components/MarketingInfoPage";
import { standalonePages } from "@/lib/marketingContent";

export default function ListYourBusinessPage() {
  return <MarketingInfoPage content={standalonePages["list-your-business"]} />;
}
