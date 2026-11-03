import { useMemo } from 'react';

interface RegistrationChartsProps {
  interUniversity: number;
  interSchool: number;
  trends: Array<{ date: string; count: number }>;
}

export default function RegistrationAnalytics({
  interUniversity,
  interSchool,
  trends,
}: RegistrationChartsProps) {
  const trendPoints = useMemo(() => {
    const ordered = [...trends].sort((a, b) => a.date.localeCompare(b.date));
    const recent = ordered.slice(-10);
    const maximum = Math.max(1, ...recent.map((item) => item.count));
    return recent.map((item, index) => ({
      ...item,
      x: recent.length === 1 ? 50 : 8 + (index / (recent.length - 1)) * 84,
      y: 88 - (item.count / maximum) * 70,
    }));
  }, [trends]);
  const line = trendPoints.map(({ x, y }) => `${x},${y}`).join(' ');
  const total = interUniversity + interSchool;

  return (
    <section className="admin-charts" aria-label="Registration analytics">
      <article className="admin-panel admin-chart-panel">
        <div className="admin-panel__heading">
          <div>
            <span className="admin-eyebrow">CATEGORY MIX</span>
            <h2>Registration comparison</h2>
          </div>
          <span className="admin-chart-total">{total} teams</span>
        </div>
        <div className="admin-comparison">
          <div className="admin-comparison__row">
            <div className="admin-comparison__label">
              <span className="admin-chart-dot admin-chart-dot--gold" />
              <span>Inter-University</span>
              <strong>{interUniversity}</strong>
            </div>
            <div className="admin-comparison__track" aria-label={`${interUniversity} university teams`}>
              <span
                className="admin-comparison__bar admin-comparison__bar--gold"
                style={{ width: `${total ? (interUniversity / total) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="admin-comparison__row">
            <div className="admin-comparison__label">
              <span className="admin-chart-dot admin-chart-dot--blue" />
              <span>Inter-School</span>
              <strong>{interSchool}</strong>
            </div>
            <div className="admin-comparison__track" aria-label={`${interSchool} school teams`}>
              <span
                className="admin-comparison__bar admin-comparison__bar--blue"
                style={{ width: `${total ? (interSchool / total) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
        <div className="admin-chart-legend">
          <span><i className="admin-chart-dot admin-chart-dot--gold" />University</span>
          <span><i className="admin-chart-dot admin-chart-dot--blue" />School</span>
        </div>
      </article>

      <article className="admin-panel admin-chart-panel">
        <div className="admin-panel__heading">
          <div>
            <span className="admin-eyebrow">ACTIVITY</span>
            <h2>Registration trend</h2>
          </div>
          <span className="admin-chart-total">By submission date</span>
        </div>
        {trendPoints.length > 0 ? (
          <>
            <div className="admin-trend-chart">
              <svg
                viewBox="0 0 100 100"
                role="img"
                aria-label={`Registrations per date: ${trendPoints.map((point) => `${point.date}, ${point.count}`).join('; ')}`}
                preserveAspectRatio="none"
              >
                <line x1="5" y1="88" x2="95" y2="88" className="admin-trend-chart__axis" />
                <line x1="5" y1="53" x2="95" y2="53" className="admin-trend-chart__grid" />
                <line x1="5" y1="18" x2="95" y2="18" className="admin-trend-chart__grid" />
                {trendPoints.length > 1 && <polyline points={line} className="admin-trend-chart__line" />}
                {trendPoints.map((point) => (
                  <circle
                    key={point.date}
                    cx={point.x}
                    cy={point.y}
                    r="1.5"
                    className="admin-trend-chart__point"
                  >
                    <title>{point.date}: {point.count} registrations</title>
                  </circle>
                ))}
              </svg>
            </div>
            <div className="admin-trend-labels">
              <span>{trendPoints[0].date}</span>
              <span>{trendPoints[trendPoints.length - 1].date}</span>
            </div>
          </>
        ) : (
          <div className="admin-chart-empty">
            <span>No usable submission dates are available in the registration records.</span>
          </div>
        )}
      </article>
    </section>
  );
}
