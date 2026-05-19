import { useEffect, useMemo, useState } from "react";
import { PageShell } from "../components/PageShell";
import { Plus, Edit2, Trash2, Clock, Tag, Camera, Check, UploadCloud, X } from "lucide-react";
import { mediaUrl, providerService, ServiceListing } from "@/services/provider.service";
import { SessionUser } from "../types/dashboard";
import { canActAsStaff, loadStaffProviderOptions, ProviderOption, sessionProviderOptions } from "../utils/providerAccess";

interface PortfolioPageProps {
  color: string;
  user: SessionUser;
  initialShowAdd?: boolean;
}

const DEFAULT_CATEGORIES = ["hair", "barber", "nails", "makeup", "spa"];
const emptyForm = { name: "", category: "hair", price: "", duration_minutes: "", description: "", image_urls: [] as string[], is_available: true };

function money(value?: number | null) {
  return value == null ? "Price not set" : `K${value.toLocaleString()}`;
}

export function PortfolioPage({ color, user, initialShowAdd = false }: PortfolioPageProps) {
  const [activeCat, setActiveCat] = useState("All");
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [showAdd, setShowAdd] = useState(initialShowAdd);
  const [editing, setEditing] = useState<ServiceListing | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [providerId, setProviderId] = useState(user.activeProviderId ?? "");
  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const staffMode = canActAsStaff(user);

  const loadServices = () => {
    if (!providerId) {
      setServices([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    providerService.listProviderServices(providerId, "beauty")
      .then((res) => setServices(res.data?.items ?? []))
      .catch((err) => setError(err instanceof Error ? err.message : "Could not load services."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    providerService.getListingOptions()
      .then((res) => setCategories((res.data?.beauty_categories ?? []).map((item) => item.name)))
      .catch(() => undefined);
    const ownProviders = sessionProviderOptions(user, "beauty");
    setProviders(ownProviders);
    if (!providerId && ownProviders[0]) setProviderId(ownProviders[0].id);
    if (staffMode) {
      loadStaffProviderOptions("beauty")
        .then((items) => {
          setProviders(items);
          if (!providerId && items[0]) setProviderId(items[0].id);
        })
        .catch(() => setError("Could not load beauty providers."));
    }
  }, [providerId, staffMode, user]);

  useEffect(() => {
    loadServices();
  }, [providerId]);

  const categoryLabels = useMemo(() => ["All", ...categories], [categories]);
  const filtered = services.filter((service) => activeCat === "All" || service.category === activeCat);
  const set = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const startEdit = (service: ServiceListing) => {
    setEditing(service);
    setShowAdd(true);
    setForm({
      name: service.name || service.title || "",
      category: service.category || "hair",
      price: service.price ? String(service.price) : "",
      duration_minutes: service.duration_minutes != null ? String(service.duration_minutes) : "",
      description: service.description || "",
      image_urls: service.images?.length ? service.images.map((image) => image.image_url) : service.primary_image ? [service.primary_image] : [],
      is_available: service.is_available,
    });
  };

  const resetForm = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowAdd(false);
  };

  const save = async () => {
    setError("");
    if (!providerId) return setError("Choose a provider workspace first.");
    if (!form.name.trim()) return setError("Service name is required.");
    setSaving(true);
    const payload = {
      provider_id: providerId,
      category: form.category,
      name: form.name.trim(),
      description: form.description,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      price: form.price ? Number(form.price) : null,
      is_available: form.is_available,
      images: form.image_urls.map((image_url, index) => ({ image_url, is_primary: index === 0 })),
    };
    try {
      if (editing) await providerService.updateBeautyService(editing.id, payload);
      else await providerService.createBeautyService(payload);
      setSaved(true);
      resetForm();
      loadServices();
      setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save service.");
    } finally {
      setSaving(false);
    }
  };

  const uploadImages = async (files?: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const res = await providerService.uploadImage(file);
        if (res.data?.image_url) uploaded.push(res.data.image_url);
      }
      if (uploaded.length) setForm((current) => ({ ...current, image_urls: [...current.image_urls, ...uploaded] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload images.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => setForm((current) => ({ ...current, image_urls: current.image_urls.filter((image) => image !== url) }));

  const deleteItem = async (service: ServiceListing) => {
    await providerService.deleteListing("beauty", service.id);
    setServices((current) => current.filter((item) => item.id !== service.id));
  };

  const fieldStyle = { width: "100%", background: "var(--bg-elevated, #1a2e42)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "10px", color: "var(--text-primary, white)", padding: "8px 12px", fontSize: "13px", outline: "none" } as React.CSSProperties;
  const labelStyle = { color: "#8ca5bc" };

  return (
    <PageShell title="My Services" subtitle="Manage beauty services, prices, images, and publishing" color={color}>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[{ label: "Services", value: services.length }, { label: "Published", value: services.filter((s) => s.is_available).length }, { label: "Hidden", value: services.filter((s) => !s.is_available).length }].map(stat => (
          <div key={stat.label} className="rounded-xl p-3 text-center" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-xl font-black" style={{ color }}>{stat.value}</div>
            <div className="text-[10px] mt-0.5" style={{ color: "#8ca5bc" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <select value={providerId} onChange={(e) => setProviderId(e.target.value)} className="px-3 py-2 rounded-lg text-xs font-semibold outline-none" style={{ background: "var(--bg-secondary, #132333)", color: "var(--text-primary, white)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <option value="">Select provider</option>
          {providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.business_name || provider.display_name || "Provider"}{provider.ownerEmail ? ` - ${provider.ownerEmail}` : ""}</option>)}
        </select>
        <div className="flex gap-1.5 flex-wrap">
          {categoryLabels.map(cat => <button key={cat} onClick={() => setActiveCat(cat)} className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all" style={activeCat === cat ? { background: color, color: "#0d1f2d" } : { background: "var(--bg-secondary, #132333)", color: "#8ca5bc", border: "1px solid rgba(255,255,255,0.07)" }}>{cat}</button>)}
        </div>
        <button onClick={() => { setShowAdd(v => !v); if (showAdd) resetForm(); }} className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all" style={{ background: showAdd ? color : `${color}18`, color: showAdd ? "#0d1f2d" : color, border: `1px solid ${color}30` }}>
          <Plus size={12} /> {showAdd ? "Cancel" : "Add Service"}
        </button>
      </div>

      {showAdd && (
        <div className="rounded-2xl p-4 mb-5" style={{ background: "var(--bg-secondary, #132333)", border: `1px solid ${color}30` }}>
          <h4 className="text-xs font-bold uppercase mb-3" style={{ color }}>{editing ? "Edit Service" : "New Service"}</h4>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="col-span-2"><label className="block text-[10px] font-semibold mb-1 uppercase" style={labelStyle}>Service Name</label><input value={form.name} onChange={set("name")} placeholder="Fade Cut, Ghana Weave, Bridal Makeup" style={fieldStyle} /></div>
            <div><label className="block text-[10px] font-semibold mb-1 uppercase" style={labelStyle}>Category</label><select value={form.category} onChange={set("category")} style={fieldStyle}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="block text-[10px] font-semibold mb-1 uppercase" style={labelStyle}>Images</label><input type="file" accept="image/*" multiple onChange={(e) => uploadImages(e.target.files)} style={fieldStyle} />{uploading && <div className="text-[10px] mt-1" style={{ color: "#8ca5bc" }}>Uploading...</div>}</div>
            <div><label className="block text-[10px] font-semibold mb-1 uppercase" style={labelStyle}>Price (MWK)</label><input type="number" value={form.price} onChange={set("price")} style={fieldStyle} /></div>
            <div><label className="block text-[10px] font-semibold mb-1 uppercase" style={labelStyle}>Duration Minutes</label><input type="number" value={form.duration_minutes} onChange={set("duration_minutes")} placeholder="60" style={fieldStyle} /></div>
            <div className="col-span-2"><label className="block text-[10px] font-semibold mb-1 uppercase" style={labelStyle}>Description</label><textarea value={form.description} onChange={set("description")} rows={2} style={{ ...fieldStyle, resize: "none" }} /></div>
            <label className="col-span-2 flex items-center gap-2 text-xs font-semibold" style={{ color: "#8ca5bc" }}><input type="checkbox" checked={form.is_available} onChange={set("is_available")} /> Published and available for browsing</label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            {form.image_urls.map((url, index) => (
              <div key={url} className="relative h-24 rounded-lg overflow-hidden" style={{ background: `${color}10` }}>
                <img src={mediaUrl(url)} alt="" className="h-full w-full object-cover" />
                <button onClick={() => removeImage(url)} className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}><X size={12} /></button>
                {index === 0 && <span className="absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: color, color: "#0d1f2d" }}>Primary</span>}
              </div>
            ))}
            {form.image_urls.length === 0 && <div className="col-span-2 sm:col-span-4 h-24 rounded-lg flex items-center justify-center gap-2 text-xs" style={{ background: `${color}10`, color: "#8ca5bc", border: `1px solid ${color}25` }}><UploadCloud size={16} /> Service image preview</div>}
          </div>
          {error && <div className="mb-3 text-xs font-semibold" style={{ color: "#ef4444" }}>{error}</div>}
          <button onClick={save} disabled={saving} className="w-full py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2" style={{ background: saved ? "#10b981" : color, color: "#0d1f2d" }}>
            {saved ? <><Check size={14} /> Saved</> : saving ? "Saving..." : editing ? "Update Service" : "Add Service"}
          </button>
        </div>
      )}

      {loading && <div className="text-sm" style={{ color: "#8ca5bc" }}>Loading services...</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {!loading && filtered.map(item => (
          <div key={item.id} className="rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 group" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="h-36 relative overflow-hidden" style={{ background: `${color}10` }}>
              {item.primary_image ? <img src={mediaUrl(item.primary_image)} alt={item.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" /> : <div className="h-full flex items-center justify-center" style={{ color: "#8ca5bc" }}><Camera size={20} /></div>}
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(item)} className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)", color: "#fff" }}><Edit2 size={10} /></button>
                <button onClick={() => deleteItem(item)} className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(239,68,68,0.6)", color: "#fff" }}><Trash2 size={10} /></button>
              </div>
              <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.58)", color: "#fff" }}>{item.status}</span>
            </div>
            <div className="p-3">
              <div className="text-sm font-bold mb-1" style={{ color: "var(--text-primary, white)" }}>{item.title}</div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}><Tag size={9} className="inline mr-1" />{item.category_display || item.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px]" style={{ color: "#8ca5bc" }}><Clock size={10} /> {item.duration_minutes ? `${item.duration_minutes} min` : "Duration not set"}</span>
                <span className="text-sm font-black" style={{ color }}>{money(item.price)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {!loading && filtered.length === 0 && <div className="rounded-xl p-5 text-sm" style={{ background: "var(--bg-secondary, #132333)", color: "#8ca5bc", border: "1px solid rgba(255,255,255,0.07)" }}>No services found.</div>}
    </PageShell>
  );
}
