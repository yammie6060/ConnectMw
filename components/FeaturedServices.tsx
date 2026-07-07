"use client";

import { useEffect, useMemo, useState, useCallback, useRef, memo } from "react";
import {
  Bed,
  Clock,
  Heart,
  Home,
  Lock,
  LocateFixed,
  MapPin,
  MapPinned,
  Package,
  Scissors,
  Search,
  ShieldCheck,
  Store,
  Truck,
  Wrench,
  X,
  Star,
  Share2,
  ChevronUp,
  Loader2,
  UserRound,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ApiError } from "@/services/api";
import {
  mediaUrl,
  providerService,
  ServiceListing,
  ListingActionPayload,
} from "@/services/provider.service";
import toast from "react-hot-toast";

type Category = "All" | "Rentals" | "Beauty" | "Spare Parts";
type LayoutMode = "horizontal" | "grid";

const CATEGORIES: Category[] = ["All", "Rentals", "Beauty", "Spare Parts"];
const ITEMS_PER_PAGE = 8;

const CATEGORY_ICON: Record<Exclude<Category, "All">, React.ElementType> = {
  Rentals: Home,
  Beauty: Scissors,
  "Spare Parts": Wrench,
};

const TOAST_STYLE_DARK = { background: "#1a2e42", color: "#fff" };
const TOAST_STYLE_ACCENT = { background: "#1a2e42", color: "#f5ab20" };

const GUEST_CONTACT_STORAGE_KEY = "connectmw_guest_contact";
const MALAWI_PHONE_PATTERN = /^(\+265|0)[1-9][0-9]{8}$/;

type GuestContact = { name: string; phone: string; email?: string };

function loadStoredGuestContact(): GuestContact | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(GUEST_CONTACT_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GuestContact) : null;
  } catch {
    return null;
  }
}

function saveGuestContact(contact: GuestContact) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(GUEST_CONTACT_STORAGE_KEY, JSON.stringify(contact));
}

function categoryFor(item: ServiceListing): Category {
  if (item.kind === "property") return "Rentals";
  if (item.kind === "beauty") return "Beauty";
  return "Spare Parts";
}

function locationFor(item: ServiceListing) {
  return (
    item.display_location ||
    [item.street_address, item.city, item.district].filter(Boolean).join(", ") ||
    item.provider_location ||
    item.provider?.physical_address ||
    item.city ||
    "Location not set"
  );
}

function metaFor(item: ServiceListing) {
  if (item.kind === "property")
    return item.bedrooms
      ? `${item.bedrooms} bed${item.bedrooms === 1 ? "" : "s"}`
      : item.property_type_display || item.property_type || "Property";
  if (item.kind === "beauty")
    return item.duration_minutes
      ? `${item.duration_minutes} min`
      : item.category_display || item.category || "Service";
  return `${item.quantity ?? 0} in stock`;
}

