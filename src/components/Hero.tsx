import React from 'react';
import './Hero.css';

interface HeroProps {
  onRegisterClick?: () => void;
  onExploreClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onRegisterClick, onExploreClick }) => {
  const handleScrollTo = (id: string, customHandler?: () => void) => {
    if (customHandler) {
      customHandler();
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="hero-section">
      {/* Background layer with responsive backdrop handling */}
      <div className="hero__bg" aria-hidden="true">
        <div className="hero__overlay-radial" />
        <div className="hero__overlay-linear" />
        <div className="hero__overlay-bottom" />
      </div>

      <div className="hero__container">
        <div className="hero__content">
          {/* Eyebrow / Presenter */}
          <div className="hero__presenter">
            <span className="hero__presenter-org">J'PURA VOICE</span>
            <span className="hero__presenter-label">PRESENTS</span>
          </div>

          {/* Logo & Main Title */}
          <div className="hero__brand">
            <img
              src="/images/cinero-logo.png"
              alt="CINERO'26"
              className="hero__logo-image"
              loading="eager"
            />
            <h1 className="hero__title-text">
              <span className="hero__subtitle">Short Film Festival</span>
            </h1>
          </div>

          {/* Golden Divider */}
          <div className="hero__divider" aria-hidden="true">
            <span className="hero__divider-line" />
            <span className="hero__divider-accent" />
            <span className="hero__divider-line" />
          </div>

          {/* Pillars / Keywords */}
          <div className="hero__pillars">
            <span className="hero__pillar-item">STORIES</span>
            <span className="hero__pillar-separator">·</span>
            <span className="hero__pillar-item">PEOPLE</span>
            <span className="hero__pillar-separator">·</span>
            <span className="hero__pillar-item">CULTURE</span>
            <span className="hero__pillar-separator">·</span>
            <span className="hero__pillar-item">CINEMA</span>
          </div>

          {/* Tagline / Mission */}
          <p className="hero__tagline">
            A PLATFORM FOR BOLD VOICES<br />
            AND MEANINGFUL STORIES
          </p>

          {/* CTA Buttons (Strictly without arrows as requested) */}
          <div className="hero__actions">
            <a
              href="#register"
              className="hero__btn hero__btn--primary"
              onClick={(e) => {
                e.preventDefault();
                handleScrollTo('register', onRegisterClick);
              }}
              id="hero-register-btn"
            >
              Register Now
            </a>

            <a
              href="#about"
              className="hero__btn hero__btn--secondary"
              onClick={(e) => {
                e.preventDefault();
                handleScrollTo('about', onExploreClick);
              }}
              id="hero-explore-btn"
            >
              Explore More
            </a>
          </div>

          {/* Quick Meta Footer Bar */}
          <div className="hero__meta">
            <div className="hero__meta-item">
              <span className="hero__meta-bullet" />
              <span>University of Sri Jayewardenepura</span>
            </div>
            <div className="hero__meta-item">
              <span className="hero__meta-bullet" />
              <span>National Competition</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
