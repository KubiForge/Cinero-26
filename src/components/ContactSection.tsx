import React, { useState } from 'react';
import './ContactSection.css';

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'general',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', category: 'general', message: '' });
    }, 4000);
  };

  return (
    <section id="contact" className="contact-section">
      {/* Background with artwork and ambient overlays */}
      <div className="contact-section__bg" aria-hidden="true">
        <picture className="contact-section__bg-art">
          <source
            type="image/webp"
            media="(max-width: 768px)"
            srcSet="/images/contact-background-mobile.ab25b803fc.webp 900w"
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet="/images/contact-background.75b51239a3.webp 1672w"
            sizes="100vw"
          />
          <img
            src="/images/contact-background.png"
            alt=""
            width={1672}
            height={941}
            loading="lazy"
            decoding="async"
          />
        </picture>
        <div className="contact-section__overlay-radial" />
        <div className="contact-section__overlay-linear" />
      </div>

      <div className="contact-section__container">
        {/* Header - matching guidelines & timeline design */}
        <div className="contact-section__header">
          <div className="contact-section__eyebrow">
            <span className="eyebrow-text">CINERO’26</span>
            <span className="eyebrow-line" />
          </div>
          <h2 className="contact-section__title">CONTACT US</h2>
          <p className="contact-section__desc">
            Have questions regarding short film submissions, categories, or partnerships?<br />
            Connect with the CINERO’26 organizing team and we will assist you.
          </p>
        </div>

        {/* Content Grid: Form + Info Cards */}
        <div className="contact-section__grid">
          {/* Inquiry Form */}
          <div className="contact-form-card">
            <div className="contact-card__badge-top">
              <span className="contact-badge-dot" />
              <span>SEND A MESSAGE</span>
            </div>

            <h3 className="contact-form__heading">Get in Touch with the Jury & Committee</h3>
            <p className="contact-form__sub">
              Fill out the form below and our team will respond within 24 hours.
            </p>

            {submitted ? (
              <div className="contact-success-msg" role="status">
                <div className="success-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <strong>Message Sent Successfully!</strong>
                  <p>Thank you for reaching out to CINERO’26. We will be in touch with you shortly.</p>
                </div>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="contact-name">Full Name *</label>
                    <input
                      type="text"
                      id="contact-name"
                      required
                      placeholder="e.g. Kasun Perera"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-email">Email Address *</label>
                    <input
                      type="email"
                      id="contact-email"
                      required
                      placeholder="e.g. kasun@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="contact-category">Inquiry Subject</label>
                  <select
                    id="contact-category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="general">General Inquiries</option>
                    <option value="university">Inter-University Category Guidelines</option>
                    <option value="school">Inter-School Category Guidelines</option>
                    <option value="submission">Submission Portal & Video Specs</option>
                    <option value="sponsorship">Sponsorship & Media Partnership</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="contact-message">Message *</label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    placeholder="Type your message, query, or feedback here..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <button type="submit" className="contact-submit-btn">
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Quick Info & Organizer Cards */}
          <div className="contact-info-column">
            {/* Direct Email Card */}
            <div className="contact-info-card">
              <div className="info-card__icon info-card__icon--email">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>
              <div className="info-card__content">
                <span className="info-card__label">OFFICIAL EMAIL</span>
                <a href="mailto:cinero@jpura.voice.lk" className="info-card__value info-card__link">
                  cinero@jpura.voice.lk
                </a>
              </div>
            </div>

            {/* Organizer Card */}
            <div className="contact-info-card">
              <div className="info-card__icon info-card__icon--club">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 20a6 6 0 0 0-12 0" />
                  <circle cx="12" cy="10" r="4" />
                  <circle cx="12" cy="12" r="10" />
                </svg>
              </div>
              <div className="info-card__content">
                <span className="info-card__label">ORGANIZED BY</span>
                <div className="info-card__value">J'Pura Voice</div>
                <p className="info-card__sub">The Official Media Club of the University of Sri Jayewardenepura</p>
              </div>
            </div>

            {/* Location Card */}
            <div className="contact-info-card">
              <div className="info-card__icon info-card__icon--venue">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="info-card__content">
                <span className="info-card__label">FESTIVAL LOCATION</span>
                <div className="info-card__value">University of Sri Jayewardenepura</div>
                <p className="info-card__sub">Gangodawila, Nugegoda, Sri Lanka</p>
              </div>
            </div>

            {/* Social & Community Links */}
            <div className="contact-social-card">
              <span className="info-card__label">CONNECT & FOLLOW</span>
              <p className="social-card__desc">Stay tuned with teaser trailers, shortlists, and behind-the-scenes.</p>
              <div className="social-links">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn"
                  aria-label="Facebook"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn"
                  aria-label="Instagram"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn"
                  aria-label="YouTube"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                    <polygon points="10 15 15 12 10 9 10 15" />
                  </svg>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-btn"
                  aria-label="LinkedIn"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
