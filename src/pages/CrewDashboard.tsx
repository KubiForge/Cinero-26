import React, { useEffect, useMemo, useState } from 'react';
import {
  FiChevronRight,
  FiFolder,
  FiLogOut,
  FiShield,
  FiUsers,
} from 'react-icons/fi';
import BrandLogo from '../components/BrandLogo';
import './CrewDashboard.css';

type DashboardView = 'all' | 'school' | 'university';

type CrewDashboardProps = {
  onLogout: () => void;
  onOpenRegistrations?: (category: 'school' | 'university') => void;
  view?: DashboardView;
};

type DashboardConfig = {
  title: string;
  subtitle: string;
};

type RegistrationRecord = Record<string, unknown>;

type SummaryState = {
  records: RegistrationRecord[];
  total: number;
  school: number;
  university: number;
};

const normalizeCategory = (value?: string): 'School' | 'University' | 'Other' => {
  const category = String(value ?? '').trim().toLowerCase();

  if (category.includes('school')) return 'School';
  if (category.includes('university')) return 'University';

  return 'Other';
};

const getRecordValue = (record: RegistrationRecord, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if ((typeof value === 'string' || typeof value === 'number') && String(value).trim()) {
      return String(value).trim();
    }
  }

  return '';
};

const buildDashboardConfig = (view: DashboardView): DashboardConfig => {
  return {
    title: view === 'all' ? 'Festival operations dashboard' : view === 'school' ? 'School category dashboard' : 'University category dashboard',
    subtitle:
      view === 'all'
        ? 'Live overview of all registrations coming from the official Google Sheet.'
        : view === 'school'
          ? 'Live snapshot of all school registration records in the source sheet.'
          : 'Live snapshot of all university registration records in the source sheet.',
  };
};

