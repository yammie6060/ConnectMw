import { useState } from 'react';
import { PageShell } from '../components/PageShell';
import { Search, Filter, Plus, Package, Edit2, Trash2 } from 'lucide-react';

const INVENTORY_ITEMS = [
  { id: 1, name: "Toyota Hiace Side Mirror (Right)", sku: "TH-SM-001", price: "K8,500", stock: 4, category: "Exterior", status: "In Stock", views: 34 },
  { id: 2, name: "Nissan Wingroad Brake Pads (Rear)", sku: "NW-BP-002", price: "K6,200", stock: 1, category: "Brakes", status: "Low Stock", views: 21 },
  { id: 3, name: "Mazda Familia Oil Filter", sku: "MF-OF-003", price: "K1,800", stock: 0, category: "Engine", status: "Out of Stock", views: 15 },
  { id: 4, name: "Toyota Vitz Headlight Assembly", sku: "TV-HL-004", price: "K22,000", stock: 2, category: "Lighting", status: "In Stock", views: 67 },
  { id: 5, name: "Suzuki Alto Clutch Plate", sku: "SA-CP-005", price: "K9,400", stock: 3, category: "Transmission", status: "In Stock", views: 29 },
];

const LANDLORD_LISTINGS = [
  { id: 1, title: "3-Bed House, Kabulonga", type: "House", rent: "K180,000/mo", status: "Available", enquiries: 2, views: 45 },
  { id: 2, title: "Studio Apt, Area 3",     type: "Apartment", rent: "K65,000/mo", status: "Occupied", enquiries: 0, views: 12 },
  { id: 3, title: "Student Hostel, Chichiri", type: "Hostel", rent: "K30,000/mo", status: "Available", enquiries: 1, views: 38 },
  { id: 4, title: "2-Bed Flat, Limbe",    type: "Flat",  rent: "K120,000/mo", status: "Available", enquiries: 3, views: 61 },
];

interface InventoryPageProps {
  color: string;
  role: string;
}

export function InventoryPage({ color, role }: InventoryPageProps) {
  const [search, setSearch] = useState("");
  const items = role === "landlord" ? LANDLORD_LISTINGS : INVENTORY_ITEMS;
  const title = role === "landlord" ? "My Listings" : "Inventory";
  const sub = role === "landlord" ? "All your property listings" : "Manage your spare parts stock";

  const statusColor = (s: string) =>
    s === "In Stock" || s === "Available" ? "#10b981"
    : s === "Low Stock" ? "#f5ab20"
    : s === "Occupied" ? "#8ca5bc"
    : "#ef4444";

  return (
    <PageShell title={title} subtitle={sub} color={color}>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <Search size={14} style={{ color: "#8ca5bc" }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: "var(--text-primary, white)" }}
          />
        </div>
        <button className="px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold" style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>
          <Filter size={13} /> Filter
        </button>
        <button className="px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold" style={{ background: color, color: "#0d1f2d" }}>
          <Plus size={13} /> Add
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {(items as any[])
          .filter(i => (i.name || i.title || "").toLowerCase().includes(search.toLowerCase()))
          .map(item => (
          <div key={item.id} className="rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 transition-all hover:-translate-y-0.5"
            style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
              <Package size={15} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: "var(--text-primary, white)" }}>
                {item.name || item.title}
              </div>
              <div className="text-[11px] mt-0.5" style={{ color: "#8ca5bc" }}>
                {item.sku || item.type} · {item.price || item.rent} · {item.views} views
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${statusColor(item.status)}20`, color: statusColor(item.status), border: `1px solid ${statusColor(item.status)}40` }}>
                {item.status}
              </span>
              <button className="text-[#8ca5bc] hover:text-white transition-colors"><Edit2 size={13} /></button>
              <button className="text-[#8ca5bc] hover:text-[#ef4444] transition-colors"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
