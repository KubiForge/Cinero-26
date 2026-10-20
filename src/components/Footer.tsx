import React from 'react';
import './Footer.css';
import BrandLogo from './BrandLogo';
import SocialLinks from './SocialLinks';
import { footerCategoryLinks, siteNavigationLinks } from '../data/siteLinks';

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
      window.location.hash = href;
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
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
                <BrandLogo
                  variant="withCaption"
                  alt="CINERO'26"
                  className="footer-logo footer-logo--cinero"
                  sizes="(max-width: 480px) 120px, 160px"
                  loading="lazy"
                  decoding="async"
                />
              </a>
              <span className="footer-logo-divider" aria-hidden="true" />
              <picture>
                <source
                  type="image/webp"
                  srcSet="/images/filmingdivision-320.webp 320w, /images/filmingdivision-640.webp 640w, /images/filmingdivision-960.webp 960w"
                  sizes="(max-width: 480px) 74px, 96px"
                />
                <img
                  src="/images/filmingdivision-optimized.png"
                  alt="J'Pura Voice Filming Division"
                  className="footer-logo footer-logo--division"
                  width={960}
                  height={288}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
              <span className="footer-logo-divider" aria-hidden="true" />
              <picture className="footer-logo-link footer-logo-link--voice">
                <source
                  type="image/webp"
                  srcSet="/images/voice-logo-for-footer-320.webp 320w, /images/voice-logo-for-footer-640.webp 640w, /images/voice-logo-for-footer-960.webp 960w"
                  sizes="(max-width: 480px) 54px, 68px"
                />
                <img
                  src="/images/voice-logo-for-footer-optimized.png"
                  alt="J'Pura Voice"
                  className="footer-logo footer-logo--voice"
                  width={960}
                  height={393}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </div>

            <p className="footer-tagline">
              CINERO’26 is a stage for every story, celebrating visionary filmmakers across Sri Lanka.
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
              {siteNavigationLinks.map(({ label, href }) => (
                <li key={href}>
                  <a href={href} onClick={(e) => handleLinkClick(href, e)}>
                    {label === 'About' ? 'About Festival' : label === 'Contact' ? 'Contact Us' : label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Categories & Details */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Categories</h4>
            <ul className="footer-links-list">
              {footerCategoryLinks.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} onClick={(e) => handleLinkClick(href, e)}>{label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Social Connect */}
          <div className="footer-social-col">
            <h4 className="footer-col-title">Connect</h4>
            <p className="footer-social-desc">
              Follow our official media channels for trailers, behind-the-scenes, and updates.
            </p>

            <SocialLinks className="footer-social-icons" linkClassName="footer-social-btn" />
          </div>
        </div>

        {/* Divider Bar */}
        <div className="footer-bottom-divider" aria-hidden="true" />

        {/* Bottom Credits Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            © {currentYear} <strong>CINERO’26</strong>. Organized by <strong>J'Pura Voice Filming Division</strong>, University of Sri Jayewardenepura.
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
