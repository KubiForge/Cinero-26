import React from 'react';
import './CrewDashboard.css';
import BrandLogo from '../components/BrandLogo';

interface CrewDashboardProps {
  onLogout: () => void;
}

export const CrewDashboardPage: React.FC<CrewDashboardProps> = ({ onLogout }) => {
  return (
    <div className="crew-dash">
      {/* Header */}
      <header className="crew-dash__header">
        <BrandLogo
          variant="withoutCaption"
          sizes="100px"
          alt="CINERO'26"
          className="crew-dash__logo"
          decoding="async"
        />
        <div className="crew-dash__header-center">
          <span className="crew-dash__header-title">Crew Portal</span>
        </div>
        <button
          type="button"
          className="crew-dash__logout"
          onClick={onLogout}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Logout</span>
        </button>
      </header>

      {/* Main placeholder content */}
      <main className="crew-dash__main">
        <div className="crew-dash__placeholder">
          {/* Clapperboard SVG */}
          <div className="crew-dash__icon-wrap" aria-hidden="true">
            <svg className="crew-dash__clapper" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="8" y="28" width="64" height="44" rx="5" fill="#1a1010" stroke="rgba(213,164,62,0.5)" strokeWidth="2"/>
              <rect x="8" y="14" width="64" height="16" rx="4" fill="#c5292a" opacity="0.85"/>
              <rect x="22" y="14" width="8" height="16" fill="#1a1010" opacity="0.7"/>
              <rect x="40" y="14" width="8" height="16" fill="#1a1010" opacity="0.7"/>
              <rect x="58" y="14" width="8" height="16" fill="#1a1010" opacity="0.7"/>
              <line x1="8" y1="30" x2="72" y2="30" stroke="rgba(213,164,62,0.4)" strokeWidth="1.5"/>
              <path d="M30 42 L30 60 L50 51 Z" fill="rgba(213,164,62,0.7)"/>
            </svg>
          </div>

          <div className="crew-dash__badge">Under Development</div>
          <h1 className="crew-dash__title">Crew Dashboard</h1>
          <p className="crew-dash__subtitle">
            The CINERO'26 Crew Dashboard is currently being developed.
          </p>
          <p className="crew-dash__note">
            This portal will give the organizing crew access to registration submissions, team management, film review workflows, and event coordination tools.
          </p>

          <div className="crew-dash__divider" aria-hidden="true">
            <span className="crew-dash__divider-line" />
            <span className="crew-dash__divider-diamond">◆</span>
            <span className="crew-dash__divider-line" />
          </div>

          <button
            type="button"
            className="crew-dash__back-btn"
            onClick={onLogout}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            <span>Return to Home</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default CrewDashboardPage;

