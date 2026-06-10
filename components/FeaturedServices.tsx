"use client";

import { useEffect, useMemo, useState } from "react";
import { Bed, Clock, Heart, Home, LocateFixed, MapPin, Package, Scissors, Search, ShieldCheck, Store, Wrench, X } from "lucide-react";
import { mediaUrl, providerService, ServiceListing } from "@/services/provider.service";

type Category = "All" | "Rentals" | "Beauty" | "Spare Parts";

const CATEGORIES: Category[] = ["All", "Rentals", "Beauty", "Spare Parts"];
const CATEGORY_ICON: Record<Exclude<Category, "All">, React.ElementType> = {
  Rentals: Home,
  Beauty: Scissors,
  "Spare Parts": Wrench,
};

const QUICK_LOCATIONS = ["All locations"];
const MALAWI_LOCATIONS = [
  { name: "Blantyre", latitude: -15.7861, longitude: 35.0058 },
  { name: "Lilongwe", latitude: -13.9626, longitude: 33.7741 },
  { name: "Mzuzu", latitude: -11.4581, longitude: 34.0151 },
  { name: "Zomba", latitude: -15.3875, longitude: 35.3188 },
  { name: "Mangochi", latitude: -14.4782, longitude: 35.2645 },
  { name: "Kasungu", latitude: -13.0333, longitude: 33.4833 },
  { name: "Salima", latitude: -13.7804, longitude: 34.4587 },
  { name: "Karonga", latitude: -9.9333, longitude: 33.9333 },
  { name: "Nkhotakota", latitude: -12.9163, longitude: 34.3000 },
  { name: "Liwonde", latitude: -15.0667, longitude: 35.2167 },
];

