import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  caption: string;
  icon: ReactNode;
  accent: 'gold' | 'blue' | 'violet' | 'green';
}

export default function DashboardStatCard({ label, value, caption, icon, accent }: StatCardProps) {
  return (
    <article className={`admin-stat-card admin-stat-card--${accent}`}>
      <div className="admin-stat-card__top">
        <span className="admin-stat-card__label">{label}</span>
        <span className="admin-stat-card__icon" aria-hidden="true">{icon}</span>
      </div>
      <strong className="admin-stat-card__value">{value}</strong>
      <span className="admin-stat-card__caption">{caption}</span>
    </article>
  );
}
