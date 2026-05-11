import { useState } from 'react';
import { PageShell } from '../components/PageShell';
import { Upload, Check, Home, MapPin } from 'lucide-react';

interface AddPropertyPageProps {
  color: string;
}

export function AddPropertyPage({ color }: AddPropertyPageProps) {
  const [form, setForm] = useState({
    title: "",
    type: "",
    rent: "",
    location: "",
    bedrooms: "",
    status: "Available",
    desc: "",
  });
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

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    fontWeight: 600,
    color: "#8ca5bc",
    marginBottom: 6,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
  };

  return (
    <PageShell title="Add Property" subtitle="List a house, apartment, hostel, or room for rent" color={color}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <label style={labelStyle}>Property Title</label>
            <input value={form.title} onChange={set("title")} placeholder="e.g. 2-Bed Flat, Area 47" style={fieldStyle} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Property Type</label>
              <select value={form.type} onChange={set("type")} style={fieldStyle}>
                <option value="">Select...</option>
                {["House", "Apartment", "Flat", "Hostel", "Room", "Office Space", "Shop"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Monthly Rent (MWK)</label>
              <input type="number" value={form.rent} onChange={set("rent")} placeholder="0" style={fieldStyle} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label style={labelStyle}>Location</label>
              <input value={form.location} onChange={set("location")} placeholder="e.g. Area 47, Lilongwe" style={fieldStyle} />
            </div>
            <div>
              <label style={labelStyle}>Bedrooms / Units</label>
              <input value={form.bedrooms} onChange={set("bedrooms")} placeholder="e.g. 2 bedrooms" style={fieldStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Availability</label>
            <select value={form.status} onChange={set("status")} style={fieldStyle}>
              {["Available", "Occupied", "Coming Soon"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.desc} onChange={set("desc")} rows={3} placeholder="Amenities, lease terms, viewing times..."
              style={{ ...fieldStyle, resize: "none" }} />
          </div>

          <button
            onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2500); }}
            className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ background: saved ? "#10b981" : color, color: "#0d1f2d" }}>
            {saved ? <><Check size={16} /> Property Listed!</> : <><Home size={16} /> List Property</>}
          </button>
        </div>

        <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h3 className="text-sm font-bold" style={{ color: "var(--text-primary, white)" }}>Property Photos</h3>
          <div className="border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all hover:border-opacity-80"
            style={{ borderColor: `${color}50` }}>
            <Upload size={24} style={{ color }} />
            <span className="text-sm font-medium" style={{ color: "#8ca5bc" }}>Upload property photos</span>
            <span className="text-[11px]" style={{ color: "#8ca5bc" }}>Front view, rooms, bathroom, kitchen, outside area</span>
          </div>

          <div className="rounded-xl p-4" style={{ background: `${color}08`, border: `1px solid ${color}25` }}>
            <h4 className="text-xs font-bold mb-2" style={{ color }}>Tips for better property listings</h4>
            {["Use bright photos of every room", "Add the exact area and nearby landmarks", "State rent, deposit, and utility terms", "Mark availability correctly"].map(tip => (
              <div key={tip} className="flex items-start gap-2 mb-1.5">
                <MapPin size={11} className="mt-0.5 flex-shrink-0" style={{ color: "#10b981" }} />
                <span className="text-[11px]" style={{ color: "#8ca5bc" }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
