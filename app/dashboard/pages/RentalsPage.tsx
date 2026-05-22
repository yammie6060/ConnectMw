import { useEffect, useMemo, useState } from "react";
import { PageShell } from "../components/PageShell";
import { Camera, Heart, Search, SlidersHorizontal, MapPin, Bed, Scissors, Wrench, Home, Clock, Package, X, Send, ShoppingCart, CalendarCheck, Mail, Phone } from "lucide-react";
import { mediaUrl, providerService, ServiceInteraction, ServiceListing } from "@/services/provider.service";

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
  return item.display_location || [item.street_address, item.city, item.district].filter(Boolean).join(", ") || item.provider_location || item.provider?.physical_address || item.city || "Location not set";
}

function metaFor(item: ServiceListing) {
  if (item.kind === "property") return item.bedrooms ? `${item.bedrooms} bed${item.bedrooms === 1 ? "" : "s"}` : item.property_type_display || item.property_type || "Property";
  if (item.kind === "beauty") return item.duration_minutes ? `${item.duration_minutes} min` : item.category_display || item.category || "Service";
  return `${item.quantity ?? 0} in stock`;
}

function priceFor(item: ServiceListing, unit = "") {
  if (item.grouped_items?.length) {
    const prices = item.grouped_items
      .map((groupedItem) => numericPriceFor(groupedItem))
      .filter((value): value is number => value != null);
    if (prices.length) return `From K${Math.min(...prices).toLocaleString()}${unit}`;
  }
  if (item.kind === "beauty" && item.price_options?.length) {
    const prices = item.price_options.filter((option) => option.is_available && option.price != null).map((option) => Number(option.price));
    if (prices.length) return `From K${Math.min(...prices).toLocaleString()}`;
  }
  return money(item.price, unit);
}

function numericPriceFor(item: ServiceListing) {
  if (item.kind === "beauty" && item.price_options?.length) {
    const prices = item.price_options
      .filter((option) => option.is_available && option.price != null)
      .map((option) => Number(option.price));
    if (prices.length) return Math.min(...prices);
  }
  return item.price ?? null;
}

function imageForDisplay(item: ServiceListing) {
  const items = item.grouped_items?.length ? item.grouped_items : [item];
  const withImages = items.find((groupedItem) => groupedItem.images?.length || groupedItem.primary_image);
  if (!withImages) return null;
  return withImages.images?.length ? withImages.images[withImages.images.length - 1].image_url : withImages.primary_image ?? null;
}

function galleryFor(item: ServiceListing) {
  const images = item.images?.length ? item.images.map((image) => image.image_url) : item.primary_image ? [item.primary_image] : [];
  return [...images].reverse();
}