export const CrewDashboardPage: React.FC<CrewDashboardProps> = ({ onLogout, onOpenRegistrations, view = 'all' }) => {
  const [summary, setSummary] = useState<SummaryState>({ records: [], total: 0, school: 0, university: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      setIsLoading(true);

      try {
        const response = await fetch(`/api/crew-registrations?category=${encodeURIComponent(view)}`, {
          credentials: 'include',
          headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
          throw new Error('Unable to load dashboard data');
        }

        const payload = await response.json();
        const records = Array.isArray(payload?.records) ? payload.records : [];
        const school = records.filter((record: RegistrationRecord) => {
          const category = normalizeCategory(getRecordValue(record, ['Category', 'category', 'Registration Type', 'registrationType']));
          return category === 'School';
        }).length;

        const university = records.filter((record: RegistrationRecord) => {
          const category = normalizeCategory(getRecordValue(record, ['Category', 'category', 'Registration Type', 'registrationType']));
          return category === 'University';
        }).length;

        if (isMounted) {
          setSummary({
            records,
            total: records.length,
            school,
            university,
          });
        }
      } catch (error) {
        console.warn('[crew-dashboard] failed to load live registration summary', error);
        if (isMounted) {
          setSummary({ records: [], total: 0, school: 0, university: 0 });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, [view]);

  const config = useMemo(() => buildDashboardConfig(view), [view]);
  const totalParticipants = summary.records.reduce((total, record) => {
    const rawTeamSize = getRecordValue(record, ['Team Size', 'teamSize']);
    const teamSize = /^\d+$/.test(rawTeamSize) ? Number(rawTeamSize) : 0;
    return total + (Number.isFinite(teamSize) && teamSize > 0 ? teamSize : 0);
  }, 0);
  const stats = [
    { label: 'Total teams', value: summary.total, icon: <FiUsers />, accent: 'gold' },
    { label: 'School entries', value: summary.school, icon: <FiFolder />, accent: 'red' },
    { label: 'University entries', value: summary.university, icon: <FiShield />, accent: 'green' },
    { label: 'Total participants', value: totalParticipants, icon: <FiUsers />, accent: 'gold' },
  ];

  return (
    <div className="crew-dashboard-page">
      <header className="crew-dashboard__header">
        <div className="crew-dashboard__brand-block">
          <div className="crew-dashboard__brand-logo-wrap">
            <BrandLogo
              variant="withoutCaption"
              sizes="(max-width: 768px) 130px, 220px"
              alt="CINERO'26"
              className="crew-dashboard__brand-logo"
            />
          </div>
          <div className="crew-dashboard__brand-copy">
            <span className="crew-dashboard__eyebrow">J'PURA VOICE</span>
            <strong>CINERO'26</strong>
          </div>
        </div>

        <div className="crew-dashboard__portal-label" aria-label="HR Crew Portal">
          <span />
          <div>
            <strong>CREW PORTAL</strong>
            <small>Registration management</small>
          </div>
          <span />
        </div>

        <div className="crew-dashboard__actions">
          <div className="crew-dashboard__user-pill">
            <span className="crew-dashboard__user-dot" aria-hidden="true" />
            <span>HR Committee</span>
          </div>
          <button type="button" className="crew-dashboard__logout" onClick={onLogout}>
            <FiLogOut />
            Logout
          </button>
        </div>
      </header>

      <main className="crew-dashboard__main">
        <section className="crew-dashboard__hero">
          <div>
            <span className="crew-dashboard__panel-kicker">HR command center</span>
            <h1>{config.title}</h1>
            <p>{config.subtitle}</p>
          </div>
        </section>

        <section className="crew-dashboard__stats-grid" aria-label="Registration overview" aria-live="polite">
          {stats.map((stat) => (
            <article key={stat.label} className="crew-dashboard__stat-card">
              <span className="crew-dashboard__stat-icon" data-accent={stat.accent} aria-hidden="true">
                {stat.icon}
              </span>
              <span className="crew-dashboard__stat-copy">
                <span>{stat.label}</span>
                <strong>{isLoading ? '—' : stat.value.toLocaleString()}</strong>
                <small>{isLoading ? 'Syncing records' : 'Live from Google Sheets'}</small>
              </span>
            </article>
          ))}
        </section>

        <section className="crew-dashboard__registration-cards" aria-label="Registration categories">
          <button
            type="button"
            className="crew-dashboard__registration-card crew-dashboard__registration-card--school"
            onClick={() => onOpenRegistrations?.('school')}
          >
            <span className="crew-dashboard__registration-card-icon" aria-hidden="true"><FiFolder /></span>
            <span className="crew-dashboard__registration-card-copy">
              <span className="crew-dashboard__registration-card-kicker">INTER-SCHOOL CATEGORY</span>
              <strong>School registrations</strong>
              <span className="crew-dashboard__registration-card-count">
                {isLoading ? 'Loading…' : `${summary.school} ${summary.school === 1 ? 'team' : 'teams'} registered`}
              </span>
            </span>
            <span className="crew-dashboard__registration-card-action">
              View registrations <FiChevronRight aria-hidden="true" />
            </span>
          </button>
          <button
            type="button"
            className="crew-dashboard__registration-card crew-dashboard__registration-card--university"
            onClick={() => onOpenRegistrations?.('university')}
          >
            <span className="crew-dashboard__registration-card-icon" aria-hidden="true"><FiShield /></span>
            <span className="crew-dashboard__registration-card-copy">
              <span className="crew-dashboard__registration-card-kicker">INTER-UNIVERSITY CATEGORY</span>
              <strong>University registrations</strong>
              <span className="crew-dashboard__registration-card-count">
                {isLoading ? 'Loading…' : `${summary.university} ${summary.university === 1 ? 'team' : 'teams'} registered`}
              </span>
            </span>
            <span className="crew-dashboard__registration-card-action">
              View registrations <FiChevronRight aria-hidden="true" />
            </span>
          </button>
        </section>

      </main>
    </div>
  );
};

export default CrewDashboardPage;
