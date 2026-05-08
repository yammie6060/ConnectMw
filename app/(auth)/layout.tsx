import Footer from "@/components/Footer";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0d1f2d" }}
    >
      {/* Auth navbar */}
      <header className="flex items-center justify-between px-[6%] h-[68px] border-b border-[rgba(245,166,35,0.12)]">
        <Link
          href="/"
          className="font-black text-[1.25rem] text-white no-underline"
          style={{ fontFamily: " sans-serif" }}
        >
          Connect<span style={{ color: "#f5ab20" }}>MW</span>
        </Link>
      </header>

      {/* Page content */}
      <main className="flex-1 flex items-center justify-center px-4 py-6">
        {children}
      </main>

      <Footer />
    </div>
  );
}
