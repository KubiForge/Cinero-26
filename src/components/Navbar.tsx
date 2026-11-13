import { useEffect, useState } from "react";
import "./Navbar.css";
import BrandLogo from './BrandLogo';
import { siteNavigationLinks } from '../data/siteLinks';

interface NavbarProps {
  onNavigate?: (href: string) => void;
  variant?: 'overlay' | 'solid';
}

export default function Navbar({ onNavigate, variant = 'overlay' }: NavbarProps = {}) {
  const [active, setActive] = useState(() => {
    const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
    return path === '/holi-gallery' ? path : window.location.hash || '#home';
  });
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (href: string) => {
    setActive(href);
    setOpen(false);
    if (onNavigate) {
      onNavigate(href);
    }
  };

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""} ${variant === 'solid' ? 'navbar--solid' : ''}`}>
      {open && (
        <button
          className="navbar__backdrop"
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="navbar__inner">
        <a href="#home" className="navbar__logo" onClick={() => handleNav("#home")}>
          <BrandLogo
            variant="withCaption"
            sizes="(max-width: 900px) 150px, 190px"
            alt="CINERO'26"
            decoding="async"
          />
        </a>

        <button
          className={`navbar__toggle ${open ? "is-open" : ""}`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="site-navigation"
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav
          id="site-navigation"
          className={`navbar__menu ${open ? "is-open" : ""}`}
        >
          <ul className="navbar__links">
            {siteNavigationLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`navbar__link ${active === link.href ? "is-active" : ""}`}
                  onClick={() => handleNav(link.href)}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href="/holi-gallery"
                className={`navbar__link ${active === '/holi-gallery' ? 'is-active' : ''}`}
                onClick={(event) => {
                  event.preventDefault();
                  handleNav('/holi-gallery');
                }}
              >
                Holi Gallery
              </a>
            </li>
          </ul>

            <div className="navbar__actions">
              <a
                href="#register"
                className="navbar__register"
                onClick={() => handleNav("#register")}
              >
                Register
              </a>
              <span className="navbar__action-divider" aria-hidden="true" />
              <a
                href="#hr-crew-login"
                className="navbar__crew-login"
                onClick={() => handleNav("#hr-crew-login")}
              >
                <svg
                  className="navbar__crew-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="8" r="3.5" />
                  <path d="M5 20a7 7 0 0 1 14 0" />
                </svg>
                Crew Login
              </a>
            </div>
        </nav>
      </div>
    </header>
  );
}
