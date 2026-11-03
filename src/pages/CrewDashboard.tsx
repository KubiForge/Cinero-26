import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CalendarClock,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-react';
import CrewNavbar from '../components/CrewNavbar';
import RegistrationAnalytics from '../components/RegistrationAnalytics';
import RegistrationTable from '../components/RegistrationTable';
import DashboardStatCard from '../components/DashboardStatCard';
import { CrewApiError, fetchCrewDashboard, logout } from '../lib/crewApi';
import type { CrewDashboardData } from '../types/crew';
import './Crew.css';

interface CrewDashboardProps {
  onLogout: () => void;
  onSessionExpired: () => void;
}

function formatUpdatedAt(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not available'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function CrewDashboard({ onLogout, onSessionExpired }: CrewDashboardProps) {
  const [dashboard, setDashboard] = useState<CrewDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [logoutError, setLogoutError] = useState('');

  const loadDashboard = useCallback(async () => {
    try {
      const result = await fetchCrewDashboard();
      setDashboard(result);
      setError('');
    } catch (requestError) {
      if (requestError instanceof CrewApiError && requestError.status === 401) {
        onSessionExpired();
        return;
      }
      setError(requestError instanceof Error
        ? requestError.message
        : 'Unable to load registration data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [onSessionExpired]);

  useEffect(() => {
    let active = true;
    const loadInitialDashboard = async () => {
      try {
        const result = await fetchCrewDashboard();
        if (active) {
          setDashboard(result);
          setError('');
        }
      } catch (requestError) {
        if (!active) return;
        if (requestError instanceof CrewApiError && requestError.status === 401) {
          onSessionExpired();
          return;
        }
        setError(requestError instanceof Error
          ? requestError.message
          : 'Unable to load registration data.');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void loadInitialDashboard();
    return () => {
      active = false;
    };
  }, [onSessionExpired]);

  const handleLogout = async () => {
    setLogoutError('');
    try {
      await logout();
      onLogout();
    } catch (requestError) {
      if (requestError instanceof CrewApiError && requestError.status === 401) {
        onSessionExpired();
        return;
      }
      setLogoutError(requestError instanceof Error
        ? requestError.message
        : 'Unable to sign out. Please try again.');
    }
  };

  return (
    <div className="admin-app">
      <CrewNavbar onLogout={() => void handleLogout()} />
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar__identity">
            <span className="admin-topbar__eyebrow">
              CINERO’26 CREW PORTAL
            </span>
            <h1>Registration overview</h1>
          </div>
          <div className="admin-topbar__actions">
            <span className="admin-secure-indicator"><ShieldCheck size={16} /> SECURE SESSION</span>
            <button
              type="button"
              className="admin-refresh-button"
              onClick={() => {
                setError('');
                setIsRefreshing(true);
                void loadDashboard();
              }}
              disabled={isLoading || isRefreshing}
            >
              <RefreshCw className={isRefreshing ? 'admin-spinner' : ''} size={16} />
              <span>{isRefreshing ? 'Refreshing' : 'Refresh data'}</span>
            </button>
            <button type="button" className="admin-topbar__logout" onClick={() => void handleLogout()}>
              Sign out
            </button>
          </div>
        </header>

        <div className="admin-content">
          {logoutError && <p className="admin-error-banner" role="alert">{logoutError}</p>}
          {error && (
            <div className="admin-error-banner" role="alert">
              <AlertCircle size={18} />
              <span>{error}</span>
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setIsRefreshing(true);
                  void loadDashboard();
                }}
              >
                Retry
              </button>
            </div>
          )}

          <section id="crew-overview" className="admin-overview">
            <div className="admin-welcome">
              <div>
                <span className="admin-eyebrow">FESTIVAL REGISTRATION</span>
                <h2>Registration dashboard</h2>
                <p>Monitor confirmed team registrations from the CINERO’26 registration sheets.</p>
              </div>
              <div className="admin-updated">
                <CalendarClock size={16} />
                <span>
                  Last updated
                  <strong>{dashboard ? formatUpdatedAt(dashboard.lastUpdated) : 'Loading records…'}</strong>
                </span>
              </div>
            </div>

            {isLoading && !dashboard ? (
              <div className="admin-stat-grid" aria-label="Loading registration statistics" aria-busy="true">
                {[0, 1, 2, 3].map((item) => (
                  <div className="admin-stat-skeleton" key={item} />
                ))}
              </div>
            ) : dashboard ? (
              <div className="admin-stat-grid">
                <DashboardStatCard
                  label="Total registered teams"
                  value={dashboard.stats.totalTeams.toLocaleString()}
                  caption="Recorded team entries"
                  icon={<Users size={19} />}
                  accent="gold"
                />
                <DashboardStatCard
                  label="Inter-University"
                  value={dashboard.stats.interUniversity.toLocaleString()}
                  caption="University registrations"
                  icon={<Building2 size={19} />}
                  accent="violet"
                />
                <DashboardStatCard
                  label="Inter-School"
                  value={dashboard.stats.interSchool.toLocaleString()}
                  caption="School registrations"
                  icon={<Building2 size={19} />}
                  accent="blue"
                />
                <DashboardStatCard
                  label="Registered participants"
                  value={dashboard.stats.totalParticipants === null
                    ? '—'
                    : dashboard.stats.totalParticipants.toLocaleString()}
                  caption={dashboard.stats.totalParticipants === null
                    ? 'Unavailable: one or more team sizes are missing or invalid'
                    : 'Calculated from recorded team sizes'}
                  icon={<Users size={19} />}
                  accent="green"
                />
              </div>
            ) : isLoading ? (
              <div className="admin-data-loading">
                <LoaderCircle className="admin-spinner" size={21} />
                <span>Loading registration data…</span>
              </div>
            ) : null}
          </section>

          {dashboard && (
            <>
              <RegistrationAnalytics
                interUniversity={dashboard.stats.interUniversity}
                interSchool={dashboard.stats.interSchool}
                trends={dashboard.trends}
              />
              <section id="crew-registrations" className="admin-panel admin-registrations">
                <div className="admin-panel__heading admin-registrations__heading">
                  <div>
                    <span className="admin-eyebrow">TEAM RECORDS</span>
                    <h2>Registrations</h2>
                    <p>Search and review submitted team entries.</p>
                  </div>
                  <span className="admin-record-count">
                    {dashboard.records.length} {dashboard.records.length === 1 ? 'record' : 'records'}
                  </span>
                </div>
                <RegistrationTable records={dashboard.records} />
              </section>
            </>
          )}

          {isLoading && !dashboard && (
            <div className="admin-data-loading">
              <LoaderCircle className="admin-spinner" size={21} />
              <span>Connecting to the registration spreadsheet…</span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
