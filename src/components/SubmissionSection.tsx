import React from 'react';

interface SubmissionSectionProps {
  onSubmitClick: () => void;
}

const SubmissionSection: React.FC<SubmissionSectionProps> = ({ onSubmitClick }) => {
  return (
    <section id="submission" className="section section--register section--submission">
      <picture className="section-bg-art section-bg-art--register" aria-hidden="true">
        <source
          type="image/webp"
          media="(max-width: 768px)"
          srcSet="/images/registration-background-480.webp 480w, /images/registration-background-960.webp 960w"
          sizes="100vw"
        />
        <source
          type="image/webp"
          srcSet="/images/registration-background-960.webp 960w, /images/registration-background-1600.webp 1600w"
          sizes="100vw"
        />
        <img
          src="/images/background%20for%20registration%20section%20and%20page.png"
          alt=""
          width={1672}
          height={941}
          loading="lazy"
          decoding="async"
        />
      </picture>
      <div className="section-container">
        <div className="register-card">
          <div className="guidelines-section__eyebrow register-card__eyebrow">
            <span className="eyebrow-text">CINERO'26</span>
            <span className="eyebrow-line" />
          </div>
          <h2 className="register-card__title">SUBMISSION</h2>
          <p>
            Submit your short film to CINERO'26 from November 15 to December 14, 2026.
            <br />
            Film submissions open on 15 November 2026.
          </p>
          <button
            type="button"
            className="register-btn"
            onClick={onSubmitClick}
          >
            <span>Submit Your Film</span>
            <span className="about-preview__button-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default SubmissionSection;
