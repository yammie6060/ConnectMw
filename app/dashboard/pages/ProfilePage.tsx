import { useState } from 'react';
import { PageShell } from '../components/PageShell';
import { Camera, MapPin, Edit2, Mail, Phone, Briefcase, Save, Star, User, Globe } from 'lucide-react';
import { authService } from '@/services/auth.service';
import { DashboardAvatar } from '../components/DashboardAvatar';

interface ProfilePageProps {
  color: string;
  user: any;
  meta: any;
  onSessionRefresh?: () => void;
}

export function ProfilePage({ color, user, meta, onSessionRefresh }: ProfilePageProps) {
  const RoleIcon = meta.icon;
  const businessName = user.businessName || user.companyName || user.garageName || "";
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    businessName,
    email: user.email || "",
    phone: user.phone || "",
    avatarUrl: user.avatarUrl || "",
    city: user.city || "",
    district: user.district || "",
    streetAddress: user.streetAddress || "",
    nationality: user.nationality || "Malawian",
    preferredLanguage: user.preferredLanguage || "en",
    bio: user.bio || "",
  });

  const setField = (key: keyof typeof profile) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile(current => ({ ...current, [key]: event.target.value }));
  };

  function toProfilePayload(nextProfile = profile) {
    return {
      full_name: `${nextProfile.firstName} ${nextProfile.lastName}`.trim(),
      avatar_url: nextProfile.avatarUrl || null,
      city: nextProfile.city || null,
      district: nextProfile.district || null,
      street_address: nextProfile.streetAddress || null,
      nationality: nextProfile.nationality || null,
      preferred_language: nextProfile.preferredLanguage || "en",
      bio: nextProfile.bio || null,
    };
  }

  function readImageAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Could not read that image."));
      reader.onload = () => {
        const image = new Image();
        image.onerror = () => reject(new Error("That image could not be loaded."));
        image.onload = () => {
          const maxSize = 320;
          const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
          const width = Math.max(1, Math.round(image.width * scale));
          const height = Math.max(1, Math.round(image.height * scale));
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Could not prepare that image."));
            return;
          }
          ctx.drawImage(image, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        image.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  async function chooseAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      return;
    }
    setMessage("");
    try {
      const avatarUrl = await readImageAsDataUrl(file);
      const nextProfile = { ...profile, avatarUrl };
      setProfile(nextProfile);
      setSaving(true);
      await authService.updateProfile(toProfilePayload(nextProfile));
      setMessage("Avatar saved.");
      onSessionRefresh?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not use that image.");
    } finally {
      setSaving(false);
      event.target.value = "";
    }
  }

  async function saveProfile() {
    setSaving(true);
    setMessage("");
    try {
      await authService.updateProfile(toProfilePayload());
      setEditMode(false);
      setMessage("Profile saved.");
      onSessionRefresh?.();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save profile.");
    } finally {
      setSaving(false);
    }
  }

  const Field = ({ label, value, onChange, icon: Icon, disabled }: {
    label: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    icon: React.ElementType;
    disabled?: boolean;
  }) => (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-secondary, #8ca5bc)" }}>{label}</span>
      <div className="mt-1.5 flex items-center gap-2 rounded-xl px-3 py-2.5"
        style={{ background: "var(--bg-elevated, #1a2e42)", border: "1px solid var(--border-color, rgba(255,255,255,0.07))" }}>
        <Icon size={14} style={{ color }} />
        <input value={value} onChange={onChange} disabled={!editMode || disabled}
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
            <DashboardAvatar
              user={{ ...user, firstName: profile.firstName, lastName: profile.lastName, avatarUrl: profile.avatarUrl }}
              size="lg"
              className="mx-auto"
            />
            <label className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
              style={{ background: color, color: "#0d1f2d" }}>
              <Camera size={12} />
              <input type="file" accept="image/*" className="sr-only" onChange={chooseAvatar} />
            </label>
          </div>
          <h2 className="text-lg font-black" style={{ color: "var(--text-primary, white)" }}>{profile.firstName} {profile.lastName}</h2>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full mt-1"
            style={{ background: `${meta.color}20`, color: meta.color }}>
            <RoleIcon size={10} /> {meta.label}
          </span>
          <div className="flex items-center justify-center gap-1 mt-2 text-[11px]" style={{ color: "var(--text-secondary, #8ca5bc)" }}>
            <MapPin size={10} /> {[profile.city, profile.district].filter(Boolean).join(", ") || "Location not set"}
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
            {message && <div className="text-sm" style={{ color }}>{message}</div>}
            <button onClick={() => editMode ? saveProfile() : setEditMode(true)}
              className="text-xs font-semibold flex items-center gap-1.5 px-3 py-2 rounded-lg"
              style={{ background: `${color}18`, color }}>
              {editMode ? <Save size={12} /> : <Edit2 size={12} />}
              {saving ? "Saving..." : editMode ? "Save" : "Edit"}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name" value={profile.firstName} onChange={setField("firstName")} icon={User} />
            <Field label="Last Name" value={profile.lastName} onChange={setField("lastName")} icon={User} />
            <Field label="Business Name" value={profile.businessName} onChange={setField("businessName")} icon={Briefcase} />
            <Field label="Email" value={profile.email} onChange={setField("email")} icon={Mail} disabled />
            <Field label="Phone" value={profile.phone} onChange={setField("phone")} icon={Phone} disabled />
            <Field label="City" value={profile.city} onChange={setField("city")} icon={MapPin} />
            <Field label="District" value={profile.district} onChange={setField("district")} icon={MapPin} />
            <Field label="Street Address" value={profile.streetAddress} onChange={setField("streetAddress")} icon={MapPin} />
            <Field label="Nationality" value={profile.nationality} onChange={setField("nationality")} icon={Globe} />
            <Field label="Language" value={profile.preferredLanguage} onChange={setField("preferredLanguage")} icon={Globe} />
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
