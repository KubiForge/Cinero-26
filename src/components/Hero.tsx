import React, { useEffect, useRef, useState } from 'react';
import './Hero.css';
import BrandLogo from './BrandLogo';

interface HeroProps {
  onRegisterClick?: () => void;
  onExploreClick?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onRegisterClick, onExploreClick }) => {
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia('(max-width: 768px)').matches
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [failedVideoSrc, setFailedVideoSrc] = useState<string | null>(null);
  const videoSrc = prefersReducedMotion
    ? null
    : isMobile
      ? '/video/mobile-bg.mp4'
      : '/video/deckstop-bg.mp4';

  useEffect(() => {
    const mobileViewport = window.matchMedia('(max-width: 768px)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateViewport = () => setIsMobile(mobileViewport.matches);
    const updateMotionPreference = () => setPrefersReducedMotion(reducedMotion.matches);

    mobileViewport.addEventListener('change', updateViewport);
    reducedMotion.addEventListener('change', updateMotionPreference);
    return () => {
      mobileViewport.removeEventListener('change', updateViewport);
      reducedMotion.removeEventListener('change', updateMotionPreference);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    let active = true;
    const playback = video.play();
    if (playback) {
      void playback.catch(() => {
        if (active) setFailedVideoSrc(videoSrc);
      });
    }

    return () => {
      active = false;
    };
  }, [videoSrc]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!finePointer.matches || reducedMotion.matches) return;

    let animationFrame = 0;
    const setParallax = (x = 0, y = 0) => {
      hero.style.setProperty('--hero-parallax-x', `${x}px`);
      hero.style.setProperty('--hero-parallax-y', `${y}px`);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || reducedMotion.matches) return;

      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const bounds = hero.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;

        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        setParallax(x * -12, y * -10);
      });
    };

    const resetParallax = () => {
      cancelAnimationFrame(animationFrame);
      setParallax();
    };

    const handleMotionChange = (event: MediaQueryListEvent) => {
      if (event.matches) resetParallax();
    };

    hero.addEventListener('pointermove', handlePointerMove, { passive: true });
    hero.addEventListener('pointerleave', resetParallax);
    reducedMotion.addEventListener('change', handleMotionChange);

    return () => {
      hero.removeEventListener('pointermove', handlePointerMove);
      hero.removeEventListener('pointerleave', resetParallax);
      reducedMotion.removeEventListener('change', handleMotionChange);
      cancelAnimationFrame(animationFrame);
    };
  }, []);

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
    <section id="home" className="hero-section" ref={heroRef}>
      {/* Background layer with responsive backdrop handling */}
      <div className="hero__bg" aria-hidden="true">
        <picture className="hero__bg-art">
          <source
            type="image/webp"
            media="(max-width: 768px)"
            srcSet="/images/hero-mobile-480.webp 480w, /images/hero-mobile-940.webp 940w"
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet="/images/hero-bg-960.webp 960w, /images/hero-bg-1600.webp 1600w"
            sizes="100vw"
          />
          <img
            src="/images/hero-bg.png"
            alt="CINERO'26 Short Film Festival"
            width={1672}
            height={941}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        {videoSrc && failedVideoSrc !== videoSrc && (
          <video
            key={videoSrc}
            ref={videoRef}
            className="hero__bg-video"
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster={isMobile ? '/images/hero-mobile-940.webp' : '/images/hero-bg-1600.webp'}
            onError={() => setFailedVideoSrc(videoSrc)}
          />
        )}
        <div className="hero__overlay-radial" />
        <div className="hero__overlay-linear" />
        <div className="hero__overlay-bottom" />
      </div>

      <div className="hero__container">
        <div className="hero__content">
          {/* Eyebrow / Presenter */}
          <div className="hero__presenter">
            <span className="hero__presenter-org">J'PURA VOICE</span>
            <span className="hero__presenter-label">FILMING DIVISION</span>
          </div>

          {/* Logo & Main Title */}
          <div className="hero__brand">
            <BrandLogo
              variant="withCaption"
              sizes="(max-width: 768px) 72vw, 460px"
              alt=""
              className="hero__logo-image"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
            <h1 className="hero__title-text">CINERO’26</h1>
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
            A STAGE FOR EVERY STORY
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
