import { useEffect, useMemo, useState } from 'react';
import { PageShell } from '../components/PageShell';
import { Star } from 'lucide-react';
import { providerService, ProviderReview } from '@/services/provider.service';
import { SessionUser } from '../types/dashboard';

interface ReviewsPageProps {
  color: string;
  user?: SessionUser;
}

export function ReviewsPage({ color, user }: ReviewsPageProps) {
  const [reviews, setReviews] = useState<ProviderReview[]>([]);
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    providerService.listReviews(user?.activeProviderId ?? undefined)
      .then((res) => {
        if (!ignore) {
          setReviews(res.data?.items ?? []);
          setAverage(res.data?.average ?? 0);
        }
      })
      .catch(() => {
        if (!ignore) setReviews([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => { ignore = true; };
  }, [user?.activeProviderId]);

  const distribution = useMemo(() => [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((review) => review.rating === stars).length,
  })), [reviews]);

  return (
    <PageShell title="Reviews" subtitle="What customers are saying" color={color}>
      <div className="rounded-xl p-5 mb-4 flex flex-col sm:flex-row sm:items-center gap-5" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="text-center">
          <div className="text-4xl font-black" style={{ color }}>{average.toFixed(1)}</div>
          <div className="flex gap-0.5 justify-center mt-1">
            {[1,2,3,4,5].map(s => <Star key={s} size={12} fill={s <= Math.round(average) ? color : "transparent"} style={{ color }} />)}
          </div>
          <div className="text-[11px] mt-1" style={{ color: "#8ca5bc" }}>{reviews.length} reviews</div>
        </div>
        <div className="flex-1 w-full">
          {distribution.map(({ stars, count }) => {
            const pct = reviews.length ? (count / reviews.length) * 100 : 0;
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
        {loading && <div className="text-sm" style={{ color: "#8ca5bc" }}>Loading reviews...</div>}
        {!loading && reviews.length === 0 && (
          <div className="rounded-xl p-4 text-sm" style={{ background: "var(--bg-secondary, #132333)", color: "#8ca5bc", border: "1px solid rgba(255,255,255,0.07)" }}>
            No real customer reviews have been recorded yet.
          </div>
        )}
        {reviews.map((rev) => {
          const reviewer = rev.reviewer?.full_name || rev.reviewer?.email || "Customer";
          return (
            <div key={rev.id} className="rounded-xl p-4" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black" style={{ background: `${color}20`, color }}>{reviewer[0]}</div>
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary, white)" }}>{reviewer}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(s => <Star key={s} size={10} fill={s <= rev.rating ? color : "transparent"} style={{ color }} />)}
                  </div>
                  <span className="text-[10px]" style={{ color: "#8ca5bc" }}>{rev.created_at ? new Date(rev.created_at).toLocaleDateString() : ""}</span>
                </div>
              </div>
              <p className="text-sm" style={{ color: "#cde0f0" }}>{rev.comment || "No comment added."}</p>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
