import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TimelineSection from './components/TimelineSection';
import GuidelinesSection from './components/GuidelinesSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import GuidlinesPage from './pages/Guidlines';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'guidelines'>('home');
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
      if (hash === '#guidelines-university') {
        setSelectedCategory('university');
        setCurrentPage('guidelines');
      } else if (hash === '#guidelines-school') {
        setSelectedCategory('school');
        setCurrentPage('guidelines');
      } else if (hash === '#guidelines-detail') {
        setCurrentPage('guidelines');
      } else if (currentPage === 'guidelines' && (hash === '#home' || hash === '' || hash === '#guidelines')) {
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
    window.location.hash = '#guidelines';
    setTimeout(() => {
      const el = document.getElementById('guidelines');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleNavClick = (href: string) => {
    if (currentPage === 'guidelines') {
      setCurrentPage('home');
      setTimeout(() => {
        const targetId = href.replace('#', '');
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
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
            setCurrentPage('home');
            setTimeout(() => {
              const el = document.getElementById('register');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 80);
          }}
        />
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
            const el = document.getElementById('about');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onRegisterClick={() => {
            const el = document.getElementById('register');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        />

        {/* About Section */}
        <section id="about" className="section section--about">
          <div className="section-container">
            <div className="section-header">
              <span className="section-eyebrow">About The Festival</span>
              <h2 className="section-title">Celebrating Visionary Filmmakers</h2>
              <p className="section-desc">
                CINERO'26 is a short film festival organized by J'Pura Voice Filming Division,
                the Official Media Club of the University of Sri Jayewardenepura.
                Empowering independent filmmakers, university students, and school creators to bring untold stories to light.
              </p>
            </div>

            <div className="about-grid">
              <div className="about-card">
                <span className="about-card__num">01 / SPOTLIGHT</span>
                <h3 className="about-card__title">Creative Freedom</h3>
                <p className="about-card__text">
                  A nationwide platform encouraging diverse perspectives, unique narratives,
                  and unconventional storytelling across all genres.
                </p>
              </div>

              <div className="about-card">
                <span className="about-card__num">02 / MASTERY</span>
                <h3 className="about-card__title">Industry Recognition</h3>
                <p className="about-card__text">
                  Evaluated by a distinguished panel of veteran directors, cinematographers,
                  and screenwriters from Sri Lanka’s cinema landscape.
                </p>
              </div>

              <div className="about-card">
                <span className="about-card__num">03 / HORIZONS</span>
                <h3 className="about-card__title">Grand Screening</h3>
                <p className="about-card__text">
                  Finalists experience their films screened before an eager cinema audience,
                  paired with networking and award ceremonies.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <TimelineSection />

        {/* Guidelines Section on Home Page */}
        <GuidelinesSection onSelectCategory={handleOpenCategoryGuidelines} />

        {/* Register Section */}
        <section id="register" className="section section--register">
          <div className="section-container">
            <div className="register-card">
              <span className="section-eyebrow">Ready To Submit?</span>
              <h2>Step Into The Spotlight</h2>
              <p>
                Register your film crew and upload your short film submission for CINERO'26.
                Be heard, be recognized, and celebrate cinema.
              </p>
              <button
                type="button"
                className="register-btn"
                onClick={() => alert("Registration opens October 26, 2026. Stay tuned!")}
              >
                Register Film Entry
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