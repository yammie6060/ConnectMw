import { useEffect, useMemo, useState } from "react";
import { PageShell } from "../components/PageShell";
import { Heart, Search, SlidersHorizontal, MapPin, Bed, Scissors, Wrench, Home, Clock, Package, X, Send, ShoppingCart, CalendarCheck } from "lucide-react";
import { mediaUrl, providerService, ServiceListing } from "@/services/provider.service";

type Category = "All" | "Rentals" | "Beauty" | "Spare Parts";

const CATEGORIES: Category[] = ["All", "Rentals", "Beauty", "Spare Parts"];
const CATEGORY_ICON: Record<string, React.ElementType> = { Rentals: Home, Beauty: Scissors, "Spare Parts": Wrench };

interface RentalsPageProps { color: string }

function categoryFor(item: ServiceListing): Category {
  if (item.kind === "property") return "Rentals";
  if (item.kind === "beauty") return "Beauty";
  return "Spare Parts";
}

function money(value?: number | null, unit = "") {
  return value == null ? "Price not set" : `K${value.toLocaleString()}${unit}`;
}

function locationFor(item: ServiceListing) {
  return [item.street_address, item.city, item.district].filter(Boolean).join(", ") || item.city || "Location not set";
}

function metaFor(item: ServiceListing) {
  if (item.kind === "property") return item.bedrooms ? `${item.bedrooms} bed${item.bedrooms === 1 ? "" : "s"}` : item.property_type_display || item.property_type || "Property";
  if (item.kind === "beauty") return item.duration_minutes ? `${item.duration_minutes} min` : item.category_display || item.category || "Service";
  return `${item.quantity ?? 0} in stock`;
}

