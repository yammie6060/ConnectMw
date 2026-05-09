import { useState } from 'react';
import { PageShell } from '../components/PageShell';
import {
  Heart, Search, SlidersHorizontal, MapPin, Bed, Eye,
  Scissors, Wrench, Home, Star, Clock, Package,
} from 'lucide-react';

// ─── Data ────────────────────────────────────────────────────────────────────

type Category = 'All' | 'Rentals' | 'Beauty' | 'Spare Parts';

interface Listing {
  id: number;
  category: 'Rentals' | 'Beauty' | 'Spare Parts';
  title: string;
  subtitle: string;
  location: string;
  price: string;
  priceUnit: string;
  status: 'Available' | 'Occupied' | 'In Stock' | 'Low Stock' | 'Out of Stock';
  meta: string;          // beds / duration / stock qty
  rating?: number;
  reviews?: number;
  views: number;
  saved: boolean;
  image: string;         // Unsplash URL
}

const LISTINGS: Listing[] = [
  // ── Rentals ──
  {
    id: 1, category: 'Rentals',
    title: '2-Bed Flat, Area 47', subtitle: 'Apartment',
    location: 'Area 47, Lilongwe', price: 'K95,000', priceUnit: '/mo',
    status: 'Available', meta: '2 beds', views: 34, saved: true,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80',
  },
  {
    id: 2, category: 'Rentals',
    title: 'Studio Apartment, Area 3', subtitle: 'Studio',
    location: 'Area 3, Lilongwe', price: 'K65,000', priceUnit: '/mo',
    status: 'Available', meta: '1 bed', views: 19, saved: true,
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80',
  },
  {
    id: 3, category: 'Rentals',
    title: '3-Bed House, Area 47', subtitle: 'House',
    location: 'Area 47, Lilongwe', price: 'K180,000', priceUnit: '/mo',
    status: 'Occupied', meta: '3 beds', views: 51, saved: false,
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80',
  },
  {
    id: 4, category: 'Rentals',
    title: '4-Bed House, Namiwawa', subtitle: 'House',
    location: 'Namiwawa, Blantyre', price: 'K250,000', priceUnit: '/mo',
    status: 'Available', meta: '4 beds', views: 67, saved: false,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
  },
  {
    id: 5, category: 'Rentals',
    title: '1-Bed Flat, Limbe', subtitle: 'Apartment',
    location: 'Limbe, Blantyre', price: 'K55,000', priceUnit: '/mo',
    status: 'Available', meta: '1 bed', views: 22, saved: false,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
  },

  // ── Beauty ──
  {
    id: 6, category: 'Beauty',
    title: 'Knotless Braids', subtitle: 'Glamour Cuts Salon',
    location: 'Area 43, Lilongwe', price: 'K15,000', priceUnit: '/session',
    status: 'Available', meta: '4–5 hrs', rating: 4.9, reviews: 24, views: 88, saved: false,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
  },
  {
    id: 7, category: 'Beauty',
    title: 'Acrylic Nail Set', subtitle: 'NailBar Blantyre',
    location: 'Ginnery Corner, Blantyre', price: 'K8,000', priceUnit: '/session',
    status: 'Available', meta: '2 hrs', rating: 4.8, reviews: 18, views: 54, saved: true,
    image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80',
  },
  {
    id: 8, category: 'Beauty',
    title: 'Bridal Makeup', subtitle: 'Faces by Chioma',
    location: 'Limbe, Blantyre', price: 'K25,000', priceUnit: '/session',
    status: 'Available', meta: '2–3 hrs', rating: 5.0, reviews: 11, views: 103, saved: false,
    image: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80',
  },
  {
    id: 9, category: 'Beauty',
    title: 'Lash Extensions', subtitle: 'Lash Lab MW',
    location: 'City Centre, Lilongwe', price: 'K12,000', priceUnit: '/session',
    status: 'Available', meta: '1.5 hrs', rating: 4.7, reviews: 31, views: 77, saved: false,
    image: 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=600&q=80',
  },
  {
    id: 10, category: 'Beauty',
    title: 'Hair Colour & Highlights', subtitle: 'Colour Studio',
    location: 'Area 9, Lilongwe', price: 'K20,000', priceUnit: '/session',
    status: 'Available', meta: '3 hrs', rating: 4.6, reviews: 9, views: 43, saved: true,
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=600&q=80',
  },

  // ── Spare Parts ──
  {
    id: 11, category: 'Spare Parts',
    title: 'Toyota Hiace Side Mirror (R)', subtitle: 'AutoParts MW',
    location: 'Lilongwe', price: 'K8,500', priceUnit: '',
    status: 'In Stock', meta: '4 in stock', views: 34, saved: false,
    image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&q=80',
  },
  {
    id: 12, category: 'Spare Parts',
    title: 'Nissan Wingroad Brake Pads', subtitle: 'Sparks & Gears',
    location: 'Blantyre', price: 'K6,200', priceUnit: '',
    status: 'Low Stock', meta: '1 in stock', views: 21, saved: false,
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80',
  },
  {
    id: 13, category: 'Spare Parts',
    title: 'Toyota Vitz Headlight Assembly', subtitle: 'City Auto Spares',
    location: 'Zomba', price: 'K22,000', priceUnit: '',
    status: 'In Stock', meta: '2 in stock', views: 67, saved: true,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  },
  {
    id: 14, category: 'Spare Parts',
    title: 'Mazda Familia Oil Filter', subtitle: 'BM Auto',
    location: 'Mzuzu', price: 'K1,800', priceUnit: '',
    status: 'Out of Stock', meta: '0 in stock', views: 15, saved: false,
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80',
  },
  {
    id: 15, category: 'Spare Parts',
    title: 'Suzuki Alto Clutch Plate', subtitle: 'TopGear Spares',
    location: 'Lilongwe', price: 'K9,400', priceUnit: '',
    status: 'In Stock', meta: '3 in stock', views: 29, saved: false,
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  'Available':    { bg: '#10b98118', text: '#10b981' },
  'In Stock':     { bg: '#10b98118', text: '#10b981' },
  'Low Stock':    { bg: '#f5ab2018', text: '#f5ab20' },
  'Occupied':     { bg: '#8ca5bc18', text: '#8ca5bc' },
  'Out of Stock': { bg: '#ef444418', text: '#ef4444' },
};

const CATEGORY_ICON: Record<string, React.ElementType> = {
  Rentals: Home,
  Beauty: Scissors,
  'Spare Parts': Wrench,
};

function MetaIcon({ category }: { category: string }) {
  if (category === 'Rentals')     return <Bed size={10} />;
  if (category === 'Beauty')      return <Clock size={10} />;
  return <Package size={10} />;
}

// ─── Image card ───────────────────────────────────────────────────────────────

function ListingCard({ listing, color, isSaved, onToggleSave }: {
  listing: Listing;
  color: string;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const statusStyle = STATUS_STYLE[listing.status] ?? STATUS_STYLE['Available'];
  const isUnavailable = ['Occupied', 'Out of Stock'].includes(listing.status);
  const CatIcon = CATEGORY_ICON[listing.category];

  const ctaLabel = listing.category === 'Rentals'
    ? (isUnavailable ? 'Join Waitlist' : 'Enquire Now')
    : listing.category === 'Beauty'
    ? 'Book Now'
    : (isUnavailable ? 'Notify Me' : 'Order Now');

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 flex flex-col"
      style={{
        background: 'var(--bg-secondary, #132333)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden shrink-0" style={{ background: `${color}10` }}>
        {/* Shimmer while loading */}
        {!imgLoaded && (
          <div
            className="absolute inset-0 animate-pulse"
            style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 100%)' }}
          />
        )}
        <img
          src={listing.image}
          alt={listing.title}
          className="w-full h-full object-cover transition-opacity duration-300"
          style={{ opacity: imgLoaded ? 1 : 0 }}
          onLoad={() => setImgLoaded(true)}
        />

        {/* Category pill */}
        <div
          className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', color: '#fff' }}
        >
          <CatIcon size={10} />
          {listing.category}
        </div>

        {/* Save button */}
        <button
          onClick={onToggleSave}
          className="absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
        >
          <Heart
            size={14}
            style={{ color: isSaved ? '#ef4444' : '#fff' }}
            fill={isSaved ? '#ef4444' : 'transparent'}
          />
        </button>

        {/* Status badge */}
        <span
          className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: statusStyle.bg, color: statusStyle.text, backdropFilter: 'blur(4px)' }}
        >
          {listing.status}
        </span>
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <div className="text-sm font-bold leading-snug mb-0.5" style={{ color: 'var(--text-primary, white)' }}>
          {listing.title}
        </div>
        <div className="text-[11px] mb-1" style={{ color: '#8ca5bc' }}>
          {listing.subtitle}
        </div>

        <div className="flex items-center gap-1 text-[11px] mb-2" style={{ color: '#8ca5bc' }}>
          <MapPin size={10} /> {listing.location}
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 text-[11px]" style={{ color: '#8ca5bc' }}>
            <span className="flex items-center gap-1">
              <MetaIcon category={listing.category} /> {listing.meta}
            </span>
            {listing.rating != null && (
              <span className="flex items-center gap-1" style={{ color: '#f5ab20' }}>
                <Star size={9} fill="#f5ab20" /> {listing.rating} ({listing.reviews})
              </span>
            )}
            <span className="flex items-center gap-1">
              <Eye size={9} /> {listing.views}
            </span>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-base font-black" style={{ color }}>
            {listing.price}
            {listing.priceUnit && (
              <span className="text-[10px] font-normal" style={{ color: '#8ca5bc' }}>
                {listing.priceUnit}
              </span>
            )}
          </span>
          <button
            className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all hover:brightness-110"
            style={
              isUnavailable
                ? { background: 'rgba(255,255,255,0.05)', color: '#8ca5bc' }
                : { background: color, color: '#0d1f2d' }
            }
          >
            {ctaLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const CATEGORIES: Category[] = ['All', 'Rentals', 'Beauty', 'Spare Parts'];

interface RentalsPageProps { color: string }

export function RentalsPage({ color }: RentalsPageProps) {
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState<Category>('All');
  const [showSaved, setShowSaved] = useState(false);
  const [saved, setSaved]       = useState<number[]>(
    LISTINGS.filter(l => l.saved).map(l => l.id)
  );

  const toggleSave = (id: number) =>
    setSaved(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const filtered = LISTINGS.filter(l => {
    const matchCat    = category === 'All' || l.category === category;
    const matchSearch = !search ||
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.subtitle.toLowerCase().includes(search.toLowerCase()) ||
      l.location.toLowerCase().includes(search.toLowerCase());
    const matchSaved  = !showSaved || saved.includes(l.id);
    return matchCat && matchSearch && matchSaved;
  });

  // counts per category
  const counts: Record<string, number> = { All: LISTINGS.length };
  LISTINGS.forEach(l => { counts[l.category] = (counts[l.category] ?? 0) + 1; });

  return (
    <PageShell
      title="Browse"
      subtitle="Find rentals, beauty services, and spare parts near you"
      color={color}
    >
      {/* Search + saved toggle */}
      <div className="flex gap-2 mb-4">
        <div
          className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'var(--bg-secondary, #132333)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <Search size={14} style={{ color: '#8ca5bc' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, provider or location…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary, white)' }}
          />
        </div>
        <button
          onClick={() => setShowSaved(v => !v)}
          className="px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold transition-all"
          style={showSaved
            ? { background: '#ef444420', color: '#ef4444', border: '1px solid #ef444440' }
            : { background: 'var(--bg-secondary, #132333)', color: '#8ca5bc', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <Heart size={13} fill={showSaved ? '#ef4444' : 'transparent'} />
          {saved.length}
        </button>
        <button
          className="px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-semibold"
          style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}
        >
          <SlidersHorizontal size={13} /> Filter
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {CATEGORIES.map(cat => {
          const Icon = cat !== 'All' ? CATEGORY_ICON[cat] : null;
          const active = category === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={active
                ? { background: color, color: '#0d1f2d' }
                : { background: 'var(--bg-secondary, #132333)', color: '#8ca5bc', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {Icon && <Icon size={11} />}
              {cat}
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full font-black"
                style={active
                  ? { background: 'rgba(0,0,0,0.2)', color: '#0d1f2d' }
                  : { background: `${color}18`, color }}
              >
                {counts[cat] ?? 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results count */}
      <div className="text-xs mb-4" style={{ color: '#8ca5bc' }}>
        {filtered.length} result{filtered.length !== 1 ? 's' : ''}
        {search && <> for "<span style={{ color }}>{search}</span>"</>}
        {showSaved && ' · saved only'}
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(listing => (
            <ListingCard
              key={listing.id}
              listing={listing}
              color={color}
              isSaved={saved.includes(listing.id)}
              onToggleSave={() => toggleSave(listing.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="text-4xl">🔍</div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary, white)' }}>No results found</p>
          <p className="text-xs" style={{ color: '#8ca5bc' }}>Try a different search or category</p>
          <button
            onClick={() => { setSearch(''); setCategory('All'); setShowSaved(false); }}
            className="mt-2 px-4 py-2 rounded-xl text-xs font-bold"
            style={{ background: color, color: '#0d1f2d' }}
          >
            Clear filters
          </button>
        </div>
      )}
    </PageShell>
  );
}