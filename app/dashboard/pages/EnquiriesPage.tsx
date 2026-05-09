import { useState } from 'react';
import { PageShell } from '../components/PageShell';
import { MessageSquare, Send } from 'lucide-react';

const ENQUIRIES = [
  { id: 1, from: "Mphatso Banda",   item: "Toyota Hiace Side Mirror",        msg: "Is this still available? I'm in Blantyre.", time: "2h ago",  status: "New",      avatar: "MB" },
  { id: 2, from: "Grace Phiri",     item: "Nissan Wingroad Brake Pads",       msg: "Can you deliver to Zomba? What's the price?", time: "5h ago",  status: "Replied",  avatar: "GP" },
  { id: 3, from: "James Chirwa",    item: "Toyota Vitz Headlight Assembly",   msg: "I'll take 2 units if price is negotiable.",   time: "1d ago",  status: "New",      avatar: "JC" },
  { id: 4, from: "Thandiwe Mwale",  item: "3-Bed House, Area 47",           msg: "When can I schedule a viewing?",              time: "3h ago",  status: "New",      avatar: "TM" },
  { id: 5, from: "Charles Nkhoma",  item: "2-Bed Flat, Limbe",                msg: "Is utilities included in the rent?",          time: "6h ago",  status: "Replied",  avatar: "CN" },
];

interface EnquiriesPageProps {
  color: string;
}

export function EnquiriesPage({ color }: EnquiriesPageProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [reply, setReply] = useState("");

  const statusColor = (s: string) => s === "New" ? "#f5ab20" : "#10b981";

  return (
    <PageShell title="Enquiries" subtitle="Respond to potential customers" color={color}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2.5">
          {ENQUIRIES.map(enq => (
            <div key={enq.id}
              onClick={() => setSelected(selected === enq.id ? null : enq.id)}
              className="rounded-xl p-4 cursor-pointer transition-all hover:-translate-y-0.5"
              style={{
                background: selected === enq.id ? `${color}10` : "var(--bg-secondary, #132333)",
                border: `1px solid ${selected === enq.id ? color + "50" : "rgba(255,255,255,0.07)"}`,
              }}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black flex-shrink-0"
                  style={{ background: `${color}20`, color }}>
                  {enq.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold" style={{ color: "var(--text-primary, white)" }}>{enq.from}</span>
                    <span className="text-[10px]" style={{ color: "#8ca5bc" }}>{enq.time}</span>
                  </div>
                  <div className="text-[11px] font-medium mb-1" style={{ color }}>{enq.item}</div>
                  <div className="text-[11px] truncate" style={{ color: "#8ca5bc" }}>{enq.msg}</div>
                </div>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: `${statusColor(enq.status)}20`, color: statusColor(enq.status) }}>
                  {enq.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl p-5" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          {selected ? (() => {
            const enq = ENQUIRIES.find(e => e.id === selected)!;
            return (
              <>
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
                    style={{ background: `${color}20`, color }}>
                    {enq.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: "var(--text-primary, white)" }}>{enq.from}</div>
                    <div className="text-[11px]" style={{ color: "#8ca5bc" }}>{enq.item}</div>
                  </div>
                </div>
                <div className="rounded-xl p-3 mb-4" style={{ background: "#1a2e42" }}>
                  <p className="text-sm" style={{ color: "#cde0f0" }}>{enq.msg}</p>
                  <div className="text-[10px] mt-2" style={{ color: "#8ca5bc" }}>{enq.time}</div>
                </div>
                <textarea
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  rows={3}
                  className="w-full rounded-xl p-3 text-sm resize-none outline-none mb-3"
                  style={{ background: "#1a2e42", border: "1px solid rgba(255,255,255,0.07)", color: "var(--text-primary, white)" }}
                />
                <button
                  onClick={() => { setReply(""); }}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                  style={{ background: color, color: "#0d1f2d" }}>
                  <Send size={14} /> Send Reply
                </button>
              </>
            );
          })() : (
            <div className="flex flex-col items-center justify-center h-full py-10 text-center">
              <MessageSquare size={32} style={{ color: "#8ca5bc", marginBottom: 12 }} />
              <p className="text-sm" style={{ color: "#8ca5bc" }}>Select an enquiry to reply</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}