import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TimelineSection from './components/TimelineSection';
import GuidelinesSection from './components/GuidelinesSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import AboutPage from './pages/About';
import GuidlinesPage from './pages/Guidlines';
import RegistrationPage from './pages/Registration';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import './App.css';

// Registration opens automatically on 27 October 2026 at 00:00 AM (SL Time / UTC+5:30)
const REGISTRATION_OPEN_TIME = new Date('2026-10-27T00:00:00+05:30').getTime();
// Registration closes automatically on 8 November 2026 at 00:00 AM (SL Time / UTC+5:30)
const REGISTRATION_CLOSE_TIME = new Date('2026-11-08T00:00:00+05:30').getTime();

const ENFORCE_REGISTRATION_DATES = true;

const isRegistrationClosed = () => Date.now() >= REGISTRATION_CLOSE_TIME;
const isRegistrationOpen = () =>
  !isRegistrationClosed() && (!ENFORCE_REGISTRATION_DATES || Date.now() >= REGISTRATION_OPEN_TIME);

const showRegistrationNotOpenAlert = () => {
  void Swal.fire({
    title: 'Registration not started yet',
    text: 'Registration opens on 27 October 2026 at 12:00 AM Sri Lanka time.',
    icon: 'error',
    confirmButtonText: 'OK',
    confirmButtonColor: '#d4a642',
    background: '#171518',
    color: '#fff',
  });
};

const showRegistrationClosedAlert = () => {
  void Swal.fire({
    title: 'Registration closed',
    text: 'The registration deadline has passed. We are no longer accepting registrations.',
    icon: 'error',
    confirmButtonText: 'OK',
    confirmButtonColor: '#d4a642',
    background: '#171518',
    color: '#fff',
  });
};

