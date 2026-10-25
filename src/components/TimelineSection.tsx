import React, { useMemo, useState } from 'react';
import './TimelineSection.css';

export interface TimelineEvent {
  id: number;
  stepNumber: string;
  title: string;
  dateLabel: string;
  startDate: string;
  description: string;
  iconType: 'megaphone' | 'registration' | 'document' | 'certificate' | 'screening';
}

const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 1,
    stepNumber: '01',
    dateLabel: '27 OCT 2026',
    startDate: '2026-10-27',
    title: 'Registration Opens',
    description: 'Registration opens for CINERO’26 filmmakers.',
    iconType: 'registration',
  },
  {
    id: 2,
    stepNumber: '02',
    dateLabel: '07 NOV 2026',
    startDate: '2026-11-07',
    title: 'Registration Closes',
    description: 'Final day to register for CINERO’26.',
    iconType: 'registration',
  },
  {
    id: 3,
    stepNumber: '03',
    dateLabel: '09 NOV 2026',
    startDate: '2026-11-09',
    title: 'Submission Opens',
    description: 'Submit your short film to CINERO’26.',
    iconType: 'document',
  },
  {
    id: 4,
    stepNumber: '04',
    dateLabel: '06 DEC 2026',
    startDate: '2026-12-06',
    title: 'Submission Closes',
    description: 'Final day to submit a short film.',
    iconType: 'document',
  },
  {
    id: 5,
    stepNumber: '05',
    dateLabel: '13 DEC 2026',
    startDate: '2026-12-13',
    title: 'Official Short Film Screening',
    description: 'The official CINERO’26 short film screening.',
    iconType: 'screening',
  },
  {
    id: 6,
    stepNumber: '06',
    dateLabel: '20 DEC 2026',
    startDate: '2026-12-20',
    title: 'CINERO’26 Award Ceremony',
    description: 'Celebrate the CINERO’26 filmmakers and award winners.',
    iconType: 'certificate',
  },
];

function getLocalDateTimestamp(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function calculateActiveIndex(events: TimelineEvent[]): number {
  const currentTimestamp = getLocalDateTimestamp(new Date());

  const firstEventDate = new Date(`${events[0].startDate}T00:00:00`);
  const firstEventTime = getLocalDateTimestamp(firstEventDate);
  if (currentTimestamp < firstEventTime) {
    return 0;
  }

  for (let i = 0; i < events.length; i++) {
    const start = getLocalDateTimestamp(new Date(`${events[i].startDate}T00:00:00`));
    const nextStart = i < events.length - 1
      ? getLocalDateTimestamp(new Date(`${events[i + 1].startDate}T00:00:00`))
      : Infinity;
    if (currentTimestamp >= start && currentTimestamp < nextStart) {
      return i;
    }
  }

  return events.length - 1;
}

function getTimelineStatus(
  events: TimelineEvent[],
): 'UPCOMING EVENT' | 'CURRENT EVENT' | 'LATEST MILESTONE' {
  const today = getLocalDateTimestamp(new Date());
  const firstEvent = getLocalDateTimestamp(new Date(`${events[0].startDate}T00:00:00`));
  const lastEvent = getLocalDateTimestamp(new Date(`${events[events.length - 1].startDate}T00:00:00`));

  if (today < firstEvent) return 'UPCOMING EVENT';
  if (today > lastEvent) return 'LATEST MILESTONE';
  return 'CURRENT EVENT';
}

export const TimelineSection: React.FC = () => {
  const autoActiveIndex = useMemo(() => calculateActiveIndex(TIMELINE_EVENTS), []);
  const timelineStatus = useMemo(() => getTimelineStatus(TIMELINE_EVENTS), []);
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
            srcSet="/images/timeline-background-960.webp 960w, /images/timeline-background-1600.webp 1600w"
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
            Mark your calendar for the key dates of CINERO’26.<br />
            A stage for every story, from registration through the awards ceremony.
          </p>
        </div>

        <div className="timeline-layout" aria-label="Interactive event timeline">
          {/* Featured Highlight Card: Current Active Event */}
          <div className={`mobile-active-card ${selectedIndex === autoActiveIndex ? 'is-current' : ''}`}>
            <div className="mobile-active-card__top">
              <span className={`in-progress-badge in-progress-badge--mobile ${
                selectedIndex === autoActiveIndex ? 'in-progress-badge--current' : ''
              }`}>
                <span className="badge-pulse" />
                <span>
                  {selectedIndex === autoActiveIndex ? timelineStatus : 'SELECTED EVENT'}
                </span>
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
                  aria-current={isCurrent ? 'step' : undefined}
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
