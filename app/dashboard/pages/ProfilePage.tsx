import { useState } from 'react';
import { PageShell } from '../components/PageShell';
import { Camera, MapPin, Edit2, Mail, Phone, Briefcase, Save, Star } from 'lucide-react';

interface ProfilePageProps {
  color: string;
  user: any;
  meta: any;
}

export function ProfilePage({ color, user, meta }: ProfilePageProps) {
  const RoleIcon = meta.icon;
  const businessName = user.businessName || user.companyName || user.garageName || "";
  const [editMode, setEditMode] = useState(false);
  const [profile, setProfile] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    businessName,
    email: user.email || "",
    phone: "+265 999 123 456",
    location: "Lilongwe, Malawi",
    bio: "Quality spare parts seller based in Lilongwe, Malawi. Specialising in Japanese car parts.",
  });

  const setField = (key: keyof typeof profile) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile(current => ({ ...current, [key]: event.target.value }));
  };

  const Field = ({ label, value, onChange, icon: Icon }: {
    label: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    icon: React.ElementType;
  }) => (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-secondary, #8ca5bc)" }}>{label}</span>
      <div className="mt-1.5 flex items-center gap-2 rounded-xl px-3 py-2.5"
        style={{ background: "var(--bg-elevated, #1a2e42)", border: "1px solid var(--border-color, rgba(255,255,255,0.07))" }}>
        <Icon size={14} style={{ color }} />
        <input value={value} onChange={onChange} disabled={!editMode}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none disabled:opacity-100"
          style={{ color: "var(--text-primary, white)" }} />
      </div>
    </label>
  );

  return (
    <PageShell title="My Profile" subtitle="Keep your public profile and contact details up to date" color={color}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="rounded-xl p-5 text-center" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="relative inline-block mb-3">
            <div className="w-20 h-20 rounded-full flex items-center justify-center font-black text-2xl mx-auto"
              style={{ background: "linear-gradient(135deg, #1b4f6a, #f5ab20)", color: "#0d1f2d" }}>
              {profile.firstName[0]}{profile.lastName[0]}
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: color, color: "#0d1f2d" }}>
              <Camera size={12} />
            </button>
          </div>
          <h2 className="text-lg font-black" style={{ color: "var(--text-primary, white)" }}>{profile.firstName} {profile.lastName}</h2>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full mt-1"
            style={{ background: `${meta.color}20`, color: meta.color }}>
            <RoleIcon size={10} /> {meta.label}
          </span>
          <div className="flex items-center justify-center gap-1 mt-2 text-[11px]" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
            <MapPin size={10} /> {profile.location}
          </div>

          <div className="grid grid-cols-3 gap-3 mt-5">
            {[["12","Listings"],["89","Views"],["4.8","Rating"]].map(([val, lab]) => (
              <div key={lab} className="rounded-xl py-3" style={{ background: "var(--bg-elevated, #1a2e42)" }}>
                <div className="text-lg font-black flex items-center justify-center gap-1" style={{ color }}>
                  {val}{lab === "Rating" && <Star size={12} fill={color} />}
                </div>
                <div className="text-[10px]" style={{ color: "var(--text-secondary, #8ca5bc)" }}>{lab}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl p-5" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between gap-3 mb-5">
            <button onClick={() => setEditMode(!editMode)}
              className="text-xs font-semibold flex items-center gap-1.5 px-3 py-2 rounded-lg"
              style={{ background: `${color}18`, color }}>
              {editMode ? <Save size={12} /> : <Edit2 size={12} />}
              {editMode ? "Done" : "Edit"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name" value={profile.firstName} onChange={setField("firstName")} icon={Briefcase} />
            <Field label="Last Name" value={profile.lastName} onChange={setField("lastName")} icon={Briefcase} />
            <Field label="Business Name" value={profile.businessName} onChange={setField("businessName")} icon={Briefcase} />
            <Field label="Email" value={profile.email} onChange={setField("email")} icon={Mail} />
            <Field label="Phone" value={profile.phone} onChange={setField("phone")} icon={Phone} />
            <Field label="Location" value={profile.location} onChange={setField("location")} icon={MapPin} />
          </div>

          <label className="block mt-4">
            <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-secondary, #8ca5bc)" }}>About</span>
            <textarea value={profile.bio} onChange={setField("bio")} disabled={!editMode} rows={4}
              className="mt-1.5 w-full rounded-xl p-3 text-sm resize-none outline-none disabled:opacity-100"
              style={{ background: "var(--bg-elevated, #1a2e42)", border: "1px solid var(--border-color, rgba(255,255,255,0.07))", color: "var(--text-primary, white)" }} />
          </label>
        </div>
      </div>
    </PageShell>
  );
}
