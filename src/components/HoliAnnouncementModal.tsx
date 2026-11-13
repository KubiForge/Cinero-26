import { createPortal } from 'react-dom';
import { useCallback, useEffect, useRef, useState } from 'react';
import './HoliAnnouncementModal.css';

const ANNOUNCEMENT_SESSION_KEY = 'cinero26-holi-announcement-shown';
const CLOSE_ANIMATION_DURATION = 220;

const isHomepage = () => {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  return path === '/' || path === '/index.html';
};

export default function HoliAnnouncementModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const isClosingRef = useRef(false);

  const closeModal = useCallback(() => {
    if (isClosingRef.current) return;

    isClosingRef.current = true;
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
      isClosingRef.current = false;
    }, CLOSE_ANIMATION_DURATION);
  }, []);

  useEffect(() => {
    if (!isHomepage()) return;

    try {
      if (window.sessionStorage.getItem(ANNOUNCEMENT_SESSION_KEY) === 'shown') return;
    } catch (error) {
      console.warn('Holi announcement session storage is unavailable:', error);
    }

    const showTimer = window.setTimeout(() => {
      if (!isHomepage()) return;

      try {
        if (window.sessionStorage.getItem(ANNOUNCEMENT_SESSION_KEY) === 'shown') return;
        window.sessionStorage.setItem(ANNOUNCEMENT_SESSION_KEY, 'shown');
      } catch (error) {
        console.warn('Could not save Holi announcement session state:', error);
      }

      setIsOpen(true);
    }, 1000);

    return () => window.clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
      } else if (event.key === 'Tab') {
        event.preventDefault();
        closeButtonRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    closeButtonRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
      if (previouslyFocused?.isConnected) {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [closeModal, isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={`holi-announcement__backdrop${isClosing ? ' is-closing' : ''}`}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <div
        className={`holi-announcement__dialog${isClosing ? ' is-closing' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="CINERO'26 Holi Fest announcement"
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="holi-announcement__close"
          aria-label="Close announcement"
          onClick={closeModal}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        <img
          className="holi-announcement__poster"
          src="/images/holi-fest-poster.png"
          alt="CINERO'26 Holi Fest promotional poster"
          width={1080}
          height={1080}
          decoding="async"
        />
      </div>
    </div>,
    document.body,
  );
}
