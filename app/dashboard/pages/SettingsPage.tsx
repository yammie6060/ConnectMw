import { useState } from 'react';
import { PageShell } from '../components/PageShell';
import { Edit2, ChevronRight, UserCircle, Mail, Phone, Lock, Bell, Smartphone, Shield, Globe, HelpCircle, CreditCard, Sun, Moon, Check } from 'lucide-react';

interface SettingsPageProps {
  color: string;
  user: any;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onNavigate: (id: string) => void;
}

export function SettingsPage({ color, user, isDarkMode, toggleTheme, onNavigate }: SettingsPageProps) {
  const [notif, setNotif] = useState({ email: true, sms: false, push: true });
  const [saved, setSaved] = useState(false);

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--bg-secondary, #132333)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="px-5 py-3 border-b border-white/5">
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: "#8ca5bc" }}>{title}</h3>
      </div>
      <div className="divide-y divide-white/5">{children}</div>
    </div>
  );

  const Row = ({ icon: Icon, label, sub, action, onClick }: { icon: React.ElementType; label: string; sub?: string; action: React.ReactNode; onClick?: () => void }) => {
    const Comp = onClick ? "button" : "div";
    return (
    <Comp onClick={onClick as any} className={`w-full flex items-center gap-3 px-5 py-3.5 text-left ${onClick ? "transition-colors hover:bg-white/5" : ""}`}>
      <Icon size={16} style={{ color, flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium" style={{ color: "var(--text-primary, white)" }}>{label}</div>
        {sub && <div className="text-[11px] mt-0.5" style={{ color: "#8ca5bc" }}>{sub}</div>}
      </div>
      {action}
    </Comp>
  )};

  const Toggle = ({ val, onToggle }: { val: boolean; onToggle: () => void }) => (
    <button onClick={onToggle}
      className="w-10 h-5 rounded-full p-0.5 transition-all flex-shrink-0"
      style={{ background: val ? color : "rgba(255,255,255,0.1)" }}>
      <div className="w-4 h-4 rounded-full bg-white transition-all"
        style={{ transform: val ? "translateX(20px)" : "translateX(0)" }} />
    </button>
  );

  return (
    <PageShell title="Settings" subtitle="Manage your account and preferences" color={color}>
      <Section title="Account">
        <Row icon={UserCircle} label="Edit Profile" sub={`${user.firstName} ${user.lastName}`}
          onClick={() => onNavigate("profile")}
          action={<span className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ background: `${color}18`, color }}><Edit2 size={11} /></span>} />
        <Row icon={Mail} label="Email" sub={user.email}
          action={<ChevronRight size={14} style={{ color: "#8ca5bc" }} />} />
        <Row icon={Phone} label="Phone" sub="+265 999 123 456"
          action={<ChevronRight size={14} style={{ color: "#8ca5bc" }} />} />
        <Row icon={Lock} label="Change Password" sub="Last changed 3 months ago"
          action={<ChevronRight size={14} style={{ color: "#8ca5bc" }} />} />
      </Section>

      <Section title="Notifications">
        <Row icon={Mail} label="Email Notifications" sub="Enquiries, bookings, messages"
          action={<Toggle val={notif.email} onToggle={() => setNotif(n => ({ ...n, email: !n.email }))} />} />
        <Row icon={Smartphone} label="SMS Alerts" sub="Urgent notifications only"
          action={<Toggle val={notif.sms} onToggle={() => setNotif(n => ({ ...n, sms: !n.sms }))} />} />
        <Row icon={Bell} label="Push Notifications" sub="In-app notifications"
          action={<Toggle val={notif.push} onToggle={() => setNotif(n => ({ ...n, push: !n.push }))} />} />
      </Section>

      <Section title="Appearance">
        <Row icon={isDarkMode ? Sun : Moon} label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} sub="Change the app theme"
          action={
            <button onClick={toggleTheme}
              className="w-10 h-5 rounded-full p-0.5 transition-all flex-shrink-0"
              style={{ background: color }}>
              <div className="w-4 h-4 rounded-full bg-white transition-all"
                style={{ transform: isDarkMode ? "translateX(0)" : "translateX(20px)" }} />
            </button>
          } />
      </Section>

      <Section title="Account Management">
        <Row icon={Shield} label="Privacy & Security" onClick={() => onNavigate("privacy")} action={<ChevronRight size={14} style={{ color: "#8ca5bc" }} />} />
        <Row icon={Globe} label="Language" sub="English" action={<ChevronRight size={14} style={{ color: "#8ca5bc" }} />} />
        <Row icon={HelpCircle} label="Help & Support" onClick={() => onNavigate("help")} action={<ChevronRight size={14} style={{ color: "#8ca5bc" }} />} />
        <Row icon={CreditCard} label="Billing & Plans" onClick={() => onNavigate("billing")} action={<ChevronRight size={14} style={{ color: "#8ca5bc" }} />} />
      </Section>

      <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
        className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 mb-4"
        style={{ background: saved ? "#10b981" : color, color: "#0d1f2d" }}>
        {saved ? <><Check size={16} /> Saved!</> : "Save Changes"}
      </button>
    </PageShell>
  );
}
