import React, { useState, useEffect } from 'react';
import './Guidlines.css';
import BrandLogo from '../components/BrandLogo';

export interface GuidlinesPageProps {
  initialCategory?: 'university' | 'school';
  onBack: () => void;
  onRegisterClick?: () => void;
}

export const GuidlinesPage: React.FC<GuidlinesPageProps> = ({
  initialCategory = 'university',
  onBack,
  onRegisterClick,
}) => {
  const [activeCategory, setActiveCategory] = useState<'university' | 'school'>(initialCategory);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeCategory]);

  const isUniversity = activeCategory === 'university';

  return (
    <div className={`guidelines-page guidelines-page--${activeCategory}`}>
      {/* Top Navigation Bar with Back Button */}
      <header className="guidelines-page__nav">
        <div className="guidelines-page__nav-inner">
          <button
            type="button"
            className="guidelines-page__back-btn"
            onClick={onBack}
            aria-label="Back to Home"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span className="back-text-full">Back to Home</span>
            <span className="back-text-short">Back</span>
          </button>

          <div className="guidelines-page__brand">
            <BrandLogo
              variant="withoutCaption"
              sizes="160px"
              alt="CINERO'26"
              className="guidelines-page__brand-logo"
              decoding="async"
            />
          </div>

          <div className="guidelines-page__actions">
            <a
              href="#register"
              className="guidelines-page__register-btn"
              onClick={(e) => {
                e.preventDefault();
                if (onRegisterClick) {
                  onRegisterClick();
                } else {
                  onBack();
                  setTimeout(() => {
                    const el = document.getElementById('register');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
            >
              Register
            </a>
          </div>
        </div>
      </header>

      {/* Hero Banner for Category */}
      <section className="guidelines-page__hero">
        <picture
          className={`guidelines-page__hero-bg ${
            isUniversity ? 'guidelines-page__hero-bg--university' : 'guidelines-page__hero-bg--school'
          }`}
          aria-hidden="true"
        >
          <source
            type="image/webp"
            media="(max-width: 768px)"
            srcSet={
              isUniversity
                ? '/images/guidline-section-university-card-background-480.webp 480w, /images/guidline-section-university-card-background-960.webp 960w'
                : '/images/guidline-section-school-card-background-480.webp 480w, /images/guidline-section-school-card-background-960.webp 960w'
            }
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet={
              isUniversity
                ? '/images/guidline-section-university-card-background-480.webp 480w, /images/guidline-section-university-card-background-960.webp 960w'
                : '/images/guidline-section-school-card-background-480.webp 480w, /images/guidline-section-school-card-background-960.webp 960w'
            }
            sizes="100vw"
          />
          <img
            src={
              isUniversity
                ? '/images/guidline section-university card-background.png'
                : '/images/guidline section-school card-background.png'
            }
            alt=""
            width={1254}
            height={1254}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <div className="guidelines-page__hero-overlay" aria-hidden="true" />

        <div className="guidelines-page__hero-content">
          <div className="guidelines-page__eyebrow">
            <span className="eyebrow-accent-text">CINERO’26 OFFICIAL RULEBOOK</span>
          </div>

          <h1 className="guidelines-page__title">
            {isUniversity ? 'University Category Guidelines' : 'School Category Guidelines'}
          </h1>

          <p className="guidelines-page__lead">
            {isUniversity
              ? 'Complete submission criteria, eligibility rules, and technical standards for undergraduates & university teams.'
              : 'Complete submission criteria, eligibility rules, and technical standards for secondary school students & teams.'}
          </p>

          {/* Category Switcher Tabs */}
          <div className="guidelines-page__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={isUniversity}
              className={`guidelines-page__tab guidelines-page__tab--university ${
                isUniversity ? 'is-active' : ''
              }`}
              onClick={() => setActiveCategory('university')}
            >
              <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
              </svg>
              <span>Inter-University</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={!isUniversity}
              className={`guidelines-page__tab guidelines-page__tab--school ${
                !isUniversity ? 'is-active' : ''
              }`}
              onClick={() => setActiveCategory('school')}
            >
              <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              <span>Inter-School</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area - Ready for user to insert specific guidelines */}
      <main className="guidelines-page__body">
        <div className="guidelines-page__container">
          {/* Notification banner for user */}
          <div className="guidelines-notice-card">
            <div className="notice-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <div className="notice-text">
              <strong>{isUniversity ? 'Inter-University' : 'Inter-School'} Category Guidelines</strong>
              <p>Review the standard regulations below. Official full rulebook text can be updated directly.</p>
            </div>
          </div>

          {/* Section 1: General Eligibility */}
          <div className="guidelines-block">
            <div className="guidelines-block__header">
              <span className="guidelines-block__number">01</span>
              <div>
                <h2 className="guidelines-block__title">Eligibility & Participation</h2>
                <span className="guidelines-block__sub">Who can submit in this category</span>
              </div>
            </div>
            <div className="guidelines-block__content">
              {/* === USER CAN ADD SPECIFIC GUIDELINES HERE === */}
              <ul className="guidelines-list">
                {isUniversity ? (
                  <>
                    <li>All team members or the principal filmmaker must be actively enrolled undergraduates from a recognized university.</li>
                    <li>Cross-faculty or collaborative university crews are permitted with valid student identification.</li>
                    <li>Films produced within the last 12 months are eligible for competition.</li>
                  </>
                ) : (
                  <>
                    <li>All participants must be currently studying in a government, private, or international school.</li>
                    <li>Submissions should be endorsed or verified with school credentials.</li>
                    <li>Films produced within the last 12 months are eligible for competition.</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Section 2: Film Duration & Technical Specifications */}
          <div className="guidelines-block">
            <div className="guidelines-block__header">
              <span className="guidelines-block__number">02</span>
              <div>
                <h2 className="guidelines-block__title">Film Duration & Technical Standards</h2>
                <span className="guidelines-block__sub">Runtime, video resolution, and audio requirements</span>
              </div>
            </div>
            <div className="guidelines-block__content">
              {/* === USER CAN ADD SPECIFIC GUIDELINES HERE === */}
              <ul className="guidelines-list">
                <li><strong>Runtime:</strong> Minimum 3 minutes, maximum 20 minutes (including opening/closing credits).</li>
                <li><strong>Resolution:</strong> Minimum Full HD 1080p (1920x1080) or 4K resolution.</li>
                <li><strong>Format & Codec:</strong> MP4 or MOV container with H.264/H.265 video encoding and stereo AAC audio.</li>
                <li><strong>Subtitles:</strong> Clear, legible English subtitles are mandatory for all entries not originally in English.</li>
              </ul>
            </div>
          </div>

          {/* Section 3: Copyright & Originality */}
          <div className="guidelines-block">
            <div className="guidelines-block__header">
              <span className="guidelines-block__number">03</span>
              <div>
                <h2 className="guidelines-block__title">Originality & Copyright Clearance</h2>
                <span className="guidelines-block__sub">Intellectual property, soundtrack, and footage permissions</span>
              </div>
            </div>
            <div className="guidelines-block__content">
              {/* === USER CAN ADD SPECIFIC GUIDELINES HERE === */}
              <ul className="guidelines-list">
                <li>All script, storyline, and visuals must be original creations by the submitting team.</li>
                <li>Background scores and sound effects must either be original compositions or royalty-free with proof of license.</li>
                <li>Any unauthorized use of copyrighted media will result in immediate disqualification.</li>
              </ul>
            </div>
          </div>

          {/* Section 4: Submission Deadlines & Verification */}
          <div className="guidelines-block">
            <div className="guidelines-block__header">
              <span className="guidelines-block__number">04</span>
              <div>
                <h2 className="guidelines-block__title">Submission Procedure & Documentation</h2>
                <span className="guidelines-block__sub">Required submission files and portal upload instructions</span>
              </div>
            </div>
            <div className="guidelines-block__content">
              {/* === USER CAN ADD SPECIFIC GUIDELINES HERE === */}
              <ul className="guidelines-list">
                <li>Complete the official registration form with all team member credentials and contact info.</li>
                <li>Provide a private, downloadable Google Drive or Vimeo link containing the final master cut and poster art.</li>
                <li>Include a 30-second teaser trailer cut and production stills for promotional screening.</li>
              </ul>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="guidelines-page__footer-bar">
            <button type="button" className="guidelines-page__back-btn-secondary" onClick={onBack}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Back to Home</span>
            </button>

            <button
              type="button"
              className="guidelines-page__submit-btn"
              onClick={() => {
                if (onRegisterClick) {
                  onRegisterClick();
                } else {
                  onBack();
                  setTimeout(() => {
                    const el = document.getElementById('register');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
            >
              Proceed to Registration
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GuidlinesPage;
