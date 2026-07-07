import { useEffect, useMemo, useState } from "react";
import { PageShell } from "../components/PageShell";
import { Search, Filter, Plus, Package, Edit2, Trash2, Home, X, ChevronDown, AlertCircle, Grid, List, ChevronLeft, ChevronRight } from "lucide-react";
import { mediaUrl, providerService, ServiceListing } from "@/services/provider.service";
import { SessionUser } from "../types/dashboard";
import { AddPartPage } from "./AddPartPage";
import { AddPropertyPage } from "./AddPropertyPage";
import {
  canActAsStaff,
  loadStaffProviderOptions,
  ProviderOption,
  sessionProviderOptions,
} from "../utils/providerAccess";

interface InventoryPageProps {
  color: string;
  role: string;
  user: SessionUser;
  onNavigate?: (id: string) => void;
}

function money(value?: number | null) {
  return value == null ? "Price not set" : `K${value.toLocaleString()}`;
}

function statusColor(s: string) {
  if (s === "In Stock" || s === "Available" || s === "Published") return "#10b981";
  if (s === "Low Stock") return "#f5ab20";
  if (s === "Occupied" || s === "Sold" || s === "Hidden") return "#8ca5bc";
  return "#ef4444";
}

const GRID_PAGE_SIZE = 9;
const LIST_PAGE_SIZE = 8;

// Delete Confirmation Modal
function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemTitle, 
  color 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  itemTitle: string;
  color: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-md rounded-2xl animate-in zoom-in-95 duration-200" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="p-6">
          <div className="flex items-center justify-center mb-4 w-12 h-12 mx-auto rounded-full" style={{ background: "#ef444420" }}>
            <AlertCircle size={24} style={{ color: "#ef4444" }} />
          </div>
          <h3 className="text-lg font-bold text-center mb-2" style={{ color: "var(--text-primary, white)" }}>Delete Listing</h3>
          <p className="text-sm text-center mb-6" style={{ color: "#8ca5bc" }}>
            Are you sure you want to delete "<span className="font-semibold" style={{ color: "var(--text-primary, white)" }}>{itemTitle}</span>"?<br />
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80"
                    style={{ background: "rgba(255,255,255,0.06)", color: "#cde0f0" }}>
              Cancel
            </button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
                    style={{ background: "#ef4444", color: "#fff" }}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grid Card
