import { useEffect, useMemo, useState } from "react";
import { PageShell } from "../components/PageShell";
import { Search, Filter, Plus, Package, Edit2, Trash2, Home, X, ChevronDown, AlertCircle } from "lucide-react";
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

  const filteredAndSorted = useMemo(() => {
    let filtered = items.filter((item) => 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      (isProperty && item.city?.toLowerCase().includes(search.toLowerCase())) ||
      (!isProperty && item.part_name?.toLowerCase().includes(search.toLowerCase()))
    );

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Apply sorting
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
      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-xl p-3" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-2xl font-bold" style={{ color }}>{items.length}</div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8ca5bc" }}>Total {itemName}s</div>
        </div>
        <div className="rounded-xl p-3" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-2xl font-bold" style={{ color: "#10b981" }}>
            {items.filter(i => i.status === "In Stock" || i.status === "Available" || i.status === "Published").length}
          </div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8ca5bc" }}>Active</div>
        </div>
        <div className="rounded-xl p-3" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-2xl font-bold" style={{ color: "#f5ab20" }}>
            {items.filter(i => i.status === "Low Stock").length}
          </div>
          <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8ca5bc" }}>Low Stock</div>
        </div>
        <div className="rounded-xl p-3" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="text-2xl font-bold" style={{ color: "#8ca5bc" }}>
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
          className="px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all hover:brightness-110 active:scale-95"
          style={{ background: color, color: "#0d1f2d" }}
        >
          <Plus size={16} />
          Add New {itemName}
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
          className="px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all hover:brightness-110"
          style={{
            background: showFilters ? color : `${color}15`,
            color: showFilters ? "#0d1f2d" : color,
            border: !showFilters ? `1px solid ${color}30` : "none",
          }}
        >
          <Filter size={14} />
          Filters
          <ChevronDown size={12} className={`transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>
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
              {filteredAndSorted.length} {itemName.toLowerCase()} listing{filteredAndSorted.length !== 1 ? "s" : ""}
            </div>
            {search && (
              <button onClick={() => setSearch("")} className="text-xs hover:underline" style={{ color }}>
                Clear search
              </button>
            )}
          </div>

          {filteredAndSorted.length === 0 ? (
            <div className="rounded-xl p-12 text-center" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
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
          ) : (
            <div className="space-y-3">
              {filteredAndSorted.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-xl p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div className="flex items-center gap-3">
                    {/* Thumbnail */}
                    <div
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center transition-all group-hover:scale-105"
                      style={{ background: `${color}10`, border: `1px solid ${color}25` }}
                    >
                      {item.primary_image ? (
                        <img src={mediaUrl(item.primary_image)} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ItemIcon size={24} style={{ color }} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <div className="text-sm font-semibold truncate" style={{ color: "var(--text-primary, white)" }}>
                          {item.title}
                        </div>
                        <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                          style={{
                            background: `${statusColor(item.status)}20`,
                            color: statusColor(item.status),
                            border: `1px solid ${statusColor(item.status)}40`,
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                      <div className="text-[11px] flex flex-wrap gap-x-3 gap-y-1" style={{ color: "#8ca5bc" }}>
                        <span>{isProperty ? item.property_type_display || item.property_type : item.part_name || "Spare part"}</span>
                        <span className="font-semibold" style={{ color }}>{money(item.price)}</span>
                        {(item.city || item.street_address) && (
                          <span>📍 {item.city || item.street_address}</span>
                        )}
                        {item.quantity !== undefined && !isProperty && (
                          <span>📦 {item.quantity} in stock</span>
                        )}
                        {isProperty && item.bedrooms && (
                          <span>🛏️ {item.bedrooms} bed{item.bedrooms !== 1 ? "s" : ""}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => setEditing(item)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                        style={{ background: "rgba(255,255,255,0.05)", color: "#8ca5bc" }}
                        aria-label="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingItem(item)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105"
                        style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}
                        aria-label="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

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
