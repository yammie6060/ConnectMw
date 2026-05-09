import { useState } from 'react';
import { PageShell } from '../components/PageShell';
import { ChevronDown, Mail, Phone } from 'lucide-react';

interface HelpPageProps {
  color: string;
}

export function HelpPage({ color }: HelpPageProps) {
  const faqs = [
    { q: "How do I list a spare part?", a: "Go to 'Add Part' in the navigation and fill in the part details, photos, and price." },
    { q: "How do I respond to enquiries?", a: "Visit the Enquiries page to see all messages and reply directly from there." },
    { q: "How does payment work?", a: "ConnectMW facilitates connections. Payments are arranged between buyers and sellers directly." },
    { q: "Can I edit a listing?", a: "Yes — go to Inventory, find the listing, and tap the edit icon." },
  ];
  const [open, setOpen] = useState<number | null>(null);

  return (
    <PageShell title="Help & Support" subtitle="Find answers and get in touch" color={color}>
      <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-5 py-3 border-b border-white/5">
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#8ca5bc" }}>FAQ</h3>
        </div>
        {faqs.map((faq, i) => (
          <div key={i} className="border-b border-white/5 last:border-0">
            <button onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left gap-3">
              <span className="text-sm font-medium" style={{ color: "var(--text-primary, white)" }}>{faq.q}</span>
              <ChevronDown size={14} style={{ color: "#8ca5bc", transform: open === i ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>
            {open === i && (
              <div className="px-5 pb-4">
                <p className="text-sm" style={{ color: "#8ca5bc" }}>{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { icon: Mail, label: "Email Support", sub: "support@connectmw.com" },
          { icon: Phone, label: "Call Us", sub: "+265 983 933 510" },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="rounded-xl p-4 text-center" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Icon size={20} style={{ color, margin: "0 auto 8px" }} />
            <div className="text-sm font-semibold" style={{ color: "var(--text-primary, white)" }}>{label}</div>
            <div className="text-[11px] mt-0.5" style={{ color: "#8ca5bc" }}>{sub}</div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
