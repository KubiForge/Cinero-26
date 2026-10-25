import React from 'react';
import BrandLogo from '../components/BrandLogo';
import './About.css';

interface AboutPageProps {
  onNavigate: (href: string) => void;
}

const BackArrow = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const festivalObjectives = [
  {
    title: 'Creative Storytelling',
    description: 'Inspire stories through imagination and personal perspectives.',
  },
  {
    title: 'Filmmaking Skills',
    description: 'Develop cinematic and technical skills.',
  },
  {
    title: 'Creative Excellence',
    description: 'Recognize outstanding films and filmmaking talent.',
  },
  {
    title: 'Collaboration',
    description: 'Foster teamwork and creative problem solving.',
  },
  {
    title: 'Islandwide Participation',
    description: 'Unite eligible school and university filmmakers across Sri Lanka.',
  },
  {
    title: 'Sustainable Growth',
    description: 'Build a lasting festival and strengthen J’PURA VOICE’s creative identity.',
  },
];

const targetAudience = [
  {
    title: 'Students',
    description: 'Aspiring filmmakers looking for a stage, feedback and peers.',
  },
  {
    title: 'University Community',
    description: 'Undergraduates, staff and families of participants and audience.',
  },
  {
    title: 'Film Enthusiasts',
    description: 'Local audiences who enjoy independent and short cinema.',
  },
  {
    title: 'Industry Guests',
    description: 'Jury members, speakers, sponsors and media partners.',
  },
];

const universityPrizes = [
  { place: '1st Place', prize: 'Rs. 75,000', icon: 'trophy' },
  { place: '2nd Place', prize: 'Rs. 50,000', icon: 'medal' },
  { place: '3rd Place', prize: 'Rs. 30,000', icon: 'award' },
] as const;

const universityIndividualAwards = [
  'Best Director',
  'Best Screenplay',
  'Best Cinematography',
  'Best Editing',
  'Best Makeup Artist',
  'Best Actor',
  'Best Actress',
];

const schoolIndividualAwards = [
  'Best Director',
  'Best Screenplay',
  'Best Cinematography',
  'Best Editing',
  'Best Actor/Actress',
];