function ListingCard({ listing, color, isSaved, onToggleSave, onOpen }: { listing: ServiceListing; color: string; isSaved: boolean; onToggleSave: () => void; onOpen: () => void }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const category = categoryFor(listing);
  const CatIcon = CATEGORY_ICON[category];
  const isUnavailable = !listing.is_available;
  const MetaIcon = category === "Rentals" ? Bed : category === "Beauty" ? Clock : Package;
  const ctaLabel = category === "Rentals" ? "Enquire Now" : category === "Beauty" ? "Book Now" : "Order Now";
  const statusColor = isUnavailable ? "#8ca5bc" : listing.status === "Low Stock" ? "#f5ab20" : "#10b981";

  return (
    <div onClick={onOpen} className="rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 flex flex-col cursor-pointer" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="relative h-40 overflow-hidden shrink-0" style={{ background: `${color}10` }}>
        {!imgLoaded && <div className="absolute inset-0 animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />}
        {listing.primary_image ? <img src={mediaUrl(listing.primary_image)} alt={listing.title} className="w-full h-full object-cover transition-opacity duration-300" style={{ opacity: imgLoaded ? 1 : 0 }} onLoad={() => setImgLoaded(true)} /> : <div className="h-full w-full flex items-center justify-center" style={{ color: "#8ca5bc" }}><CatIcon size={28} /></div>}
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}><CatIcon size={10} />{category}</div>
        <button onClick={(event) => { event.stopPropagation(); onToggleSave(); }} className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{ background: "rgba(0,0,0,0.45)" }}><Heart size={14} style={{ color: isSaved ? "#ef4444" : "#fff" }} fill={isSaved ? "#ef4444" : "transparent"} /></button>
        <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${statusColor}22`, color: statusColor }}>{listing.status}</span>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <div className="text-sm font-bold leading-snug mb-0.5" style={{ color: "var(--text-primary, white)" }}>{listing.title}</div>
        <div className="text-[11px] mb-1" style={{ color: "#8ca5bc" }}>{listing.provider?.business_name || listing.category_display || listing.property_type_display || listing.part_name || "Provider"}</div>
        <div className="flex items-center gap-1 text-[11px] mb-2" style={{ color: "#8ca5bc" }}><MapPin size={10} /> {locationFor(listing)}</div>
        <div className="flex items-center gap-1 text-[11px] mb-3" style={{ color: "#8ca5bc" }}><MetaIcon size={10} /> {metaFor(listing)}</div>
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-base font-black" style={{ color }}>{money(listing.price, category === "Rentals" ? "/mo" : "")}</span>
          <button onClick={(event) => { event.stopPropagation(); onOpen(); }} className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:brightness-110" style={isUnavailable ? { background: "rgba(255,255,255,0.05)", color: "#8ca5bc" } : { background: color, color: "#0d1f2d" }}>{isUnavailable ? "Unavailable" : ctaLabel}</button>
        </div>
      </div>
    </div>
  );
}

function ListingDetailModal({ listing, color, onClose }: { listing: ServiceListing; color: string; onClose: () => void }) {
  const [activeImage, setActiveImage] = useState(0);
  const [message, setMessage] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const images = listing.images?.length ? listing.images.map((image) => image.image_url) : listing.primary_image ? [listing.primary_image] : [];
  const category = categoryFor(listing);
  const actionLabel = listing.kind === "property" ? "Send Enquiry" : listing.kind === "beauty" ? "Request Booking" : "Place Order";
  const ActionIcon = listing.kind === "property" ? Send : listing.kind === "beauty" ? CalendarCheck : ShoppingCart;

  const submitAction = async () => {
    setSubmitting(true);
    setError("");
    setResult("");
    try {
      const res = await providerService.createListingAction(listing.kind, listing.id, {
        message,
        notes: message,
        quantity: Number(quantity || 1),
        booking_date: listing.kind === "beauty" ? bookingDate : undefined,
        start_time: listing.kind === "beauty" && startTime ? startTime : undefined,
      });
      setResult(res.message || "Request sent successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete this action.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5" style={{ background: "rgba(3,10,18,0.78)" }}>
      <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 24px 80px rgba(0,0,0,0.38)" }}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3" style={{ background: "var(--bg-secondary, #132333)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color }}>{category}</div>
            <h3 className="text-base sm:text-lg font-black truncate" style={{ color: "var(--text-primary, white)" }}>{listing.title}</h3>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)", color: "#cde0f0" }}><X size={16} /></button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-5 p-4 sm:p-5">
          <div>
            <div className="h-72 sm:h-96 rounded-xl overflow-hidden" style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
              {images[activeImage] ? <img src={mediaUrl(images[activeImage])} alt={listing.title} className="h-full w-full object-cover" /> : <div className="h-full flex items-center justify-center text-sm" style={{ color: "#8ca5bc" }}>No image attached</div>}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-2">
                {images.map((url, index) => (
                  <button key={url} onClick={() => setActiveImage(index)} className="h-16 rounded-lg overflow-hidden" style={{ border: index === activeImage ? `2px solid ${color}` : "1px solid rgba(255,255,255,0.08)" }}>
                    <img src={mediaUrl(url)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <div className="text-2xl font-black" style={{ color }}>{money(listing.price, listing.kind === "property" ? "/mo" : "")}</div>
              <div className="flex items-center gap-1 text-xs mt-1" style={{ color: "#8ca5bc" }}><MapPin size={12} /> {locationFor(listing)}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[metaFor(listing), listing.status, listing.provider?.business_name || "Provider", listing.kind === "spare" ? listing.condition || "Condition not set" : listing.kind === "property" ? `${listing.bathrooms ?? 0} bath` : listing.category_display || listing.category || "Service"].map((value) => (
                <div key={value} className="rounded-xl p-3 text-xs" style={{ background: "var(--bg-elevated, #1a2e42)", color: "#cde0f0", border: "1px solid rgba(255,255,255,0.06)" }}>{value}</div>
              ))}
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#cde0f0" }}>{listing.description || "No description provided yet."}</p>
            {listing.kind === "beauty" && (
              <div className="grid grid-cols-2 gap-2">
                <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} className="rounded-xl px-3 py-2 text-sm outline-none" style={{ background: "var(--bg-elevated, #1a2e42)", color: "var(--text-primary, white)", border: "1px solid rgba(255,255,255,0.08)" }} />
                <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="rounded-xl px-3 py-2 text-sm outline-none" style={{ background: "var(--bg-elevated, #1a2e42)", color: "var(--text-primary, white)", border: "1px solid rgba(255,255,255,0.08)" }} />
              </div>
            )}
            {listing.kind === "spare" && <input type="number" min={1} max={listing.quantity ?? undefined} value={quantity} onChange={(e) => setQuantity(e.target.value)} className="rounded-xl px-3 py-2 text-sm outline-none" style={{ background: "var(--bg-elevated, #1a2e42)", color: "var(--text-primary, white)", border: "1px solid rgba(255,255,255,0.08)" }} />}
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} placeholder="Add a short message..." className="rounded-xl px-3 py-2 text-sm outline-none resize-none" style={{ background: "var(--bg-elevated, #1a2e42)", color: "var(--text-primary, white)", border: "1px solid rgba(255,255,255,0.08)" }} />
            {error && <div className="text-xs font-semibold" style={{ color: "#ef4444" }}>{error}</div>}
            {result && <div className="text-xs font-semibold" style={{ color: "#10b981" }}>{result}</div>}
            <button onClick={submitAction} disabled={submitting || !listing.is_available} className="w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 disabled:opacity-50" style={{ background: color, color: "#0d1f2d" }}>
              <ActionIcon size={16} /> {submitting ? "Sending..." : actionLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RentalsPage({ color }: RentalsPageProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("All");
  const [showSaved, setShowSaved] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [listings, setListings] = useState<ServiceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState<ServiceListing | null>(null);

  useEffect(() => {
    providerService.browseServices(undefined, search)
      .then((res) => setListings(res.data?.items ?? []))
      .finally(() => setLoading(false));
  }, [search]);

  const toggleSave = (id: string) => setSaved(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const filtered = listings.filter((listing) => {
    const matchCat = category === "All" || categoryFor(listing) === category;
    const text = `${listing.title} ${listing.provider?.business_name ?? ""} ${locationFor(listing)}`.toLowerCase();
    const matchSearch = !search || text.includes(search.toLowerCase());
    const matchSaved = !showSaved || saved.includes(listing.id);
    return matchCat && matchSearch && matchSaved;
  });

  const counts = useMemo(() => {
    const values: Record<string, number> = { All: listings.length, Rentals: 0, Beauty: 0, "Spare Parts": 0 };
    listings.forEach((listing) => { values[categoryFor(listing)] += 1; });
    return values;
  }, [listings]);

  return (
    <PageShell title="Browse" subtitle="Find rentals, beauty services, and spare parts near you" color={color}>
      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <Search size={14} style={{ color: "#8ca5bc" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, provider or location..." className="flex-1 bg-transparent text-sm outline-none" style={{ color: "var(--text-primary, white)" }} />
        </div>
        <button onClick={() => setShowSaved(v => !v)} className="px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all" style={showSaved ? { background: "#ef444420", color: "#ef4444", border: "1px solid #ef444440" } : { background: "var(--bg-secondary, #132333)", color: "#8ca5bc", border: "1px solid rgba(255,255,255,0.07)" }}><Heart size={13} fill={showSaved ? "#ef4444" : "transparent"} />{saved.length}</button>
        <button className="px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold" style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}><SlidersHorizontal size={13} /> Filter</button>
      </div>
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {CATEGORIES.map(cat => {
          const Icon = cat !== "All" ? CATEGORY_ICON[cat] : null;
          const active = category === cat;
          return <button key={cat} onClick={() => setCategory(cat)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all" style={active ? { background: color, color: "#0d1f2d" } : { background: "var(--bg-secondary, #132333)", color: "#8ca5bc", border: "1px solid rgba(255,255,255,0.07)" }}>{Icon && <Icon size={11} />}{cat}<span className="text-[9px] px-1.5 py-0.5 rounded-full font-black" style={active ? { background: "rgba(0,0,0,0.2)", color: "#0d1f2d" } : { background: `${color}18`, color }}>{counts[cat] ?? 0}</span></button>;
        })}
      </div>
      <div className="text-xs mb-4" style={{ color: "#8ca5bc" }}>{loading ? "Loading services..." : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}{showSaved && " saved only"}</div>
      {filtered.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{filtered.map(listing => <ListingCard key={listing.id} listing={listing} color={color} isSaved={saved.includes(listing.id)} onToggleSave={() => toggleSave(listing.id)} onOpen={() => setSelectedListing(listing)} />)}</div> : !loading && <div className="flex flex-col items-center justify-center py-16 gap-3"><p className="text-sm font-medium" style={{ color: "var(--text-primary, white)" }}>No results found</p><button onClick={() => { setSearch(""); setCategory("All"); setShowSaved(false); }} className="mt-2 px-4 py-2 rounded-xl text-xs font-bold" style={{ background: color, color: "#0d1f2d" }}>Clear filters</button></div>}
      {selectedListing && <ListingDetailModal listing={selectedListing} color={color} onClose={() => setSelectedListing(null)} />}
    </PageShell>
  );
}
