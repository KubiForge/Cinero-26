import React, { useMemo, useState } from 'react';
import './TimelineSection.css';

export interface TimelineEvent {
  id: number;
  stepNumber: string;
  title: string;
  dateLabel: string;
  startDate: string; // ISO date string 'YYYY-MM-DD'
  description: string;
  iconType: 'megaphone' | 'registration' | 'document' | 'certificate' | 'screening';
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 1,
    stepNumber: '01',
    dateLabel: '20 APR 2026',
    startDate: '2026-04-20',
    title: 'Promotions & Media',
    description: 'Design event promotional flyers & write matching captions.',
    iconType: 'megaphone',
  },
  {
    id: 2,
    stepNumber: '02',
    dateLabel: '10 MAY 2026',
    startDate: '2026-05-10',
    title: 'Pre-Registration',
    description: 'Design event posters, banners, and physical print displays.',
    iconType: 'registration',
  },
  {
    id: 3,
    stepNumber: '03',
    dateLabel: '25 MAY 2026',
    startDate: '2026-05-25',
    title: 'Pre-Registration',
    description: 'Design official document layouts, cover pages, & PDF materials.',
    iconType: 'document',
  },
  {
    id: 4,
    stepNumber: '04',
    dateLabel: '15 JUN 2026',
    startDate: '2026-06-15',
    title: 'Submission / Screening',
    description: 'Design participant & award certificates.',
    iconType: 'certificate',
  },
  {
    id: 5,
    stepNumber: '05',
    dateLabel: '21 JUL 2026',
    startDate: '2026-07-21',
    title: 'Screening / Event Day',
    description: 'Design event backdrop artwork for printing.',
    iconType: 'screening',
  },
];

// Helper to calculate active event index based on current client date
function calculateActiveIndex(events: TimelineEvent[]): number {
  const now = new Date();
  const currentTimestamp = now.getTime();

  // If before the first event, the first is upcoming / active
  const firstEventTime = new Date(events[0].startDate).getTime();
  if (currentTimestamp <= firstEventTime) {
    return 0;
  }

  // Find the interval where today falls
  for (let i = 0; i < events.length; i++) {
    const start = new Date(events[i].startDate).getTime();
    const nextStart = i < events.length - 1 ? new Date(events[i + 1].startDate).getTime() : Infinity;
    if (currentTimestamp >= start && currentTimestamp < nextStart) {
      return i;
    }
  }

  // If past all events, default to the latest/finale
  return events.length - 1;
}

