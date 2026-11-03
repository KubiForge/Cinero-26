import { useState, type FormEvent } from 'react';
import { ArrowLeft, Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-react';
import BrandLogo from '../components/BrandLogo';
import { CrewApiError, login } from '../lib/crewApi';
import './Crew.css';

interface CrewLoginProps {
  onBack: () => void;
  onLogin: () => void;
}

export default function CrewLogin({ onBack, onLogin }: CrewLoginProps) {
  const [username, setUsername] = useState(() => localStorage.getItem('cinero-crew-username') ?? '');
  const [rememberUsername, setRememberUsername] = useState(() => localStorage.getItem('cinero-crew-username') !== null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (rememberUsername) {
        localStorage.setItem('cinero-crew-username', username.trim());
      } else {
        localStorage.removeItem('cinero-crew-username');
      }
      await login(username.trim(), password);
      setPassword('');
      onLogin();
    } catch (requestError) {
      setError(requestError instanceof CrewApiError
        ? requestError.message
        : 'Unable to sign in right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-backdrop" aria-hidden="true" />
      <header className="admin-login-header">
        <a
          href="/"
          className="admin-login-brand"
          onClick={(event) => {
            event.preventDefault();
            onBack();
          }}
        >
          <BrandLogo
            variant="withCaption"
            alt="CINERO’26"
            sizes="(max-width: 600px) 140px, 185px"
          />
        </a>
        <span className="admin-login-header__label"><ShieldCheck size={16} /> CREW COORDINATOR ACCESS</span>
      </header>

      <section className="admin-login-card" aria-labelledby="admin-login-title">
        <div className="admin-login-card__emblem"><LockKeyhole size={23} /></div>
        <span className="admin-eyebrow">CINERO’26 · CREW PORTAL</span>
        <h1 id="admin-login-title">Welcome back</h1>
        <p className="admin-login-card__description">
          A Stage for Every Story. Sign in to coordinate the festival.
        </p>

        <form className="admin-login-form" onSubmit={(event) => void handleSubmit(event)}>
          <label htmlFor="crew-username">Username</label>
          <input
            id="crew-username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="crew.cinero"
            maxLength={128}
            required
          />

          <label htmlFor="crew-password">Password</label>
          <div className="admin-password-field">
            <input
              id="crew-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              maxLength={256}
              required
            />
            <button
              type="button"
              className="admin-password-toggle"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              onClick={() => setShowPassword((visible) => !visible)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <label className="crew-remember-username">
            <input
              type="checkbox"
              checked={rememberUsername}
              onChange={(event) => setRememberUsername(event.target.checked)}
            />
            Remember username only
          </label>

          {error && <p className="admin-login-error" role="alert">{error}</p>}

          <button type="submit" className="admin-primary-button admin-login-submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Enter Crew Portal'}
          </button>
        </form>

        <div className="admin-login-card__security">
          <ShieldCheck size={15} />
          <span>Secure crew access · Sessions expire automatically</span>
        </div>
      </section>

      <button type="button" className="admin-login-back" onClick={onBack}>
        <ArrowLeft size={16} /> Return to CINERO’26
      </button>
      <span className="admin-login-footer">AUTHORIZED CINERO’26 CREW ONLY</span>
    </main>
  );
}