function priceFor(item: ServiceListing) {
  if (item.kind === "beauty" && item.price_options?.length) {
    const prices = item.price_options
      .filter((o) => o.is_available && o.price != null)
      .map((o) => Number(o.price));
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

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// Loading Skeleton
const SkeletonCard = memo(() => (
  <div className="w-[320px] flex-none sm:w-[340px]">
    <div className="relative aspect-[4/3] overflow-hidden rounded-lg" style={{ background: "#1a2e42" }}>
      <div className="absolute inset-0 shimmer" />
    </div>
    <div className="mt-3 space-y-3 p-2">
      <div className="h-4 w-3/4 rounded" style={{ background: "#1a2e42" }} />
      <div className="h-3 w-1/2 rounded" style={{ background: "#1a2e42" }} />
      <div className="h-3 w-2/3 rounded" style={{ background: "#1a2e42" }} />
      <div className="flex justify-between">
        <div className="h-4 w-1/3 rounded" style={{ background: "#1a2e42" }} />
        <div className="h-8 w-20 rounded" style={{ background: "#1a2e42" }} />
      </div>
    </div>
  </div>
));

SkeletonCard.displayName = "SkeletonCard";

//  Shared field styling 
const fieldClass =
  "w-full rounded-lg px-3 py-2 text-sm text-white outline-none placeholder:text-[#8ca5bc]";
const fieldStyle = { background: "#1a2e42", border: "1px solid rgba(255,255,255,0.08)" };

function BookingActionModal({
  listing,
  isAuthenticated,
  onClose,
  onRequireAuth,
}: {
  listing: ServiceListing;
  isAuthenticated?: boolean;
  onClose: () => void;
  onRequireAuth: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);

  // Beauty
  const availableModes = useMemo(
    () =>
      listing.price_options?.filter((o) => o.is_available).map((o) => o.service_mode) ??
      (listing.service_modes ?? []),
    [listing]
  );
  const [serviceMode, setServiceMode] = useState<"onsite" | "mobile">(
    (availableModes.includes("onsite") ? "onsite" : (availableModes[0] as "onsite" | "mobile")) ||
      "onsite"
  );
  const [bookingDate, setBookingDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("");
  const [serviceAddress, setServiceAddress] = useState("");

  // Spare
  const [quantity, setQuantity] = useState(1);
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");

  // Property / shared notes
  const [message, setMessage] = useState("");

  // Guest contact
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  useEffect(() => {
    if (isAuthenticated) return;
    const saved = loadStoredGuestContact();
    if (saved) {
      setGuestName(saved.name || "");
      setGuestPhone(saved.phone || "");
      setGuestEmail(saved.email || "");
    }
  }, [isAuthenticated]);

  const selectedPriceOption = useMemo(
    () => listing.price_options?.find((o) => o.is_available && o.service_mode === serviceMode),
    [listing.price_options, serviceMode]
  );

  const guestValid =
    isAuthenticated ||
    (guestName.trim().length >= 2 && MALAWI_PHONE_PATTERN.test(guestPhone.trim()));

  const detailsValid = useMemo(() => {
    if (listing.kind === "beauty") {
      return (
        Boolean(bookingDate) &&
        Boolean(startTime) &&
        (serviceMode !== "mobile" || serviceAddress.trim().length > 4)
      );
    }
    if (listing.kind === "spare") {
      return quantity >= 1 && (deliveryMethod !== "delivery" || deliveryAddress.trim().length > 4);
    }
    return true; // property enquiry only needs an optional message
  }, [
    listing.kind, bookingDate, startTime, serviceMode, serviceAddress,
    quantity, deliveryMethod, deliveryAddress,
  ]);

  const canSubmit = detailsValid && guestValid;

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const payload: ListingActionPayload = { message: message || undefined };

      if (listing.kind === "beauty") {
        payload.booking_date = bookingDate;
        payload.start_time = startTime;
        payload.service_mode = serviceMode;
        if (selectedPriceOption?.id) payload.price_option_id = selectedPriceOption.id;
        if (serviceMode === "mobile") payload.service_address = serviceAddress.trim();
      }

      if (listing.kind === "spare") {
        payload.quantity = quantity;
        payload.delivery_method = deliveryMethod;
        if (deliveryMethod === "delivery") payload.delivery_address = deliveryAddress.trim();
      }

      if (!isAuthenticated) {
        const contact: GuestContact = {
          name: guestName.trim(),
          phone: guestPhone.trim(),
          email: guestEmail.trim() || undefined,
        };
        saveGuestContact(contact);
        payload.guest_contact = contact;
      }

      const response = await providerService.createListingAction(listing.kind, listing.id, payload);
      const payment = response.data?.payment;
      if (payment?.checkout_url) {
        toast.success("Redirecting you to complete payment...", { style: TOAST_STYLE_ACCENT });
        window.location.href = payment.checkout_url;
        return;
      }
      toast.success(
        isAuthenticated
          ? "Request sent successfully!"
          : "Request sent! The provider will contact you directly.",
        { style: TOAST_STYLE_ACCENT }
      );
      onClose();
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
        { style: TOAST_STYLE_DARK }
      );
    } finally {
      setSubmitting(false);
    }
  }, [
    canSubmit, listing, message, bookingDate, startTime, serviceMode, selectedPriceOption,
    quantity, deliveryMethod, deliveryAddress, isAuthenticated, guestName, guestPhone, guestEmail, onClose,
  ]);

  return (
    <div
      className="fixed inset-0 z-[1100] flex items-center justify-center p-4"
      style={{ background: "rgba(3,10,18,0.86)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-lg p-5"
        style={{ background: "#132333", border: "1px solid rgba(255,255,255,0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <div className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#f5ab20]">
              {kindLabel(listing.kind)}
            </div>
            <h3 className="text-lg font-black leading-snug text-white">{listing.title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#cde0f0] hover:bg-white/5"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/*  Beauty: mode, date, time, address  */}
          {listing.kind === "beauty" && (
            <>
              {availableModes.length > 0 && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#8ca5bc]">
                    How would you like this service?
                  </label>
                  <div className="flex gap-2">
                    {(["onsite", "mobile"] as const)
                      .filter((mode) => availableModes.includes(mode))
                      .map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setServiceMode(mode)}
                          className="flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-all"
                          style={
                            serviceMode === mode
                              ? { background: "#f5ab20", color: "#0d1f2d" }
                              : { background: "#1a2e42", color: "#8ca5bc", border: "1px solid rgba(255,255,255,0.08)" }
                          }
                        >
                          {mode === "onsite" ? "At the provider" : "Come to me"}
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {serviceMode === "mobile" && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#8ca5bc]">
                    Address for the provider to come to
                  </label>
                  <input
                    value={serviceAddress}
                    onChange={(e) => setServiceAddress(e.target.value)}
                    placeholder="e.g. Area 47, Sector 3, near ABC store"
                    className={fieldClass}
                    style={fieldStyle}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#8ca5bc]">Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    min={todayISO()}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className={fieldClass}
                    style={fieldStyle}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#8ca5bc]">Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={fieldClass}
                    style={fieldStyle}
                  />
                </div>
              </div>
            </>
          )}

          {/*  Spare parts: quantity, pickup/delivery, address  */}
          {listing.kind === "spare" && (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-[#8ca5bc]">Quantity</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
                    style={fieldStyle}
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-white">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(listing.quantity ?? q + 1, q + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
                    style={fieldStyle}
                  >
                    +
                  </button>
                  {listing.quantity != null && (
                    <span className="text-[11px] text-[#8ca5bc]">{listing.quantity} in stock</span>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-[#8ca5bc]">
                  <Truck size={12} /> Pickup or delivery?
                </label>
                <div className="flex gap-2">
                  {(["pickup", "delivery"] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setDeliveryMethod(method)}
                      className="flex-1 rounded-lg px-3 py-2 text-xs font-bold capitalize transition-all"
                      style={
                        deliveryMethod === method
                          ? { background: "#f5ab20", color: "#0d1f2d" }
                          : { background: "#1a2e42", color: "#8ca5bc", border: "1px solid rgba(255,255,255,0.08)" }
                      }
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              {deliveryMethod === "delivery" && (
                <div>
                  <label className="mb-1.5 block text-xs font-bold text-[#8ca5bc]">Delivery address</label>
                  <input
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Where should this be delivered?"
                    className={fieldClass}
                    style={fieldStyle}
                  />
                </div>
              )}
            </>
          )}

          {/*  Message / notes — every kind  */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-[#8ca5bc]">
              {listing.kind === "property" ? "Message to the provider (optional)" : "Notes (optional)"}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={2}
              placeholder="Anything the provider should know?"
              className={`${fieldClass} resize-none`}
              style={fieldStyle}
            />
          </div>

          {/*  Guest contact — only when not signed in  */}
          {!isAuthenticated && (
            <div
              className="rounded-lg p-3"
              style={{ background: "rgba(245,171,32,0.06)", border: "1px solid rgba(245,171,32,0.2)" }}
            >
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#f5ab20]">
                <UserRound size={12} /> Your contact details
              </div>
              <div className="space-y-2">
                <input
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Full name"
                  className={fieldClass}
                  style={fieldStyle}
                />
                <input
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="Phone (e.g. 0999123456)"
                  className={fieldClass}
                  style={fieldStyle}
                />
                <input
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="Email (optional)"
                  className={fieldClass}
                  style={fieldStyle}
                />
              </div>
              <button
                type="button"
                onClick={onRequireAuth}
                className="mt-2 text-[11px] font-bold text-[#f5ab20] underline decoration-dotted underline-offset-2 hover:text-[#f5ab20]/80"
              >
                Sign in instead to track this from your dashboard
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={!canSubmit || submitting}
          onClick={handleSubmit}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-black transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          style={{ background: "#f5ab20", color: "#0d1f2d" }}
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {kindLabel(listing.kind)} now
        </button>
      </div>
    </div>
  );
}

// Featured Card Component
interface FeaturedCardProps {
  item: ServiceListing;
  onOpen: () => void;
  onRequireAuth: () => void;
  isAuthenticated?: boolean;
  layout?: LayoutMode;
}

const FeaturedCard = memo(({ item, onOpen, onRequireAuth, isAuthenticated, layout = "horizontal" }: FeaturedCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const category = categoryFor(item);
  const CategoryIcon = category === "All" ? Home : CATEGORY_ICON[category as Exclude<Category, "All">];
  const MetaIcon =
    item.kind === "property" ? Bed : item.kind === "beauty" ? Clock : Package;
  const image = item.primary_image || item.images?.[0]?.image_url;

  const handleSave = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error("Please sign in to save services", {
        duration: 3000,
        position: "bottom-center",
        icon: <Lock size={16} />,
        style: TOAST_STYLE_DARK,
      });
      onRequireAuth();
      return;
    }
    setIsSaved(!isSaved);
    toast.success(isSaved ? "Removed from favorites" : "Saved to favorites!", {
      icon: <Heart size={16} fill={isSaved ? "none" : "#f5ab20"} color="#f5ab20" />,
      style: TOAST_STYLE_ACCENT,
    });
  }, [isAuthenticated, isSaved, onRequireAuth]);

  const cardWidth = layout === "horizontal" ? "w-[320px] sm:w-[340px]" : "w-full";

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onOpen}
      className={`${cardWidth} flex-none cursor-pointer overflow-hidden rounded-lg transition-all duration-300`}
      style={{
        background: "#1a2e42",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: isHovered ? "0 20px 40px rgba(0,0,0,0.4)" : "0 16px 34px rgba(0,0,0,0.22)",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
      }}
    >
      <div
        className="relative aspect-[4/3] overflow-hidden"
        style={{ background: "rgba(245,171,32,0.08)" }}
      >
        {!imageLoaded && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{ background: "rgba(255,255,255,0.05)" }}
          />
        )}
        {image ? (
          <img
            src={mediaUrl(image)}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500"
            style={{
              opacity: imageLoaded ? 1 : 0,
              transform: isHovered ? "scale(1.08)" : "scale(1)",
            }}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#8ca5bc]">
            <CategoryIcon size={34} />
          </div>
        )}

        <div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
          style={{ opacity: isHovered ? 1 : 0, transition: "opacity 0.3s" }}
        />

        <div
          className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md"
          style={{ background: "rgba(0,0,0,0.62)" }}
        >
          <CategoryIcon size={11} />
          {category}
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full backdrop-blur-md transition-all hover:scale-110"
          style={{ background: "rgba(0,0,0,0.55)", color: isSaved ? "#f5ab20" : "#fff" }}
          aria-label="Save service"
          title="Save to favorites"
        >
          <Heart size={14} fill={isSaved ? "#f5ab20" : "none"} />
        </button>

        <span
          className="absolute bottom-3 left-3 rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ background: "rgba(16,185,129,0.18)", color: "#10b981" }}
        >
          {item.status}
        </span>

        {item.distance_km != null && (
          <span
            className="absolute bottom-3 right-3 rounded-full px-2 py-0.5 text-[10px] font-bold backdrop-blur-md"
            style={{ background: "rgba(245,171,32,0.18)", color: "#f5ab20" }}
          >
            {item.distance_km < 1
              ? `${Math.round(item.distance_km * 1000)} m`
              : `${item.distance_km} km`}
          </span>
        )}
      </div>

      <div className="flex min-h-[210px] flex-col p-4">
        <div className="mb-1 text-sm font-bold leading-snug text-white line-clamp-2">
          {item.title}
        </div>
        <div className="mb-2 flex items-center gap-2">
          <span className="truncate text-[11px] font-bold text-[#f5ab20]">
            {item.provider?.business_name ||
              item.category_display ||
              item.property_type_display ||
              item.part_name ||
              "Verified provider"}
          </span>
          {item.provider?.is_verified && (
            <span className="text-[10px] text-[#10b981]">
              <Star size={12} fill="#10b981" />
            </span>
          )}
        </div>
        <div className="mb-2 flex items-center gap-1.5 text-[11px] text-[#8ca5bc]">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">{locationFor(item)}</span>
        </div>
        <div className="mb-3 flex items-center gap-1.5 text-[11px] text-[#8ca5bc]">
          <MetaIcon size={12} className="shrink-0" />
          <span className="truncate">{metaFor(item)}</span>
        </div>
        <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-[#cde0f0]">
          {item.description || "Provider details are available after sign in."}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3">
          <span className="text-base font-black text-[#f5ab20]">{priceFor(item)}</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            className="rounded-lg px-3 py-2 text-[11px] font-black transition-all hover:brightness-110 hover:scale-105"
            style={{ background: "#f5ab20", color: "#0d1f2d" }}
          >
            {kindLabel(item.kind)}
          </button>
        </div>
      </div>
    </div>
  );
});

FeaturedCard.displayName = "FeaturedCard";

// Provider Storefront Modal — browsing only. Action detail-gathering is
// delegated to BookingActionModal so the form is identical no matter which
// listing card in this storefront triggered it.
function ProviderStorefrontModal({
  listing,
  onClose,
  onRequireAuth,
  isAuthenticated,
}: {
  listing: ServiceListing;
  onClose: () => void;
  onRequireAuth: () => void;
  isAuthenticated?: boolean;
}) {
  const [items, setItems] = useState<ServiceListing[]>([listing]);
  const [activeId, setActiveId] = useState(listing.id);
  const [loading, setLoading] = useState(true);
  const [showActionForm, setShowActionForm] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const active = items.find((i) => i.id === activeId) || listing;
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showActionForm) setShowActionForm(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, showActionForm]);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: active.title,
          text: `Check out ${active.title} on ConnectMW`,
          url: url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard!", {
          style: TOAST_STYLE_ACCENT,
        });
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error("Could not share at this time");
      }
    }
  }, [active.title]);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-5"
      style={{ background: "rgba(3,10,18,0.86)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-lg"
        style={{
          background: "#132333",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 z-10 flex items-center justify-between gap-3 px-4 py-3"
          style={{
            background: "rgba(19,35,51,0.96)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#f5ab20]">
              <Store size={12} />
              Provider Profile
            </div>
            <h3 className="truncate text-lg font-black text-white">
              {provider?.business_name || provider?.display_name || "ConnectMW Provider"}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#cde0f0] transition-all hover:bg-white/5 hover:scale-110"
              aria-label="Share"
            >
              <Share2 size={18} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-[#cde0f0] transition-all hover:bg-white/5 hover:scale-110"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="grid gap-5 p-4 sm:p-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <div
              className="aspect-video overflow-hidden rounded-lg"
              style={{
                background: "rgba(245,171,32,0.08)",
                border: "1px solid rgba(245,171,32,0.2)",
              }}
            >
              {image ? (
                <img
                  src={mediaUrl(image)}
                  alt={active.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#8ca5bc]">
                  No image attached
                </div>
              )}
            </div>
            <div className="mt-4">
              <div className="mb-1 text-[11px] font-bold uppercase tracking-widest text-[#f5ab20]">
                {categoryFor(active)}
              </div>
              <h4 className="text-2xl font-black text-white">{active.title}</h4>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-[#8ca5bc]">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1"
                  style={{ background: "#1a2e42" }}
                >
                  <MapPin size={12} />
                  {locationFor(active)}
                </span>
                <span className="rounded-full px-2.5 py-1" style={{ background: "#1a2e42" }}>
                  {metaFor(active)}
                </span>
                <span className="rounded-full px-2.5 py-1" style={{ background: "#1a2e42" }}>
                  {active.status}
                </span>
                {active.distance_km != null && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-1"
                    style={{ background: "rgba(245,171,32,0.12)", color: "#f5ab20" }}
                  >
                    <MapPinned size={12} />
                    {active.distance_km < 1
                      ? `${Math.round(active.distance_km * 1000)} m away`
                      : `${active.distance_km} km away`}
                  </span>
                )}
              </div>
              <p className="mt-4 text-sm leading-7 text-[#cde0f0]">
                {active.description || "This provider has not added a description yet."}
              </p>
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div
              className="rounded-lg p-4"
              style={{ background: "#1a2e42", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="mb-3 text-xs font-black uppercase tracking-widest text-[#8ca5bc]">
                Provider
              </div>
              <div className="text-base font-black text-white">
                {provider?.business_name || provider?.display_name || "ConnectMW Provider"}
              </div>
              <div className="mt-2 text-xs leading-6 text-[#cde0f0]">
                {provider?.physical_address || active.provider_location || "Location not set"}
              </div>
              {provider?.is_verified && (
                <div
                  className="mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-[#10b981]"
                  style={{ background: "rgba(16,185,129,0.12)" }}
                >
                  <ShieldCheck size={14} />
                  Verified provider
                </div>
              )}
            </div>

            <div
              className="rounded-lg p-4"
              style={{ background: "#1a2e42", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="text-xs font-black uppercase tracking-widest text-[#8ca5bc]">
                  Services
                </div>
                <div className="text-[11px] text-[#8ca5bc]">
                  {loading ? "Loading..." : `${items.length} listed`}
                </div>
              </div>
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#f5ab20] scrollbar-track-transparent">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    className="w-full rounded-lg p-3 text-left transition-all hover:bg-white/5"
                    style={
                      activeId === item.id
                        ? {
                            background: "rgba(245,171,32,0.14)",
                            border: "1px solid rgba(245,171,32,0.35)",
                          }
                        : {
                            background: "rgba(255,255,255,0.035)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }
                    }
                  >
                    <span className="block truncate text-sm font-bold text-white">
                      {item.title}
                    </span>
                    <span className="mt-1 block truncate text-[11px] text-[#8ca5bc]">
                      {categoryFor(item)} — {priceFor(item)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div
              className="rounded-lg p-4"
              style={{ background: "#1a2e42", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="text-2xl font-black text-[#f5ab20]">{priceFor(active)}</div>
              <button
                type="button"
                onClick={() => setShowActionForm(true)}
                className="mt-4 w-full rounded-lg px-4 py-3 text-sm font-black transition-all hover:brightness-110 hover:scale-[1.02]"
                style={{ background: "#f5ab20", color: "#0d1f2d" }}
              >
                {kindLabel(active.kind)}
              </button>
              {!isAuthenticated && (
                <p className="mt-2 text-center text-[11px] text-[#8ca5bc]">
                  No account needed to continue.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      {showActionForm && (
        <BookingActionModal
          listing={active}
          isAuthenticated={isAuthenticated}
          onClose={() => {
            setShowActionForm(false);
            onClose();
          }}
          onRequireAuth={() => {
            setShowActionForm(false);
            onRequireAuth();
          }}
        />
      )}
    </div>
  );
}

interface GeoCoords {
  latitude: number;
  longitude: number;
}

type LocationStatus = "idle" | "detecting" | "granted" | "denied" | "unavailable";

export default function FeaturedServices({
  onOpenAuthModal,
  isAuthenticated = false,
}: {
  onOpenAuthModal: (tab: "signin" | "signup") => void;
  isAuthenticated?: boolean;
}) {
  const [items, setItems] = useState<ServiceListing[]>([]);
  const [category, setCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [locationText, setLocationText] = useState("");
  const [coords, setCoords] = useState<GeoCoords | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [selectedListing, setSelectedListing] = useState<ServiceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [layout, setLayout] = useState<LayoutMode>("horizontal");
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Fix hydration by setting mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // If someone signed in while holding a stored guest contact, link any of
  // their prior guest requests onto the new account, then forget the guest
  // contact locally (it's now redundant with the account).
  useEffect(() => {
    if (!isAuthenticated) return;
    const stored = loadStoredGuestContact();
    if (!stored) return;
    providerService
      .claimGuestInteractions()
      .then((res) => {
        if (res.data?.claimed) {
          toast.success(
            `Linked ${res.data.claimed} previous request${res.data.claimed === 1 ? "" : "s"} to your account`,
            { style: TOAST_STYLE_ACCENT }
          );
        }
      })
      .catch(() => {})
      .finally(() => {
        window.localStorage.removeItem(GUEST_CONTACT_STORAGE_KEY);
      });
  }, [isAuthenticated]);

  // Check scroll position for arrows
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || layout !== "horizontal") return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 20);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 20);
  }, [layout]);

  // Scroll functions
  const scrollHorizontal = useCallback((direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    const newScrollLeft = direction === "left" 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  }, []);

  // Geolocation
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      return;
    }
    setLocationStatus("detecting");
    setCoords(null);
    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => {
        setCoords({ latitude: c.latitude, longitude: c.longitude });
        setLocationStatus("granted");
        setLocationText("");
        toast.success("Location detected!", {
          icon: <MapPinned size={16} color="#f5ab20" />,
          style: TOAST_STYLE_ACCENT,
        });
      },
      () => {
        setLocationStatus("denied");
        toast.error("Location access denied. Please enter a city manually.", {
          duration: 4000,
          style: TOAST_STYLE_DARK,
        });
      },
      { enableHighAccuracy: false, timeout: 9000, maximumAge: 600_000 }
    );
  }, []);

  // Fetch services
  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await providerService.browseServices(
        undefined,
        search || undefined,
        {
          location: locationText || undefined,
          latitude: coords?.latitude,
          longitude: coords?.longitude,
          limit: 50,
        }
      );

      const newItems = response.data?.items ?? [];
      setItems(newItems);
      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to fetch services:", error);
      toast.error("Failed to load services. Please try again.", {
        style: TOAST_STYLE_DARK,
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, locationText, coords]);

  // Initial load
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Debounced fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchServices]);

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedListing(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Scroll horizontal with mouse wheel and check position
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || layout !== "horizontal") return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        scrollContainer.scrollLeft += e.deltaY;
      }
    };

    scrollContainer.addEventListener("wheel", handleWheel, { passive: false });
    scrollContainer.addEventListener("scroll", checkScrollPosition);
    
    // Initial check
    setTimeout(checkScrollPosition, 100);

    return () => {
      scrollContainer.removeEventListener("wheel", handleWheel);
      scrollContainer.removeEventListener("scroll", checkScrollPosition);
    };
  }, [layout, checkScrollPosition]);

  const filtered = useMemo(
    () => items.filter((item) => category === "All" || categoryFor(item) === category),
    [category, items]
  );

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filtered.slice(start, end);
  }, [filtered, currentPage]);

  const counts = useMemo(() => {
    const values: Record<Category, number> = { All: items.length, Rentals: 0, Beauty: 0, "Spare Parts": 0 };
    items.forEach((item) => (values[categoryFor(item)] += 1));
    return values;
  }, [items]);

  const locationHint = useMemo(() => {
    if (locationStatus === "detecting") return "Detecting your location...";
    if (locationStatus === "granted" && !locationText)
      return "Showing services sorted by distance from you.";
    if (locationStatus === "denied")
      return "Location access denied — type a city to filter results.";
    if (locationStatus === "unavailable")
      return "Geolocation unavailable — type a city to filter results.";
    if (locationText) return `Filtering by "${locationText}".`;
    return "Allow location access to show services near you.";
  }, [locationStatus, locationText]);

  const handleLocationTextChange = (value: string) => {
    setLocationText(value);
    if (value) setCoords(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toggleLayout = () => {
    setLayout(prev => prev === "horizontal" ? "grid" : "horizontal");
    setCurrentPage(1);
  };

  // Don't render on server
  if (!mounted) {
    return (
      <section
        id="featured-services"
        className="px-[10%] py-12 sm:py-14"
        style={{
          background: "#0f1d2b",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 size={40} className="animate-spin text-[#f5ab20]" />
        </div>
      </section>
    );
  }

  return (
    <>
      <section
        id="services"
        ref={containerRef}
        className="px-[10%] py-12 sm:py-14"
        style={{
          background: "#0f1d2b",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          marginTop: "-1px",
        }}
      >
        <div>
          {/* Header */}
          <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-[0.75rem] font-semibold uppercase tracking-[2px] text-[#f5ab20]">
                Featured Services
              </p>
              <h2 className="text-[clamp(1.7rem,3vw,2.35rem)] font-bold leading-tight text-white">
                Live services near you
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#cde0f0]">
                Browse real listings from ConnectMW providers. Sign in only when you want to save,
                or continue as a guest to enquire, book, or order.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:flex-row lg:max-w-xl">
              {/* Search */}
              <div
                className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2 transition-all focus-within:border-[#f5ab20]"
                style={{
                  background: "#132333",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Search size={14} className="text-[#8ca5bc]" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search services"
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#8ca5bc]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="rounded p-1 hover:bg-white/10"
                  >
                    <X size={12} className="text-[#8ca5bc]" />
                  </button>
                )}
              </div>

              {/* Location */}
              <div
                className="flex flex-1 items-center gap-2 rounded-lg px-3 py-2 transition-all focus-within:border-[#f5ab20]"
                style={{
                  background: "#132333",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <MapPin size={14} className="text-[#8ca5bc]" />
                <input
                  value={locationText}
                  onChange={(e) => handleLocationTextChange(e.target.value)}
                  placeholder={
                    locationStatus === "detecting"
                      ? "Detecting location..."
                      : "Override city / district"
                  }
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-[#8ca5bc]"
                />
                <button
                  type="button"
                  onClick={requestLocation}
                  className="rounded-md p-1.5 transition-all hover:bg-white/5 hover:scale-110"
                  style={{
                    color: locationStatus === "granted" && !locationText ? "#10b981" : "#f5ab20",
                  }}
                  aria-label="Use my location"
                  title={
                    locationStatus === "granted" && !locationText
                      ? "Using GPS location"
                      : "Use my location"
                  }
                >
                  <LocateFixed size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Categories and Layout Toggle */}
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-[#f5ab20] scrollbar-track-transparent">
              {CATEGORIES.map((item) => {
                const active = category === item;
                const Icon = item === "All" ? ShieldCheck : CATEGORY_ICON[item as Exclude<Category, "All">];
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all hover:scale-[1.02]"
                    style={
                      active
                        ? { background: "#f5ab20", color: "#0d1f2d" }
                        : {
                            background: "#132333",
                            color: "#8ca5bc",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }
                    }
                  >
                    <Icon size={12} />
                    {item}
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[10px]"
                      style={
                        active
                          ? { background: "rgba(0,0,0,0.14)" }
                          : { background: "rgba(245,171,32,0.12)", color: "#f5ab20" }
                      }
                    >
                      {counts[item]}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              {/* Layout Toggle */}
              <button
                type="button"
                onClick={toggleLayout}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all hover:scale-[1.02]"
                style={{
                  background: "#132333",
                  color: "#cde0f0",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {layout === "horizontal" ? (
                  <>
                    <LayoutGrid size={14} />
                    Grid View
                  </>
                ) : (
                  <>
                    <List size={14} />
                    Horizontal View
                  </>
                )}
              </button>

              <p className="flex items-center gap-1.5 text-xs text-[#8ca5bc]">
                {locationStatus === "detecting" && (
                  <span
                    className="inline-block h-2 w-2 animate-pulse rounded-full"
                    style={{ background: "#f5ab20" }}
                  />
                )}
                {locationStatus === "granted" && !locationText && (
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ background: "#10b981" }}
                  />
                )}
                {locationHint}
              </p>
            </div>
          </div>

          {/* Listings */}
          {loading ? (
            <div className={layout === "horizontal" ? "flex gap-4 overflow-x-auto pb-4" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : paginatedItems.length > 0 ? (
            <>
              <div className="relative">
                {/* Horizontal Scroll Container with Arrows */}
                {layout === "horizontal" && (
                  <>
                    {/* Left Scroll Arrow */}
                    {showLeftArrow && (
                      <button
                        type="button"
                        onClick={() => scrollHorizontal("left")}
                        className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 transition-all hover:scale-110"
                        style={{
                          background: "rgba(19,35,51,0.9)",
                          color: "#f5ab20",
                          border: "1px solid rgba(245,171,32,0.3)",
                          backdropFilter: "blur(8px)",
                        }}
                        aria-label="Scroll left"
                      >
                        <ChevronLeft size={20} />
                      </button>
                    )}

                    {/* Right Scroll Arrow */}
                    {showRightArrow && (
                      <button
                        type="button"
                        onClick={() => scrollHorizontal("right")}
                        className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full p-2 transition-all hover:scale-110"
                        style={{
                          background: "rgba(19,35,51,0.9)",
                          color: "#f5ab20",
                          border: "1px solid rgba(245,171,32,0.3)",
                          backdropFilter: "blur(8px)",
                        }}
                        aria-label="Scroll right"
                      >
                        <ChevronRight size={20} />
                      </button>
                    )}

                    {/* Scroll Indicator */}
                    <div className="mb-3 flex items-center justify-center gap-2 text-xs text-[#8ca5bc]">
                      <ChevronLeft size={14} />
                      <span>Swipe or use arrows to browse</span>
                      <ChevronRight size={14} />
                    </div>
                  </>
                )}

                <div
                  ref={scrollContainerRef}
                  className={
                    layout === "horizontal"
                      ? "flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[#f5ab20] scrollbar-track-transparent"
                      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  }
                  style={{
                    scrollBehavior: "smooth",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {paginatedItems.map((item) => (
                    <FeaturedCard
                      key={item.id}
                      item={item}
                      onOpen={() => setSelectedListing(item)}
                      onRequireAuth={() => onOpenAuthModal("signin")}
                      isAuthenticated={isAuthenticated}
                      layout={layout}
                    />
                  ))}
                </div>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-6 flex flex-col items-center gap-3">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5"
                      style={{
                        background: currentPage === 1 ? "transparent" : "#1a2e42",
                        color: currentPage === 1 ? "#8ca5bc" : "#f5ab20",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <ChevronLeft size={16} />
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => handlePageChange(page)}
                          className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold transition-all hover:scale-105"
                          style={{
                            background: currentPage === page ? "#f5ab20" : "transparent",
                            color: currentPage === page ? "#0d1f2d" : "#cde0f0",
                            border: currentPage === page ? "none" : "1px solid rgba(255,255,255,0.08)",
                          }}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/5"
                      style={{
                        background: currentPage === totalPages ? "transparent" : "#1a2e42",
                        color: currentPage === totalPages ? "#8ca5bc" : "#f5ab20",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      Next
                      <ChevronRight size={16} />
                    </button>
                  </div>

                  {/* Results count */}
                  <div className="text-center text-xs text-[#8ca5bc]">
                    Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                    {Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} results
                  </div>
                </div>
              )}
            </>
          ) : (
            <div
              className="flex flex-col items-center justify-center rounded-lg p-12 text-center"
              style={{
                background: "#132333",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <Package size={48} className="text-[#8ca5bc]" />
              <h3 className="mt-4 text-lg font-bold text-white">No services found</h3>
              <p className="mt-2 text-sm text-[#8ca5bc]">
                Try adjusting your search or location filters
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setLocationText("");
                  requestLocation();
                }}
                className="mt-4 rounded-lg px-6 py-2 text-sm font-bold transition-all hover:scale-105"
                style={{ background: "#f5ab20", color: "#0d1f2d" }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Storefront Modal */}
      {selectedListing && (
        <ProviderStorefrontModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onRequireAuth={() => onOpenAuthModal("signin")}
          isAuthenticated={isAuthenticated}
        />
      )}

      {/* Scroll to Top */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 rounded-full p-3 shadow-lg transition-all hover:scale-110"
          style={{ background: "#f5ab20", color: "#0d1f2d" }}
          aria-label="Scroll to top"
        >
          <ChevronUp size={20} />
        </button>
      )}
    </>
  );
}