function distanceKm(fromLatitude: number, fromLongitude: number, toLatitude: number, toLongitude: number) {
  const radiusKm = 6371;
  const degreesToRadians = Math.PI / 180;
  const deltaLatitude = (toLatitude - fromLatitude) * degreesToRadians;
  const deltaLongitude = (toLongitude - fromLongitude) * degreesToRadians;
  const startLatitude = fromLatitude * degreesToRadians;
  const endLatitude = toLatitude * degreesToRadians;
  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(deltaLongitude / 2) ** 2;

  return 2 * radiusKm * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function nearestMalawiLocation(latitude: number, longitude: number) {
  const nearest = MALAWI_LOCATIONS.reduce(
    (closest, location) => {
      const distance = distanceKm(latitude, longitude, location.latitude, location.longitude);
      return distance < closest.distance ? { name: location.name, distance } : closest;
    },
    { name: "", distance: Number.POSITIVE_INFINITY },
  );

  return nearest.distance <= 150 ? nearest.name : "";
}

function categoryFor(item: ServiceListing): Category {
  if (item.kind === "property") return "Rentals";
  if (item.kind === "beauty") return "Beauty";
  return "Spare Parts";
}

function locationFor(item: ServiceListing) {
  return item.display_location || [item.street_address, item.city, item.district].filter(Boolean).join(", ") || item.provider_location || item.provider?.physical_address || item.city || "Location not set";
}

function metaFor(item: ServiceListing) {
  if (item.kind === "property") return item.bedrooms ? `${item.bedrooms} bed${item.bedrooms === 1 ? "" : "s"}` : item.property_type_display || item.property_type || "Property";
  if (item.kind === "beauty") return item.duration_minutes ? `${item.duration_minutes} min` : item.category_display || item.category || "Service";
  return `${item.quantity ?? 0} in stock`;
}

function priceFor(item: ServiceListing) {
  if (item.kind === "beauty" && item.price_options?.length) {
    const prices = item.price_options.filter((option) => option.is_available && option.price != null).map((option) => Number(option.price));
    if (prices.length) return `From K${Math.min(...prices).toLocaleString()}`;
  }
  if (item.price == null) return "Price not set";
  return `K${item.price.toLocaleString()}${item.kind === "property" ? "/mo" : ""}`;
}

function kindLabel(kind: ServiceListing["kind"]) {
  if (kind === "property") return "Enquire";
  if (kind === "beauty") return "Book";
  return "Order";
}

function FeaturedCard({ item, onOpen, onRequireAuth }: { item: ServiceListing; onOpen: () => void; onRequireAuth: () => void }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const category = categoryFor(item);
  const CategoryIcon = category === "All" ? Home : CATEGORY_ICON[category];
  const MetaIcon = item.kind === "property" ? Bed : item.kind === "beauty" ? Clock : Package;
  const image = item.primary_image || item.images?.[0]?.image_url;

  return (
    <article
      onClick={onOpen}
      className="w-[282px] sm:w-[320px] flex-none cursor-pointer overflow-hidden rounded-lg transition-all duration-300 hover:-translate-y-1"
      style={{ background: "#1a2e42", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 16px 34px rgba(0,0,0,0.22)" }}
    >
      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: "rgba(245,171,32,0.08)" }}>
        {!imageLoaded && <div className="absolute inset-0 animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />}
        {image ? (
          <img
            src={mediaUrl(image)}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            style={{ opacity: imageLoaded ? 1 : 0 }}
            onLoad={() => setImageLoaded(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#8ca5bc]">
            <CategoryIcon size={34} />
          </div>
        )}
        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md" style={{ background: "rgba(0,0,0,0.62)" }}>
          <CategoryIcon size={11} />
          {category}
        </div>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onRequireAuth();
          }}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all hover:scale-105"
          style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
          aria-label="Sign in to save this service"
          title="Sign in to save"
        >
          <Heart size={14} />
        </button>
        <span className="absolute bottom-3 left-3 rounded-full px-2 py-0.5 text-[10px] font-bold" style={{ background: "rgba(16,185,129,0.18)", color: "#10b981" }}>
          {item.status}
        </span>
      </div>

      <div className="flex min-h-[210px] flex-col p-4">
        <div className="mb-1 text-sm font-bold leading-snug text-white line-clamp-2">{item.title}</div>
        <div className="mb-2 truncate text-[11px] font-bold text-[#f5ab20]">{item.provider?.business_name || item.category_display || item.property_type_display || item.part_name || "Verified provider"}</div>
        <div className="mb-2 flex items-center gap-1.5 text-[11px] text-[#8ca5bc]">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">{locationFor(item)}</span>
        </div>
        <div className="mb-3 flex items-center gap-1.5 text-[11px] text-[#8ca5bc]">
          <MetaIcon size={12} className="shrink-0" />
          <span className="truncate">{metaFor(item)}</span>
        </div>
        <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-[#cde0f0]">{item.description || "Provider details are available after sign in."}</p>
        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="text-base font-black text-[#f5ab20]">{priceFor(item)}</span>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onRequireAuth();
            }}
            className="rounded-lg px-3 py-2 text-[11px] font-black transition-all hover:brightness-110 active:scale-95"
            style={{ background: "#f5ab20", color: "#0d1f2d" }}
          >
            {kindLabel(item.kind)}
          </button>
        </div>
      </div>
    </article>
  );
}

function ProviderStorefrontModal({
  listing,
  onClose,
  onRequireAuth,
}: {
  listing: ServiceListing;
  onClose: () => void;
  onRequireAuth: () => void;
}) {
  const [items, setItems] = useState<ServiceListing[]>([listing]);
  const [activeId, setActiveId] = useState(listing.id);
  const [loading, setLoading] = useState(true);
  const active = items.find((item) => item.id === activeId) || listing;
  const image = active.primary_image || active.images?.[0]?.image_url;
  const provider = active.provider || listing.provider;

  useEffect(() => {
    setLoading(true);
    providerService
      .getProviderShop(listing.provider_id)
      .then((res) => setItems(res.data?.items?.length ? res.data.items : [listing]))
      .catch(() => setItems([listing]))
      .finally(() => setLoading(false));
  }, [listing]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-5" style={{ background: "rgba(3,10,18,0.86)", backdropFilter: "blur(4px)" }} onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-8xl overflow-y-auto rounded-lg" style={{ background: "#132333", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }} onClick={(event) => event.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3" style={{ background: "rgba(19,35,51,0.96)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#f5ab20]">
              <Store size={12} />
              Provider Profile
            </div>
            <h3 className="truncate text-lg font-black text-white">{provider?.business_name || provider?.display_name || "ConnectMW Provider"}</h3>
          </div>
          <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg text-[#cde0f0] transition-all hover:bg-white/5" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <div className="aspect-video overflow-hidden rounded-lg" style={{ background: "rgba(245,171,32,0.08)", border: "1px solid rgba(245,171,32,0.2)" }}>
              {image ? <img src={mediaUrl(image)} alt={active.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-[#8ca5bc]">No image attached</div>}
            </div>
            <div className="mt-4">
              <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-[#f5ab20]">{categoryFor(active)}</div>
              <h4 className="text-2xl font-black text-white">{active.title}</h4>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#8ca5bc]">
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1" style={{ background: "#1a2e42" }}><MapPin size={12} />{locationFor(active)}</span>
                <span className="rounded-full px-2.5 py-1" style={{ background: "#1a2e42" }}>{metaFor(active)}</span>
                <span className="rounded-full px-2.5 py-1" style={{ background: "#1a2e42" }}>{active.status}</span>
              </div>
              <p className="mt-4 text-sm leading-7 text-[#cde0f0]">{active.description || "This provider has not added a description yet."}</p>
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="rounded-lg p-4" style={{ background: "#1a2e42", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="mb-3 text-xs font-black uppercase tracking-widest text-[#8ca5bc]">Provider</div>
              <div className="text-base font-black text-white">{provider?.business_name || provider?.display_name || "ConnectMW Provider"}</div>
              <div className="mt-2 text-xs leading-6 text-[#cde0f0]">{provider?.physical_address || active.provider_location || "Location not set"}</div>
              {provider?.is_verified && <div className="mt-3 inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold text-[#10b981]" style={{ background: "rgba(16,185,129,0.12)" }}>Verified provider</div>}
            </div>

            <div className="rounded-lg p-4" style={{ background: "#1a2e42", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-xs font-black uppercase tracking-widest text-[#8ca5bc]">Services</div>
                <div className="text-[11px] text-[#8ca5bc]">{loading ? "Loading..." : `${items.length} listed`}</div>
              </div>
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {items.map((item) => (
                  <button key={item.id} type="button" onClick={() => setActiveId(item.id)} className="w-full rounded-lg p-3 text-left transition-all hover:bg-white/5" style={activeId === item.id ? { background: "rgba(245,171,32,0.14)", border: "1px solid rgba(245,171,32,0.35)" } : { background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <span className="block truncate text-sm font-bold text-white">{item.title}</span>
                    <span className="mt-1 block truncate text-[11px] text-[#8ca5bc]">{categoryFor(item)} - {priceFor(item)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg p-4" style={{ background: "#1a2e42", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-2xl font-black text-[#f5ab20]">{priceFor(active)}</div>
              <button type="button" onClick={onRequireAuth} className="mt-4 w-full rounded-lg px-4 py-3 text-sm font-black transition-all hover:brightness-110" style={{ background: "#f5ab20", color: "#0d1f2d" }}>
                Sign in to {kindLabel(active.kind).toLowerCase()}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function FeaturedServices({ onOpenAuthModal }: { onOpenAuthModal: (tab: "signin" | "signup") => void }) {
  const [items, setItems] = useState<ServiceListing[]>([]);
  const [category, setCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [selectedListing, setSelectedListing] = useState<ServiceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationStatus, setLocationStatus] = useState("Allow location access to show services near you.");

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Location is not available in this browser. Type a city to filter.");
      setLoading(false);
      return;
    }
    setLocationStatus("Checking your location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nearest = nearestMalawiLocation(position.coords.latitude, position.coords.longitude);
        setLocation(nearest || "");
        setLocationStatus(nearest ? `Showing services near ${nearest}.` : "Location found. Type your city to refine results.");
      },
      () => {
        setLocationStatus("Location permission was not granted. Type your city to filter services.");
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 9000, maximumAge: 1000 * 60 * 10 },
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    setLoading(true);
    providerService
      .browseServices(undefined, search, { location: location || undefined })
      .then((res) => setItems(res.data?.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [location, search]);

  const filtered = useMemo(() => {
    return items.filter((item) => category === "All" || categoryFor(item) === category);
  }, [category, items]);

  const counts = useMemo(() => {
    const values: Record<Category, number> = { All: items.length, Rentals: 0, Beauty: 0, "Spare Parts": 0 };
    items.forEach((item) => {
      values[categoryFor(item)] += 1;
    });
    return values;
  }, [items]);

  return (
    <section id="featured-services" className="px-[10%] py-14 sm:py-16" style={{ background: "#0f1d2b", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div>
        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-[0.75rem] font-semibold uppercase tracking-[2px] text-[#f5ab20]">Featured Services</p>
            <h2 className="text-[clamp(1.7rem,3vw,2.35rem)] font-bold leading-tight text-white">Live services near you</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#cde0f0]">
              Browse real listings from ConnectMW providers. Sign in only when you want to save, enquire, book, or order.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-xl">
            <div className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2" style={{ background: "#132333", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Search size={14} className="text-[#8ca5bc]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search services"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#8ca5bc]"
              />
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2" style={{ background: "#132333", border: "1px solid rgba(255,255,255,0.08)" }}>
              <MapPin size={14} className="text-[#8ca5bc]" />
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="City or district"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#8ca5bc]"
              />
              <button type="button" onClick={requestLocation} className="rounded-md p-1.5 text-[#f5ab20] transition-all hover:bg-white/5" aria-label="Use my location" title="Use my location">
                <LocateFixed size={15} />
              </button>
            </div>
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((item) => {
              const active = category === item;
              const Icon = item === "All" ? ShieldCheck : CATEGORY_ICON[item];
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCategory(item)}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all hover:scale-[1.02]"
                  style={active ? { background: "#f5ab20", color: "#0d1f2d" } : { background: "#132333", color: "#8ca5bc", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <Icon size={12} />
                  {item}
                  <span className="rounded-full px-1.5 py-0.5 text-[10px]" style={active ? { background: "rgba(0,0,0,0.14)" } : { background: "rgba(245,171,32,0.12)", color: "#f5ab20" }}>
                    {counts[item]}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-[#8ca5bc]">{locationStatus}</p>
        </div>

        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {QUICK_LOCATIONS.map((item) => {
            const value = item === "All locations" ? "" : item;
            const active = location === value;
            return (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setLocation(value);
                  setLocationStatus(value ? `Showing services in ${value}.` : "Showing services from all locations.");
                }}
                className="shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition-all"
                style={active ? { background: "#cde0f0", color: "#0d1f2d" } : { background: "#132333", color: "#8ca5bc", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {item}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-[390px] w-[282px] flex-none animate-pulse rounded-lg sm:w-[320px]" style={{ background: "#1a2e42" }} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="overflow-x-auto pb-3">
            <div className="flex gap-4">
              {filtered.map((item) => (
                <FeaturedCard key={item.id} item={item} onOpen={() => setSelectedListing(item)} onRequireAuth={() => onOpenAuthModal("signin")} />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-lg p-6 text-center text-sm" style={{ background: "#132333", border: "1px solid rgba(255,255,255,0.08)", color: "#cde0f0" }}>
            No services found for this location yet.
          </div>
        )}
      </div>
      {selectedListing && (
        <ProviderStorefrontModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onRequireAuth={() => onOpenAuthModal("signin")}
        />
      )}
    </section>
  );
}
