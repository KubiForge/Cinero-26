import { useState } from 'react';
import {
  Clapperboard,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';

interface CrewNavbarProps {
  onLogout: () => void;
}

export default function CrewNavbar({ onLogout }: CrewNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'registrations'>('overview');

  const navigateTo = (id: string, section: 'overview' | 'registrations') => {
    setActiveSection(section);
    setIsOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <>
      <button
        type="button"
        className="admin-mobile-menu"
        aria-label="Open crew navigation"
        onClick={() => setIsOpen(true)}
      >
        <Menu size={21} />
      </button>
      {isOpen && (
        <button
          type="button"
          className="admin-sidebar-backdrop"
          aria-label="Close crew navigation"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside className={`admin-sidebar${isOpen ? ' admin-sidebar--open' : ''}`}>
        <div className="admin-sidebar__brand">
          <span className="admin-brand-mark"><Clapperboard size={20} /></span>
          <span>
            <strong>CINERO’26</strong>
            <small>CREW PORTAL</small>
          </span>
          <button
            type="button"
            className="admin-sidebar__close"
            aria-label="Close crew navigation"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-sidebar__section-label">WORKSPACE</div>
        <nav className="admin-sidebar__nav" aria-label="Crew navigation">
          <button
            type="button"
            className={`admin-sidebar__link${activeSection === 'overview' ? ' is-active' : ''}`}
            onClick={() => navigateTo('crew-overview', 'overview')}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>
          <button
            type="button"
            className={`admin-sidebar__link${activeSection === 'registrations' ? ' is-active' : ''}`}
            onClick={() => navigateTo('crew-registrations', 'registrations')}
          >
            <Users size={18} />
            <span>Registrations</span>
          </button>
        </nav>

        <div className="admin-sidebar__bottom">
          <div className="admin-sidebar__secure">
            <ShieldCheck size={17} />
            <span>Secure crew access</span>
          </div>
          <button type="button" className="admin-sidebar__logout" onClick={onLogout}>
            <LogOut size={17} />
            <span>Sign out</span>
          </button>
          <span className="admin-sidebar__version">CINERO’26 · CREW</span>
        </div>
      </aside>
    </>
  );
}
