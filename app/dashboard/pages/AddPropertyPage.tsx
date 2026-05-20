import { useEffect, useMemo, useState } from "react";
import { PageShell } from "../components/PageShell";
import { Check, Home, UploadCloud, X, Plus, Edit3, Trash2, ChevronRight } from "lucide-react";
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
  amenity_ids: [] as string[],
  is_available: true,
};

// Modal Component
function PropertyFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editItem, 
  color, 
  user 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (data: any) => void; 
  editItem?: ServiceListing | null;
  color: string;
  user: SessionUser;
}) {
  const [form, setForm] = useState(emptyForm);
  const [providerId, setProviderId] = useState(user.activeProviderId ?? "");
  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<string[]>(["apartment", "house", "hostel", "shop", "land"]);
  const [amenities, setAmenities] = useState<Array<{ id: string; name: string }>>([]);
  const [ownerForm, setOwnerForm] = useState({ fullName: "", email: "", phone: "", businessName: "", address: "" });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [activeStep, setActiveStep] = useState(1);
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
        amenity_ids: editItem.amenity_ids ?? editItem.amenities?.map((amenity) => amenity.id) ?? [],
        is_available: editItem.is_available,
      });
    }
  }, [editItem]);

  useEffect(() => {
    providerService.getListingOptions()
      .then((res) => {
        setPropertyTypes((res.data?.property_types ?? []).map((item) => item.name));
        setAmenities(res.data?.amenities ?? []);
      })
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

  const selectedProvider = useMemo(
    () => providers.find((provider) => provider.id === providerId),
    [providerId, providers],
  );

  const set = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));
  
  const setOwner = (k: keyof typeof ownerForm) => (e: React.ChangeEvent<HTMLInputElement>) => 
    setOwnerForm((f) => ({ ...f, [k]: e.target.value }));
  
  const toggleAmenity = (id: string) => setForm((current) => ({
    ...current,
    amenity_ids: current.amenity_ids.includes(id) ? current.amenity_ids.filter((item) => item !== id) : [...current.amenity_ids, id],
  }));

  const fieldStyle = { 
    background: "var(--bg-secondary, #132333)", 
    border: "1px solid rgba(255,255,255,0.09)", 
    color: "var(--text-primary, white)", 
    borderRadius: "12px", 
    padding: "12px 16px", 
    width: "100%", 
    fontSize: "14px", 
    outline: "none",
    transition: "all 0.2s"
  } as React.CSSProperties;
  
  const labelStyle = { 
    display: "block", 
    fontSize: "12px", 
    fontWeight: 600, 
    color: "#8ca5bc", 
    marginBottom: 8, 
    letterSpacing: "0.3px" 
  } as const;

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

  const removeImage = (url: string) => 
    setForm((current) => ({ ...current, image_urls: current.image_urls.filter((image) => image !== url) }));

  const handleSubmit = async () => {
    setError("");
    if (!form.title.trim()) return setError("Property title is required.");
    setSaving(true);
    let listingProviderId = providerId;
    
    try {
      if (!listingProviderId && staffMode) {
        if (!ownerForm.fullName.trim() || !ownerForm.email.trim() || !ownerForm.phone.trim()) {
          setSaving(false);
          return setError("Add owner name, email, and phone or choose an existing provider.");
        }
        const ownerProvider = await providerService.createProviderForOwner({
          provider_type_name: "landlord",
          owner_full_name: ownerForm.fullName.trim(),
          owner_email: ownerForm.email.trim(),
          owner_phone: ownerForm.phone.trim(),
          business_name: ownerForm.businessName.trim() || ownerForm.fullName.trim(),
          physical_address: ownerForm.address.trim() || form.street_address,
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
      amenity_ids: form.amenity_ids,
      images: form.image_urls.map((image_url, index) => ({ image_url, is_primary: index === 0 })),
    };

    try {
      if (editItem) await providerService.updatePropertyListing(editItem.id, payload);
      else await providerService.createPropertyListing(payload);
      setSaved(true);
      onSubmit(payload);
      setTimeout(() => {
        if (!editItem) setForm(emptyForm);
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save this property.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="min-h-screen px-4 py-6 flex items-center justify-center">
        <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl animate-in slide-in-from-bottom-4 duration-300" 
             style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.1)" }}>
          
          {/* Modal Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 backdrop-blur-md" 
               style={{ background: "rgba(19,35,51,0.95)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div>
              <h2 className="text-xl font-bold" style={{ color: "var(--text-primary, white)" }}>
                {editItem ? "Edit Property" : "Add New Property"}
              </h2>
              <p className="text-xs mt-1" style={{ color: "#8ca5bc" }}>Fill in the details below</p>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                    style={{ background: "rgba(255,255,255,0.06)", color: "#cde0f0" }}>
              <X size={16} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6">
            {/* Step Indicator (Optional) */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {["Basic Info", "Location & Details", "Images & Amenities"].map((step, idx) => (
                <div key={step} className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                    ${activeStep === idx + 1 ? 'ring-2 ring-offset-2' : ''}`}
                    style={{ background: activeStep === idx + 1 ? color : "rgba(255,255,255,0.1)", 
                             color: activeStep === idx + 1 ? "#0d1f2d" : "#8ca5bc",
                             boxShadow: activeStep === idx + 1 ? `0 0 0 2px ${color}55` : undefined }}>
                    {idx + 1}
                  </div>
                  <span className="text-xs font-medium hidden sm:inline" style={{ color: "#8ca5bc" }}>{step}</span>
                  {idx < 2 && <ChevronRight size={12} style={{ color: "#8ca5bc" }} />}
                </div>
              ))}
            </div>

            {/* Provider Section */}
            <div className="mb-6">
              <label style={labelStyle}>Provider Workspace</label>
              <select value={providerId} onChange={(e) => setProviderId(e.target.value)} 
                      disabled={!staffMode && providers.length <= 1} style={fieldStyle}>
                <option value="">{staffMode ? "Create from owner details below" : "Select provider"}</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.business_name || provider.display_name || "Provider"}
                    {provider.ownerEmail ? ` - ${provider.ownerEmail}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Owner Form for Staff */}
            {staffMode && !providerId && (
              <div className="mb-6 rounded-xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <h3 className="text-sm font-semibold mb-3" style={{ color }}>New Owner Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input value={ownerForm.fullName} onChange={setOwner("fullName")} placeholder="Full Name *" style={fieldStyle} />
                  <input value={ownerForm.phone} onChange={setOwner("phone")} placeholder="Phone Number *" style={fieldStyle} />
                  <input type="email" value={ownerForm.email} onChange={setOwner("email")} placeholder="Email Address *" style={fieldStyle} />
                  <input value={ownerForm.businessName} onChange={setOwner("businessName")} placeholder="Business Name (Optional)" style={fieldStyle} />
                  <div className="md:col-span-2">
                    <input value={ownerForm.address} onChange={setOwner("address")} placeholder="Physical Address" style={fieldStyle} />
                  </div>
                </div>
              </div>
            )}

            {/* Basic Info Section */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3" style={{ color }}>Basic Information</h3>
              <div className="space-y-3">
                <input value={form.title} onChange={set("title")} placeholder="Property Title * (e.g., 2-Bedroom Flat in Area 47)" style={fieldStyle} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select value={form.property_type} onChange={set("property_type")} style={fieldStyle}>
                    {propertyTypes.map((type) => (
                      <option key={type} value={type}>{type.replace("_", " ").toUpperCase()}</option>
                    ))}
                  </select>
                  <input type="number" value={form.price} onChange={set("price")} placeholder="Monthly Rent / Price (MWK)" style={fieldStyle} />
                </div>
                <textarea value={form.description} onChange={set("description")} rows={3} 
                          placeholder="Describe the property (features, nearby amenities, etc.)" 
                          style={{ ...fieldStyle, resize: "vertical" }} />
              </div>
            </div>

            {/* Location & Details */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3" style={{ color }}>Location & Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <input value={form.city} onChange={set("city")} placeholder="City *" style={fieldStyle} />
                <input value={form.district} onChange={set("district")} placeholder="District" style={fieldStyle} />
                <input value={form.street_address} onChange={set("street_address")} placeholder="Street / Area" style={fieldStyle} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="number" value={form.bedrooms} onChange={set("bedrooms")} placeholder="Bedrooms" style={fieldStyle} />
                <input type="number" value={form.bathrooms} onChange={set("bathrooms")} placeholder="Bathrooms" style={fieldStyle} />
                <input type="number" value={form.area_sqm} onChange={set("area_sqm")} placeholder="Area (sqm)" style={fieldStyle} />
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-6">
              <label style={labelStyle}>Amenities</label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 rounded-xl" 
                   style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                {amenities.map((amenity) => {
                  const active = form.amenity_ids.includes(amenity.id);
                  return (
                    <button key={amenity.id} type="button" onClick={() => toggleAmenity(amenity.id)}
                            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all hover:scale-105">
                      <span style={active ? { background: color, color: "#0d1f2d", padding: "6px 12px", borderRadius: "9999px" } 
                                         : { background: "var(--bg-elevated, #1a2e42)", color: "#8ca5bc", padding: "6px 12px", borderRadius: "9999px" }}>
                        {amenity.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Images Section */}
            <div className="mb-6">
              <label style={labelStyle}>Property Images</label>
              <div className="relative">
                <input type="file" accept="image/*" multiple onChange={(e) => uploadImages(e.target.files)} 
                       className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10" />
                <div className="border-2 border-dashed rounded-xl p-6 text-center transition-all hover:border-opacity-50"
                     style={{ borderColor: `${color}50`, background: `${color}05` }}>
                  <UploadCloud size={32} style={{ color: "#8ca5bc", margin: "0 auto 8px" }} />
                  <p className="text-sm" style={{ color: "#8ca5bc" }}>Click or drag to upload images</p>
                  <p className="text-xs mt-1" style={{ color: "#6b8a9e" }}>PNG, JPG up to 5MB</p>
                </div>
              </div>
              {uploading && <div className="text-xs mt-2 text-center animate-pulse" style={{ color: "#8ca5bc" }}>Uploading images...</div>}
              
              {form.image_urls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                  {form.image_urls.map((url, index) => (
                    <div key={url} className="relative group h-28 rounded-lg overflow-hidden">
                      <img src={mediaUrl(url)} alt="" className="h-full w-full object-cover" />
                      <button onClick={() => removeImage(url)} 
                              className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ background: "rgba(0,0,0,0.7)", color: "#fff" }}>
                        <X size={13} />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ background: color, color: "#0d1f2d" }}>Primary</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Availability Toggle */}
            <label className="flex items-center gap-3 mb-6 p-3 rounded-xl cursor-pointer transition-all"
                   style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <input type="checkbox" checked={form.is_available} onChange={set("is_available")} />
              <span className="text-sm font-medium" style={{ color: "var(--text-primary, white)" }}>Mark as available for rent</span>
            </label>

            {/* Error & Success Messages */}
            {error && (
              <div className="mb-4 p-3 rounded-xl text-xs font-semibold animate-in slide-in-from-top-1"
                   style={{ background: "#ef444420", color: "#ef4444", border: "1px solid #ef444430" }}>
                {error}
              </div>
            )}
            {saved && (
              <div className="mb-4 p-3 rounded-xl text-xs font-semibold animate-in slide-in-from-top-1 flex items-center gap-2"
                   style={{ background: "#10b98120", color: "#10b981", border: "1px solid #10b98130" }}>
                <Check size={14} /> Property {editItem ? "updated" : "added"} successfully!
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-80">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={saving || (!selectedProvider && !staffMode)}
                      className="flex-1 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:brightness-110">
                <span style={{ background: color, color: "#0d1f2d", padding: "12px 24px", borderRadius: "12px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                  {saving ? "Saving..." : editItem ? "Update Property" : "Add Property"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export function AddPropertyPage({ color, user, editItem, onSaved, onCancel }: AddPropertyPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [properties, setProperties] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProperty, setEditingProperty] = useState<ServiceListing | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const res = await providerService.browseServices("property");
      setProperties(res.data?.items ?? []);
    } catch (err) {
      console.error("Failed to load properties:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    loadProperties();
    onSaved?.();
  };

  const handleEdit = (property: ServiceListing) => {
    setEditingProperty(property);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this property?")) {
      try {
        await providerService.deleteListing("properties", id);
        await loadProperties();
      } catch (err) {
        console.error("Failed to delete property:", err);
      }
    }
  };

  return (
    <PageShell title="Properties" subtitle="Manage your rental listings" color={color}>
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary, white)" }}>My Properties</h2>
          <p className="text-xs mt-1" style={{ color: "#8ca5bc" }}>{properties.length} total listings</p>
        </div>
        <button onClick={() => {
          setEditingProperty(null);
          setIsModalOpen(true);
        }} 
        className="px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all hover:scale-105"
        style={{ background: color, color: "#0d1f2d" }}>
          <Plus size={16} /> Add Property
        </button>
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl h-64 animate-pulse" style={{ background: "var(--bg-secondary, #132333)" }} />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="rounded-xl p-12 text-center" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <Home size={48} style={{ color: "#8ca5bc", margin: "0 auto 16px" }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary, white)" }}>No properties yet</h3>
          <p className="text-sm mb-4" style={{ color: "#8ca5bc" }}>Start by adding your first property listing</p>
          <button onClick={() => setIsModalOpen(true)} 
                  className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:brightness-110"
                  style={{ background: color, color: "#0d1f2d" }}>
            Add Property
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((property) => (
            <div key={property.id} className="rounded-xl overflow-hidden transition-all hover:-translate-y-1 group"
                 style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="h-40 overflow-hidden relative">
                {property.primary_image ? (
                  <img src={mediaUrl(property.primary_image)} alt={property.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center" style={{ background: `${color}10` }}>
                    <Home size={32} style={{ color: "#8ca5bc" }} />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEdit(property)} 
                          className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all hover:scale-105"
                          style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>
                    <Edit3 size={12} />
                  </button>
                  <button onClick={() => handleDelete(property.id)} 
                          className="w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all hover:scale-105"
                          style={{ background: "rgba(0,0,0,0.6)", color: "#ef4444" }}>
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md"
                     style={{ background: property.is_available ? "#10b981" : "#ef4444", color: "#fff" }}>
                  {property.is_available ? "Available" : "Unavailable"}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-sm mb-1 line-clamp-1" style={{ color: "var(--text-primary, white)" }}>{property.title}</h3>
                <p className="text-xs mb-2" style={{ color: "#8ca5bc" }}>{property.city}, {property.district}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-black" style={{ color }}>K{property.price?.toLocaleString()}/mo</span>
                  <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: `${color}15`, color }}>
                    {property.bedrooms} bed • {property.bathrooms} bath
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <PropertyFormModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProperty(null);
          onCancel?.();
        }}
        onSubmit={handleSave}
        editItem={editingProperty}
        color={color}
        user={user}
      />
    </PageShell>
  );
}