// ---------------------------------------------------------------------------
function InventoryGridCard({ item, color, isProperty, onEdit, onDelete }: any) {
  const ItemIcon = isProperty ? Home : Package;
  
  return (
    <div className="group rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="relative h-40 sm:h-48 md:h-40 overflow-hidden" style={{ background: `${color}15` }}>
        {item.primary_image ? (
          <img src={mediaUrl(item.primary_image)} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ color: "#8ca5bc" }}>
            <ItemIcon size={28} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full" style={{ background: statusColor(item.status), color: "#fff" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            {item.status}
          </span>
        </div>
        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(item)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:scale-110 transition-transform" style={{ background: "rgba(0,0,0,0.6)" }}>
            <Edit2 size={12} style={{ color: "#fff" }} />
          </button>
          <button onClick={() => onDelete(item)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:scale-110 transition-transform" style={{ background: "rgba(239,68,68,0.7)" }}>
            <Trash2 size={12} style={{ color: "#fff" }} />
          </button>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>
            {isProperty ? (item.property_type_display || item.property_type) : (item.part_name || "Spare part")}
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <h4 className="text-sm font-bold mb-1 line-clamp-1" style={{ color: "var(--text-primary, white)" }}>{item.title}</h4>
        <p className="text-xs line-clamp-2 mb-3" style={{ color: "#8ca5bc" }}>{item.description || "No description provided"}</p>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "#8ca5bc" }}>
            <span>{money(item.price)}</span>
          </div>
          {(item.city || item.street_address) && (
            <span className="text-[10px]" style={{ color: "#8ca5bc" }}>
               {item.city || item.street_address}
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          {!isProperty && item.quantity !== undefined && (
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "#cde0f0" }}>
              📦 {item.quantity} in stock
            </span>
          )}
          {isProperty && item.bedrooms && (
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "#cde0f0" }}>
              🛏️ {item.bedrooms} bed{item.bedrooms !== 1 ? "s" : ""}
            </span>
          )}
          {isProperty && item.bathrooms && (
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "#cde0f0" }}>
              🚿 {item.bathrooms} bath{item.bathrooms !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// List Row
// ---------------------------------------------------------------------------
function InventoryListRow({ item, color, isProperty, onEdit, onDelete }: any) {
  const ItemIcon = isProperty ? Home : Package;
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 rounded-xl transition-colors hover:bg-white/[0.03]" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden shrink-0" style={{ background: `${color}15` }}>
          {item.primary_image ? (
            <img src={mediaUrl(item.primary_image)} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: "#8ca5bc" }}><ItemIcon size={16} /></div>
          )}
        </div>
        <div className="min-w-0 flex-1 sm:hidden">
          <h4 className="text-sm font-bold truncate" style={{ color: "var(--text-primary, white)" }}>{item.title}</h4>
          <div className="text-sm font-black" style={{ color }}>{money(item.price)}</div>
        </div>
      </div>

      <div className="min-w-0 flex-1 hidden sm:block">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-bold truncate" style={{ color: "var(--text-primary, white)" }}>{item.title}</h4>
          <span className="shrink-0 inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${statusColor(item.status)}20`, color: statusColor(item.status) }}>
            {item.status}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>
            {isProperty ? (item.property_type_display || item.property_type) : (item.part_name || "Spare part")}
          </span>
          <span className="flex items-center gap-1 text-[11px]" style={{ color: "#8ca5bc" }}>
            {money(item.price)}
          </span>
          {(item.city || item.street_address) && (
            <span className="flex items-center gap-1 text-[11px]" style={{ color: "#8ca5bc" }}>
               {item.city || item.street_address}
            </span>
          )}
          {!isProperty && item.quantity !== undefined && (
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)", color: "#cde0f0" }}>
       {item.quantity}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between w-full sm:w-auto sm:gap-4">
        <div className="hidden sm:block text-right shrink-0">
          <div className="text-sm font-black" style={{ color }}>{money(item.price)}</div>
        </div>
        <div className="flex items-center gap-2 sm:gap-1.5 shrink-0">
          <span className="sm:hidden inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${statusColor(item.status)}20`, color: statusColor(item.status) }}>
            {item.status}
          </span>
          <button onClick={() => onEdit(item)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: "var(--bg-elevated, #1a2e42)" }}>
            <Edit2 size={13} style={{ color: "#8ca5bc" }} />
          </button>
          <button onClick={() => onDelete(item)} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ background: "rgba(239,68,68,0.12)" }}>
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

