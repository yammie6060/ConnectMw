import { PageShell } from '../components/PageShell';
import { Plus } from 'lucide-react';

const PORTFOLIO_ITEMS = [
  { id: 1, title: "Knotless Braids",   category: "Hair",   price: "K15,000", },
  { id: 2, title: "Acrylic Nail Set",  category: "Nails",  price: "K8,000",   },
  { id: 3, title: "Bridal Makeup",     category: "Makeup", price: "K25,000",  },
  { id: 4, title: "Lash Extensions",   category: "Lashes", price: "K12,000", },
  { id: 5, title: "Hair Colour",       category: "Hair",   price: "K20,000",  },
  { id: 6, title: "Eyebrow Threading", category: "Beauty", price: "K3,000",  },
];

interface PortfolioPageProps {
  color: string;
}

export function PortfolioPage({ color }: PortfolioPageProps) {
  return (
    <PageShell title="Portfolio" subtitle="Showcase your work and services" color={color}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-2">
          {["All","Hair","Nails","Makeup"].map(cat => (
            <button key={cat} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{ background: cat === "All" ? color : "rgba(255,255,255,0.05)", color: cat === "All" ? "#0d1f2d" : "#8ca5bc" }}>
              {cat}
            </button>
          ))}
        </div>
        <button className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
          style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
          <Plus size={12} /> Add Service
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {PORTFOLIO_ITEMS.map(item => (
          <div key={item.id} className="rounded-xl overflow-hidden group transition-all hover:-translate-y-0.5"
            style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="h-28 flex items-center justify-center text-5xl"
              style={{ background: `${color}10` }}>
                {item.title.split(" ").map(w => w[0]).join("")}
            </div>
            <div className="p-3">
              <div className="text-sm font-semibold" style={{ color: "var(--text-primary, white)" }}>{item.title}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{item.category}</span>
                <span className="text-xs font-bold" style={{ color }}>{item.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}