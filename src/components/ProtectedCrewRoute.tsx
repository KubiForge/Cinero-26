import { useEffect, useState, type ReactNode } from 'react';
import { AlertCircle, LoaderCircle } from 'lucide-react';
import { CrewApiError, validateSession } from '../lib/crewApi';

interface ProtectedCrewRouteProps {
  children: ReactNode;
  onSessionExpired: () => void;
}

export default function ProtectedCrewRoute({
  children,
  onSessionExpired,
}: ProtectedCrewRouteProps) {
  const [status, setStatus] = useState<'checking' | 'ready' | 'error'>('checking');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const verify = async () => {
      try {
        await validateSession();
        if (active) setStatus('ready');
      } catch (requestError) {
        if (!active) return;
        if (requestError instanceof CrewApiError && requestError.status === 401) {
          onSessionExpired();
          return;
        }
        setError(requestError instanceof Error ? requestError.message : 'Unable to verify your session.');
        setStatus('error');
      }
    };
    void verify();
    return () => {
      active = false;
    };
  }, [onSessionExpired]);

  if (status === 'ready') {
    return children;
  }

  if (status === 'error') {
    return (
      <main className="admin-route-state">
        <div className="admin-route-state__card">
          <AlertCircle size={25} />
          <h1>Could not verify your session</h1>
          <p>{error}</p>
          <button
            type="button"
            className="admin-primary-button"
            onClick={() => {
              setError('');
              setStatus('checking');
              void validateSession()
                .then(() => setStatus('ready'))
                .catch((requestError: unknown) => {
                  if (requestError instanceof CrewApiError && requestError.status === 401) {
                    onSessionExpired();
                    return;
                  }
                  setError(requestError instanceof Error ? requestError.message : 'Unable to verify your session.');
                  setStatus('error');
                });
            }}
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-route-state" role="status" aria-live="polite">
      <LoaderCircle className="admin-spinner" size={28} />
      <span>Verifying secure crew access…</span>
    </main>
  );
}
