import { useState } from 'react';
import { PageShell } from '../components/PageShell';
import { Plus, Edit2, Trash2, Star, Clock, Tag, Camera } from 'lucide-react';

const CATEGORIES = ['All', 'Hair', 'Barbering', 'Nails', 'Makeup', 'Lashes', 'Beauty'];

const INITIAL_SERVICES = [
  {
    id: 1, title: "Knotless Braids", category: "Hair", price: 15000, duration: "4-5 hrs", rating: 4.9, reviews: 24,
    image: "https://images.unsplash.com/photo-1749805045793-80b5d32016ba?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2, title: "Barber Cut & Line-up", category: "Barbering", price: 7000, duration: "45 min", rating: 4.8, reviews: 36,
    image: "https://images.unsplash.com/photo-1768363446104-b8a0c1716600?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3, title: "Acrylic Nail Set", category: "Nails", price: 8000, duration: "2 hrs", rating: 4.8, reviews: 18,
    image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4, title: "Bridal Makeup", category: "Makeup", price: 25000, duration: "2-3 hrs", rating: 5.0, reviews: 11,
    image: "https://images.unsplash.com/photo-1765852549271-64171b460d4b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5, title: "Scissor Cut & Styling", category: "Barbering", price: 9000, duration: "1 hr", rating: 4.7, reviews: 21,
    image: "https://images.unsplash.com/photo-1761931403671-d020a14928d9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6, title: "Manicure & Nail Care", category: "Beauty", price: 6500, duration: "1 hr", rating: 4.9, reviews: 42,
    image: "https://images.unsplash.com/photo-1648241815778-fdc8daf0d6ef?auto=format&fit=crop&w=900&q=80",
  },
];

const DEFAULT_IMAGE_BY_CATEGORY: Record<string, string> = {
  Hair: "https://images.unsplash.com/photo-1749805045793-80b5d32016ba?auto=format&fit=crop&w=900&q=80",
  Barbering: "https://images.unsplash.com/photo-1768363446104-b8a0c1716600?auto=format&fit=crop&w=900&q=80",
  Nails: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=900&q=80",
  Makeup: "https://images.unsplash.com/photo-1765852549271-64171b460d4b?auto=format&fit=crop&w=900&q=80",
  Lashes: "https://images.unsplash.com/photo-1758738880475-dac2ab1c92d4?auto=format&fit=crop&w=900&q=80",
  Beauty: "https://images.unsplash.com/photo-1648241815778-fdc8daf0d6ef?auto=format&fit=crop&w=900&q=80",
};

interface PortfolioPageProps {
  color: string;
  initialShowAdd?: boolean;
}

