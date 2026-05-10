import Navbar from "@/components/Navbar";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function ContactPage() {
  return (
    <>
      <Navbar />
      <main className="pt-[68px]" style={{ background: "#132333" }}>
        <Contact />
      </main>
      <Footer />
    </>
  );
}
