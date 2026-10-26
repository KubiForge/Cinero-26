import React, { useState, useEffect } from 'react';
import './Guidlines.css';
import BrandLogo from '../components/BrandLogo';

interface GuidelineSection {
  title: string;
  subtitle: string;
  items?: string[];
  groups?: {
    introduction: string;
    items: string[];
  }[];
  notes?: string[];
}

export interface GuidlinesPageProps {
  initialCategory?: 'university' | 'school';
  onBack: () => void;
  onRegisterClick?: () => void;
}

export const GuidlinesPage: React.FC<GuidlinesPageProps> = ({
  initialCategory = 'university',
  onBack,
  onRegisterClick,
}) => {
  const [activeCategory, setActiveCategory] = useState<'university' | 'school'>(initialCategory);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeCategory]);

  const isUniversity = activeCategory === 'university';
  const commonGuidelineSections: GuidelineSection[] = [
    {
      title: 'Registration Requirement:',
      subtitle: '1. FESTIVAL GUIDELINES — Common Rules for Both Categories',
      items: [
        'Only teams that have successfully completed the official CINERO’26 registration process are eligible to submit films. Film submissions from unregistered teams will not be accepted or considered for the competition.',
      ],
    },
    {
      title: '1.1 Originality and Copyright',
      subtitle: '1. FESTIVAL GUIDELINES — Common Rules for Both Categories',
      items: [
        'All submitted films must be original works created by the participating team.',
        'Submitted films must remain unpublished on all open-access streaming platforms, including YouTube and Facebook, throughout the competition period.',
        'Music, footage, images, graphics, fonts, and other materials must be original, royalty-free, or properly licensed.',
        'Participants are responsible for obtaining the necessary permissions for all copyrighted materials used in their films.',
        "Films must not contain plagiarism or unauthorized use of another person's work.",
      ],
    },
    {
      title: '1.2 Language and Subtitles',
      subtitle: '1. FESTIVAL GUIDELINES — Common Rules for Both Categories',
      items: [
        'All films must include embedded English subtitles so that the judges and audience can understand the content.',
        'Separate dialogue lists will not be accepted as a replacement for subtitles.',
      ],
    },
    {
      title: '1.3 Technical Requirements',
      subtitle: '1. FESTIVAL GUIDELINES — Common Rules for Both Categories',
      items: [
        'All submitted films must meet the following technical requirements:',
        'File format: MP4 or MOV',
        'Resolution: Full HD (1920 × 1080) or higher',
        'Video codec: H.264',
        'Audio: 2.0 Stereo',
      ],
    },
    {
      title: '1.4 Promotional Rights',
      subtitle: '1. FESTIVAL GUIDELINES — Common Rules for Both Categories',
      items: [
        'By participating, teams grant CINERO’26 non-exclusive permission to use their film posters, trailers, selected clips, and team photographs for festival-related promotional purposes.',
        'The original ownership of the films remains with their creators.',
      ],
    },
    {
      title: '1.5 Judging and Final Decisions',
      subtitle: '1. FESTIVAL GUIDELINES — Common Rules for Both Categories',
      items: [
        'Films will be evaluated by a panel of judges with relevant filmmaking expertise.',
        "The judging panel's decisions on awards and rankings will be final.",
        'The Organizing Committee reserves the right to reject entries that do not comply with the official guidelines.',
      ],
    },
  ];
  const schoolGuidelineSections: GuidelineSection[] = [
    {
      title: '2.1 Eligibility and Participation',
      subtitle: '2. INTER-SCHOOL CATEGORY GUIDELINES — Rules Specifically for School Students',
      items: [
        'The competition is open to students currently studying in Grades 6–13 at schools.',
        'Students who are sitting for or registered for the G.C.E. Advanced Level (A/L) examination are not eligible to participate.',
        'Each team must represent one eligible school. Students from different schools cannot form a team together.',
        'Each team must consist of a minimum of 4 members and a maximum of 15 members.',
        'Each student may participate in only one team.',
        'Each school or team may submit only one film.',
        'Participants must provide proof of current student status through a student confirmation letter signed by the school principal.',
      ],
    },
    {
      title: '2.2 Teacher Supervision',
      subtitle: '2. INTER-SCHOOL CATEGORY GUIDELINES — Rules Specifically for School Students',
      items: [
        'Each participating school must appoint one teacher as the team’s guardian.',
        "The teacher must supervise and accompany the team throughout the competition and at the award ceremony.",
      ],
    },
    {
      title: '2.3 Film Requirements',
      subtitle: '2. INTER-SCHOOL CATEGORY GUIDELINES — Rules Specifically for School Students',
      items: [
        'Films must be created on or after 1 January 2026.',
        'The film must have a running time of 5–15 minutes, including opening and closing credits.',
        'The topic and genre are open, provided the content is appropriate for school students.',
        'Films may be produced in any language, but embedded English subtitles are compulsory.',
        "AI tools may be used only if they do not compromise the film's originality, authenticity, or human creative quality.",
        'The Organizing Committee may request raw footage, behind-the-scenes videos, project files, or production records to verify when a film was created.',
      ],
    },
    {
      title: '2.4 External Assistance',
      subtitle: '2. INTER-SCHOOL CATEGORY GUIDELINES — Rules Specifically for School Students',
      items: [
        'Professional filmmakers, paid actors, and external production houses must not be involved in producing the submitted film.',
        'The film must be created by the participating students.',
      ],
    },
    {
      title: '2.5 Registration and Submission',
      subtitle: '2. INTER-SCHOOL CATEGORY GUIDELINES — Rules Specifically for School Students',
      items: [
        'Registration fee: LKR 2,000 per team.',
        'Teams must register and submit their films through the official links provided by the Organizing Committee.',
        'A member of the Organizing Committee will contact the team via WhatsApp or telephone to confirm receipt.',
        'All submissions must be completed before the official deadline. Late submissions will not be accepted.',
      ],
    },
    {
      title: '2.6 Judging and Awards',
      subtitle: '2. INTER-SCHOOL CATEGORY GUIDELINES — Rules Specifically for School Students',
      groups: [
        {
          introduction: 'Films will be evaluated by a panel of judges based on the following criteria:',
          items: [
            'Storytelling and screenplay',
            'Acting and performances',
            'Directing and creative vision',
            'Cinematography and visual quality',
            'Editing and technical execution',
          ],
        },
        {
          introduction: 'Awards will be presented in the following categories:',
          items: [
            'Best Director',
            'Best Screenplay',
            'Best Actor/Actress (Best Performer)',
            'Best Cinematographer',
            'Best Editor',
          ],
        },
      ],
      notes: [
        'School-category films will not be publicly screened at the festival venue.',
        'Winners will receive official awards, trophies, and certificates.',
        'Cash prizes will not be awarded in the Inter-School category.',
      ],
    },
  ];
  const universityGuidelineSections: GuidelineSection[] = [
    {
      title: '2.1 Eligibility and Participation',
      subtitle: '2. INTER-UNIVERSITY CATEGORY GUIDELINES — Rules Specifically for University Undergraduates',
      items: [
        'The competition is open to currently enrolled undergraduate students of recognized universities.',
        'Graduates are not eligible to participate.',
        'All team members must be from the same university. Students from different universities cannot form a team together.',
        'Each team must consist of a minimum of 4 members and a maximum of 15 members.',
        'Each student may participate in only one team.',
        'A university may register multiple teams.',
      ],
    },
    {
      title: '2.2 Film Requirements',
      subtitle: '2. INTER-UNIVERSITY CATEGORY GUIDELINES — Rules Specifically for University Undergraduates',
      items: [
        'Films must be created on or after 1 January 2026.',
        'The film must have a running time of 5–15 minutes, including opening and closing credits.',
        'The topic is open, but pornography, nudity, explicit violence, harmful content, and personal insults are prohibited.',
        'Films must be in Sinhala, Tamil, or English.',
        'Embedded English subtitles are compulsory.',
      ],
    },
    {
      title: '2.3 Required Submission Materials',
      subtitle: '2. INTER-UNIVERSITY CATEGORY GUIDELINES — Rules Specifically for University Undergraduates',
      groups: [
        {
          introduction: 'Each participating team must submit the following:',
          items: [
            'Completed short film',
            'Creative film poster',
            'Completed Script',
            'Team declaration',
          ],
        },
      ],
      notes: [
        'All materials must be submitted through the official submission process announced by the Organizing Committee.',
      ],
    },
    {
      title: '2.4 Registration and Copyright',
      subtitle: '2. INTER-UNIVERSITY CATEGORY GUIDELINES — Rules Specifically for University Undergraduates',
      items: [
        'Registration fee: LKR 1,000 per team member.',
        'Teams must register and submit their films through the official links provided by the Organizing Committee.',
        'A member of the Organizing Committee will contact the team via WhatsApp or telephone to confirm receipt.',
        'All submissions must be completed before the official deadline. Late submissions will not be accepted.',
      ],
    },
    {
      title: '2.5 Judging and Screening',
      subtitle: '2. INTER-UNIVERSITY CATEGORY GUIDELINES — Rules Specifically for University Undergraduates',
      groups: [
        {
          introduction: 'Films will be evaluated by a panel of judges with relevant filmmaking expertise, based on:',
          items: [
            'Storytelling and screenplay',
            'Acting and performances',
            'Directing and creative vision',
            'Cinematography and visual quality',
            'Editing and technical execution',
            'Production Design and Styling',
          ],
        },
        {
          introduction: 'Awards will be presented in the following categories:',
          items: [
            'Best Director',
            'Best Screenplay',
            'Best Actor',
            'Best Actress',
            'Best Cinematographer',
            'Best Editor',
            'Best Makeup and Production Styling',
          ],
        },
      ],
      notes: [
        'The Top 10 finalist teams will be selected and officially invited to the award ceremony.',
        'Shortlisted university-category films will be screened at official festival venues organized by J’PURA VOICE.',
      ],
    },
    {
      title: '2.6 Cash Prizes',
      subtitle: '2. INTER-UNIVERSITY CATEGORY GUIDELINES — Rules Specifically for University Undergraduates',
      items: [
        '1st Place — LKR 75,000',
        '2nd Place — LKR 50,000',
        '3rd Place — LKR 30,000',
      ],
    },
  ];
  const activeGuidelineSections = [
    ...commonGuidelineSections,
    ...(isUniversity ? universityGuidelineSections : schoolGuidelineSections),
  ];

  return (
    <div className={`guidelines-page guidelines-page--${activeCategory}`}>
      {/* Top Navigation Bar with Back Button */}
      <header className="guidelines-page__nav">
        <div className="guidelines-page__nav-inner">
          <button
            type="button"
            className="guidelines-page__back-btn"
            onClick={onBack}
            aria-label="Back to Home"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span className="back-text-full">Back to Home</span>
            <span className="back-text-short">Back</span>
          </button>

          <div className="guidelines-page__brand">
            <BrandLogo
              variant="withoutCaption"
              sizes="160px"
              alt="CINERO'26"
              className="guidelines-page__brand-logo"
              decoding="async"
            />
          </div>

          <div className="guidelines-page__actions">
            <a
              href="#register"
              className="guidelines-page__register-btn"
              onClick={(e) => {
                e.preventDefault();
                if (onRegisterClick) {
                  onRegisterClick();
                } else {
                  onBack();
                  setTimeout(() => {
                    const el = document.getElementById('register');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
            >
              Register
            </a>
          </div>
        </div>
      </header>

      {/* Hero Banner for Category */}
      <section className="guidelines-page__hero">
        <picture
          className={`guidelines-page__hero-bg ${
            isUniversity ? 'guidelines-page__hero-bg--university' : 'guidelines-page__hero-bg--school'
          }`}
          aria-hidden="true"
        >
          <source
            type="image/webp"
            media="(max-width: 768px)"
            srcSet={
              isUniversity
                ? '/images/guidline-section-university-card-background-480.webp 480w, /images/guidline-section-university-card-background-960.webp 960w'
                : '/images/guidline-section-school-card-background-480.webp 480w, /images/guidline-section-school-card-background-960.webp 960w'
            }
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet={
              isUniversity
                ? '/images/guidline-section-university-card-background-480.webp 480w, /images/guidline-section-university-card-background-960.webp 960w'
                : '/images/guidline-section-school-card-background-480.webp 480w, /images/guidline-section-school-card-background-960.webp 960w'
            }
            sizes="100vw"
          />
          <img
            src={
              isUniversity
                ? '/images/guidline section-university card-background.png'
                : '/images/guidline section-school card-background.png'
            }
            alt=""
            width={1254}
            height={1254}
            fetchPriority="high"
            decoding="async"
          />
        </picture>
        <div className="guidelines-page__hero-overlay" aria-hidden="true" />

        <div className="guidelines-page__hero-content">
          <div className="guidelines-page__eyebrow">
            <span className="eyebrow-accent-text">CINERO’26 OFFICIAL RULEBOOK</span>
          </div>

          <h1 className="guidelines-page__title">
            {isUniversity ? 'University Category Guidelines' : 'School Category Guidelines'}
          </h1>

          <p className="guidelines-page__lead">
            {isUniversity
              ? 'Complete submission criteria, eligibility rules, and technical standards for undergraduates & university teams.'
              : 'Complete submission criteria, eligibility rules, and technical standards for secondary school students & teams.'}
          </p>

          {/* Category Switcher Tabs */}
          <div className="guidelines-page__tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={isUniversity}
              className={`guidelines-page__tab guidelines-page__tab--university ${
                isUniversity ? 'is-active' : ''
              }`}
              onClick={() => setActiveCategory('university')}
            >
              <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
              </svg>
              <span>Inter-University</span>
            </button>

            <button
              type="button"
              role="tab"
              aria-selected={!isUniversity}
              className={`guidelines-page__tab guidelines-page__tab--school ${
                !isUniversity ? 'is-active' : ''
              }`}
              onClick={() => setActiveCategory('school')}
            >
              <svg className="tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
              <span>Inter-School</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area - Ready for user to insert specific guidelines */}
      <main className="guidelines-page__body">
        <div className="guidelines-page__container">
          {/* Notification banner for user */}
          <div className="guidelines-notice-card">
            <div className="notice-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </div>
            <div className="notice-text">
              <strong>{isUniversity ? 'Inter-University' : 'Inter-School'} Category Guidelines</strong>
              <p>
                {isUniversity
                  ? 'Review the finalized Inter-University rules below, or download the official PDF.'
                  : 'Review the finalized Inter-School rules below, or download the official PDF.'}
              </p>
            </div>
          </div>

          <div className="guidelines-page__download-card">
            <div className="guidelines-page__download-copy">
              <span className="guidelines-page__download-eyebrow">OFFICIAL RULEBOOK</span>
              <strong>Take the guidelines with you</strong>
              <span>Download the {isUniversity ? 'Inter-University' : 'Inter-School'} rules as a PDF.</span>
            </div>
            <a
              className="guidelines-page__download-btn"
              href={isUniversity ? '/PDFs/InterUniGuid.pdf' : '/PDFs/InterSchoolGuid.pdf'}
              download={`CINERO-26-${isUniversity ? 'Inter-University' : 'Inter-School'}-Guidelines.pdf`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>Download PDF</span>
              <span className="guidelines-page__download-format">PDF</span>
            </a>
          </div>

          {activeGuidelineSections.map((section, index) => (
            <div className="guidelines-block" key={section.title}>
              <div className="guidelines-block__header">
                <span className="guidelines-block__number">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <h2 className="guidelines-block__title">{section.title}</h2>
                  <span className="guidelines-block__sub">{section.subtitle}</span>
                </div>
              </div>
              <div className="guidelines-block__content">
                {section.groups ? (
                  <>
                    {section.groups.map((group) => (
                      <div className="guidelines-list-group" key={group.introduction}>
                        <p className="guidelines-list-introduction">{group.introduction}</p>
                        <ul className="guidelines-list">
                          {group.items.map((item) => <li key={item}>{item}</li>)}
                        </ul>
                      </div>
                    ))}
                    {section.notes && (
                      <div className="guidelines-list-notes">
                        {section.notes.map((note) => <p key={note}>{note}</p>)}
                      </div>
                    )}
                  </>
                ) : (
                  <ul className="guidelines-list">
                    {section.items?.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                )}
              </div>
            </div>
          ))}

          {/* Bottom Actions */}
          <div className="guidelines-page__footer-bar">
            <button type="button" className="guidelines-page__back-btn-secondary" onClick={onBack}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span>Back to Home</span>
            </button>

            <button
              type="button"
              className="guidelines-page__submit-btn"
              onClick={() => {
                if (onRegisterClick) {
                  onRegisterClick();
                } else {
                  onBack();
                  setTimeout(() => {
                    const el = document.getElementById('register');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
            >
              Proceed to Registration
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GuidlinesPage;