export const TimelineSection: React.FC = () => {
  const autoActiveIndex = useMemo(() => calculateActiveIndex(TIMELINE_EVENTS), []);
  const [selectedIndex, setSelectedIndex] = useState<number>(autoActiveIndex);

  const activeEvent = TIMELINE_EVENTS[selectedIndex];

  // Render vector icons
  const renderIcon = (type: TimelineEvent['iconType']) => {
    switch (type) {
      case 'megaphone':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m3 11 18-5v12L3 14v-3z" />
            <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
          </svg>
        );
      case 'registration':
      case 'document':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
        );
      case 'certificate':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="6" />
            <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
          </svg>
        );
      case 'screening':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <section id="timeline" className="timeline-section">
      {/* Background artwork and ambient overlays */}
      <div className="timeline-section__bg" aria-hidden="true">
        <picture className="timeline-section__bg-art">
          <source
            type="image/webp"
            media="(max-width: 768px)"
            srcSet="/images/timeline-background-mobile.c317b0be31.webp 900w"
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet="/images/timeline-background.4a58c3109d.webp 1672w"
            sizes="100vw"
          />
          <img
            src="/images/timeline background.png"
            alt=""
            width={1672}
            height={941}
            loading="lazy"
            decoding="async"
          />
        </picture>
        <div className="timeline-section__overlay-radial" />
        <div className="timeline-section__overlay-linear" />
      </div>

      <div className="timeline-section__container">
        {/* Header - matching guidelines typography & styling */}
        <div className="timeline-section__header">
          <div className="timeline-section__eyebrow">
            <span className="eyebrow-text">CINERO’26</span>
            <span className="eyebrow-line" />
          </div>
          <h2 className="timeline-section__title">TIMELINE</h2>
          <p className="timeline-section__desc">
            Mark your calendar and stay updated with all the key dates of CINERO’26.<br />
            Follow our journey from registration to the final screening and awards ceremony.
          </p>
        </div>

        {/* ===================================================================
            DESKTOP CIRCULAR TIMELINE (Orbital 5-node radar with film reel center)
            =================================================================== */}
        <div className="timeline-desktop" aria-label="Interactive event timeline">
          <div className="timeline-orbital">
            {/* Center Circular Film Reel Emblem */}
            <div className="timeline-center-reel">
              <div className="reel-outer-ring" />
              <div className="reel-housing">
                {/* Film reel cutouts */}
                <div className="reel-holes">
                  <span className="hole hole-1" />
                  <span className="hole hole-2" />
                  <span className="hole hole-3" />
                  <span className="hole hole-4" />
                  <span className="hole hole-5" />
                  <span className="hole hole-6" />
                </div>
                {/* Center Badge */}
                <div className="reel-core">
                  <span className="reel-core__logo">CINERO’26</span>
                  <span className="reel-core__sub">TIMELINE</span>
                  <span className="reel-core__bar" />
                </div>
              </div>
            </div>

            {/* Concentric orbital track SVG rings and connectors */}
            <svg className="orbital-svg" viewBox="0 0 600 600" aria-hidden="true">
              <circle cx="300" cy="300" r="170" className="orbital-ring orbital-ring--inner" />
              <circle cx="300" cy="300" r="215" className="orbital-ring orbital-ring--outer" />
              {/* Connector spokes to 5 nodes */}
              {/* Node 1: Top (300, 85) */}
              <line x1="300" y1="130" x2="300" y2="85" className="spoke-line" />
              {/* Node 2: Top Right (475, 175) */}
              <line x1="420" y1="210" x2="475" y2="175" className="spoke-line" />
              {/* Node 3: Bottom Right (425, 470) */}
              <line x1="385" y1="420" x2="425" y2="470" className="spoke-line" />
              {/* Node 4: Bottom Left (175, 470) */}
              <line x1="215" y1="420" x2="175" y2="470" className="spoke-line" />
              {/* Node 5: Top Left (125, 175) */}
              <line x1="180" y1="210" x2="125" y2="175" className="spoke-line" />

              {/* Glowing anchor dots */}
              <circle cx="300" cy="130" r="4" className="anchor-dot" />
              <circle cx="420" cy="210" r="4" className="anchor-dot" />
              <circle cx="385" cy="420" r="4" className="anchor-dot" />
              <circle cx="215" cy="420" r="4" className="anchor-dot" />
              <circle cx="180" cy="210" r="4" className="anchor-dot" />
            </svg>

            {/* 5 Milestone Nodes & Text Callouts */}
            {TIMELINE_EVENTS.map((event, index) => {
              const isSelected = selectedIndex === index;
              const isCurrentActive = autoActiveIndex === index;
              return (
                <div
                  key={event.id}
                  className={`orbital-node-wrapper node-pos-${index + 1} ${
                    isSelected ? 'is-selected' : ''
                  } ${isCurrentActive ? 'is-current' : ''}`}
                  onClick={() => setSelectedIndex(index)}
                >
                  {/* Status badge for the active milestone */}
                  {isCurrentActive && (
                    <div className="in-progress-badge">
                      <span className="badge-pulse" />
                      <span>IN PROGRESS</span>
                    </div>
                  )}

                  {/* Circular Node Button */}
                  <button
                    type="button"
                    className="orbital-node-btn"
                    aria-label={`${event.title} on ${event.dateLabel}`}
                    aria-pressed={isSelected}
                  >
                    <div className="node-glow" />
                    <div className="node-icon">{renderIcon(event.iconType)}</div>
                  </button>

                  {/* Info Callout */}
                  <div className={`orbital-info info-align-${index + 1}`}>
                    <div className="orbital-info__step">
                      <span>{event.stepNumber}</span>
                      <span className="step-dash" />
                    </div>
                    <div className="orbital-info__date">{event.dateLabel}</div>
                    <h3 className="orbital-info__title">{event.title}</h3>
                    <p className="orbital-info__desc">{event.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===================================================================
            MOBILE RESPONSIVE TIMELINE (< 960px)
            =================================================================== */}
        <div className="timeline-mobile" aria-label="Mobile event timeline">
          {/* Featured Highlight Card: Current Active Event */}
          <div className="mobile-active-card">
            <div className="mobile-active-card__top">
              <span className="in-progress-badge in-progress-badge--mobile">
                <span className="badge-pulse" />
                <span>IN PROGRESS</span>
              </span>
              <span className="mobile-active-card__step">{activeEvent.stepNumber}</span>
            </div>

            <div className="mobile-active-card__date">{activeEvent.dateLabel}</div>
            <h3 className="mobile-active-card__title">{activeEvent.title}</h3>
            <p className="mobile-active-card__desc">{activeEvent.description}</p>
          </div>

          {/* Interactive Vertical Timeline Track */}
          <div className="mobile-track">
            <div className="mobile-track__line" />

            {TIMELINE_EVENTS.map((event, index) => {
              const isSelected = selectedIndex === index;
              const isCurrent = autoActiveIndex === index;
              return (
                <div
                  key={event.id}
                  className={`mobile-step ${isSelected ? 'is-selected' : ''} ${
                    isCurrent ? 'is-current' : ''
                  }`}
                  onClick={() => setSelectedIndex(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedIndex(index);
                    }
                  }}
                >
                  <div className="mobile-step__node">
                    <div className="mobile-step__icon">{renderIcon(event.iconType)}</div>
                    {isCurrent && <span className="mobile-step__pulse-ring" />}
                  </div>

                  <div className="mobile-step__body">
                    <div className="mobile-step__meta">
                      <span className="mobile-step__number">{event.stepNumber}</span>
                      <span className="mobile-step__dash" />
                      <span className="mobile-step__date">{event.dateLabel}</span>
                    </div>
                    <h4 className="mobile-step__title">{event.title}</h4>
                    <p className="mobile-step__desc">{event.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TimelineSection;
