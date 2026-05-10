import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0d1f2d" }}
    >
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 pb-10 pt-[92px]">
        {children}
      </main>

      <Footer />
    </div>
  );
}
