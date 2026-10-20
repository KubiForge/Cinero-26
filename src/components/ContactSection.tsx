import React, { useState } from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import './ContactSection.css';
import SocialLinks from './SocialLinks';
import { contactEmail } from '../data/siteLinks';

const showContactAlert = (title: string, text: string, icon: 'success' | 'error') =>
  Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: 'OK',
    confirmButtonColor: '#d4a642',
    background: '#171518',
    color: '#fff',
  });

export const ContactSection: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'general',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
    if (!accessKey) {
      const message = 'The contact form is not configured yet. Please email us directly.';
      setSubmitError(message);
      await showContactAlert('Unable to send message', message, 'error');
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const inquirySubjects: Record<string, string> = {
      general: 'General Inquiries',
      university: 'Inter-University Category Guidelines',
      school: 'Inter-School Category Guidelines',
      submission: 'Submission Portal & Video Specs',
      sponsorship: 'Sponsorship & Media Partnership',
      other: 'Other',
    };

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: accessKey,
          name: formData.name,
          email: formData.email,
          subject: `CINERO'26 - ${inquirySubjects[formData.category] ?? 'Other'}`,
          message: formData.message,
          replyto: formData.email,
          botcheck: '',
        }),
      });
      const result: unknown = await response.json();
      const resultMessage =
        typeof result === 'object' &&
        result !== null &&
        'message' in result &&
        typeof result.message === 'string'
          ? result.message
          : '';

      if (!response.ok) {
        throw new Error(resultMessage || 'The message could not be sent. Please try again.');
      }

      if (
        typeof result !== 'object' ||
        result === null ||
        !('success' in result) ||
        result.success !== true
      ) {
        throw new Error(resultMessage || 'The message could not be sent. Please try again.');
      }

      setSubmitted(true);
      setFormData({ name: '', email: '', category: 'general', message: '' });
      await showContactAlert(
        'Message sent!',
        'Thank you for reaching out to CINERO’26. We will be in touch with you shortly.',
        'success',
      );
    } catch (error) {
      console.error('Web3Forms contact submission failed:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Could not send your message. Please try again or email us directly.';
      setSubmitError(message);
      await showContactAlert('Message not sent', message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="contact-section">
      {/* Background with artwork and ambient overlays */}
      <div className="contact-section__bg" aria-hidden="true">
        <picture className="contact-section__bg-art">
          <source
            type="image/webp"
            srcSet="/images/contact-background-960.webp 960w, /images/contact-background-1600.webp 1600w"
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
                  <button
                    type="button"
                    className="contact-submit-btn"
                    onClick={() => setSubmitted(false)}
                  >
                    Send another message
                  </button>
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
                    <option value="other">Other</option>
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

                {submitError && (
                  <p className="contact-error-msg" role="alert">
                    {submitError}
                  </p>
                )}

                <button type="submit" className="contact-submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send Message'}
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
                <a href={contactEmail.href} className="info-card__value info-card__link">
                  {contactEmail.address}
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
                <div className="info-card__value">J'Pura Voice Filming Division</div>
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
                <div className="info-card__value">Coming Soon</div>
                <p className="info-card__sub">Festival venue details will be announced soon.</p>
              </div>
            </div>

            {/* Social & Community Links */}
            <div className="contact-social-card">
              <span className="info-card__label">CONNECT & FOLLOW</span>
              <p className="social-card__desc">Stay tuned with teaser trailers, shortlists, and behind-the-scenes.</p>
              <SocialLinks className="social-links" linkClassName="social-btn" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
