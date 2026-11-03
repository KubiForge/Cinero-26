import BrandLogo from './BrandLogo';
import './PageHeader.css';

interface PageHeaderProps {
  onBack: () => void;
  onRegisterClick?: () => void;
  showRegisterButton?: boolean;
}

export default function PageHeader({ onBack, onRegisterClick, showRegisterButton = true }: PageHeaderProps) {
  const handleBrandClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    onBack();
  };

  return (
    <header className="page-nav">
      <div className="page-nav__inner">
        <button
          type="button"
          className="page-nav__back-button"
          onClick={onBack}
          aria-label="Back to Home"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span className="page-nav__back-label">Back to Home</span>
          <span className="page-nav__back-short-label">Back</span>
        </button>

        <a
          className="page-nav__brand"
          href="#home"
          onClick={handleBrandClick}
          aria-label="CINERO'26 home"
        >
          <BrandLogo
            variant="withoutCaption"
            sizes="160px"
            alt="CINERO'26"
            className="page-nav__brand-logo"
            decoding="async"
          />
        </a>

        {showRegisterButton && (
          <button
            type="button"
            className="page-nav__register-button"
            onClick={onRegisterClick ?? onBack}
          >
            Register
          </button>
        )}
      </div>
    </header>
  );
}
