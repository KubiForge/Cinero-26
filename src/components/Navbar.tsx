import { useEffect, useState } from "react";
import "./Navbar.css";

// Change this if your saved logo has a different file name
const LOGO_SRC = "/images/cinero-logo.png";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Timeline", href: "#timeline" },
  { label: "Guidelines", href: "#guidelines" },
  { label: "Contact", href: "#contact" },
];

interface NavbarProps {
  onNavigate?: (href: string) => void;
}

export default function Navbar({ onNavigate }: NavbarProps = {}) {
  const [active, setActive] = useState("#home");
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
      <div className="navbar__inner">
        <a href="#home" className="navbar__logo" onClick={() => handleNav("#home")}>
          <img src={LOGO_SRC} alt="CINERO'26" />
        </a>

        <button
          className={`navbar__toggle ${open ? "is-open" : ""}`}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav className={`navbar__menu ${open ? "is-open" : ""}`}>
          <ul className="navbar__links">
            {NAV_LINKS.map((link) => (
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
          <a
            href="#register"
            className="navbar__register"
            onClick={() => handleNav("#register")}
          >
            Register
          </a>
        </nav>
      </div>
    </header>
  );
}
