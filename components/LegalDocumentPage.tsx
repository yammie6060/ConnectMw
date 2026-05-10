import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { footerLinkGroups, type MarketingPageContent } from "@/lib/marketingContent";

type LegalDocumentPageProps = {
  content: MarketingPageContent;
  slug: string;
};

const legalLinks = footerLinkGroups.find((group) => group.heading === "Legal")?.links ?? [];

export default function LegalDocumentPage({ content, slug }: LegalDocumentPageProps) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-[68px]" style={{ background: "#132333" }}>
        <section className="px-[6%] lg:px-[10%] py-12 lg:py-16">
          <div className="mx-auto max-w-[1180px]">
            <div
              className="rounded-2xl px-6 py-8 lg:px-10 lg:py-10 mb-8"
            >
              <p className="text-[0.72rem] font-semibold tracking-[2px] uppercase text-[#f5ab20] mb-3">
                ConnectMW Legal
              </p>
              <h1 className="text-[clamp(2rem,4vw,3.4rem)] font-black leading-[1.08] text-white">
                {content.title}
              </h1>
              <p className="mt-4 max-w-[760px] text-sm lg:text-base leading-[1.8] text-[#cde0f0]">
                {content.subtitle}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-xs text-[#8ca5bc]">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  Last updated: May 10, 2026
                </span>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                  Applies to ConnectMW users and providers
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8 items-start">
              <aside
                className="lg:sticky lg:top-[92px] rounded-2xl p-5"
                style={{
                  background: "#0d1f2d",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <p className="text-xs font-semibold uppercase tracking-[1.5px] text-[#f5ab20] mb-4">
                  Legal Pages
                </p>
                <nav className="flex flex-col gap-2">
                  {legalLinks.map((link) => {
                    const active = link.href.endsWith(slug);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`rounded-xl px-3 py-2.5 text-sm no-underline transition-all duration-200 ${
                          active ? "text-[#0d1f2d]" : "text-[#cde0f0] hover:text-[#f5ab20]"
                        }`}
                        style={{
                          background: active ? "#f5ab20" : "rgba(255,255,255,0.04)",
                          border: active
                            ? "1px solid rgba(245,171,32,0.7)"
                            : "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
              </aside>

              <article
                className="rounded-2xl p-6 lg:p-10"
                style={{
                  background: "#0d1f2d",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <div
                  className="rounded-xl p-5 mb-8"
                  style={{
                    background: "rgba(245,171,32,0.08)",
                    border: "1px solid rgba(245,171,32,0.16)",
                  }}
                >
                  <p className="text-sm leading-[1.8] text-[#cde0f0]">{content.intro}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                  {content.highlights.map((item) => (
                    <section
                      key={item.title}
                      className="rounded-xl p-4"
                      style={{
                        background: "#1a2e42",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <h2 className="text-sm font-bold text-white mb-1.5">{item.title}</h2>
                      <p className="text-xs leading-[1.7] text-[#8ca5bc]">{item.description}</p>
                    </section>
                  ))}
                </div>

                <div className="space-y-8">
                  {content.sections.map((section, index) => (
                    <section key={section.title} id={section.title.toLowerCase().replace(/\s+/g, "-")}>
                      <div className="flex items-start gap-4">
                        <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f5ab20] text-sm font-black text-[#0d1f2d]">
                          {index + 1}
                        </span>
                        <div>
                          <h2 className="text-xl font-bold text-white">{section.title}</h2>
                          <p className="mt-3 text-sm leading-[1.9] text-[#cde0f0]">{section.body}</p>
                          {section.points && (
                            <ul className="mt-4 space-y-2">
                              {section.points.map((point) => (
                                <li key={point} className="flex gap-3 text-sm leading-[1.7] text-[#8ca5bc]">
                                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f5ab20]" />
                                  <span>{point}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </section>
                  ))}
                </div>

                <div
                  className="mt-10 rounded-xl p-5 text-sm leading-[1.8] text-[#8ca5bc]"
                  style={{
                    background: "#1a2e42",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  Questions about {content.title.toLowerCase()}?{" "}
                  <Link href="/contact" className="font-semibold text-[#f5ab20] no-underline hover:underline">
                    Contact the ConnectMW team
                  </Link>
                  .
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
