import { useEffect, useMemo, useState } from "react";
import { PageShell } from "../components/PageShell";
import { Check, Home, UploadCloud, X } from "lucide-react";
import { mediaUrl, providerService, ServiceListing } from "@/services/provider.service";
import { SessionUser } from "../types/dashboard";
import { canActAsStaff, loadStaffProviderOptions, ProviderOption, sessionProviderOptions } from "../utils/providerAccess";

interface AddPropertyPageProps {
  color: string;
  user: SessionUser;
  editItem?: ServiceListing | null;
  onSaved?: () => void;
  onCancel?: () => void;
}

const emptyForm = {
  title: "",
  property_type: "apartment",
  price: "",
  city: "",
  district: "",
  street_address: "",
  bedrooms: "",
  bathrooms: "",
  area_sqm: "",
  description: "",
  image_urls: [] as string[],
  is_available: true,
};

export function AddPropertyPage({ color, user, editItem, onSaved, onCancel }: AddPropertyPageProps) {
  const [form, setForm] = useState(emptyForm);
  const [providerId, setProviderId] = useState(user.activeProviderId ?? "");
  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>(["apartment", "house", "hostel", "shop", "land"]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const staffMode = canActAsStaff(user);

  useEffect(() => {
    if (editItem) {
      setProviderId(editItem.provider_id);
      setForm({
        title: editItem.title ?? "",
        property_type: editItem.property_type ?? "apartment",
        price: editItem.price ? String(editItem.price) : "",
        city: editItem.city ?? "",
        district: editItem.district ?? "",
        street_address: editItem.street_address ?? "",
        bedrooms: editItem.bedrooms != null ? String(editItem.bedrooms) : "",
        bathrooms: editItem.bathrooms != null ? String(editItem.bathrooms) : "",
        area_sqm: editItem.area_sqm != null ? String(editItem.area_sqm) : "",
        description: editItem.description ?? "",
        image_urls: editItem.images?.length ? editItem.images.map((image) => image.image_url) : editItem.primary_image ? [editItem.primary_image] : [],
        is_available: editItem.is_available,
      });
    }
  }, [editItem]);

  useEffect(() => {
    providerService.getListingOptions()
      .then((res) => setPropertyTypes((res.data?.property_types ?? []).map((item) => item.name)))
      .catch(() => undefined);

    const ownProviders = sessionProviderOptions(user, "property");
    setProviders(ownProviders);
    if (!providerId && ownProviders[0]) setProviderId(ownProviders[0].id);
    if (staffMode) {
      loadStaffProviderOptions("property")
        .then((items) => {
          setProviders(items);
          if (!providerId && items[0]) setProviderId(items[0].id);
        })
        .catch(() => setError("Could not load property providers."));
    }
  }, [providerId, staffMode, user]);

  const selectedProvider = useMemo(() => providers.find((provider) => provider.id === providerId), [providerId, providers]);
  const set = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const fieldStyle = { background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.09)", color: "var(--text-primary, white)", borderRadius: "10px", padding: "10px 14px", width: "100%", fontSize: "14px", outline: "none" } as React.CSSProperties;
  const labelStyle = { display: "block", fontSize: "11px", fontWeight: 600, color: "#8ca5bc", marginBottom: 6, textTransform: "uppercase" as const };

  const save = async () => {
    setError("");
    if (!providerId) return setError("Choose a provider workspace first.");
    if (!form.title.trim()) return setError("Property title is required.");
    setSaving(true);
    const payload = {
      provider_id: providerId,
      property_type: form.property_type,
      title: form.title.trim(),
      description: form.description,
      price: form.price ? Number(form.price) : null,
      city: form.city,
      district: form.district,
      street_address: form.street_address,
      bedrooms: form.bedrooms ? Number(form.bedrooms) : null,
      bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
      area_sqm: form.area_sqm ? Number(form.area_sqm) : null,
      is_available: form.is_available,
      images: form.image_urls.map((image_url, index) => ({ image_url, is_primary: index === 0 })),
    };
    try {
      if (editItem) await providerService.updatePropertyListing(editItem.id, payload);
      else await providerService.createPropertyListing(payload);
      setSaved(true);
      if (!editItem) setForm(emptyForm);
      onSaved?.();
      setTimeout(() => setSaved(false), 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this property.");
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
    <PageShell title={editItem ? "Edit Property" : "Add Property"} subtitle="List a house, apartment, hostel, room, shop, or land" color={color}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div><label style={labelStyle}>Provider</label><select value={providerId} onChange={(e) => setProviderId(e.target.value)} disabled={!staffMode && providers.length <= 1} style={fieldStyle}><option value="">Select provider</option>{providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.business_name || provider.display_name || "Provider"}{provider.ownerEmail ? ` - ${provider.ownerEmail}` : ""}</option>)}</select></div>
          <div><label style={labelStyle}>Property Title</label><input value={form.title} onChange={set("title")} placeholder="2-Bed Flat, Area 47" style={fieldStyle} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><label style={labelStyle}>Property Type</label><select value={form.property_type} onChange={set("property_type")} style={fieldStyle}>{propertyTypes.map((type) => <option key={type} value={type}>{type.replace("_", " ")}</option>)}</select></div>
            <div><label style={labelStyle}>Monthly Rent / Price (MWK)</label><input type="number" value={form.price} onChange={set("price")} style={fieldStyle} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label style={labelStyle}>City</label><input value={form.city} onChange={set("city")} placeholder="Lilongwe" style={fieldStyle} /></div>
            <div><label style={labelStyle}>District</label><input value={form.district} onChange={set("district")} placeholder="Lilongwe" style={fieldStyle} /></div>
            <div><label style={labelStyle}>Street / Area</label><input value={form.street_address} onChange={set("street_address")} placeholder="Area 47" style={fieldStyle} /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label style={labelStyle}>Bedrooms</label><input type="number" value={form.bedrooms} onChange={set("bedrooms")} style={fieldStyle} /></div>
            <div><label style={labelStyle}>Bathrooms</label><input type="number" value={form.bathrooms} onChange={set("bathrooms")} style={fieldStyle} /></div>
            <div><label style={labelStyle}>Area SQM</label><input type="number" value={form.area_sqm} onChange={set("area_sqm")} style={fieldStyle} /></div>
          </div>
          <div><label style={labelStyle}>Description</label><textarea value={form.description} onChange={set("description")} rows={3} style={{ ...fieldStyle, resize: "none" }} /></div>
          <label className="flex items-center gap-2 text-xs font-semibold" style={{ color: "#8ca5bc" }}><input type="checkbox" checked={form.is_available} onChange={set("is_available")} /> Published and available</label>
          {error && <div className="text-xs font-semibold" style={{ color: "#ef4444" }}>{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {editItem && (
              <button onClick={onCancel} disabled={saving} className="py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50" style={{ background: "rgba(255,255,255,0.06)", color: "#cde0f0" }}>
                Cancel
              </button>
            )}
            <button onClick={save} disabled={saving || !selectedProvider} className={`${editItem ? "" : "sm:col-span-2"} py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50`} style={{ background: saved ? "#10b981" : color, color: "#0d1f2d" }}>
              {saved ? <><Check size={16} /> Saved</> : <><Home size={16} /> {saving ? "Saving..." : editItem ? "Update Property" : "List Property"}</>}
            </button>
          </div>
        </div>
        <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div><label style={labelStyle}>Listing Images</label><input type="file" accept="image/*" multiple onChange={(e) => uploadImages(e.target.files)} style={fieldStyle} />{uploading && <div className="text-xs mt-2" style={{ color: "#8ca5bc" }}>Uploading images...</div>}</div>
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
