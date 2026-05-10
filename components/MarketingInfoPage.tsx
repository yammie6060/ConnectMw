import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { MarketingPageContent } from "@/lib/marketingContent";

type MarketingInfoPageProps = {
  content: MarketingPageContent;
};

export default function MarketingInfoPage({ content }: MarketingInfoPageProps) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[68px]" style={{ background: "#132333" }}>
        <section className="px-[10%] py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center max-w-[1400px] mx-auto">
            <div>
              <p className="text-[0.75rem] font-semibold tracking-[2px] uppercase text-[#f5ab20] mb-3">
                {content.eyebrow}
              </p>
              <h1 className="text-[clamp(2rem,5vw,4.2rem)] font-black leading-[1.03] text-white max-w-[780px]">
                {content.title}
              </h1>
              <p className="text-[#cde0f0] text-base lg:text-lg leading-[1.7] mt-5 max-w-[680px]">
                {content.subtitle}
              </p>
              <p className="text-[#8ca5bc] text-sm leading-[1.8] mt-4 max-w-[680px]">
                {content.intro}
              </p>
              {(content.primaryCta || content.secondaryCta) && (
                <div className="flex flex-wrap gap-4 mt-8">
                  {content.primaryCta && (
                    <Link
                      href={content.primaryCta.href}
                      className="px-7 py-3 rounded-full text-sm font-bold text-[#0d1f2d] bg-[#f5ab20] no-underline transition-all duration-200 hover:bg-[#e8941a] hover:-translate-y-0.5"
                    >
                      {content.primaryCta.label}
                    </Link>
                  )}
                  {content.secondaryCta && (
                    <Link
                      href={content.secondaryCta.href}
                      className="px-7 py-3 rounded-full text-sm font-medium text-white border border-[rgba(255,255,255,0.25)] no-underline transition-all duration-200 hover:border-[#f5ab20] hover:text-[#f5ab20]"
                    >
                      {content.secondaryCta.label}
                    </Link>
                  )}
                </div>
              )}
            </div>

            <div
              className="rounded-2xl overflow-hidden min-h-[360px] lg:min-h-[500px]"
              style={{
                background: content.heroImage
                  ? `linear-gradient(180deg, rgba(13,31,45,0.12), rgba(13,31,45,0.78)), url(${content.heroImage}) center/cover`
                  : "linear-gradient(135deg,#1b4f6a,#1a2e42)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="h-full min-h-[360px] lg:min-h-[500px] flex items-end p-6 lg:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                  {content.highlights.map((item) => (
                    <div
                      key={item.title}
                      className="p-4 rounded-xl"
                      style={{
                        background: "rgba(13,31,45,0.78)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        backdropFilter: "blur(12px)",
                      }}
                    >
                      <h2 className="text-sm font-bold text-white mb-1">{item.title}</h2>
                      <p className="text-xs leading-[1.6] text-[#cde0f0]">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-[10%] pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1200px] mx-auto">
            {content.sections.map((section) => (
              <article
                key={section.title}
                className="rounded-2xl p-6 lg:p-8"
                style={{
                  background: "#1a2e42",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <h2 className="text-xl font-bold text-white mb-3">{section.title}</h2>
                <p className="text-sm leading-[1.8] text-[#cde0f0]">{section.body}</p>
                {section.points && (
                  <ul className="mt-5 space-y-3">
                    {section.points.map((point) => (
                      <li key={point} className="flex gap-3 text-sm text-[#8ca5bc]">
                        <span className="mt-1 h-2 w-2 rounded-full bg-[#f5ab20] flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