const showRegistrationUnavailableAlert = () => {
  if (isRegistrationClosed()) {
    showRegistrationClosedAlert();
  } else {
    showRegistrationNotOpenAlert();
  }
};

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'about' | 'guidelines' | 'register'>('home');
  const [selectedCategory, setSelectedCategory] = useState<'university' | 'school'>('university');
  const [isLoading, setIsLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const minimumDisplayTime = 450;
    const startedAt = Date.now();
    let hideTimer: number | undefined;
    let removeTimer: number | undefined;

    const finishLoading = () => {
      const remainingTime = Math.max(0, minimumDisplayTime - (Date.now() - startedAt));
      hideTimer = window.setTimeout(() => {
        setIsLoading(false);
        removeTimer = window.setTimeout(() => setShowLoader(false), 350);
      }, remainingTime);
    };

    if (document.readyState === 'complete') {
      finishLoading();
    } else {
      window.addEventListener('load', finishLoading, { once: true });
    }

    return () => {
      window.removeEventListener('load', finishLoading);
      if (hideTimer !== undefined) window.clearTimeout(hideTimer);
      if (removeTimer !== undefined) window.clearTimeout(removeTimer);
    };
  }, []);

  useEffect(() => {
    if (currentPage !== 'register') return;

    const closeRegistrationPage = () => {
      showRegistrationClosedAlert();
      setCurrentPage('home');
      window.location.hash = '#register';
      window.setTimeout(() => {
        document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    };

    const timeUntilClose = Math.max(0, REGISTRATION_CLOSE_TIME - Date.now());
    const closeTimer = window.setTimeout(closeRegistrationPage, timeUntilClose);

    return () => window.clearTimeout(closeTimer);
  }, [currentPage]);

  const pageLoader = showLoader ? (
    <div
      className={`site-loader${isLoading ? '' : ' site-loader--dismissed'}`}
      role="status"
      aria-live="polite"
      aria-hidden={!isLoading}
    >
      <span className="site-loader__spinner" aria-hidden="true" />
      <span className="site-loader__label">Loading...</span>
    </div>
  ) : null;

  // Synchronize with URL hash for back/forward navigation and direct links
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#register-page' || hash === '#register-form') {
        if (!isRegistrationOpen()) {
          showRegistrationUnavailableAlert();
          window.location.hash = '#register';
          setCurrentPage('home');
          window.setTimeout(() => {
            document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
          }, 80);
        } else {
          setCurrentPage('register');
        }
      } else if (hash === '#register') {
        if (currentPage !== 'home') {
          setCurrentPage('home');
          window.setTimeout(() => {
            document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
          }, 80);
        } else {
          document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (hash === '#guidelines-university') {
        setSelectedCategory('university');
        setCurrentPage('guidelines');
      } else if (hash === '#guidelines-school') {
        setSelectedCategory('school');
        setCurrentPage('guidelines');
      } else if (hash === '#guidelines-detail') {
        setCurrentPage('guidelines');
      } else if (hash === '#about' || hash.startsWith('#about-')) {
        setCurrentPage('about');
        if (hash !== '#about') {
          window.setTimeout(() => {
            document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
          }, 80);
        }
      } else if (currentPage !== 'home' && (hash === '#home' || hash === '' || hash === '#guidelines' || hash === '#timeline' || hash === '#contact')) {
        setCurrentPage('home');
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [currentPage]);

  const handleOpenCategoryGuidelines = (category: 'university' | 'school') => {
    setSelectedCategory(category);
    setCurrentPage('guidelines');
    window.location.hash = `#guidelines-${category}`;
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    window.location.hash = '#home';
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
  };

  const handleNavClick = (href: string) => {
    if (href === '#register-page' || href === '#register-form') {
      if (!isRegistrationOpen()) {
        showRegistrationUnavailableAlert();
        return;
      }
      setCurrentPage('register');
      window.location.hash = '#register-page';
      return;
    }

    if (href === '#register') {
      const scrollToRegisterSection = () => {
        document.getElementById('register')?.scrollIntoView({ behavior: 'smooth' });
      };

      if (currentPage !== 'home') {
        setCurrentPage('home');
        window.location.hash = '#register';
        window.setTimeout(scrollToRegisterSection, 80);
        return;
      }

      window.location.hash = '#register';
      scrollToRegisterSection();
      return;
    }

    if (href === '#guidelines-university' || href === '#guidelines-school') {
      handleOpenCategoryGuidelines(href.endsWith('university') ? 'university' : 'school');
      return;
    }

    if (href === '#about' || href.startsWith('#about-')) {
      setCurrentPage('about');
      window.location.hash = href;
      window.setTimeout(() => {
        document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
      return;
    }

    const scrollToTarget = () => {
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    };

    if (currentPage !== 'home') {
      setCurrentPage('home');
      window.location.hash = href;
      window.setTimeout(scrollToTarget, 80);
      return;
    }

    window.location.hash = href;
    scrollToTarget();
  };

  // If viewing the dedicated guidelines page
  if (currentPage === 'guidelines') {
    return (
      <>
        {pageLoader}
        <GuidlinesPage
          key={selectedCategory}
          initialCategory={selectedCategory}
          onBack={handleBackToHome}
          onRegisterClick={() => {
            handleNavClick('#register');
          }}
        />
      </>
    );
  }

  if (currentPage === 'about') {
    return (
      <>
        {pageLoader}
        <AboutPage onNavigate={handleNavClick} />
        <Footer onNavigate={handleNavClick} />
      </>
    );
  }

  if (currentPage === 'register') {
    return (
      <>
        {pageLoader}
        <RegistrationPage onBack={handleBackToHome} />
      </>
    );
  }

  // Home Page View
  return (
    <>
      {pageLoader}
      <Navbar onNavigate={handleNavClick} />
      <main>
        {/* Hero Section */}
        <Hero
          onExploreClick={() => {
            const el = document.getElementById('about-preview');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onRegisterClick={() => handleNavClick('#register')}
        />

        {/* About Section */}
        <section id="about-preview" className="section section--about">
          <picture className="section-bg-art section-bg-art--about" aria-hidden="true">
            <source
              type="image/webp"
              media="(max-width: 768px)"
              srcSet="/images/about-background-480.webp 480w, /images/about-background-960.webp 960w"
              sizes="100vw"
            />
            <source
              type="image/webp"
              srcSet="/images/about-background-960.webp 960w, /images/about-background-1600.webp 1600w"
              sizes="100vw"
            />
            <img
              src="/images/background%20for%20about%20section%20and%20page.png"
              alt=""
              width={1672}
              height={941}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <div className="section-container">
            <div className="about-section__header">
              <div className="about-section__eyebrow">
                <span>CINERO’26</span>
                <span className="about-section__eyebrow-line" aria-hidden="true" />
              </div>
              <h2 className="about-section__title">ABOUT</h2>
              <p className="section-desc">
                CINERO’26 is an inter-school and inter-university short film festival celebrating
                the stories, ideas, and creative voices of emerging filmmakers.
              </p>
            </div>

            <div className="about-grid">
              <div className="about-card">
                <span className="about-card__num">01 / SPOTLIGHT</span>
                <h3 className="about-card__title">Our Concept</h3>
                <p className="about-card__text">
                  Every story deserves to be told, and every vision deserves the chance to be seen.
                </p>
              </div>

              <div className="about-card">
                <span className="about-card__num">02 / MASTERY</span>
                <h3 className="about-card__title">Our Purpose</h3>
                <p className="about-card__text">
                  Encourage creativity, celebrate diverse perspectives, and support the next generation of filmmakers.
                </p>
              </div>

              <div className="about-card">
                <span className="about-card__num">03 / HORIZONS</span>
                <h3 className="about-card__title">Two Categories</h3>
                <p className="about-card__text">
                  A shared platform for school students and university undergraduates to express themselves through film.
                </p>
              </div>
            </div>
            <div className="about-preview__actions">
              <button
                type="button"
                className="about-preview__button"
                onClick={() => handleNavClick('#about')}
              >
                <span>Discover Our Story</span>
                <span className="about-preview__button-arrow" aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <TimelineSection />

        {/* Guidelines Section on Home Page */}
        <GuidelinesSection onSelectCategory={handleOpenCategoryGuidelines} />

        {/* Register Section */}
        <section id="register" className="section section--register">
          <picture className="section-bg-art section-bg-art--register" aria-hidden="true">
            <source
              type="image/webp"
              media="(max-width: 768px)"
              srcSet="/images/registration-background-480.webp 480w, /images/registration-background-960.webp 960w"
              sizes="100vw"
            />
            <source
              type="image/webp"
              srcSet="/images/registration-background-960.webp 960w, /images/registration-background-1600.webp 1600w"
              sizes="100vw"
            />
            <img
              src="/images/background%20for%20registration%20section%20and%20page.png"
              alt=""
              width={1672}
              height={941}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <div className="section-container">
            <div className="register-card">
              <div className="guidelines-section__eyebrow register-card__eyebrow">
                <span className="eyebrow-text">CINERO’26</span>
                <span className="eyebrow-line" />
              </div>
              <h2 className="register-card__title">REGISTRATION</h2>
              <p>
                Register your film crew and team entry for CINERO'26.<br />
                Be heard, be recognized, and take the first step towards the spotlight.
              </p>
              <button
                type="button"
                className="register-btn"
                onClick={() => handleNavClick('#register-page')}
              >
                <span>Register Your Team</span>
                <span className="about-preview__button-arrow" aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <ContactSection />
      </main>

      {/* Professional Industry-Level Footer */}
      <Footer onNavigate={handleNavClick} />
    </>
  );
}

export default App;