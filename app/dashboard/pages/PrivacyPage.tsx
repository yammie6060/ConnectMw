import { useState } from 'react';
import { PageShell } from '../components/PageShell';
import { Lock, Smartphone, Download } from 'lucide-react';

interface PrivacyPageProps {
  color: string;
}

export function PrivacyPage({ color }: PrivacyPageProps) {
  const [prefs, setPrefs] = useState({ showPhone: true, showEmail: false, publicProfile: true });
  
  const Toggle = ({ val, onToggle }: { val: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className="w-10 h-5 rounded-full p-0.5 transition-all" style={{ background: val ? color : "rgba(255,255,255,0.1)" }}>
      <div className="w-4 h-4 rounded-full bg-white transition-all" style={{ transform: val ? "translateX(20px)" : "translateX(0)" }} />
    </button>
  );

  return (
    <PageShell title="Privacy & Security" subtitle="Control your data and account security" color={color}>
      <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="px-5 py-3 border-b border-white/5">
          <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#8ca5bc" }}>Visibility</h3>
        </div>
        {[
          { key: "showPhone", label: "Show Phone Number", sub: "Visible on your profile" },
          { key: "showEmail", label: "Show Email Address", sub: "Visible to buyers" },
          { key: "publicProfile", label: "Public Profile", sub: "Anyone can view your listings" },
        ].map(({ key, label, sub }) => (
          <div key={key} className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 last:border-0">
            <div className="flex-1">
              <div className="text-sm font-medium" style={{ color: "var(--text-primary, white)" }}>{label}</div>
              <div className="text-[11px]" style={{ color: "#8ca5bc" }}>{sub}</div>
            </div>
            <Toggle val={(prefs as any)[key]} onToggle={() => setPrefs(p => ({ ...p, [key]: !(p as any)[key] }))} />
          </div>
        ))}
      </div>

      <div className="rounded-xl p-5" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
        <h3 className="text-sm font-bold mb-4" style={{ color: "var(--text-primary, white)" }}>Security</h3>
        {[
          { icon: Lock, label: "Change Password", action: "Update" },
          { icon: Smartphone, label: "Two-Factor Auth", action: "Enable" },
          { icon: Download, label: "Download My Data", action: "Request" },
        ].map(({ icon: Icon, label, action }) => (
          <div key={label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3">
              <Icon size={15} style={{ color }} />
              <span className="text-sm" style={{ color: "var(--text-primary, white)" }}>{label}</span>
            </div>
            <button className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: `${color}18`, color }}>{action}</button>
          </div>
        ))}
      </div>
    </PageShell>
  );
}