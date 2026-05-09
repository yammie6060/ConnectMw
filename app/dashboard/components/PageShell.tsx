import { ReactNode } from 'react';

export function PageShell({ title, subtitle, color, children }: {
  title: string;
  subtitle?: string;
  color: string;
  children: ReactNode;
}) {
  return (
    <div className="py-5 sm:py-6" style={{ animation: "fadeIn 0.2s ease" }}>
      <div className="mb-5 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-black" style={{ color: "var(--text-primary, white)" }}>{title}</h1>
        {subtitle && <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--text-secondary, #8ca5bc)" }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}
