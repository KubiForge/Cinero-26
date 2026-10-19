import React from 'react';
import './Footer.css';

interface FooterProps {
  onNavigate?: (href: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const currentYear = new Date().getFullYear();

  const handleLinkClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(href);
    } else {
      const targetId = href.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="cinero-footer">
      {/* Top subtle decorative ambient glow */}
      <div className="footer-glow" aria-hidden="true" />

      <div className="footer-container">
        {/* Main Footer Content Grid */}
        <div className="footer-main-grid">
          {/* Column 1: Brand & Logos */}
          <div className="footer-brand-col">
            <div className="footer-logos">
              <a href="#home" onClick={(e) => handleLinkClick('#home', e)} className="footer-logo-link">
                <img
                  src="/images/cinero-logo.png"
                  alt="CINERO'26"
                  className="footer-logo footer-logo--cinero"
                />
              </a>
              <span className="footer-logo-divider" aria-hidden="true" />
              <div className="footer-logo-link">
                <img
                  src="/images/Voice logo for footer.png"
                  alt="J'Pura Voice"
                  className="footer-logo footer-logo--voice"
                />
              </div>
            </div>

            <p className="footer-tagline">
              The premier national short film festival celebrating bold voices, authentic narratives, and visionary student creators across Sri Lanka.
            </p>

            <div className="footer-university-badge">
              <span className="badge-dot" />
              <span>University of Sri Jayewardenepura</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Navigation</h4>
            <ul className="footer-links-list">
              <li>
                <a href="#home" onClick={(e) => handleLinkClick('#home', e)}>Home</a>
              </li>
              <li>
                <a href="#about" onClick={(e) => handleLinkClick('#about', e)}>About Festival</a>
              </li>
              <li>
                <a href="#timeline" onClick={(e) => handleLinkClick('#timeline', e)}>Timeline</a>
              </li>
              <li>
                <a href="#guidelines" onClick={(e) => handleLinkClick('#guidelines', e)}>Guidelines</a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => handleLinkClick('#contact', e)}>Contact Us</a>
              </li>
            </ul>
          </div>

          {/* Column 3: Categories & Details */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Categories</h4>
            <ul className="footer-links-list">
              <li>
                <a href="#guidelines-university" onClick={(e) => handleLinkClick('#guidelines-university', e)}>
                  Inter-University
                </a>
              </li>
              <li>
                <a href="#guidelines-school" onClick={(e) => handleLinkClick('#guidelines-school', e)}>
                  Inter-School
                </a>
              </li>
              <li>
                <a href="#about" onClick={(e) => handleLinkClick('#about', e)}>
                  Awards & Recognition
                </a>
              </li>
              <li>
                <a href="#register" onClick={(e) => handleLinkClick('#register', e)}>
                  Registration Portal
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Social Connect */}
          <div className="footer-social-col">
            <h4 className="footer-col-title">Connect</h4>
            <p className="footer-social-desc">
              Follow our official media channels for trailers, behind-the-scenes, and updates.
            </p>

            <div className="footer-social-icons">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="YouTube"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                  <polygon points="10 15 15 12 10 9 10 15" />
                </svg>
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="LinkedIn"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Divider Bar */}
        <div className="footer-bottom-divider" aria-hidden="true" />

        {/* Bottom Credits Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            © {currentYear} <strong>CINERO’26</strong>. Organized by <strong>J'Pura Voice</strong>, University of Sri Jayewardenepura.
          </div>

          {/* Developer Credit: Kubi Forge */}
          <div className="footer-developer">
            <span className="dev-prefix">Developed by</span>
            <a
              href="https://kubiforge.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="kubiforge-badge"
              title="Visit Kubi Forge"
            >
              <span className="kubiforge-dot" />
              <span className="kubiforge-name">Kubi Forge</span>
              <svg className="external-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
