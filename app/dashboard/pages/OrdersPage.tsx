import { PageShell } from '../components/PageShell';

interface OrdersPageProps {
  color: string;
}

export function OrdersPage({ color }: OrdersPageProps) {
  const orders = [
    { id: 1, title: "Toyota Vitz Side Mirror", seller: "AutoParts MW", status: "Quote Received", price: "K8,500", date: "May 7" },
    { id: 2, title: "Brake Pads – Nissan",    seller: "Sparks & Gears", status: "Pending",       price: "K6,200", date: "May 5" },
  ];
  
  return (
    <PageShell title="Orders" subtitle="Your spare part orders" color={color}>
      <div className="flex flex-col gap-3">
        {orders.map(o => (
          <div key={o.id} className="rounded-xl p-4" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold" style={{ color: "var(--text-primary, white)" }}>{o.title}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${color}18`, color }}>{o.status}</span>
            </div>
            <div className="text-[11px]" style={{ color: "#8ca5bc" }}>{o.seller} · {o.price} · {o.date}</div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}