function normalizeLocation(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function groupedTitle(item: ServiceListing) {
  const providerName = item.provider?.business_name || item.provider?.display_name;
  if (!item.grouped_items?.length || item.grouped_items.length === 1) return item.title;
  if (item.kind === "beauty") return providerName || "Beauty provider";
  if (item.kind === "property") return providerName || "Property provider";
  return providerName || "Spare parts seller";
}

function groupedMeta(item: ServiceListing) {
  if (!item.grouped_items?.length || item.grouped_items.length === 1) return metaFor(item);
  const labels = item.grouped_items
    .map((groupedItem) => groupedItem.category_display || groupedItem.property_type_display || groupedItem.part_name || groupedItem.title)
    .filter(Boolean);
  const uniqueLabels = Array.from(new Set(labels));
  return `${item.grouped_items.length} ${item.kind === "beauty" ? "services" : item.kind === "property" ? "listings" : "items"}${uniqueLabels.length ? `: ${uniqueLabels.slice(0, 3).join(", ")}` : ""}`;
}

function interactionTypeFor(kind: ServiceListing["kind"]) {
  if (kind === "property") return "rental_application";
  if (kind === "beauty") return "booking";
  return "order";
}

function viewerInteractionFor(listing: ServiceListing, interactionByListingId: Map<string, ServiceInteraction>) {
  const items = listing.grouped_items?.length ? listing.grouped_items : [listing];
  return items.map((item) => interactionByListingId.get(item.id)).find(Boolean) ?? null;
}

function groupBrowseListings(items: ServiceListing[]) {
  const groups = new Map<string, ServiceListing[]>();
  items.forEach((item) => {
    const location = locationFor(item);
    const key = [item.provider_id || item.provider?.id || "unknown", item.kind, normalizeLocation(location)].join("|");
    groups.set(key, [...(groups.get(key) ?? []), item]);
  });

  return Array.from(groups.values()).map((groupItems) => {
    const sorted = [...groupItems].sort((a, b) => (Date.parse(b.updated_at || b.created_at || "") || 0) - (Date.parse(a.updated_at || a.created_at || "") || 0));
    const representative = sorted[0];
    return {
      ...representative,
      id: sorted.map((item) => item.id).join("__"),
      title: groupedTitle({ ...representative, grouped_items: sorted }),
      grouped_items: sorted,
      grouped_count: sorted.length,
      display_location: locationFor(representative),
      primary_image: imageForDisplay({ ...representative, grouped_items: sorted }),
      price: numericPriceFor(representative),
      is_available: sorted.some((item) => item.is_available),
      status: sorted.some((item) => item.is_available) ? (sorted.length > 1 ? `${sorted.length} available` : representative.status) : "Unavailable",
    } as ServiceListing;
  });
}

function modeLabel(mode: string) {
  if (mode === "onsite") return "Onsite";
  if (mode === "mobile") return "Mobile";
  return mode;
}

function ListingCard({ listing, color, isSaved, viewerInteraction, onToggleSave, onOpen }: { listing: ServiceListing; color: string; isSaved: boolean; viewerInteraction: ServiceInteraction | null; onToggleSave: () => void; onOpen: () => void }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const category = categoryFor(listing);
  const CatIcon = CATEGORY_ICON[category];
  const isUnavailable = !listing.is_available;
  const MetaIcon = category === "Rentals" ? Bed : category === "Beauty" ? Clock : Package;
  const ctaLabel = category === "Rentals" ? "Enquire Now" : category === "Beauty" ? "Book Now" : "Order Now";
  const statusColor = isUnavailable ? "#8ca5bc" : listing.status === "Low Stock" ? "#f5ab20" : "#10b981";

  return (
    <div 
      onClick={onOpen} 
      className="group rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col cursor-pointer"
      style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="relative aspect-[4/3] sm:aspect-[3/2] overflow-hidden shrink-0" style={{ background: `${color}10` }}>
        {!imgLoaded && <div className="absolute inset-0 animate-pulse" style={{ background: "rgba(255,255,255,0.05)" }} />}
        {listing.primary_image ? 
          <img 
            src={mediaUrl(listing.primary_image)} 
            alt={listing.title} 
            className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
            style={{ opacity: imgLoaded ? 1 : 0 }} 
            onLoad={() => setImgLoaded(true)} 
          /> : 
          <div className="h-full w-full flex items-center justify-center" style={{ color: "#8ca5bc" }}>
            <CatIcon size={32} />
          </div>
        }
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold backdrop-blur-md" style={{ background: "rgba(0,0,0,0.65)", color: "#fff" }}>
          <CatIcon size={10} />
          <span className="hidden xs:inline">{category}</span>
        </div>
        <button 
          onClick={(event) => { event.stopPropagation(); onToggleSave(); }} 
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 backdrop-blur-md"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          <Heart size={14} style={{ color: isSaved ? "#ef4444" : "#fff" }} fill={isSaved ? "#ef4444" : "transparent"} />
        </button>
        <span className="absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm" style={{ background: `${statusColor}22`, color: statusColor }}>
          {listing.status}
        </span>
        {viewerInteraction && (
          <span className="absolute bottom-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize backdrop-blur-sm" style={{ background: "rgba(0,0,0,0.65)", color: "#fff" }}>
            {viewerInteraction.status}
          </span>
        )}
      </div>
      
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <div className="text-sm font-bold leading-snug mb-1 line-clamp-2" style={{ color: "var(--text-primary, white)" }}>
          {listing.title}
        </div>
        <div className="text-[10px] sm:text-[11px] mb-1.5 truncate" style={{ color: "#8ca5bc" }}>
          {listing.grouped_count && listing.grouped_count > 1
            ? `${listing.grouped_count} ${listing.kind === "beauty" ? "services" : listing.kind === "property" ? "listings" : "items"} in this location`
            : listing.provider?.business_name || listing.category_display || listing.property_type_display || listing.part_name || "Provider"}
        </div>
        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] mb-2 truncate" style={{ color: "#8ca5bc" }}>
          <MapPin size={10} className="flex-shrink-0" /> 
          <span className="truncate">{locationFor(listing)}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] mb-3" style={{ color: "#8ca5bc" }}>
          <MetaIcon size={10} className="flex-shrink-0" /> 
          <span className="truncate">{groupedMeta(listing)}</span>
        </div>
        {listing.kind === "beauty" && Boolean(listing.service_modes?.length) && (
          <div className="flex flex-wrap gap-1 mb-3">
            {listing.service_modes?.map((mode) => (
              <span key={mode} className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>
                {modeLabel(mode)}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-base sm:text-lg font-black" style={{ color }}>
            {priceFor(listing, category === "Rentals" ? "/mo" : "")}
          </span>
          <button 
            onClick={(event) => { event.stopPropagation(); onOpen(); }} 
            className="px-2 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all hover:brightness-110 active:scale-95"
            style={isUnavailable ? { background: "rgba(255,255,255,0.05)", color: "#8ca5bc" } : { background: color, color: "#0d1f2d" }}
          >
            {isUnavailable ? "Unavailable" : listing.grouped_count && listing.grouped_count > 1 ? "View" : ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function ListingDetailModal({ listing, color, interactionByListingId, onClose }: { listing: ServiceListing; color: string; interactionByListingId: Map<string, ServiceInteraction>; onClose: () => void }) {
  const listingItems = listing.grouped_items?.length ? listing.grouped_items : [listing];
  const [activeItemId, setActiveItemId] = useState(listingItems[0]?.id ?? listing.id);
  const activeListing = listingItems.find((item) => item.id === activeItemId) ?? listingItems[0] ?? listing;
  const [activeImage, setActiveImage] = useState(0);
  const [message, setMessage] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [bookingDate, setBookingDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [shopGroups, setShopGroups] = useState<Array<{ name: string; count: number; items: ServiceListing[] }>>([]);
  
  const images = galleryFor(activeListing);
  const category = categoryFor(activeListing);
  const actionLabel = activeListing.kind === "property" ? "Send Enquiry" : activeListing.kind === "beauty" ? "Request Booking" : "Place Order";
  const ActionIcon = activeListing.kind === "property" ? Send : activeListing.kind === "beauty" ? CalendarCheck : ShoppingCart;
  const activeInteraction = interactionByListingId.get(activeListing.id) ?? null;
  const slotBooked = activeListing.kind === "beauty" && Boolean(startTime) && Boolean(activeListing.booked_slots?.some((slot) => slot.booking_date === bookingDate && slot.start_time?.slice(0, 5) === startTime.slice(0, 5)));

  useEffect(() => {
    setActiveImage(0);
    setResult("");
    setError("");
  }, [activeItemId]);

  useEffect(() => {
    if (!listing.provider_id) return;
    providerService.getProviderShop(listing.provider_id, listing.kind)
      .then((res) => setShopGroups(res.data?.groups ?? []))
      .catch(() => setShopGroups([]));
  }, [listing.provider_id, listing.kind]);

  const submitAction = async () => {
    setSubmitting(true);
    setError("");
    setResult("");
    try {
      const res = await providerService.createListingAction(activeListing.kind, activeListing.id, {
        message,
        notes: message,
        quantity: Number(quantity || 1),
        booking_date: activeListing.kind === "beauty" ? bookingDate : undefined,
        start_time: activeListing.kind === "beauty" && startTime ? startTime : undefined,
      });
      setResult(res.message || "Request sent successfully.");
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete this action.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      style={{ background: "rgba(3,10,18,0.85)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div 
        className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl animate-in slide-in-from-bottom-4 duration-300"
        style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.09)", boxShadow: "0 24px 80px rgba(0,0,0,0.5)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3 backdrop-blur-md" style={{ background: "rgba(19,35,51,0.95)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color }}>{category}</div>
            <h3 className="text-base sm:text-lg font-black truncate" style={{ color: "var(--text-primary, white)" }}>{groupedTitle(listing)}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            style={{ background: "rgba(255,255,255,0.06)", color: "#cde0f0" }}
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-5 p-4 sm:p-6">
          {/* Image Gallery */}
          <div className="lg:w-2/3">
            <div className="aspect-video rounded-xl overflow-hidden" style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
              {images[activeImage] ? 
                <img src={mediaUrl(images[activeImage])} alt={activeListing.title} className="h-full w-full object-cover" /> : 
                <div className="h-full flex items-center justify-center text-sm" style={{ color: "#8ca5bc" }}>No image attached</div>
              }
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mt-3">
                {images.map((url, index) => (
                  <button 
                    key={url} 
                    onClick={() => setActiveImage(index)} 
                    className="aspect-square rounded-lg overflow-hidden transition-all hover:opacity-80"
                    style={{ border: index === activeImage ? `2px solid ${color}` : "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <img src={mediaUrl(url)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Details and Actions */}
          <div className="lg:w-1/3 flex flex-col gap-4">
            {listingItems.length > 1 && (
              <div className="rounded-xl p-3" style={{ background: "var(--bg-elevated, #1a2e42)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-xs font-black mb-2" style={{ color: "var(--text-primary, white)" }}>
                  Services at this location
                </div>
                <div className="flex flex-col gap-2 max-h-52 overflow-y-auto">
                  {listingItems.map((item) => {
                    const active = item.id === activeListing.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveItemId(item.id)}
                        className="w-full rounded-lg p-2 text-left transition-all"
                        style={active ? { background: `${color}18`, border: `1px solid ${color}45` } : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)" }}
                      >
                        <span className="block text-xs font-bold truncate" style={{ color: active ? color : "#cde0f0" }}>{item.title}</span>
                        <span className="block text-[10px] mt-0.5 truncate" style={{ color: "#8ca5bc" }}>
                          {[item.category_display || item.property_type_display || item.part_name, priceFor(item, item.kind === "property" ? "/mo" : "")].filter(Boolean).join(" - ")}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div>
              <div className="text-2xl sm:text-3xl font-black" style={{ color }}>
                {priceFor(activeListing, activeListing.kind === "property" ? "/mo" : "")}
              </div>
              <div className="flex items-center gap-1.5 text-xs mt-1.5" style={{ color: "#8ca5bc" }}>
                <MapPin size={12} className="flex-shrink-0" /> 
                <span className="flex-1">{locationFor(activeListing)}</span>
              </div>
            </div>

            <div className="rounded-xl p-3 text-xs" style={{ background: "var(--bg-elevated, #1a2e42)", color: "#cde0f0", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="font-black mb-2" style={{ color: "var(--text-primary, white)" }}>Provider contact</div>
              <div className="flex items-center gap-2 mb-1">
                <Phone size={12} style={{ color }} />
                <span>{activeListing.provider?.owner_phone || "Phone not provided"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={12} style={{ color }} />
                <span className="truncate">{activeListing.provider?.owner_email || "Email not provided"}</span>
              </div>
              {activeListing.provider?.owner_name && <div className="mt-2" style={{ color: "#8ca5bc" }}>{activeListing.provider.owner_name}</div>}
            </div>

            {activeInteraction && (
              <div className="rounded-xl p-3 text-xs capitalize" style={{ background: `${color}12`, color, border: `1px solid ${color}30` }}>
                Your {interactionTypeFor(activeListing.kind).replace("_", " ")} is {activeInteraction.status}.
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-2">
              {[metaFor(activeListing), activeListing.status, activeListing.provider?.business_name || "Provider", 
                activeListing.kind === "spare" ? activeListing.condition || "Condition not set" : 
                activeListing.kind === "property" ? `${activeListing.bathrooms ?? 0} bath` : 
                activeListing.category_display || activeListing.category || "Service"
              ].map((value, idx) => (
                <div key={idx} className="rounded-xl p-2 sm:p-3 text-xs break-words" style={{ background: "var(--bg-elevated, #1a2e42)", color: "#cde0f0", border: "1px solid rgba(255,255,255,0.06)" }}>
                  {value}
                </div>
              ))}
            </div>

            {activeListing.kind === "beauty" && Boolean(activeListing.price_options?.length) && (
              <div className="grid grid-cols-1 gap-2">
                {activeListing.price_options?.filter((option) => option.is_available).map((option) => (
                  <div key={option.id || option.service_mode} className="rounded-xl p-3 text-xs" style={{ background: "var(--bg-elevated, #1a2e42)", color: "#cde0f0", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div className="flex items-center justify-between gap-2 font-bold">
                      <span>{modeLabel(option.service_mode)}</span>
                      <span style={{ color }}>{option.price == null ? "Negotiable" : `${option.price_type === "from" ? "From " : ""}K${Number(option.price).toLocaleString()}`}</span>
                    </div>
                    {option.location_note && <div className="mt-1" style={{ color: "#8ca5bc" }}>{option.location_note}</div>}
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-sm leading-relaxed break-words max-h-32 overflow-y-auto" style={{ color: "#cde0f0" }}>
              {activeListing.description || "No description provided yet."}
            </p>
            
            {activeListing.kind === "property" && Boolean(activeListing.amenities?.length) && (
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {activeListing.amenities?.slice(0, 6).map((amenity) => (
                  <span key={amenity.id} className="rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap" style={{ background: `${color}16`, color, border: `1px solid ${color}30` }}>
                    {amenity.name}
                  </span>
                ))}
              </div>
            )}
            
            {activeListing.kind === "beauty" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input 
                  type="date" 
                  value={bookingDate} 
                  onChange={(e) => setBookingDate(e.target.value)} 
                  className="rounded-xl px-3 py-2 text-sm outline-none transition-all focus:ring-2"
                  style={{ background: "var(--bg-elevated, #1a2e42)", color: "var(--text-primary, white)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
                <input 
                  type="time" 
                  value={startTime} 
                  onChange={(e) => setStartTime(e.target.value)} 
                  className="rounded-xl px-3 py-2 text-sm outline-none transition-all focus:ring-2"
                  style={{ background: "var(--bg-elevated, #1a2e42)", color: "var(--text-primary, white)", border: "1px solid rgba(255,255,255,0.08)" }}
                />
              </div>
            )}

            {activeListing.kind === "beauty" && Boolean(activeListing.booked_slots?.length) && (
              <div className="rounded-xl p-3 text-xs" style={{ background: "var(--bg-elevated, #1a2e42)", color: "#cde0f0", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="font-bold mb-2" style={{ color: "var(--text-primary, white)" }}>Confirmed booked slots</div>
                <div className="flex flex-wrap gap-1.5">
                  {activeListing.booked_slots?.slice(0, 6).map((slot, index) => (
                    <span key={`${slot.booking_date}-${slot.start_time}-${index}`} className="rounded-full px-2 py-1" style={{ background: "#ef444420", color: "#fca5a5" }}>
                      {slot.booking_date} {slot.start_time?.slice(0, 5) || "time pending"}
                    </span>
                  ))}
                </div>
                {slotBooked && <div className="mt-2 font-semibold" style={{ color: "#ef4444" }}>That slot is already booked.</div>}
              </div>
            )}
            
            {activeListing.kind === "spare" && (
              <input 
                type="number" 
                min={1} 
                max={activeListing.quantity ?? undefined} 
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)} 
                className="rounded-xl px-3 py-2 text-sm outline-none transition-all focus:ring-2 w-full"
                style={{ background: "var(--bg-elevated, #1a2e42)", color: "var(--text-primary, white)", border: "1px solid rgba(255,255,255,0.08)" }}
              />
            )}
            
            <textarea 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              rows={3} 
              placeholder="Add a short message..." 
              className="rounded-xl px-3 py-2 text-sm outline-none resize-none transition-all focus:ring-2"
              style={{ background: "var(--bg-elevated, #1a2e42)", color: "var(--text-primary, white)", border: "1px solid rgba(255,255,255,0.08)" }}
            />
            
            {error && <div className="text-xs font-semibold animate-in slide-in-from-top-1" style={{ color: "#ef4444" }}>{error}</div>}
            {result && <div className="text-xs font-semibold animate-in slide-in-from-top-1" style={{ color: "#10b981" }}>{result}</div>}
            
            <button 
              onClick={submitAction} 
              disabled={submitting || !activeListing.is_available || slotBooked} 
              className="w-full py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 disabled:opacity-50 transition-all hover:brightness-110 active:scale-98"
              style={{ background: color, color: "#0d1f2d" }}
            >
              <ActionIcon size={16} /> 
              {submitting ? "Sending..." : slotBooked ? "Slot unavailable" : actionLabel}
            </button>

            {shopGroups.length > 0 && (
              <div className="rounded-xl p-3" style={{ background: "var(--bg-elevated, #1a2e42)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="text-xs font-black mb-2" style={{ color: "var(--text-primary, white)" }}>
                  More from {listing.provider?.business_name || "this provider"}
                </div>
                <div className="flex flex-col gap-2 max-h-44 overflow-y-auto">
                  {shopGroups.map((group) => (
                    <div key={group.name}>
                      <div className="text-[10px] uppercase font-bold mb-1" style={{ color }}>{group.name} ({group.count})</div>
                      {group.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-2 text-[11px] py-1" style={{ color: "#cde0f0" }}>
                          <span className="truncate">{item.title}</span>
                          <span className="shrink-0" style={{ color: "#8ca5bc" }}>{priceFor(item, item.kind === "property" ? "/mo" : "")}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
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
  const [interactions, setInteractions] = useState<ServiceInteraction[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoSearching, setPhotoSearching] = useState(false);
  const [photoSearchMessage, setPhotoSearchMessage] = useState("");
  const [selectedListing, setSelectedListing] = useState<ServiceListing | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    providerService.browseServices(undefined, search)
      .then((res) => setListings(res.data?.items ?? []))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    providerService
      .listInteractions({ scope: "customer" })
      .then((res) => setInteractions(res.data?.items ?? []))
      .catch(() => setInteractions([]));
  }, []);

  const toggleSave = (id: string) => setSaved(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  
  const searchByPhoto = async (file?: File | null) => {
    if (!file) return;
    setPhotoSearching(true);
    setPhotoSearchMessage("");
    try {
      const res = await providerService.searchSparesByPhoto(file, search);
      setListings(res.data?.items ?? []);
      setCategory("Spare Parts");
      setPhotoSearchMessage(res.message);
    } catch (err) {
      setPhotoSearchMessage(err instanceof Error ? err.message : "Could not search by photo.");
    } finally {
      setPhotoSearching(false);
    }
  };
  
  const browseListings = useMemo(() => groupBrowseListings(listings), [listings]);
  const interactionByListingId = useMemo(() => {
    const map = new Map<string, ServiceInteraction>();
    interactions.forEach((interaction) => {
      if (interaction.listing?.id && !map.has(interaction.listing.id)) map.set(interaction.listing.id, interaction);
    });
    return map;
  }, [interactions]);

  const filtered = browseListings.filter((listing) => {
    const matchCat = category === "All" || categoryFor(listing) === category;
    const groupedText = (listing.grouped_items ?? [listing])
      .map((item) => `${item.title} ${item.category_display ?? ""} ${item.category ?? ""} ${item.property_type_display ?? ""} ${item.part_name ?? ""}`)
      .join(" ");
    const text = `${listing.title} ${listing.provider?.business_name ?? ""} ${locationFor(listing)} ${listing.category_display ?? ""} ${listing.category ?? ""} ${groupedText}`.toLowerCase();
    const matchSearch = !search || text.includes(search.toLowerCase());
    const matchSaved = !showSaved || saved.includes(listing.id);
    return matchCat && matchSearch && matchSaved;
  });

  const counts = useMemo(() => {
    const values: Record<string, number> = { All: browseListings.length, Rentals: 0, Beauty: 0, "Spare Parts": 0 };
    browseListings.forEach((listing) => { values[categoryFor(listing)] += 1; });
    return values;
  }, [browseListings]);

  return (
    <PageShell title="Browse" subtitle="Find rentals, beauty services, and spare parts near you" color={color}>
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl transition-all focus-within:ring-2" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <Search size={14} style={{ color: "#8ca5bc" }} />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by name, provider or location..." 
            className="flex-1 bg-transparent text-sm outline-none min-w-0"
            style={{ color: "var(--text-primary, white)" }} 
          />
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => setShowSaved(v => !v)} 
            className="px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all hover:scale-105 active:scale-95"
            style={showSaved ? { background: "#ef444420", color: "#ef4444", border: "1px solid #ef444440" } : { background: "var(--bg-secondary, #132333)", color: "#8ca5bc", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <Heart size={13} fill={showSaved ? "#ef4444" : "transparent"} />
            <span className="hidden xs:inline">{saved.length}</span>
          </button>
          
          <label className="px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-all hover:bg-opacity-80" style={{ background: "var(--bg-secondary, #132333)", color: "#8ca5bc", border: "1px solid rgba(255,255,255,0.07)" }}>
            <Camera size={13} /> 
            <span className="hidden xs:inline">{photoSearching ? "Searching..." : "Photo"}</span>
            <input type="file" accept="image/*" className="sr-only" onChange={(event) => searchByPhoto(event.target.files?.[0])} />
          </label>
          
          <button 
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)} 
            className="lg:hidden px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
          >
            <SlidersHorizontal size={13} /> 
          </button>
        </div>
      </div>
      
      {photoSearchMessage && (
        <div className="text-xs mb-4 animate-in slide-in-from-top-1" style={{ color: "#8ca5bc" }}>
          {photoSearchMessage}
        </div>
      )}
      
      {/* Categories - Desktop */}
      <div className="hidden lg:flex gap-2 flex-wrap mb-6 overflow-x-auto pb-2 scrollbar-thin">
        {CATEGORIES.map(cat => {
          const Icon = cat !== "All" ? CATEGORY_ICON[cat] : null;
          const active = category === cat;
          return (
            <button 
              key={cat} 
              onClick={() => setCategory(cat)} 
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
              style={active ? { background: color, color: "#0d1f2d" } : { background: "var(--bg-secondary, #132333)", color: "#8ca5bc", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {Icon && <Icon size={11} />}
              {cat}
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-black" style={active ? { background: "rgba(0,0,0,0.2)", color: "#0d1f2d" } : { background: `${color}18`, color }}>
                {counts[cat] ?? 0}
              </span>
            </button>
          );
        })}
      </div>
      
      {/* Mobile Categories Drawer */}
      {mobileFiltersOpen && (
        <>
          <div className="fixed inset-0 z-40 lg:hidden" style={{ background: "rgba(0,0,0,0.5)" }} onClick={() => setMobileFiltersOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden rounded-t-2xl animate-in slide-in-from-bottom-48" style={{ background: "var(--bg-secondary, #132333)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              <h3 className="font-bold" style={{ color: "var(--text-primary, white)" }}>Categories</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
                <X size={14} />
              </button>
            </div>
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              <div className="flex flex-col gap-2">
                {CATEGORIES.map(cat => {
                  const Icon = cat !== "All" ? CATEGORY_ICON[cat] : null;
                  const active = category === cat;
                  return (
                    <button 
                      key={cat} 
                      onClick={() => { setCategory(cat); setMobileFiltersOpen(false); }} 
                      className="flex items-center justify-between px-3 py-3 rounded-xl text-sm font-bold transition-all"
                      style={active ? { background: color, color: "#0d1f2d" } : { background: "var(--bg-elevated, #1a2e42)", color: "#8ca5bc" }}
                    >
                      <span className="flex items-center gap-2">
                        {Icon && <Icon size={16} />}
                        {cat}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full" style={active ? { background: "rgba(0,0,0,0.2)", color: "#0d1f2d" } : { background: `${color}18`, color }}>
                        {counts[cat] ?? 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* Results Count */}
      <div className="text-xs mb-4 flex justify-between items-center" style={{ color: "#8ca5bc" }}>
        <span>{loading ? "Loading services..." : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}</span>
        {showSaved && <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: "#ef444420", color: "#ef4444" }}>Saved only</span>}
      </div>
      
      {/* Listings Grid */}
      {loading ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {[1,2,3,4].map(i => (
            <div key={i} className="rounded-2xl overflow-hidden animate-pulse" style={{ background: "var(--bg-secondary, #132333)", height: 280 }} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {filtered.map(listing => (
            <ListingCard 
              key={listing.id} 
              listing={listing} 
              color={color} 
              isSaved={saved.includes(listing.id)} 
              viewerInteraction={viewerInteractionFor(listing, interactionByListingId)}
              onToggleSave={() => toggleSave(listing.id)} 
              onOpen={() => setSelectedListing(listing)} 
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-4 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: `${color}15` }}>
            <Search size={24} style={{ color }} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary, white)" }}>No results found</p>
            <p className="text-xs mt-1" style={{ color: "#8ca5bc" }}>Try adjusting your search or filters</p>
          </div>
          <button 
            onClick={() => { setSearch(""); setCategory("All"); setShowSaved(false); }} 
            className="mt-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all hover:brightness-110 active:scale-95"
            style={{ background: color, color: "#0d1f2d" }}
          >
            Clear all filters
          </button>
        </div>
      )}
      
      {selectedListing && (
        <ListingDetailModal listing={selectedListing} color={color} interactionByListingId={interactionByListingId} onClose={() => setSelectedListing(null)} />
      )}
    </PageShell>
  );
}
