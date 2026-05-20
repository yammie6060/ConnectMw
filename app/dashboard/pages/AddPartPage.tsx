import { useEffect, useMemo, useState } from "react";
import { PageShell } from "../components/PageShell";
import { Check, PlusCircle, UploadCloud, X } from "lucide-react";
import { mediaUrl, providerService, ServiceListing } from "@/services/provider.service";
import { SessionUser } from "../types/dashboard";
import { canActAsStaff, loadStaffProviderOptions, ProviderOption, sessionProviderOptions } from "../utils/providerAccess";

interface AddPartPageProps {
  color: string;
  user: SessionUser;
  editItem?: ServiceListing | null;
  onSaved?: () => void;
  onCancel?: () => void;
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
  image_urls: [] as string[],
  is_available: true,
};

export function AddPartPage({ color, user, editItem, onSaved, onCancel }: AddPartPageProps) {
  const [form, setForm] = useState(emptyForm);
  const [providerId, setProviderId] = useState(user.activeProviderId ?? "");
  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [ownerForm, setOwnerForm] = useState({ fullName: "", email: "", phone: "", businessName: "", address: "" });
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
        image_urls: editItem.images?.length ? editItem.images.map((image) => image.image_url) : editItem.primary_image ? [editItem.primary_image] : [],
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
  const setOwner = (k: keyof typeof ownerForm) => (e: React.ChangeEvent<HTMLInputElement>) => setOwnerForm((f) => ({ ...f, [k]: e.target.value }));

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
    if (!form.title.trim()) return setError("Part title is required.");
    setSaving(true);
    let listingProviderId = providerId;
    try {
      if (!listingProviderId && staffMode) {
        if (!ownerForm.fullName.trim() || !ownerForm.email.trim() || !ownerForm.phone.trim()) {
          setSaving(false);
          return setError("Add owner name, email, and phone or choose an existing provider.");
        }
        const ownerProvider = await providerService.createProviderForOwner({
          provider_type_name: "spare_seller",
          owner_full_name: ownerForm.fullName.trim(),
          owner_email: ownerForm.email.trim(),
          owner_phone: ownerForm.phone.trim(),
          business_name: ownerForm.businessName.trim() || ownerForm.fullName.trim(),
          physical_address: ownerForm.address.trim(),
        });
        listingProviderId = ownerProvider.data?.id ?? "";
        setProviderId(listingProviderId);
      }
      if (!listingProviderId) throw new Error("Choose a provider workspace first.");
    } catch (err) {
      setSaving(false);
      return setError(err instanceof Error ? err.message : "Could not prepare owner provider.");
    }
    const payload = {
      provider_id: listingProviderId,
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
      images: form.image_urls.map((image_url, index) => ({ image_url, is_primary: index === 0 })),
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

  return (
    <PageShell title={editItem ? "Edit Part" : "Add New Part"} subtitle="Publish spare parts with matching backend fields" color={color}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <label style={labelStyle}>Provider</label>
            <select value={providerId} onChange={(e) => setProviderId(e.target.value)} disabled={!staffMode && providers.length <= 1} style={fieldStyle}>
              <option value="">{staffMode ? "Create from owner details below" : "Select provider"}</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.business_name || provider.display_name || "Provider"}{provider.ownerEmail ? ` - ${provider.ownerEmail}` : ""}
                </option>
              ))}
            </select>
          </div>
          {staffMode && !providerId && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl p-3" style={{ background: "var(--bg-elevated, #1a2e42)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div><label style={labelStyle}>Owner Name</label><input value={ownerForm.fullName} onChange={setOwner("fullName")} style={fieldStyle} /></div>
              <div><label style={labelStyle}>Owner Phone</label><input value={ownerForm.phone} onChange={setOwner("phone")} style={fieldStyle} /></div>
              <div><label style={labelStyle}>Owner Email</label><input type="email" value={ownerForm.email} onChange={setOwner("email")} style={fieldStyle} /></div>
              <div><label style={labelStyle}>Display Name</label><input value={ownerForm.businessName} onChange={setOwner("businessName")} placeholder="Optional" style={fieldStyle} /></div>
              <div className="sm:col-span-2"><label style={labelStyle}>Owner Address</label><input value={ownerForm.address} onChange={setOwner("address")} placeholder="Optional" style={fieldStyle} /></div>
            </div>
          )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {editItem && (
              <button onClick={onCancel} disabled={saving} className="py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50" style={{ background: "rgba(255,255,255,0.06)", color: "#cde0f0" }}>
                Cancel
              </button>
            )}
            <button onClick={save} disabled={saving || (!selectedProvider && !staffMode)} className={`${editItem ? "" : "sm:col-span-2"} py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50`} style={{ background: saved ? "#10b981" : color, color: "#0d1f2d" }}>
              {saved ? <><Check size={16} /> Saved</> : <><PlusCircle size={16} /> {saving ? "Saving..." : editItem ? "Update Part" : "List Part"}</>}
            </button>
          </div>
        </div>

        <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <label style={labelStyle}>Listing Images</label>
            <input type="file" accept="image/*" multiple onChange={(e) => uploadImages(e.target.files)} style={fieldStyle} />
            {uploading && <div className="text-xs mt-2" style={{ color: "#8ca5bc" }}>Uploading images...</div>}
          </div>
          <div className="rounded-xl overflow-hidden min-h-56" style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
            {form.image_urls.length ? (
              <div className="grid grid-cols-2 gap-2 p-2">
                {form.image_urls.map((url, index) => (
                  <div key={url} className="relative h-32 rounded-lg overflow-hidden">
                    <img src={mediaUrl(url)} alt="" className="h-full w-full object-cover" />
                    <button onClick={() => removeImage(url)} className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}><X size={13} /></button>
                    {index === 0 && <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: color, color: "#0d1f2d" }}>Primary</span>}
                  </div>
                ))}
              </div>
            ) : <div className="h-56 flex flex-col items-center justify-center gap-2 text-sm" style={{ color: "#8ca5bc" }}><UploadCloud size={22} /> Image preview</div>}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
