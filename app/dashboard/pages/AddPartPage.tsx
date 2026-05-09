import { useState } from 'react';
import { PageShell } from '../components/PageShell';
import { Upload, Check, PlusCircle } from 'lucide-react';

interface AddPartPageProps {
  color: string;
}

export function AddPartPage({ color }: AddPartPageProps) {
  const [form, setForm] = useState({ name: "", category: "", price: "", stock: "", desc: "" });
  const [saved, setSaved] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const fieldStyle = {
    background: "var(--bg-secondary, #132333)",
    border: "1px solid rgba(255,255,255,0.09)",
    color: "var(--text-primary, white)",
    borderRadius: "10px",
    padding: "10px 14px",
    width: "100%",
    fontSize: "14px",
    outline: "none",
  } as React.CSSProperties;

  const labelStyle = { display: "block", fontSize: "11px", fontWeight: 600, color: "#8ca5bc", marginBottom: 6, textTransform: "uppercase" as const, letterSpacing: "0.05em" };

  return (
    <PageShell title="Add New Part" subtitle="List a spare part for sale" color={color}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <label style={labelStyle}>Part Name</label>
            <input value={form.name} onChange={set("name")} placeholder="e.g. Toyota Hiace Side Mirror" style={fieldStyle} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Category</label>
              <select value={form.category} onChange={set("category")} style={fieldStyle}>
                <option value="">Select…</option>
                {["Engine","Exterior","Brakes","Lighting","Transmission","Electrical"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Price (MWK)</label>
              <input type="number" value={form.price} onChange={set("price")} placeholder="0" style={fieldStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Stock Quantity</label>
            <input type="number" value={form.stock} onChange={set("stock")} placeholder="0" style={fieldStyle} />
          </div>
          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.desc} onChange={set("desc")} rows={3} placeholder="Condition, compatibility, notes..."
              style={{ ...fieldStyle, resize: "none" }} />
          </div>
          <button
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: saved ? "#10b981" : color, color: "#0d1f2d" }}>
            {saved ? <><Check size={16} /> Part Listed!</> : <><PlusCircle size={16} /> List Part</>}
          </button>
        </div>

        <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary, white)" }}>Photos</h3>
          <div className="border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:border-opacity-80"
            style={{ borderColor: `${color}50` }}>
            <Upload size={24} style={{ color }} />
            <span className="text-sm font-medium" style={{ color: "#8ca5bc" }}>Upload photos</span>
            <span className="text-[11px]" style={{ color: "#8ca5bc" }}>PNG, JPG up to 5MB</span>
          </div>

          <div className="rounded-xl p-4" style={{ background: `${color}08`, border: `1px solid ${color}25` }}>
            <h4 className="text-xs font-bold mb-2" style={{ color }}>Tips for better listings</h4>
            {["Use clear, well-lit photos","Include part number & compatibility","Mention condition (new/used)","State your location for buyers"].map(tip => (
              <div key={tip} className="flex items-start gap-2 mb-1.5">
                <Check size={11} className="mt-0.5 flex-shrink-0" style={{ color: "#10b981" }} />
                <span className="text-[11px]" style={{ color: "#8ca5bc" }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
