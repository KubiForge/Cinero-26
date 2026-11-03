import { useEffect, useState } from "react";
import { ShieldCheck } from 'lucide-react';
import "./Navbar.css";
import BrandLogo from './BrandLogo';
import { siteNavigationLinks } from '../data/siteLinks';

interface NavbarProps {
  onNavigate?: (href: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps = {}) {
  const [active, setActive] = useState(() => window.location.hash || "#home");
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
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
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
            sizes="(max-width: 768px) 150px, 190px"
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
          </ul>
          <div className="navbar__actions">
            <a
              href="#register"
              className="navbar__register"
              onClick={(event) => {
                event.preventDefault();
                handleNav("#register");
              }}
            >
              Register
            </a>
            <a
              href="/crew/login"
              className="navbar__crew-login"
              aria-label="Crew Login"
              title="Crew Login"
              onClick={(event) => {
                event.preventDefault();
                handleNav('/crew/login');
              }}
            >
              <ShieldCheck size={14} strokeWidth={2.2} />
              <span>CREW LOGIN</span>
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
}
