import { PageShell } from '../components/PageShell';
import { Star } from 'lucide-react';

const REVIEWS_DATA = [
  { id: 1, from: "Mphatso B.",  rating: 5, text: "Excellent quality parts, very fast response. Will definitely buy again!", date: "Apr 28", item: "Toyota Hiace Mirror" },
  { id: 2, from: "Grace P.",   rating: 4, text: "Good service overall. Part was exactly as described.",                   date: "Apr 22", item: "Oil Filter" },
  { id: 3, from: "James C.",   rating: 5, text: "Delivered same day! Amazing. Highly recommend this seller.",             date: "Apr 15", item: "Brake Pads" },
  { id: 4, from: "Chisomo M.", rating: 3, text: "Part was okay but packaging could be better.",                          date: "Apr 10", item: "Clutch Plate" },
];

interface ReviewsPageProps {
  color: string;
}

export function ReviewsPage({ color }: ReviewsPageProps) {
  const avg = (REVIEWS_DATA.reduce((s, r) => s + r.rating, 0) / REVIEWS_DATA.length).toFixed(1);

  return (
    <PageShell title="Reviews" subtitle="What customers are saying" color={color}>
      <div className="rounded-xl p-5 mb-4 flex flex-col sm:flex-row sm:items-center gap-5" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="text-center">
          <div className="text-4xl font-black" style={{ color }}>{avg}</div>
          <div className="flex gap-0.5 justify-center mt-1">
            {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= Math.round(Number(avg)) ? color : "transparent"} style={{ color }} />)}
          </div>
          <div className="text-[11px] mt-1" style={{ color: "#8ca5bc" }}>{REVIEWS_DATA.length} reviews</div>
        </div>
        <div className="flex-1 w-full">
          {[5,4,3,2,1].map(stars => {
            const count = REVIEWS_DATA.filter(r => r.rating === stars).length;
            const pct = (count / REVIEWS_DATA.length) * 100;
            return (
              <div key={stars} className="flex items-center gap-2 mb-1">
                <span className="text-[10px] w-3" style={{ color: "#8ca5bc" }}>{stars}</span>
                <Star size={9} style={{ color }} />
                <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.07)" }}>
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                </div>
                <span className="text-[10px] w-3" style={{ color: "#8ca5bc" }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {REVIEWS_DATA.map(rev => (
          <div key={rev.id} className="rounded-xl p-4" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black"
                  style={{ background: `${color}20`, color }}>
                  {rev.from[0]}
                </div>
                <span className="text-sm font-semibold" style={{ color: "var(--text-primary, white)" }}>{rev.from}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(s => <Star key={s} size={10} fill={s <= rev.rating ? color : "transparent"} style={{ color }} />)}
                </div>
                <span className="text-[10px]" style={{ color: "#8ca5bc" }}>{rev.date}</span>
              </div>
            </div>
            <div className="text-[11px] mb-1" style={{ color }}>{rev.item}</div>
            <p className="text-sm" style={{ color: "#cde0f0" }}>{rev.text}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
