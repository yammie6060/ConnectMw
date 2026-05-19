import { useEffect, useMemo, useState } from "react";
import { PageShell } from "../components/PageShell";
import { Check, PlusCircle } from "lucide-react";
import { mediaUrl, providerService, ServiceListing } from "@/services/provider.service";
import { SessionUser } from "../types/dashboard";
import { canActAsStaff, loadStaffProviderOptions, ProviderOption, sessionProviderOptions } from "../utils/providerAccess";

interface AddPartPageProps {
  color: string;
  user: SessionUser;
  editItem?: ServiceListing | null;
  onSaved?: () => void;
}

const emptyForm = {
  title: "",
  vehicle_type: "",
  vehicle_brand: "",
  vehicle_model: "",
  part_name: "",
  condition: "used",
  price: "",
  quantity: "1",
  city: "",
  description: "",
  image_url: "",
  is_available: true,
};

export function AddPartPage({ color, user, editItem, onSaved }: AddPartPageProps) {
  const [form, setForm] = useState(emptyForm);
  const [providerId, setProviderId] = useState(user.activeProviderId ?? "");
  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const staffMode = canActAsStaff(user);

  useEffect(() => {
    if (editItem) {
      setProviderId(editItem.provider_id);
      setForm({
        title: editItem.title ?? "",
        vehicle_type: editItem.vehicle_type ?? "",
        vehicle_brand: editItem.vehicle_brand ?? "",
        vehicle_model: editItem.vehicle_model ?? "",
        part_name: editItem.part_name ?? "",
        condition: editItem.condition ?? "used",
        price: editItem.price ? String(editItem.price) : "",
        quantity: editItem.quantity != null ? String(editItem.quantity) : "1",
        city: editItem.city ?? "",
        description: editItem.description ?? "",
        image_url: editItem.primary_image ?? "",
        is_available: editItem.is_available,
      });
    }
  }, [editItem]);

  useEffect(() => {
    const ownProviders = sessionProviderOptions(user, "spare");
    setProviders(ownProviders);
    if (!providerId && ownProviders[0]) setProviderId(ownProviders[0].id);
    if (staffMode) {
      loadStaffProviderOptions("spare")
        .then((items) => {
          setProviders(items);
          if (!providerId && items[0]) setProviderId(items[0].id);
        })
        .catch(() => setError("Could not load providers for staff management."));
    }
  }, [providerId, staffMode, user]);

  const selectedProvider = useMemo(
    () => providers.find((provider) => provider.id === providerId),
    [providerId, providers],
  );

  const set = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

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

  const labelStyle = { display: "block", fontSize: "11px", fontWeight: 600, color: "#8ca5bc", marginBottom: 6, textTransform: "uppercase" as const };

  const save = async () => {
    setError("");
    if (!providerId) return setError("Choose a provider workspace first.");
    if (!form.title.trim()) return setError("Part title is required.");
    setSaving(true);
    const payload = {
      provider_id: providerId,
      title: form.title.trim(),
      vehicle_type: form.vehicle_type,
      vehicle_brand: form.vehicle_brand,
      vehicle_model: form.vehicle_model,
      part_name: form.part_name,
      condition: form.condition,
      price: form.price ? Number(form.price) : null,
      quantity: Number(form.quantity || 0),
      city: form.city,
      description: form.description,
      is_available: form.is_available,
      images: form.image_url ? [{ image_url: form.image_url, is_primary: true }] : [],
    };
    try {
      if (editItem) await providerService.updateSpareListing(editItem.id, payload);
      else await providerService.createSpareListing(payload);
      setSaved(true);
      if (!editItem) setForm(emptyForm);
      onSaved?.();
      setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this part.");
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await providerService.uploadImage(file);
      if (res.data?.image_url) setForm((current) => ({ ...current, image_url: res.data!.image_url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <PageShell title={editItem ? "Edit Part" : "Add New Part"} subtitle="Publish spare parts with matching backend fields" color={color}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <label style={labelStyle}>Provider</label>
            <select value={providerId} onChange={(e) => setProviderId(e.target.value)} disabled={!staffMode && providers.length <= 1} style={fieldStyle}>
              <option value="">Select provider</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.business_name || provider.display_name || "Provider"}{provider.ownerEmail ? ` - ${provider.ownerEmail}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Listing Title</label>
            <input value={form.title} onChange={set("title")} placeholder="Toyota Hiace Side Mirror" style={fieldStyle} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label style={labelStyle}>Part Name</label><input value={form.part_name} onChange={set("part_name")} placeholder="Side mirror" style={fieldStyle} /></div>
            <div><label style={labelStyle}>Condition</label><select value={form.condition} onChange={set("condition")} style={fieldStyle}><option value="new">New</option><option value="used">Used</option><option value="refurbished">Refurbished</option></select></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label style={labelStyle}>Vehicle Type</label><input value={form.vehicle_type} onChange={set("vehicle_type")} placeholder="Car, truck" style={fieldStyle} /></div>
            <div><label style={labelStyle}>Brand</label><input value={form.vehicle_brand} onChange={set("vehicle_brand")} placeholder="Toyota" style={fieldStyle} /></div>
            <div><label style={labelStyle}>Model</label><input value={form.vehicle_model} onChange={set("vehicle_model")} placeholder="Hiace" style={fieldStyle} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label style={labelStyle}>Price (MWK)</label><input type="number" value={form.price} onChange={set("price")} style={fieldStyle} /></div>
            <div><label style={labelStyle}>Quantity</label><input type="number" value={form.quantity} onChange={set("quantity")} style={fieldStyle} /></div>
            <div><label style={labelStyle}>City</label><input value={form.city} onChange={set("city")} placeholder="Blantyre" style={fieldStyle} /></div>
          </div>
          <div><label style={labelStyle}>Description</label><textarea value={form.description} onChange={set("description")} rows={3} style={{ ...fieldStyle, resize: "none" }} /></div>
          <label className="flex items-center gap-2 text-xs font-semibold" style={{ color: "#8ca5bc" }}>
            <input type="checkbox" checked={form.is_available} onChange={set("is_available")} /> Published and available
          </label>
          {error && <div className="text-xs font-semibold" style={{ color: "#ef4444" }}>{error}</div>}
          <button onClick={save} disabled={saving || !selectedProvider} className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50" style={{ background: saved ? "#10b981" : color, color: "#0d1f2d" }}>
            {saved ? <><Check size={16} /> Saved</> : <><PlusCircle size={16} /> {saving ? "Saving..." : editItem ? "Update Part" : "List Part"}</>}
          </button>
        </div>

        <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <label style={labelStyle}>Primary Image</label>
            <input type="file" accept="image/*" onChange={(e) => uploadImage(e.target.files?.[0])} style={fieldStyle} />
            {uploading && <div className="text-xs mt-2" style={{ color: "#8ca5bc" }}>Uploading image...</div>}
          </div>
          <div className="rounded-xl overflow-hidden h-56" style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
            {form.image_url ? <img src={mediaUrl(form.image_url)} alt="" className="h-full w-full object-cover" /> : <div className="h-full flex items-center justify-center text-sm" style={{ color: "#8ca5bc" }}>Image preview</div>}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
