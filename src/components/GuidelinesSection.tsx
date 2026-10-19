import React from 'react';
import './GuidelinesSection.css';

interface GuidelinesSectionProps {
  onSelectCategory: (category: 'university' | 'school') => void;
}

export const GuidelinesSection: React.FC<GuidelinesSectionProps> = ({ onSelectCategory }) => {
  return (
    <section id="guidelines" className="guidelines-section">
      {/* Background with overlay */}
      <div className="guidelines-section__bg" aria-hidden="true">
        <picture className="guidelines-section__bg-art">
          <source
            type="image/webp"
            media="(max-width: 768px)"
            srcSet="/images/guidline-section-backgound-mobile.992ef29093.webp 900w"
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet="/images/guidline-section-backgound.4faeae743b.webp 1671w"
            sizes="100vw"
          />
          <img
            src="/images/guidline-section-backgound.png"
            alt=""
            width={1671}
            height={941}
            loading="lazy"
            decoding="async"
          />
        </picture>
        <div className="guidelines-section__overlay-linear" />
        <div className="guidelines-section__overlay-radial" />
      </div>

      <div className="guidelines-section__container">
        {/* Header matching reference mockup */}
        <div className="guidelines-section__header">
          <div className="guidelines-section__eyebrow">
            <span className="eyebrow-text">CINERO’26</span>
            <span className="eyebrow-line" />
          </div>
          <h2 className="guidelines-section__title">GUIDELINES</h2>
          <p className="guidelines-section__desc">
            Explore the rules and requirements for your category.<br />
            Click on the relevant section to view the detailed guidelines and rulebook.
          </p>
        </div>

        {/* 2 Category Cards */}
        <div className="guidelines-section__cards">
          {/* Card 1: University Category */}
          <div
            className="guideline-card guideline-card--university"
            onClick={() => onSelectCategory('university')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectCategory('university');
              }
            }}
            id="guideline-card-university"
          >
            <picture className="guideline-card__bg guideline-card__bg--university">
              <source
                type="image/webp"
                media="(max-width: 768px)"
                srcSet="/images/guidline-section-university-card-background-mobile.a29947c05e.webp 750w"
                sizes="100vw"
              />
              <source
                type="image/webp"
                srcSet="/images/guidline-section-university-card-background.798382d6d0.webp 1254w"
                sizes="350px"
              />
              <img
                src="/images/guidline section-university card-background.png"
                alt=""
                width={1254}
                height={1254}
                loading="lazy"
                decoding="async"
              />
            </picture>
            <div className="guideline-card__overlay" />

            <div className="guideline-card__content">
              {/* Icon */}
              <div className="guideline-card__icon-wrap">
                <svg
                  className="guideline-card__icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Graduation Cap */}
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
                </svg>
              </div>

              {/* Eyebrow */}
              <span className="guideline-card__badge guideline-card__badge--university">
                INTER-UNIVERSITY
              </span>

              {/* Title */}
              <h3 className="guideline-card__title">University Category</h3>

              {/* Description */}
              <p className="guideline-card__text">
                Guidelines, eligibility, team details, awards and more for the Inter-University category.
              </p>

              {/* Action row with circled arrow */}
              <div className="guideline-card__footer">
                <span className="guideline-card__action-text">View Guidelines</span>
                <span className="guideline-card__arrow-btn guideline-card__arrow-btn--university" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: School Category */}
          <div
            className="guideline-card guideline-card--school"
            onClick={() => onSelectCategory('school')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectCategory('school');
              }
            }}
            id="guideline-card-school"
          >
            <picture className="guideline-card__bg guideline-card__bg--school">
              <source
                type="image/webp"
                media="(max-width: 768px)"
                srcSet="/images/guidline-section-school-card-background-mobile.385a888440.webp 750w"
                sizes="100vw"
              />
              <source
                type="image/webp"
                srcSet="/images/guidline-section-school-card-background.5f3343b629.webp 1254w"
                sizes="350px"
              />
              <img
                src="/images/guidline section-school card-background.png"
                alt=""
                width={1254}
                height={1254}
                loading="lazy"
                decoding="async"
              />
            </picture>
            <div className="guideline-card__overlay" />

            <div className="guideline-card__content">
              {/* Icon */}
              <div className="guideline-card__icon-wrap">
                <svg
                  className="guideline-card__icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Book Open */}
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>

              {/* Eyebrow */}
              <span className="guideline-card__badge guideline-card__badge--school">
                INTER-SCHOOL
              </span>

              {/* Title */}
              <h3 className="guideline-card__title">School Category</h3>

              {/* Description */}
              <p className="guideline-card__text">
                Guidelines, eligibility, team details, awards and more for the Inter-School category.
              </p>

              {/* Action row with circled arrow */}
              <div className="guideline-card__footer">
                <span className="guideline-card__action-text">View Guidelines</span>
                <span className="guideline-card__arrow-btn guideline-card__arrow-btn--school" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuidelinesSection;