const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const goBackHome = () => onNavigate('#home');

  return (
    <div className="about-page">
      <header className="about-page__nav">
        <div className="about-page__nav-inner">
          <button
            type="button"
            className="about-page__back-button"
            onClick={goBackHome}
            aria-label="Back to Home"
          >
            <BackArrow />
            <span className="about-page__back-label">Back to Home</span>
            <span className="about-page__back-short-label">Back</span>
          </button>

          <a
            className="about-page__brand"
            href="#home"
            onClick={(event) => {
              event.preventDefault();
              goBackHome();
            }}
            aria-label="CINERO'26 home"
          >
            <BrandLogo
              variant="withoutCaption"
              sizes="160px"
              alt="CINERO'26"
              className="about-page__brand-logo"
              decoding="async"
            />
          </a>

          <button
            type="button"
            className="about-page__register-button"
            onClick={() => onNavigate('#register')}
          >
            Register
          </button>
        </div>
      </header>

      <main>
        <section id="about" className="about-page__overview">
          <picture className="about-page__background" aria-hidden="true">
            <source
              type="image/webp"
              media="(max-width: 768px)"
              srcSet="/images/about-background-480.webp 480w, /images/about-background-960.webp 960w"
              sizes="100vw"
            />
            <source
              type="image/webp"
              srcSet="/images/about-background-960.webp 960w, /images/about-background-1600.webp 1600w"
              sizes="100vw"
            />
            <img
              src="/images/background%20for%20about%20section%20and%20page.png"
              alt=""
              width={1672}
              height={941}
              fetchPriority="high"
              decoding="async"
            />
          </picture>
          <div className="about-page__overlay" aria-hidden="true" />

          <div className="about-page__overview-content">
            <h1 className="about-page__title">
              <span>WHAT IS</span>
              <span>CINERO’26?</span>
            </h1>

            <article className="about-page__overview-card">
              <h2>Project Overview</h2>
              <p>
                CINERO’26 is an inter-school and inter-university short film festival organized
                by the J'PURA VOICE FILMING DIVISION, the Official Media and Broadcasting Unit
                of the University of Sri Jayewardenepura. The festival aims to provide a platform
                for school students and university undergraduates to express their creativity,
                showcase their storytelling abilities, and explore the art of filmmaking. Through
                this initiative, CINERO’26 seeks to celebrate diverse perspectives, encourage
                cinematic innovation, and nurture the next generation of filmmakers.
              </p>
            </article>
          </div>

        </section>

        <section id="about-concept" className="about-page__concept">
          <picture className="about-page__background" aria-hidden="true">
            <source
              type="image/webp"
              media="(max-width: 768px)"
              srcSet="/images/about-background-480.webp 480w, /images/about-background-960.webp 960w"
              sizes="100vw"
            />
            <source
              type="image/webp"
              srcSet="/images/about-background-960.webp 960w, /images/about-background-1600.webp 1600w"
              sizes="100vw"
            />
            <img
              src="/images/background%20for%20about%20section%20and%20page.png"
              alt=""
              width={1672}
              height={941}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <div className="about-page__concept-overlay" aria-hidden="true" />

          <div className="about-page__concept-content">
            <h2 className="about-page__concept-title">OUR CONCEPT</h2>

            <article className="about-page__concept-card">
              <h3>A Stage for Every Story</h3>
              <p className="about-page__concept-tagline">
                Every story deserves to be told. Every vision deserves to be seen.
              </p>
              <p className="about-page__concept-description">
                CINERO’26 is built on the belief that every individual has a story worth sharing
                and every creative mind deserves an opportunity to express it through cinema. The
                festival brings together school students and university undergraduates, creating
                a platform where imagination meets expression, diverse perspectives find their
                voices, and emerging filmmakers can showcase their creativity through the art of
                storytelling.
              </p>
            </article>
          </div>

        </section>

        <section id="about-purpose" className="about-page__purpose">
          <picture className="about-page__background" aria-hidden="true">
            <source
              type="image/webp"
              media="(max-width: 768px)"
              srcSet="/images/about-background-480.webp 480w, /images/about-background-960.webp 960w"
              sizes="100vw"
            />
            <source
              type="image/webp"
              srcSet="/images/about-background-960.webp 960w, /images/about-background-1600.webp 1600w"
              sizes="100vw"
            />
            <img
              src="/images/background%20for%20about%20section%20and%20page.png"
              alt=""
              width={1672}
              height={941}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <div className="about-page__purpose-overlay" aria-hidden="true" />

          <div className="about-page__purpose-content">
            <h2 className="about-page__purpose-title">OUR PURPOSE</h2>
            <h3 className="about-page__purpose-subtitle">Objectives of CINERO’26</h3>
            <p className="about-page__purpose-intro">
              Inspiring creativity. Empowering storytellers. Celebrating cinema.
            </p>

            <ol className="about-page__objectives">
              {festivalObjectives.map((objective, index) => (
                <li className="about-page__objective" key={objective.title}>
                  <h4>
                    <span>{index + 1}.</span> {objective.title}
                  </h4>
                  <p>{objective.description}</p>
                </li>
              ))}
            </ol>
          </div>

        </section>

        <section id="about-jpura-voice" className="about-page__voice">
          <picture className="about-page__background" aria-hidden="true">
            <source
              type="image/webp"
              media="(max-width: 768px)"
              srcSet="/images/about-background-480.webp 480w, /images/about-background-960.webp 960w"
              sizes="100vw"
            />
            <source
              type="image/webp"
              srcSet="/images/about-background-960.webp 960w, /images/about-background-1600.webp 1600w"
              sizes="100vw"
            />
            <img
              src="/images/background%20for%20about%20section%20and%20page.png"
              alt=""
              width={1672}
              height={941}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <div className="about-page__voice-overlay" aria-hidden="true" />

          <div className="about-page__voice-content">
            <h2 className="about-page__voice-title">ABOUT J’PURA VOICE</h2>
            <article className="about-page__voice-card">
              <p>
                J’PURA VOICE functions as the Official Media &amp; Broadcasting Unit of the
                University of Sri Jayewardenepura and represents 600+ active members across 11
                faculties, making it the largest university media organization in Sri Lanka. The
                unit operates through multiple divisions including Announcing, Debating,
                Dubbing, Filming &amp; Programming, while also managing official platforms such as
                FM J’PURA and J’PURA NEWS. J’PURA VOICE actively supports university events,
                national level competitions, and media productions, while offering students
                direct exposure to real-world media practices.
              </p>
            </article>
          </div>
        </section>

        <section id="about-filming-division" className="about-page__division">
          <picture className="about-page__background" aria-hidden="true">
            <source
              type="image/webp"
              media="(max-width: 768px)"
              srcSet="/images/about-background-480.webp 480w, /images/about-background-960.webp 960w"
              sizes="100vw"
            />
            <source
              type="image/webp"
              srcSet="/images/about-background-960.webp 960w, /images/about-background-1600.webp 1600w"
              sizes="100vw"
            />
            <img
              src="/images/background%20for%20about%20section%20and%20page.png"
              alt=""
              width={1672}
              height={941}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <div className="about-page__division-overlay" aria-hidden="true" />

          <div className="about-page__division-content">
            <div className="about-page__division-heading">
              <h2 className="about-page__division-title">
                ABOUT THE FILMING
                <br />
                DIVISION
              </h2>
            </div>

            <article className="about-page__division-card">
              <p>
                J'PURA VOICE FILMING DIVISION is a dedicated creative unit focused on
                visual storytelling and media production within the University of Sri
                Jayewardenepura. It brings together students with skills in directing,
                cinematography, editing, and production. The division is responsible for
                producing short films, promotional content, and event coverage. It actively
                contributes to university and national level media projects, showcasing student
                creativity and talent. Through hands-on experience, members gain practical
                exposure to real world filmmaking. The division plays a key role in strengthening
                the media presence of J’PURA VOICE.
              </p>
            </article>
          </div>

        </section>

        <section id="about-audience" className="about-page__audience">
          <picture className="about-page__background" aria-hidden="true">
            <source
              type="image/webp"
              media="(max-width: 768px)"
              srcSet="/images/about-background-480.webp 480w, /images/about-background-960.webp 960w"
              sizes="100vw"
            />
            <source
              type="image/webp"
              srcSet="/images/about-background-960.webp 960w, /images/about-background-1600.webp 1600w"
              sizes="100vw"
            />
            <img
              src="/images/background%20for%20about%20section%20and%20page.png"
              alt=""
              width={1672}
              height={941}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <div className="about-page__audience-overlay" aria-hidden="true" />

          <div className="about-page__audience-content">
            <h2 className="about-page__audience-title">TARGET AUDIENCE</h2>
            <h3 className="about-page__audience-subtitle">Who We Are Inviting?</h3>

            <ul className="about-page__audience-grid">
              {targetAudience.map((audience) => (
                <li className="about-page__audience-card" key={audience.title}>
                  <h4>{audience.title}</h4>
                  <p>{audience.description}</p>
                </li>
              ))}
            </ul>
          </div>

        </section>

        <section id="about-awards" className="about-page__awards">
          <picture className="about-page__background" aria-hidden="true">
            <source
              type="image/webp"
              media="(max-width: 768px)"
              srcSet="/images/about-background-480.webp 480w, /images/about-background-960.webp 960w"
              sizes="100vw"
            />
            <source
              type="image/webp"
              srcSet="/images/about-background-960.webp 960w, /images/about-background-1600.webp 1600w"
              sizes="100vw"
            />
            <img
              src="/images/background%20for%20about%20section%20and%20page.png"
              alt=""
              width={1672}
              height={941}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <div className="about-page__awards-overlay" aria-hidden="true" />

          <div className="about-page__awards-content">
            <h2 className="about-page__awards-title">AWARDS &amp; RECOGNITION</h2>

            <div className="about-page__awards-grid">
            <article className="about-page__award-panel">
              <header className="about-page__category-heading">
                <span className="about-page__category-kicker">CATEGORY 01</span>
                <h3>INTER-UNIVERSITY</h3>
              </header>
              <p className="about-page__award-subtitle">Best Film — Cash Prizes</p>

              <ul className="about-page__prizes">
                {universityPrizes.map(({ place, prize, icon }) => (
                  <li className="about-page__prize" key={place}>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      {icon === 'trophy' && (
                        <>
                          <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
                          <path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4" />
                        </>
                      )}
                      {icon === 'medal' && (
                        <>
                          <circle cx="12" cy="14" r="5" />
                          <path d="m8.5 10.5-2-7h4l1.5 5M15.5 10.5l2-7h-4L12 8.5" />
                          <path d="m10 14 1.3 1.3L14 12.5" />
                        </>
                      )}
                      {icon === 'award' && (
                        <>
                          <circle cx="12" cy="8" r="5" />
                          <path d="m8.5 12-1 9 4.5-2.5 4.5 2.5-1-9" />
                        </>
                      )}
                    </svg>
                    <span>{place}</span>
                    <strong>{prize}</strong>
                  </li>
                ))}
              </ul>

              <section className="about-page__individual-awards">
                <header>
                  <h4>Individual Awards</h4>
                  <span>{universityIndividualAwards.length} recognitions</span>
                </header>
                <ul className="about-page__individual-awards-grid">
                  {universityIndividualAwards.map((award) => (
                    <li key={award}>
                      <span aria-hidden="true">✦</span>
                      {award}
                    </li>
                  ))}
                </ul>
              </section>
            </article>

            <article className="about-page__award-panel about-page__award-panel--school">
              <header className="about-page__category-heading">
                <span className="about-page__category-kicker">CATEGORY 02</span>
                <h3>INTER-SCHOOL</h3>
              </header>
              <p className="about-page__award-subtitle">Best Film — Awards for 1st, 2nd &amp; 3rd Place</p>

              <ul className="about-page__school-placements">
                {['1st Place', '2nd Place', '3rd Place'].map((place, index) => (
                  <li key={place}>
                    <span className="about-page__placement-number">0{index + 1}</span>
                    <strong>{place}</strong>
                    <span>Trophy &amp; Certificate</span>
                  </li>
                ))}
              </ul>

              <section className="about-page__individual-awards">
                <header>
                  <h4>Individual Awards</h4>
                  <span>{schoolIndividualAwards.length} recognitions</span>
                </header>
                <ul className="about-page__individual-awards-grid">
                  {schoolIndividualAwards.map((award) => (
                    <li key={award}>
                      <span aria-hidden="true">✦</span>
                      {award}
                    </li>
                  ))}
                </ul>
              </section>
              <p className="about-page__award-note">No Cash Prizes</p>
            </article>
            </div>
          </div>
        </section>

        {/* Key Personnel Section */}
        <section id="about-personnel" className="about-page__personnel">
          <picture className="about-page__background" aria-hidden="true">
            <source
              type="image/webp"
              media="(max-width: 768px)"
              srcSet="/images/about-background-480.webp 480w, /images/about-background-960.webp 960w"
              sizes="100vw"
            />
            <source
              type="image/webp"
              srcSet="/images/about-background-960.webp 960w, /images/about-background-1600.webp 1600w"
              sizes="100vw"
            />
            <img
              src="/images/background%20for%20about%20section%20and%20page.png"
              alt=""
              width={1672}
              height={941}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <div className="about-page__personnel-overlay" aria-hidden="true" />

          <div className="about-page__personnel-content">
            <h2 className="about-page__personnel-title">KEY PERSONNEL</h2>
            <p className="about-page__personnel-subtitle">
              Leadership &amp; Organizing Committee of CINERO’26
            </p>

            <div className="about-page__personnel-grid">
              {/* Row 1, Member 1: Michael Fernando */}
              <article className="personnel-card">
                <div className="personnel-card__photo-wrap">
                  <img
                    src="/images/personnel/michael-fernando.png"
                    alt="Michael Fernando"
                    className="personnel-card__photo"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.classList.add('personnel-card__photo-wrap--fallback');
                        target.parentElement.setAttribute('data-initials', 'MF');
                      }
                    }}
                  />
                </div>
                <div className="personnel-card__info">
                  <a
                    href="tel:+94768071233"
                    className="personnel-card__contact-row personnel-card__contact-row--phone"
                  >
                    <span className="personnel-card__contact-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    <span className="personnel-card__phone-num">+94 76 807 1233</span>
                  </a>

                  <h3 className="personnel-card__name">Michael Fernando</h3>
                  <div className="personnel-card__roles">
                    <span className="personnel-card__role">Divisional Head – Term 25/26</span>
                    <span className="personnel-card__org">Filming Division</span>
                  </div>

                  <a
                    href="mailto:michaelfer0114nando@gmail.com"
                    className="personnel-card__contact-row personnel-card__contact-row--email"
                  >
                    <span className="personnel-card__contact-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </span>
                    <span className="personnel-card__email-text">michaelfer0114nando@gmail.com</span>
                  </a>
                </div>
              </article>

              {/* Row 1, Member 2: Asintha Diwan */}
              <article className="personnel-card">
                <div className="personnel-card__photo-wrap">
                  <img
                    src="/images/personnel/asintha-diwan.png"
                    alt="Asintha Diwan"
                    className="personnel-card__photo"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.classList.add('personnel-card__photo-wrap--fallback');
                        target.parentElement.setAttribute('data-initials', 'AD');
                      }
                    }}
                  />
                </div>
                <div className="personnel-card__info">
                  <a
                    href="tel:+94712552174"
                    className="personnel-card__contact-row personnel-card__contact-row--phone"
                  >
                    <span className="personnel-card__contact-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    <span className="personnel-card__phone-num">+94 71 255 2174</span>
                  </a>

                  <h3 className="personnel-card__name">Asintha Diwan</h3>
                  <div className="personnel-card__roles">
                    <span className="personnel-card__role">Assistant Divisional Head – Term 25/26</span>
                    <span className="personnel-card__org">Filming Division</span>
                  </div>

                  <a
                    href="mailto:asinthadiw@gmail.com"
                    className="personnel-card__contact-row personnel-card__contact-row--email"
                  >
                    <span className="personnel-card__contact-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </span>
                    <span className="personnel-card__email-text">asinthadiw@gmail.com</span>
                  </a>
                </div>
              </article>

              {/* Row 2, Member 3: Rishini Wijethilaka */}
              <article className="personnel-card">
                <div className="personnel-card__photo-wrap">
                  <img
                    src="/images/personnel/rishini-wijethilaka.png"
                    alt="Rishini Wijethilaka"
                    className="personnel-card__photo"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.classList.add('personnel-card__photo-wrap--fallback');
                        target.parentElement.setAttribute('data-initials', 'RW');
                      }
                    }}
                  />
                </div>
                <div className="personnel-card__info">
                  <a
                    href="tel:+94714850920"
                    className="personnel-card__contact-row personnel-card__contact-row--phone"
                  >
                    <span className="personnel-card__contact-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    <span className="personnel-card__phone-num">+94 71 485 0920</span>
                  </a>

                  <h3 className="personnel-card__name">Rishini Wijethilaka</h3>
                  <div className="personnel-card__roles">
                    <span className="personnel-card__role">Task Master – Term 25/26</span>
                    <span className="personnel-card__org">Filming Division</span>
                  </div>

                  <a
                    href="mailto:rishinisewwandi16@gmail.com"
                    className="personnel-card__contact-row personnel-card__contact-row--email"
                  >
                    <span className="personnel-card__contact-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </span>
                    <span className="personnel-card__email-text">rishinisewwandi16@gmail.com</span>
                  </a>
                </div>
              </article>

              {/* Row 2, Member 4: Isuri Sathyangana */}
              <article className="personnel-card">
                <div className="personnel-card__photo-wrap">
                  <img
                    src="/images/personnel/isuri-sathyangana.png"
                    alt="Isuri Sathyangana"
                    className="personnel-card__photo"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.classList.add('personnel-card__photo-wrap--fallback');
                        target.parentElement.setAttribute('data-initials', 'IS');
                      }
                    }}
                  />
                </div>
                <div className="personnel-card__info">
                  <a
                    href="tel:+94712938590"
                    className="personnel-card__contact-row personnel-card__contact-row--phone"
                  >
                    <span className="personnel-card__contact-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    <span className="personnel-card__phone-num">+94 71 293 8590</span>
                  </a>

                  <h3 className="personnel-card__name">Isuri Sathyangana</h3>
                  <div className="personnel-card__roles">
                    <span className="personnel-card__role">Task Master – Term 25/26</span>
                    <span className="personnel-card__org">Filming Division</span>
                  </div>

                  <a
                    href="mailto:isuriekanayake111@gmail.com"
                    className="personnel-card__contact-row personnel-card__contact-row--email"
                  >
                    <span className="personnel-card__contact-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </span>
                    <span className="personnel-card__email-text">isuriekanayake111@gmail.com</span>
                  </a>
                </div>
              </article>

              {/* Row 3, Member 5: Nuwan Sampath */}
              <article className="personnel-card">
                <div className="personnel-card__photo-wrap">
                  <img
                    src="/images/personnel/nuwan-sampath.png"
                    alt="Nuwan Sampath"
                    className="personnel-card__photo"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.classList.add('personnel-card__photo-wrap--fallback');
                        target.parentElement.setAttribute('data-initials', 'NS');
                      }
                    }}
                  />
                </div>
                <div className="personnel-card__info">
                  <a
                    href="tel:+94712741085"
                    className="personnel-card__contact-row personnel-card__contact-row--phone"
                  >
                    <span className="personnel-card__contact-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    <span className="personnel-card__phone-num">+94 71 274 1085</span>
                  </a>

                  <h3 className="personnel-card__name">Nuwan Sampath</h3>
                  <div className="personnel-card__roles">
                    <span className="personnel-card__role">Project Director</span>
                    <span className="personnel-card__org">CINERO’26</span>
                  </div>

                  <a
                    href="mailto:nuwansjayalal@gmail.com"
                    className="personnel-card__contact-row personnel-card__contact-row--email"
                  >
                    <span className="personnel-card__contact-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </span>
                    <span className="personnel-card__email-text">nuwansjayalal@gmail.com</span>
                  </a>
                </div>
              </article>

              {/* Row 3, Member 6: Dumini Rasnayake */}
              <article className="personnel-card">
                <div className="personnel-card__photo-wrap">
                  <img
                    src="/images/personnel/dumini-rasnayake.png"
                    alt="Dumini Rasnayake"
                    className="personnel-card__photo"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      if (target.parentElement) {
                        target.parentElement.classList.add('personnel-card__photo-wrap--fallback');
                        target.parentElement.setAttribute('data-initials', 'DR');
                      }
                    }}
                  />
                </div>
                <div className="personnel-card__info">
                  <a
                    href="tel:+94713733206"
                    className="personnel-card__contact-row personnel-card__contact-row--phone"
                  >
                    <span className="personnel-card__contact-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </span>
                    <span className="personnel-card__phone-num">+94 71 373 3206</span>
                  </a>

                  <h3 className="personnel-card__name">Dumini Rasnayake</h3>
                  <div className="personnel-card__roles">
                    <span className="personnel-card__role">Project Secretary</span>
                    <span className="personnel-card__org">CINERO’26</span>
                  </div>

                  <a
                    href="mailto:dumini.rasnayake@gmail.com"
                    className="personnel-card__contact-row personnel-card__contact-row--email"
                  >
                    <span className="personnel-card__contact-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </span>
                    <span className="personnel-card__email-text">dumini.rasnayake@gmail.com</span>
                  </a>
                </div>
              </article>
            </div>
          </div>

          <div className="about-page__bottom-actions">
            <button
              type="button"
              className="about-page__back-button about-page__back-button--bottom"
              onClick={goBackHome}
            >
              <BackArrow />
              <span>Back to Home</span>
            </button>
            <button
              type="button"
              className="about-page__proceed-button"
              onClick={() => onNavigate('#register')}
            >
              Proceed to Registration
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;