export function PortfolioPage({ color, initialShowAdd = false }: PortfolioPageProps) {
  const [activeCat, setActiveCat] = useState('All');
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [showAdd, setShowAdd] = useState(initialShowAdd);
  const [form, setForm] = useState({ title: '', category: 'Hair', price: '', duration: '', image: '' });

  const filtered = services.filter(s => activeCat === 'All' || s.category === activeCat);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAdd = () => {
    if (!form.title || !form.price) return;
    setServices(s => [...s, {
      id: Date.now(), title: form.title, category: form.category,
      price: Number(form.price), duration: form.duration || '1 hr',
      rating: 0, reviews: 0, image: form.image || DEFAULT_IMAGE_BY_CATEGORY[form.category],
    }]);
    setForm({ title: '', category: 'Hair', price: '', duration: '', image: '' });
    setShowAdd(false);
  };

  const fieldStyle = {
    width: '100%', background: 'var(--bg-elevated, #1a2e42)',
    border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px',
    color: 'var(--text-primary, white)', padding: '8px 12px', fontSize: '13px', outline: 'none',
  } as React.CSSProperties;

  return (
    <PageShell title="My Services" subtitle="Manage salon, barber, grooming, and beauty services" color={color}>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Services', value: services.length },
          { label: 'Total Reviews', value: services.reduce((a, s) => a + s.reviews, 0) },
          { label: 'Avg Rating', value: (services.filter(s=>s.rating>0).reduce((a,s)=>a+s.rating,0)/services.filter(s=>s.rating>0).length||0).toFixed(1) + ' ★' },
        ].map(stat => (
          <div key={stat.label} className="rounded-xl p-3 text-center"
            style={{ background: 'var(--bg-secondary, #132333)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="text-xl font-black" style={{ color }}>{stat.value}</div>
            <div className="text-[10px] mt-0.5" style={{ color: '#8ca5bc' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Category filter + Add */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setActiveCat(cat)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={activeCat === cat
                ? { background: color, color: '#0d1f2d' }
                : { background: 'var(--bg-secondary, #132333)', color: '#8ca5bc', border: '1px solid rgba(255,255,255,0.07)' }}>
              {cat}
            </button>
          ))}
        </div>
        <button onClick={() => setShowAdd(v => !v)}
          className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all"
          style={{ background: showAdd ? color : `${color}18`, color: showAdd ? '#0d1f2d' : color, border: `1px solid ${color}30` }}>
          <Plus size={12} /> {showAdd ? 'Cancel' : 'Add Service'}
        </button>
      </div>

      {/* Add service form */}
      {showAdd && (
        <div className="rounded-2xl p-4 mb-5" style={{ background: 'var(--bg-secondary, #132333)', border: `1px solid ${color}30` }}>
          <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color }}>New Service</h4>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="col-span-2">
              <label className="block text-[10px] font-semibold mb-1 uppercase" style={{ color: '#8ca5bc' }}>Service Name</label>
              <input value={form.title} onChange={set('title')} placeholder="e.g. Fade Cut, Ghana Weave, Bridal Makeup" style={fieldStyle} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold mb-1 uppercase" style={{ color: '#8ca5bc' }}>Category</label>
              <select value={form.category} onChange={set('category')} style={fieldStyle}>
                {['Hair','Barbering','Nails','Makeup','Lashes','Beauty'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold mb-1 uppercase" style={{ color: '#8ca5bc' }}>Image URL</label>
              <input value={form.image} onChange={set('image')} placeholder="Optional - paste a photo URL" style={fieldStyle} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold mb-1 uppercase" style={{ color: '#8ca5bc' }}>Price (MWK)</label>
              <input type="number" value={form.price} onChange={set('price')} placeholder="0" style={fieldStyle} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold mb-1 uppercase" style={{ color: '#8ca5bc' }}>Duration</label>
              <input value={form.duration} onChange={set('duration')} placeholder="e.g. 2 hrs" style={fieldStyle} />
            </div>
          </div>
          <button onClick={handleAdd}
            className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110"
            style={{ background: color, color: '#0d1f2d' }}>
            Add Service
          </button>
        </div>
      )}

      {/* Service grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(item => (
          <div key={item.id} className="rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 group"
            style={{ background: 'var(--bg-secondary, #132333)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {/* Visual */}
            <div className="h-36 relative overflow-hidden" style={{ background: `${color}10` }}>
              <img
                src={item.image}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.4)', color: '#fff' }}>
                  <Edit2 size={10} />
                </button>
                <button onClick={() => setServices(s => s.filter(x => x.id !== item.id))}
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.6)', color: '#fff' }}>
                  <Trash2 size={10} />
                </button>
              </div>
              <span className="absolute bottom-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
                style={{ background: 'rgba(0,0,0,0.58)', color: '#fff', backdropFilter: 'blur(8px)' }}>
                <Camera size={10} /> Service photo
              </span>
            </div>
            {/* Info */}
            <div className="p-3">
              <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary, white)' }}>{item.title}</div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>
                  <Tag size={9} className="inline mr-1" />
                  {item.category}
                </span>
                {item.rating > 0 && (
                  <span className="flex items-center gap-1 text-[10px]" style={{ color: '#f5ab20' }}>
                    <Star size={9} fill="#f5ab20" /> {item.rating} ({item.reviews})
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px]" style={{ color: '#8ca5bc' }}>
                  <Clock size={10} /> {item.duration}
                </span>
                <span className="text-sm font-black" style={{ color }}>
                  K{item.price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