export function InventoryPage({ color, role, user, onNavigate }: InventoryPageProps) {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<ServiceListing[]>([]);
  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [providerId, setProviderId] = useState(user.activeProviderId ?? "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<ServiceListing | null>(null);
  const [deletingItem, setDeletingItem] = useState<ServiceListing | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price_high" | "price_low">("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [page, setPage] = useState(1);

  const isProperty = role === "landlord" || role === "agent";
  const kind = isProperty ? "property" : "spare";
  const staffMode = canActAsStaff(user);
  const ItemIcon = isProperty ? Home : Package;
  const itemName = isProperty ? "Property" : "Part";
  const title = isProperty ? "Property Listings" : "Inventory Management";
  const sub = isProperty
    ? "Manage your rental properties - edit, delete, and track availability"
    : "Manage your spare parts inventory - track stock, edit, and update prices";
  const focusRingStyle = { "--tw-ring-color": color } as React.CSSProperties;

  const loadItems = () => {
    if (!providerId) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    providerService
      .listProviderServices(providerId, kind)
      .then((res) => setItems(res.data?.items ?? []))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Could not load listings.")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const ownProviders = sessionProviderOptions(user, kind);
    setProviders(ownProviders);
    if (!providerId && ownProviders[0]) setProviderId(ownProviders[0].id);
    if (staffMode) {
      loadStaffProviderOptions(kind)
        .then((loaded) => {
          setProviders(loaded);
          if (!providerId && loaded[0]) setProviderId(loaded[0].id);
        })
        .catch(() => setError("Could not load providers."));
    }
  }, [kind, providerId, staffMode, user]);

  useEffect(() => {
    loadItems();
  }, [providerId, kind]);

  const filtered = useMemo(() => {
    let filtered = items.filter((item) => 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (isProperty && item.city?.toLowerCase().includes(search.toLowerCase())) ||
      (!isProperty && item.part_name?.toLowerCase().includes(search.toLowerCase()))
    );

    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    switch (sortBy) {
      case "newest":
        return filtered.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
      case "oldest":
        return filtered.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
      case "price_high":
        return filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
      case "price_low":
        return filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
      default:
        return filtered;
    }
  }, [items, search, statusFilter, sortBy, isProperty]);

  // Reset to page 1 whenever the result set or view mode changes
  useEffect(() => { setPage(1); }, [search, statusFilter, sortBy, viewMode, providerId]);

  const pageSize = viewMode === "grid" ? GRID_PAGE_SIZE : LIST_PAGE_SIZE;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const deleteItem = async () => {
    if (!deletingItem) return;
    const pathKind =
      deletingItem.kind === "property" ? "properties" : deletingItem.kind === "spare" ? "spares" : "beauty";
    try {
      await providerService.deleteListing(pathKind, deletingItem.id);
      setItems((cur) => cur.filter((entry) => entry.id !== deletingItem.id));
      setDeletingItem(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete listing.");
    }
  };

  const getStatusOptions = () => {
    const statuses = new Set(items.map(item => item.status));
    return Array.from(statuses);
  };

  if (editing) {
    return isProperty ? (
      <AddPropertyPage
        color={color}
        user={user}
        editItem={editing}
        onSaved={() => { setEditing(null); loadItems(); }}
        onCancel={() => setEditing(null)}
      />
    ) : (
      <AddPartPage
        color={color}
        user={user}
        editItem={editing}
        onSaved={() => { setEditing(null); loadItems(); }}
        onCancel={() => setEditing(null)}
      />
    );
  }

  return (
    <PageShell title={title} subtitle={sub} color={color}>
      {/* Main container with centering and max-width */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 sm:mb-6">
          <div className="rounded-xl p-3" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-xl sm:text-2xl font-bold" style={{ color }}>{items.length}</div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8ca5bc" }}>Total {itemName}s</div>
          </div>
          <div className="rounded-xl p-3" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-xl sm:text-2xl font-bold" style={{ color: "#10b981" }}>
              {items.filter(i => i.status === "In Stock" || i.status === "Available" || i.status === "Published").length}
            </div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8ca5bc" }}>Active</div>
          </div>
          <div className="rounded-xl p-3" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-xl sm:text-2xl font-bold" style={{ color: "#f5ab20" }}>
              {items.filter(i => i.status === "Low Stock").length}
            </div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8ca5bc" }}>Low Stock</div>
          </div>
          <div className="rounded-xl p-3" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="text-xl sm:text-2xl font-bold" style={{ color: "#8ca5bc" }}>
              {items.filter(i => i.status === "Occupied" || i.status === "Sold" || i.status === "Hidden").length}
            </div>
            <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8ca5bc" }}>Inactive</div>
          </div>
        </div>

        {/* Provider Selection & Add Button */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <select
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all focus:ring-2"
              style={{
                background: "var(--bg-secondary, #132333)",
                color: "var(--text-primary, white)",
                border: "1px solid rgba(255,255,255,0.07)",
                ...focusRingStyle,
              }}
            >
              <option value="">Select Provider Workspace</option>
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.business_name || p.display_name || "Provider"}
                  {p.ownerEmail ? ` - ${p.ownerEmail}` : ""}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() => onNavigate?.(isProperty ? "upload" : "add")}
            className="px-4 sm:px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all hover:brightness-110 active:scale-95 whitespace-nowrap"
            style={{ background: color, color: "#0d1f2d" }}
          >
            <Plus size={16} />
            <span className="hidden xs:inline">Add New {itemName}</span>
            <span className="xs:hidden">Add</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all focus-within:ring-2"
            style={{
              background: "var(--bg-secondary, #132333)",
              border: "1px solid rgba(255,255,255,0.07)",
              ...focusRingStyle,
            }}
          >
            <Search size={16} style={{ color: "#8ca5bc", flexShrink: 0 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${itemName.toLowerCase()} listings...`}
              className="flex-1 bg-transparent text-sm outline-none min-w-0"
              style={{ color: "var(--text-primary, white)" }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:brightness-110 whitespace-nowrap"
            style={{
              background: showFilters ? color : `${color}15`,
              color: showFilters ? "#0d1f2d" : color,
              border: !showFilters ? `1px solid ${color}30` : "none",
            }}
          >
            <Filter size={14} />
            <span className="hidden xs:inline">Filters</span>
            <ChevronDown size={12} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </button>
          <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.07)" }}>
            <button onClick={() => setViewMode("list")} className="p-2 transition-colors" style={{ background: viewMode === "list" ? "var(--bg-elevated, #1a2e42)" : "transparent" }}>
              <List size={15} style={{ color: viewMode === "list" ? color : "#8ca5bc" }} />
            </button>
            <button onClick={() => setViewMode("grid")} className="p-2 transition-colors" style={{ background: viewMode === "grid" ? "var(--bg-elevated, #1a2e42)" : "transparent" }}>
              <Grid size={15} style={{ color: viewMode === "grid" ? color : "#8ca5bc" }} />
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="rounded-xl p-4 mb-4 animate-in slide-in-from-top-2" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold uppercase mb-2 block" style={{ color: "#8ca5bc" }}>Status</label>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-primary, white)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <option value="all">All Statuses</option>
                  {getStatusOptions().map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold uppercase mb-2 block" style={{ color: "#8ca5bc" }}>Sort By</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", color: "var(--text-primary, white)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="price_low">Price: Low to High</option>
                </select>
              </div>
            </div>
            {(statusFilter !== "all" || sortBy !== "newest") && (
              <button 
                onClick={() => { setStatusFilter("all"); setSortBy("newest"); }}
                className="mt-3 text-xs font-semibold transition-all hover:opacity-80"
                style={{ color }}
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl text-xs font-semibold animate-in slide-in-from-top-1 flex items-center gap-2"
            style={{ background: "#ef444420", color: "#ef4444", border: "1px solid #ef444430" }}>
            <AlertCircle size={14} /> {error}
            <button onClick={() => setError("")} className="ml-auto"><X size={12} /></button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl p-4 animate-pulse" style={{ background: "var(--bg-secondary, #132333)" }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }} />
                  <div className="flex-1">
                    <div className="h-4 rounded w-3/4 mb-2" style={{ background: "rgba(255,255,255,0.05)" }} />
                    <div className="h-3 rounded w-1/2" style={{ background: "rgba(255,255,255,0.05)" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Listings Grid/List View */}
        {!loading && (
          <>
            {/* Results Count */}
            <div className="flex justify-between items-center mb-3">
              <div className="text-xs" style={{ color: "#8ca5bc" }}>
                {filtered.length} {itemName.toLowerCase()} listing{filtered.length !== 1 ? "s" : ""}
              </div>
              {(search || statusFilter !== "all" || sortBy !== "newest") && (
                <button 
                  onClick={() => { setSearch(""); setStatusFilter("all"); setSortBy("newest"); }}
                  className="text-xs hover:underline" 
                  style={{ color }}
                >
                  Clear all filters
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-xl p-8 sm:p-12 text-center" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <ItemIcon size={48} style={{ color: "#8ca5bc", margin: "0 auto 16px" }} />
                <h3 className="text-base font-semibold mb-2" style={{ color: "var(--text-primary, white)" }}>No {itemName.toLowerCase()} listings found</h3>
                <p className="text-sm mb-4" style={{ color: "#8ca5bc" }}>
                  {search ? "Try adjusting your search or filters" : `Get started by adding your first ${itemName.toLowerCase()}`}
                </p>
                {!search && (
                  <button
                    onClick={() => onNavigate?.(isProperty ? "upload" : "add")}
                    className="px-4 py-2 rounded-xl text-sm font-bold transition-all hover:brightness-110"
                    style={{ background: color, color: "#0d1f2d" }}
                  >
                    + Add {itemName}
                  </button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {paginated.map((item) => (
                  <InventoryGridCard 
                    key={item.id} 
                    item={item} 
                    color={color} 
                    isProperty={isProperty}
                    onEdit={setEditing} 
                    onDelete={() => setDeletingItem(item)} 
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {paginated.map((item) => (
                  <InventoryListRow 
                    key={item.id} 
                    item={item} 
                    color={color} 
                    isProperty={isProperty}
                    onEdit={setEditing} 
                    onDelete={() => setDeletingItem(item)} 
                  />
                ))}
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <Pagination page={currentPage} pageCount={pageCount} onChange={setPage} color={color} />
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={deleteItem}
        itemTitle={deletingItem?.title || ""}
        color={color}
      />
    </PageShell>
  );
}