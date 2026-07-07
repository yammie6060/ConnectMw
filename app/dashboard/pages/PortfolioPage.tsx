import { useEffect, useMemo, useState } from "react";
import { PageShell } from "../components/PageShell";
import { Plus, Edit2, Trash2, Clock, Tag, Camera, Check, UploadCloud, X, MapPin, Grid, List, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { BeautyPriceOption, mediaUrl, providerService, ServiceListing } from "@/services/provider.service";
import { SessionUser } from "../types/dashboard";
import { canActAsStaff, loadStaffProviderOptions, ProviderOption, sessionProviderOptions } from "../utils/providerAccess";

interface PortfolioPageProps {
  color: string;
  user: SessionUser;
  initialShowAdd?: boolean;
}

const DEFAULT_CATEGORIES = ["hair", "barber", "nails", "makeup", "spa"];
const defaultPriceOptions: BeautyPriceOption[] = [
  { service_mode: "onsite", price_type: "fixed", price: null, location_note: "At shop or salon", is_available: true },
  { service_mode: "mobile", price_type: "from", price: null, location_note: "Depends on customer location", is_available: false },
];
const emptyForm = {
  name: "",
  category: "hair",
  price: "",
  duration_minutes: "",
  description: "",
  image_urls: [] as string[],
  price_options: defaultPriceOptions,
  is_available: true,
  latitude: "",
  longitude: "",
};

const GRID_PAGE_SIZE = 9;
const LIST_PAGE_SIZE = 8;

function money(value?: number | null) {
  return value == null ? "Price not set" : `K${value.toLocaleString()}`;
}

function priceOptionLabel(option: BeautyPriceOption) {
  const mode = option.service_mode === "onsite" ? "Onsite" : option.service_mode === "mobile" ? "Mobile" : option.service_mode;
  const price = option.price == null ? "negotiable" : `${option.price_type === "from" ? "from " : ""}${money(option.price)}`;
  return `${mode}: ${price}`;
}

// ---------------------------------------------------------------------------
// Modal — responsive with full-screen on mobile
// ---------------------------------------------------------------------------
function ServiceModal({
  isOpen,
  onClose,
  editing,
  color,
  form,
  setForm,
  categories,
  providerId,
  staffMode,
  ownerForm,
  setOwner,
  saving,
  saved,
  error,
  uploadImages,
  uploading,
  removeImage,
  updatePriceOption,
  useCurrentLocation,
  locating,
  save,
}: any) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fieldStyle = {
    width: "100%",
    background: "var(--bg-elevated, #1a2e42)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: "10px",
    color: "var(--text-primary, white)",
    padding: "9px 12px",
    fontSize: "13px",
    outline: "none",
  } as React.CSSProperties;

  const labelStyle = {
    color: "#8ca5bc",
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    marginBottom: "4px",
    display: "block",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="relative w-full sm:w-full md:max-w-3xl max-h-[95vh] sm:max-h-[85vh] flex flex-col rounded-t-2xl sm:rounded-2xl overflow-hidden"
        style={{ 
          background: "var(--bg-secondary, #132333)", 
          border: "1px solid rgba(255,255,255,0.07)",
          borderBottom: "none",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="min-w-0">
            <h3 className="text-sm sm:text-base font-bold truncate" style={{ color: "var(--text-primary, white)" }}>
              {editing ? "Edit Service" : "Create New Service"}
            </h3>
            <p className="text-[10px] sm:text-xs truncate" style={{ color: "#8ca5bc" }}>Fill in the details below to {editing ? "update" : "add"} your service</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0">
            <X size={18} style={{ color: "#8ca5bc" }} />
          </button>
        </div>

        {/* Body (scrolls) */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-3 sm:py-4">
          {staffMode && !providerId && (
            <div className="mb-4 p-3 rounded-xl" style={{ background: "var(--bg-elevated, #1a2e42)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h4 className="text-xs font-semibold mb-2" style={{ color: "#8ca5bc" }}>Provider Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input value={ownerForm.fullName} onChange={setOwner("fullName")} placeholder="Owner name *" style={fieldStyle} />
                <input value={ownerForm.phone} onChange={setOwner("phone")} placeholder="Owner phone *" style={fieldStyle} />
                <input type="email" value={ownerForm.email} onChange={setOwner("email")} placeholder="Owner email *" style={fieldStyle} />
                <input value={ownerForm.businessName} onChange={setOwner("businessName")} placeholder="Business name" style={fieldStyle} />
                <input className="sm:col-span-2" value={ownerForm.address} onChange={setOwner("address")} placeholder="Physical address" style={fieldStyle} />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-3">
              <div>
                <label style={labelStyle}>Service Name</label>
                <input value={form.name} onChange={setForm("name")} placeholder="Enter service name" style={fieldStyle} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={labelStyle}>Category</label>
                  <select value={form.category} onChange={setForm("category")} style={fieldStyle}>
                    {categories.map((c: string) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Duration (min)</label>
                  <input type="number" value={form.duration_minutes} onChange={setForm("duration_minutes")} placeholder="60" style={fieldStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Price (MWK)</label>
                <input type="number" value={form.price} onChange={setForm("price")} placeholder="Enter price" style={fieldStyle} />
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea value={form.description} onChange={setForm("description")} rows={3} style={{ ...fieldStyle, resize: "vertical" }} placeholder="Describe your service..." />
              </div>

              <div>
                <label style={labelStyle}>Pricing Options</label>
                <div className="space-y-2">
                  {form.price_options.map((option: BeautyPriceOption, index: number) => (
                    <div key={option.service_mode} className="p-3 rounded-xl" style={{ background: "var(--bg-elevated, #1a2e42)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold" style={{ color: "var(--text-primary, white)" }}>
                          {option.service_mode === "onsite" ? "Onsite" : "Mobile"}
                        </span>
                        <label className="flex items-center gap-2 text-xs">
                          <span style={{ color: "#8ca5bc" }}>Available</span>
                          <input type="checkbox" checked={option.is_available} onChange={(e) => updatePriceOption(index, "is_available", e.target.checked)} />
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <select value={option.price_type} onChange={(e) => updatePriceOption(index, "price_type", e.target.value)} style={fieldStyle}>
                          <option value="fixed">Fixed</option>
                          <option value="from">From</option>
                          <option value="negotiable">Negotiable</option>
                        </select>
                        <input type="number" value={option.price ?? ""} onChange={(e) => updatePriceOption(index, "price", e.target.value ? Number(e.target.value) : null)} placeholder="MWK" style={fieldStyle} />
                      </div>
                      <input className="mt-2" value={option.location_note ?? ""} onChange={(e) => updatePriceOption(index, "location_note", e.target.value)} placeholder="Location note" style={fieldStyle} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Service Images</label>
                  <label className="text-[11px] font-bold cursor-pointer" style={{ color }}>
                    {uploading ? "Uploading..." : "+ Upload"}
                    <input type="file" accept="image/*" multiple onChange={(e) => uploadImages(e.target.files)} className="hidden" />
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {form.image_urls.map((url: string, index: number) => (
                    <div key={url} className="relative aspect-square rounded-lg overflow-hidden" style={{ background: `${color}10` }}>
                      <img src={mediaUrl(url)} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => removeImage(url)} className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.55)" }}>
                        <X size={10} style={{ color: "#fff" }} />
                      </button>
                      {index === 0 && (
                        <span className="absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: color, color: "#0d1f2d" }}>
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                  {form.image_urls.length === 0 && (
                    <div className="col-span-3 h-20 rounded-lg flex items-center justify-center gap-2 text-xs" style={{ background: `${color}10`, color: "#8ca5bc", border: `1px solid ${color}25` }}>
                      <UploadCloud size={14} /> No images yet
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Location (optional)</label>
                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    disabled={locating}
                    className="flex items-center gap-1 text-[11px] font-bold disabled:opacity-50"
                    style={{ color }}
                  >
                    <MapPin size={12} /> {locating ? "Locating..." : "Use my location"}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" step="any" value={form.latitude} onChange={setForm("latitude")} placeholder="Latitude" style={fieldStyle} />
                  <input type="number" step="any" value={form.longitude} onChange={setForm("longitude")} placeholder="Longitude" style={fieldStyle} />
                </div>
                <p className="text-[10px] mt-1" style={{ color: "#6b8a9e" }}>Set this if service location differs from your address</p>
              </div>

              <div className="p-3 rounded-xl" style={{ background: "var(--bg-elevated, #1a2e42)" }}>
                <label className="flex items-center gap-3 text-xs font-semibold" style={{ color: "var(--text-primary, white)" }}>
                  <input type="checkbox" checked={form.is_available} onChange={setForm("is_available")} />
                  Publish this service (visible to customers)
                </label>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg text-xs font-semibold" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 px-4 sm:px-5 py-3 sm:py-4 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors order-2 sm:order-1" style={{ background: "var(--bg-elevated, #1a2e42)", color: "#8ca5bc" }}>
            Cancel
          </button>
          <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2" style={{ background: saved ? "#10b981" : color, color: "#0d1f2d" }}>
            {saved ? <><Check size={14} /> Saved!</> : saving ? "Saving..." : editing ? "Update Service" : "Add Service"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grid card - responsive
// ---------------------------------------------------------------------------
function ServiceCard({ service, color, onEdit, onDelete }: any) {
  return (
    <div className="group rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="relative h-40 sm:h-48 md:h-40 overflow-hidden" style={{ background: `${color}15` }}>
        {service.primary_image ? (
          <img src={mediaUrl(service.primary_image)} alt={service.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: "#8ca5bc" }}>
            <Camera size={28} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: service.is_available ? "rgba(16,185,129,0.9)" : "rgba(239,68,68,0.9)", color: "#fff" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            {service.is_available ? "Published" : "Hidden"}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(service)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:scale-110 transition-transform" style={{ background: "rgba(0,0,0,0.6)" }}>
            <Edit2 size={12} style={{ color: "#fff" }} />
          </button>
          <button onClick={() => onDelete(service)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:scale-110 transition-transform" style={{ background: "rgba(239,68,68,0.7)" }}>
            <Trash2 size={12} style={{ color: "#fff" }} />
          </button>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>
            <Tag size={10} /> {service.category_display || service.category}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <h4 className="text-sm font-bold mb-1 line-clamp-1" style={{ color: "var(--text-primary, white)" }}>{service.title}</h4>
        <p className="text-xs line-clamp-2 mb-3" style={{ color: "#8ca5bc" }}>{service.description || "No description provided"}</p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "#8ca5bc" }}>
            <Clock size={12} />
            <span>{service.duration_minutes ? `${service.duration_minutes} min` : "No duration"}</span>
          </div>
          <span className="text-base font-black" style={{ color }}>{money(service.price)}</span>
        </div>
        {service.price_options?.filter((opt: any) => opt.is_available).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            {service.price_options.filter((opt: any) => opt.is_available).map((option: any) => (
              <span key={option.service_mode} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "#cde0f0" }}>
                {priceOptionLabel(option)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// List row - responsive
// ---------------------------------------------------------------------------
function ServiceListRow({ service, color, onEdit, onDelete }: any) {
  const availableOptions = service.price_options?.filter((opt: any) => opt.is_available) ?? [];
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 rounded-xl transition-colors hover:bg-white/[0.03]" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden shrink-0" style={{ background: `${color}15` }}>
          {service.primary_image ? (
            <img src={mediaUrl(service.primary_image)} alt={service.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: "#8ca5bc" }}><Camera size={16} /></div>
          )}
        </div>
        <div className="min-w-0 flex-1 sm:hidden">
          <h4 className="text-sm font-bold truncate" style={{ color: "var(--text-primary, white)" }}>{service.title}</h4>
          <div className="text-sm font-black" style={{ color }}>{money(service.price)}</div>
        </div>
      </div>

      <div className="min-w-0 flex-1 hidden sm:block">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold truncate" style={{ color: "var(--text-primary, white)" }}>{service.title}</h4>
          <span className="shrink-0 inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: service.is_available ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: service.is_available ? "#10b981" : "#ef4444" }}>
            {service.is_available ? "Published" : "Hidden"}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>
            <Tag size={9} /> {service.category_display || service.category}
          </span>
          <span className="flex items-center gap-1 text-[11px]" style={{ color: "#8ca5bc" }}>
            <Clock size={11} /> {service.duration_minutes ? `${service.duration_minutes} min` : "No duration"}
          </span>
          {availableOptions.slice(0, 2).map((option: any) => (
            <span key={option.service_mode} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "#cde0f0" }}>
              {priceOptionLabel(option)}
            </span>
          ))}
          {availableOptions.length > 2 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "#cde0f0" }}>
              +{availableOptions.length - 2} more
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between w-full sm:w-auto sm:gap-4">
        <div className="hidden sm:block text-right shrink-0">
          <div className="text-sm font-black" style={{ color }}>{money(service.price)}</div>
        </div>
        <div className="flex items-center gap-2 sm:gap-1.5 shrink-0">
          <span className="sm:hidden inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: service.is_available ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: service.is_available ? "#10b981" : "#ef4444" }}>
            {service.is_available ? "Published" : "Hidden"}
          </span>
          <button onClick={() => onEdit(service)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: "var(--bg-elevated, #1a2e42)" }}>
            <Edit2 size={13} style={{ color: "#8ca5bc" }} />
          </button>
          <button onClick={() => onDelete(service)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: "rgba(239,68,68,0.12)" }}>
            <Trash2 size={13} style={{ color: "#ef4444" }} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pagination controls - responsive
// ---------------------------------------------------------------------------
function Pagination({ page, pageCount, onChange, color }: { page: number; pageCount: number; onChange: (page: number) => void; color: string }) {
  if (pageCount <= 1) return null;
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1,
  );
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-1.5 mt-5">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition-colors"
        style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <ChevronLeft size={12} style={{ color: "#8ca5bc" }} />
      </button>
      {pages.map((p, idx) => (
        <span key={p} className="flex items-center">
          {idx > 0 && pages[idx - 1] !== p - 1 && <span className="px-1 text-xs" style={{ color: "#6b8a9e" }}>…</span>}
          <button
            onClick={() => onChange(p)}
            className="min-w-[28px] h-7 sm:min-w-8 sm:h-8 px-1.5 sm:px-2 rounded-lg text-[11px] sm:text-xs font-bold transition-colors"
            style={p === page ? { background: color, color: "#0d1f2d" } : { background: "var(--bg-secondary, #132333)", color: "#8ca5bc", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {p}
          </button>
        </span>
      ))}
      <button
        onClick={() => onChange(Math.min(pageCount, page + 1))}
        disabled={page === pageCount}
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center disabled:opacity-30 transition-colors"
        style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <ChevronRight size={12} style={{ color: "#8ca5bc" }} />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export function PortfolioPage({ color, user, initialShowAdd = false }: PortfolioPageProps) {
  const [activeCat, setActiveCat] = useState("All");
  const [services, setServices] = useState<ServiceListing[]>([]);
  const [showAdd, setShowAdd] = useState(initialShowAdd);
  const [editing, setEditing] = useState<ServiceListing | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [providerId, setProviderId] = useState(user.activeProviderId ?? "");
  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [ownerForm, setOwnerForm] = useState({ fullName: "", email: "", phone: "", businessName: "", address: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
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

  const filtered = useMemo(() => services.filter((service) => {
    const matchesCategory = activeCat === "All" || service.category === activeCat;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || service.title?.toLowerCase().includes(q) || service.description?.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  }), [services, activeCat, searchQuery]);

  // Reset to page 1 whenever the result set or view mode changes.
  useEffect(() => { setPage(1); }, [activeCat, searchQuery, viewMode, providerId]);

  const pageSize = viewMode === "grid" ? GRID_PAGE_SIZE : LIST_PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const set = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const setOwner = (k: keyof typeof ownerForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setOwnerForm((f) => ({ ...f, [k]: e.target.value }));

  const useCurrentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Location services aren't available in this browser.");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((f) => ({
          ...f,
          latitude: position.coords.latitude.toFixed(7),
          longitude: position.coords.longitude.toFixed(7),
        }));
        setLocating(false);
      },
      () => {
        setError("Could not get your location. You can enter coordinates manually.");
        setLocating(false);
      },
    );
  };

  const openAddModal = () => {
    setEditing(null);
    setForm({ ...emptyForm, price_options: defaultPriceOptions.map((option) => ({ ...option })) });
    setError("");
    setShowAdd(true);
  };

  const startEdit = (service: ServiceListing) => {
    setEditing(service);
    setError("");
    setForm({
      name: service.name || service.title || "",
      category: service.category || "hair",
      price: service.price ? String(service.price) : "",
      duration_minutes: service.duration_minutes != null ? String(service.duration_minutes) : "",
      description: service.description || "",
      image_urls: service.images?.length ? service.images.map((image) => image.image_url) : service.primary_image ? [service.primary_image] : [],
      price_options: service.price_options?.length ? service.price_options : defaultPriceOptions.map((option) => ({ ...option })),
      is_available: service.is_available,
      latitude: service.latitude != null ? String(service.latitude) : "",
      longitude: service.longitude != null ? String(service.longitude) : "",
    });
    setShowAdd(true);
  };

  const closeModal = () => {
    setShowAdd(false);
    setEditing(null);
    setError("");
  };

  const save = async () => {
    setError("");
    if (!form.name.trim()) return setError("Service name is required.");
    setSaving(true);
    let serviceProviderId = providerId;
    try {
      if (!serviceProviderId && staffMode) {
        if (!ownerForm.fullName.trim() || !ownerForm.email.trim() || !ownerForm.phone.trim()) {
          setSaving(false);
          return setError("Add owner name, email, and phone or choose an existing provider.");
        }
        const ownerProvider = await providerService.createProviderForOwner({
          provider_type_name: "beauty_provider",
          owner_full_name: ownerForm.fullName.trim(),
          owner_email: ownerForm.email.trim(),
          owner_phone: ownerForm.phone.trim(),
          business_name: ownerForm.businessName.trim() || ownerForm.fullName.trim(),
          physical_address: ownerForm.address.trim(),
        });
        serviceProviderId = ownerProvider.data?.id ?? "";
        setProviderId(serviceProviderId);
      }
      if (!serviceProviderId) throw new Error("Choose a provider workspace first.");
    } catch (err) {
      setSaving(false);
      return setError(err instanceof Error ? err.message : "Could not prepare owner provider.");
    }
    const payload = {
      provider_id: serviceProviderId,
      category: form.category,
      name: form.name.trim(),
      description: form.description,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : null,
      price: form.price ? Number(form.price) : null,
      price_options: form.price_options
        .filter((option) => option.is_available || option.price != null)
        .map((option) => ({ ...option, price: option.price == null ? null : Number(option.price) })),
      is_available: form.is_available,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      images: form.image_urls.map((image_url, index) => ({ image_url, is_primary: index === 0 })),
    };
    try {
      if (editing) await providerService.updateBeautyService(editing.id, payload);
      else await providerService.createBeautyService(payload);
      setSaved(true);
      loadServices();
      setTimeout(() => {
        setSaved(false);
        closeModal();
      }, 900);
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
  const updatePriceOption = (index: number, key: keyof BeautyPriceOption, value: string | boolean | number | null) => {
    setForm((current) => ({
      ...current,
      price_options: current.price_options.map((option, idx) => idx === index ? { ...option, [key]: value } : option),
    }));
  };

  const deleteItem = async (service: ServiceListing) => {
    if (!confirm(`Delete "${service.title}"?`)) return;
    await providerService.deleteListing("beauty", service.id);
    setServices((current) => current.filter((item) => item.id !== service.id));
  };

  return (
    <PageShell title="Portfolio" subtitle="Manage your beauty services and offerings" color={color}>
      {/* Main container with centering and max-width */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Stats - responsive grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {[
            { label: "Total Services", value: services.length },
            { label: "Published", value: services.filter((s) => s.is_available).length },
            { label: "Hidden", value: services.filter((s) => !s.is_available).length },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl p-3 sm:p-4" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="text-xl sm:text-2xl font-black" style={{ color }}>{stat.value}</div>
              <div className="text-[10px] sm:text-xs mt-0.5" style={{ color: "#8ca5bc" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Controls - fully responsive */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-4 sm:mb-5 p-3 sm:p-4 rounded-xl w-full" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 w-full md:w-auto md:flex-1">
            <div className="relative flex-1 min-w-[140px] xs:min-w-[180px] md:min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#8ca5bc" }} />
              <input
                type="text"
                placeholder="Search services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--bg-elevated, #1a2e42)", color: "var(--text-primary, white)", border: "1px solid rgba(255,255,255,0.07)" }}
              />
            </div>
            <div className="flex gap-2 flex-1 xs:flex-none">
              <select value={activeCat} onChange={(e) => setActiveCat(e.target.value)} className="flex-1 xs:flex-none px-3 py-2 rounded-lg text-xs font-semibold outline-none min-w-[80px]" style={{ background: "var(--bg-elevated, #1a2e42)", color: "var(--text-primary, white)", border: "1px solid rgba(255,255,255,0.07)" }}>
                {categoryLabels.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <select value={providerId} onChange={(e) => setProviderId(e.target.value)} className="flex-1 xs:flex-none px-3 py-2 rounded-lg text-xs font-semibold outline-none min-w-[120px] max-w-[200px]" style={{ background: "var(--bg-elevated, #1a2e42)", color: "var(--text-primary, white)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <option value="">{staffMode ? "Create from owner" : "Select provider"}</option>
                {providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.business_name || provider.display_name || "Provider"}{provider.ownerEmail ? ` - ${provider.ownerEmail}` : ""}</option>)}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between xs:justify-end gap-2 w-full md:w-auto md:flex-shrink-0">
            <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
              <button onClick={() => setViewMode("list")} className="p-2 transition-colors" style={{ background: viewMode === "list" ? "var(--bg-elevated, #1a2e42)" : "transparent" }}>
                <List size={15} style={{ color: viewMode === "list" ? color : "#8ca5bc" }} />
              </button>
              <button onClick={() => setViewMode("grid")} className="p-2 transition-colors" style={{ background: viewMode === "grid" ? "var(--bg-elevated, #1a2e42)" : "transparent" }}>
                <Grid size={15} style={{ color: viewMode === "grid" ? color : "#8ca5bc" }} />
              </button>
            </div>
            <button
              onClick={openAddModal}
              className="px-3 sm:px-4 py-2 rounded-lg text-[11px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all whitespace-nowrap"
              style={{ background: color, color: "#0d1f2d" }}
            >
              <Plus size={14} /> <span className="hidden xs:inline">Add Service</span>
            </button>
          </div>
        </div>

        {/* List / Grid - responsive */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm" style={{ color: "#8ca5bc" }}>Loading services...</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-sm font-semibold" style={{ color: "#8ca5bc" }}>No services found</p>
            <p className="text-xs mt-1" style={{ color: "#6b8a9e" }}>Add your first service to get started</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {paginated.map((service) => (
              <ServiceCard key={service.id} service={service} color={color} onEdit={startEdit} onDelete={deleteItem} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {paginated.map((service) => (
              <ServiceListRow key={service.id} service={service} color={color} onEdit={startEdit} onDelete={deleteItem} />
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} color={color} />
        )}
      </div>

      <ServiceModal
        isOpen={showAdd}
        onClose={closeModal}
        editing={editing}
        color={color}
        form={form}
        setForm={set}
        categories={categories}
        providerId={providerId}
        staffMode={staffMode}
        ownerForm={ownerForm}
        setOwner={setOwner}
        saving={saving}
        saved={saved}
        error={error}
        uploadImages={uploadImages}
        uploading={uploading}
        removeImage={removeImage}
        updatePriceOption={updatePriceOption}
        useCurrentLocation={useCurrentLocation}
        locating={locating}
        save={save}
      />
    </PageShell>
  );
}