import { useState } from 'react';
import { PageShell } from '../components/PageShell';
import { Plus, Edit2, Trash2, Star, Clock, Tag } from 'lucide-react';

const CATEGORIES = ['All', 'Hair', 'Nails', 'Makeup', 'Lashes', 'Beauty'];

const INITIAL_SERVICES = [
  { id: 1, title: "Knotless Braids",    category: "Hair",   price: 15000, duration: "4–5 hrs", rating: 4.9, reviews: 24, emoji: "🪢" },
  { id: 2, title: "Acrylic Nail Set",   category: "Nails",  price: 8000,  duration: "2 hrs",   rating: 4.8, reviews: 18, emoji: "💅" },
  { id: 3, title: "Bridal Makeup",      category: "Makeup", price: 25000, duration: "2–3 hrs", rating: 5.0, reviews: 11, emoji: "👰" },
  { id: 4, title: "Lash Extensions",    category: "Lashes", price: 12000, duration: "1.5 hrs", rating: 4.7, reviews: 31, emoji: "👁" },
  { id: 5, title: "Hair Colour",        category: "Hair",   price: 20000, duration: "3 hrs",   rating: 4.6, reviews: 9,  emoji: "🎨" },
  { id: 6, title: "Eyebrow Threading",  category: "Beauty", price: 3000,  duration: "20 min",  rating: 4.9, reviews: 42, emoji: "✨" },
];

interface PortfolioPageProps { color: string }

export function PortfolioPage({ color }: PortfolioPageProps) {
  const [activeCat, setActiveCat] = useState('All');
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Hair', price: '', duration: '', emoji: '✂' });

  const filtered = services.filter(s => activeCat === 'All' || s.category === activeCat);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleAdd = () => {
    if (!form.title || !form.price) return;
    setServices(s => [...s, {
      id: Date.now(), title: form.title, category: form.category,
      price: Number(form.price), duration: form.duration || '1 hr',
      rating: 0, reviews: 0, emoji: form.emoji,
    }]);
    setForm({ title: '', category: 'Hair', price: '', duration: '', emoji: '✂' });
    setShowAdd(false);
  };

  const fieldStyle = {
    width: '100%', background: 'var(--bg-elevated, #1a2e42)',
    border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px',
    color: 'var(--text-primary, white)', padding: '8px 12px', fontSize: '13px', outline: 'none',
  } as React.CSSProperties;

  return (
    <PageShell title="My Portfolio" subtitle="Showcase your services and attract more clients" color={color}>
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
              <input value={form.title} onChange={set('title')} placeholder="e.g. Ghana Weave" style={fieldStyle} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold mb-1 uppercase" style={{ color: '#8ca5bc' }}>Category</label>
              <select value={form.category} onChange={set('category')} style={fieldStyle}>
                {['Hair','Nails','Makeup','Lashes','Beauty'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-semibold mb-1 uppercase" style={{ color: '#8ca5bc' }}>Emoji Icon</label>
              <input value={form.emoji} onChange={set('emoji')} placeholder="✂" style={{ ...fieldStyle, textAlign: 'center', fontSize: '20px' }} />
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
            Add to Portfolio
          </button>
        </div>
      )}

      {/* Service grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(item => (
          <div key={item.id} className="rounded-2xl overflow-hidden transition-all hover:-translate-y-0.5 group"
            style={{ background: 'var(--bg-secondary, #132333)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {/* Visual */}
            <div className="h-24 flex items-center justify-center relative" style={{ background: `${color}10` }}>
              <span className="text-5xl">{item.emoji}</span>
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
            </div>
            {/* Info */}
            <div className="p-3">
              <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary, white)' }}>{item.title}</div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>
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