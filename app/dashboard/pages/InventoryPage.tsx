import { useEffect, useMemo, useState } from "react";
import { PageShell } from "../components/PageShell";
import { Search, Filter, Plus, Package, Edit2, Trash2, Home } from "lucide-react";
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

export function InventoryPage({ color, role, user, onNavigate }: InventoryPageProps) {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState<ServiceListing[]>([]);
  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [providerId, setProviderId] = useState(user.activeProviderId ?? "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<ServiceListing | null>(null);

  const isProperty = role === "landlord" || role === "agent";
  const kind = isProperty ? "property" : "spare";
  const staffMode = canActAsStaff(user);
  const ItemIcon = isProperty ? Home : Package;
  const itemName = isProperty ? "Property" : "Part";
  const title = isProperty ? "Listings" : "Inventory";
  const sub = isProperty
    ? "View, edit, delete, and publish property listings"
    : "View, edit, delete, and publish spare parts";

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

  const filtered = useMemo(
    () => items.filter((item) => item.title.toLowerCase().includes(search.toLowerCase())),
    [items, search]
  );

  const deleteItem = async (item: ServiceListing) => {
    const pathKind =
      item.kind === "property" ? "properties" : item.kind === "spare" ? "spares" : "beauty";
    await providerService.deleteListing(pathKind, item.id);
    setItems((cur) => cur.filter((entry) => entry.id !== item.id));
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
      <div className="flex flex-col gap-2 mb-4 sm:flex-row ">
        <div className="flex gap-2">
          <select
            value={providerId}
            onChange={(e) => setProviderId(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 rounded-xl text-xs sm:text-sm outline-none truncate"
            style={{
              background: "var(--bg-secondary, #132333)",
              color: "var(--text-primary, white)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <option value="">Select provider</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.business_name || p.display_name || "Provider"}
                {p.ownerEmail ? ` - ${p.ownerEmail}` : ""}
              </option>
            ))}
          </select>
          <button
            onClick={() => onNavigate?.(isProperty ? "upload" : "add")}
            className="flex-shrink-0 px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold"
            style={{ background: color, color: "#0d1f2d" }}
          >
            <Plus size={13} />
            <span className="hidden sm:inline">Add {itemName}</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        <div className="flex gap-2">
          <div
            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: "var(--bg-secondary, #132333)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <Search size={13} style={{ color: "#8ca5bc", flexShrink: 0 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search listings..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: "var(--text-primary, white)" }}
            />
          </div>
          <button
            className="flex-shrink-0 px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold"
            style={{
              background: `${color}18`,
              color,
              border: `1px solid ${color}30`,
            }}
          >
            <Filter size={13} />
            <span className="hidden sm:inline">Filter</span>
          </button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-3 text-xs font-semibold" style={{ color: "#ef4444" }}>
          {error}
        </div>
      )}

      {/* ── Loading ── */}
      {loading && (
        <div className="text-sm" style={{ color: "#8ca5bc" }}>
          Loading listings...
        </div>
      )}

      {/* ── List ── */}
      <div className="flex flex-col gap-2">
        {!loading && filtered.length === 0 && (
          <div
            className="rounded-xl p-6 text-sm text-center"
            style={{
              background: "var(--bg-secondary, #132333)",
              color: "#8ca5bc",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            No listings found.
          </div>
        )}

        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-xl p-3 flex items-center gap-3 transition-all hover:-translate-y-0.5"
            style={{
              background: "var(--bg-secondary, #132333)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            {/* Thumbnail */}
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center"
              style={{ background: `${color}15`, border: `1px solid ${color}25` }}
            >
              {item.primary_image ? (
                <img
                  src={mediaUrl(item.primary_image)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <ItemIcon size={15} style={{ color }} />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div
                className="text-sm font-semibold truncate"
                style={{ color: "var(--text-primary, white)" }}
              >
                {item.title}
              </div>
              <div
                className="text-[11px] mt-0.5 truncate"
                style={{ color: "#8ca5bc" }}
              >
                {isProperty
                  ? item.property_type_display || item.property_type
                  : item.part_name || item.vehicle_brand || "Spare part"}{" "}
                · {money(item.price)}
                {(item.city || item.street_address) && (
                  <> · {item.city || item.street_address}</>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className="hidden sm:inline text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: `${statusColor(item.status)}20`,
                  color: statusColor(item.status),
                  border: `1px solid ${statusColor(item.status)}40`,
                }}
              >
                {item.status}
              </span>
              <button
                onClick={() => setEditing(item)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.05)", color: "#8ca5bc" }}
                aria-label="Edit"
              >
                <Edit2 size={12} />
              </button>
              <button
                onClick={() => deleteItem(item)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                style={{ background: "rgba(239,68,68,0.08)", color: "#ef4444" }}
                aria-label="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}