import React, { useState } from 'react';
import './CrewLogin.css';
import BrandLogo from '../components/BrandLogo';
import PageHeader from '../components/PageHeader';

interface CrewLoginProps {
  onBack: () => void;
  onLoginSuccess: () => void;
  onRegisterClick?: () => void;
}

export const CrewLoginPage: React.FC<CrewLoginProps> = ({ onBack, onLoginSuccess, onRegisterClick }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const clearFormState = () => {
    setIdentifier('');
    setPassword('');
    setShowPassword(false);
    setRememberMe(false);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError('');

    if (!identifier.trim()) {
      setError('Please enter your crew email or username.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${window.location.origin}/api/crew-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });

      const data = await res.json() as { success: boolean; message?: string; token?: string; user?: { username: string; role: string } };

      if (!res.ok || !data.success) {
        setError(data.message ?? 'Login failed. Please try again.');
        setIsLoading(false);
        return;
      }

      if (rememberMe) {
        localStorage.setItem('crewToken', data.token ?? '');
        localStorage.setItem('crewUser', JSON.stringify(data.user ?? {}));
      } else {
        sessionStorage.setItem('crewToken', data.token ?? '');
        sessionStorage.setItem('crewUser', JSON.stringify(data.user ?? {}));
      }

      clearFormState();
      setIsLoading(false);
      onLoginSuccess();
    } catch {
      setIsLoading(false);
      setError('Network error. Please check your connection and try again.');
    }
  };

  return (
    <div className="crew-login-page">
      <PageHeader
        onBack={onBack}
        showRegisterButton={false}
        onRegisterClick={onRegisterClick ?? (() => {
          window.location.hash = '#register';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        })}
      />

      <div className="crew-login__body">
        <div className="crew-login__left" aria-hidden="true">
          <div className="crew-login__left-overlay" />

          <div className="crew-login__branding">
            <div className="crew-login__division-label">
              <span className="crew-login__division-name">J'PURA VOICE</span>
              <span className="crew-login__division-sub">FILMING DIVISION</span>
            </div>

            <BrandLogo
              variant="withCaption"
              sizes="(max-width: 900px) 180px, 430px"
              alt="CINERO'26"
              className="crew-login__brand-logo"
              loading="eager"
              decoding="async"
            />

            <div className="crew-login__tagline-row" aria-hidden="true">
              <span className="crew-login__tagline-line" />
              <span className="crew-login__tagline-diamond">◆</span>
              <span className="crew-login__tagline-line" />
            </div>

            <p className="crew-login__tagline">A STAGE FOR EVERY STORY</p>
          </div>
        </div>

        <div className="crew-login__right">
          <div className="crew-login__card">
            <div className="crew-login__icon-wrap" aria-hidden="true">
              <svg className="crew-login__clapper-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="20" width="52" height="36" rx="4" fill="#1a1010" stroke="#c5292a" strokeWidth="2"/>
                <rect x="6" y="10" width="52" height="12" rx="3" fill="#c5292a"/>
                <rect x="17" y="10" width="6" height="12" fill="#1a1010"/>
                <rect x="31" y="10" width="6" height="12" fill="#1a1010"/>
                <rect x="45" y="10" width="6" height="12" fill="#1a1010"/>
                <line x1="6" y1="22" x2="58" y2="22" stroke="#c5292a" strokeWidth="1.5"/>
                <path d="M24 33 L24 47 L40 40 Z" fill="#c5292a" opacity="0.9"/>
              </svg>
            </div>

            <h1 className="crew-login__heading">
              Crew <span className="crew-login__heading-accent">Login</span>
            </h1>

            <p className="crew-login__desc">
              Exclusive access for CINERO'26 Crew Members
            </p>

            <div className="crew-login__divider" aria-hidden="true">
              <span className="crew-login__divider-line" />
              <span className="crew-login__divider-diamond">◆</span>
              <span className="crew-login__divider-line" />
            </div>

            <form className="crew-login__form" onSubmit={handleSubmit} noValidate autoComplete="on">
              <div className="cl-input-group">
                <span className="cl-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M2 7l10 7 10-7" />
                  </svg>
                </span>
                <input
                  id="crew-identifier"
                  type="text"
                  className="cl-input"
                  placeholder="Crew Email / Username"
                  value={identifier}
                  onChange={(e) => { setIdentifier(e.target.value); setError(''); }}
                  autoComplete="username"
                  name="crewIdentifier"
                  inputMode="email"
                  aria-label="Crew Email or Username"
                  disabled={isLoading}
                />
              </div>

              <div className="cl-input-group">
                <span className="cl-input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  id="crew-password"
                  type={showPassword ? 'text' : 'password'}
                  className="cl-input cl-input--password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password"
                  name="crewPassword"
                  aria-label="Password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="cl-btn-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              <div className="cl-checkbox-row">
                <label className="cl-checkbox-label">
                  <input
                    type="checkbox"
                    className="cl-checkbox-native"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span className="cl-checkbox-box" aria-hidden="true" />
                  <span className="cl-checkbox-text">Remember Me</span>
                </label>
                <button type="button" className="cl-forgot" aria-label="Forgot Password">Forgot Password?</button>
              </div>

              {error && (
                <div className="cl-error" role="alert">
                  <svg className="cl-error__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className={`cl-submit-btn${isLoading ? ' cl-submit-btn--loading' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="cl-spinner" aria-hidden="true" />
                    <span>Authenticating…</span>
                  </>
                ) : (
                  <>
                    <span>Login to Crew Portal</span>
                    <svg className="cl-submit-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="cl-badge-wrap">
              <div className="cl-badge">
                <svg className="cl-badge__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span>Crew Members Only</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CrewLoginPage;
