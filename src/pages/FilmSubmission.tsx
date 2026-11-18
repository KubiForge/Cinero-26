import { useState, type FormEvent } from 'react';
import Swal from 'sweetalert2';
import {
  submitFilmEntry,
  uploadFilmSubmissionFile,
  verifyFilmSubmissionTeam,
  type FilmSubmissionCategory,
  type FilmSubmissionFileLabel,
  type RegisteredFilmTeam,
  type UploadedFilmSubmissionFile,
} from '../services/filmSubmissionService';
import './FilmSubmission.css';

interface FilmSubmissionPageProps {
  category: FilmSubmissionCategory;
}

export function FilmSubmissionSelectionPage() {
  return (
    <main className="film-submission film-submission--selection">
      <header className="film-submission__hero film-submission__hero--selection">
        <picture className="film-submission__hero-art" aria-hidden="true">
          <source
            type="image/webp"
            media="(max-width: 640px)"
            srcSet="/images/hero-mobile-480.webp 480w, /images/hero-mobile-940.webp 940w"
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet="/images/hero-bg-960.webp 960w, /images/hero-bg-1600.webp 1600w"
            sizes="100vw"
          />
          <img src="/images/hero-bg.png" alt="" width={1672} height={941} fetchPriority="high" />
        </picture>
        <div className="film-submission__hero-shade" aria-hidden="true" />
        <div className="film-submission__hero-copy">
          <p className="film-submission__eyebrow">CINERO’26 <span aria-hidden="true">·</span> OFFICIAL FILM SUBMISSION</p>
          <h1>Every story<br />deserves <span>the screen.</span></h1>
          <p>Choose your registered competition category to begin your film submission.</p>
          <a className="film-submission__hero-link" href="#submission-categories">
            CHOOSE YOUR CATEGORY <span aria-hidden="true">↓</span>
          </a>
        </div>
        <span className="film-submission__hero-caption" aria-hidden="true">CINERO’26 · A STAGE FOR EVERY STORY</span>
      </header>
      <section id="submission-categories" className="film-submission__content film-submission__content--selection" aria-labelledby="submission-category-title">
        <div className="film-submission__selection-intro">
          <p className="film-submission__section-kicker">TWO CATEGORIES · ONE STAGE</p>
          <h2 id="submission-category-title" className="film-submission__selection-heading">
            Select your competition
          </h2>
          <p>Pick the category your team registered for. The matching submission form opens next.</p>
        </div>
        <div className="film-submission__category-grid">
          <a className="film-submission__category-card film-submission__category-card--school" href="/submission/school">
            <picture className="film-submission__category-art" aria-hidden="true">
              <source
                type="image/webp"
                srcSet="/images/guidline-section-school-card-background-480.webp 480w, /images/guidline-section-school-card-background-960.webp 960w"
                sizes="(max-width: 700px) 100vw, 50vw"
              />
              <img src="/images/guidline section-school card-background.png" alt="" loading="lazy" decoding="async" />
            </picture>
            <span className="film-submission__category-number">CATEGORY 01</span>
            <div className="film-submission__category-copy">
              <span className="film-submission__category-tag">INTER-SCHOOL FILM FESTIVAL</span>
              <h3>Inter-School</h3>
              <p>For teams registered in the school category.</p>
              <span className="film-submission__category-action">
                ENTER SCHOOL SUBMISSION <span aria-hidden="true">↗</span>
              </span>
            </div>
          </a>
          <a className="film-submission__category-card film-submission__category-card--university" href="/submission/university">
            <picture className="film-submission__category-art" aria-hidden="true">
              <source
                type="image/webp"
                srcSet="/images/guidline-section-university-card-background-480.webp 480w, /images/guidline-section-university-card-background-960.webp 960w"
                sizes="(max-width: 700px) 100vw, 50vw"
              />
              <img src="/images/guidline section-university card-background.png" alt="" loading="lazy" decoding="async" />
            </picture>
            <span className="film-submission__category-number">CATEGORY 02</span>
            <div className="film-submission__category-copy">
              <span className="film-submission__category-tag">INTER-UNIVERSITY FILM FESTIVAL</span>
              <h3>Inter-University</h3>
              <p>For teams registered in the university category.</p>
              <span className="film-submission__category-action">
                ENTER UNIVERSITY SUBMISSION <span aria-hidden="true">↗</span>
              </span>
            </div>
          </a>
        </div>
        <div className="film-submission__selection-note">
          <span className="film-submission__selection-note-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>
          <p><strong>Registered teams only.</strong> Team name and leader email are checked against the selected category before submission.</p>
        </div>
      </section>
    </main>
  );
}

interface FileRequirement {
  label: FilmSubmissionFileLabel;
  title: string;
  accept: string;
  required: boolean;
  hint: string;
}

const DECLARATIONS = [
  'Our film was entirely shot and produced on or after 1 January 2026.',
  'Our film is an original creation of our team, and all third-party materials are properly licensed or permitted.',
  'Our film is 2–15 minutes long, includes embedded English subtitles, and meets the CINERO’26 technical requirements.',
  'Our team has read and agrees to follow the CINERO’26 competition guidelines for our category.',
  'CINERO’26 may use our poster, trailers, selected clips, and team photographs for festival-related promotion.',
];

const SRI_LANKA_TODAY = new Date(Date.now() + 330 * 60 * 1000).toISOString().slice(0, 10);

const GENRES = [
  'Drama',
  'Comedy',
  'Thriller',
  'Romance',
  'Documentary',
  'Animation',
  'Action',
  'Experimental',
  'Other',
];

function getFileRequirements(category: FilmSubmissionCategory): FileRequirement[] {
  if (category === 'school') {
    return [
      {
        label: 'Poster',
        title: 'Film poster (optional)',
        accept: '.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf',
        required: false,
        hint: 'JPG, PNG, or PDF. No image upload size cap.',
      },
      {
        label: 'StudentConfirmation',
        title: 'Principal-signed student confirmation letter (optional)',
        accept: '.pdf,application/pdf',
        required: false,
        hint: 'Optional: upload the completed confirmation letter as a PDF.',
      },
    ];
  }

  return [
    {
      label: 'Poster',
      title: 'Creative film poster',
      accept: '.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf',
      required: true,
      hint: 'JPG, PNG, or PDF. No image upload size cap.',
    },
    {
      label: 'Script',
      title: 'Completed film script',
      accept: '.pdf,application/pdf',
      required: true,
      hint: 'Upload the completed script as a PDF.',
    },
    {
      label: 'TeamDeclaration',
      title: 'Completed team declaration and university ID cards (optional)',
      accept: '.pdf,application/pdf',
      required: false,
      hint: 'Optional: combine the signed declaration and all team members’ university ID cards into one PDF.',
    },
  ];
}

function getCategoryTitle(category: FilmSubmissionCategory): string {
  return category === 'school' ? 'Inter-School' : 'Inter-University';
}

function showSubmissionAlert(
  title: string,
  text: string,
  icon: 'success' | 'error' | 'info',
) {
  return Swal.fire({
    title,
    text,
    icon,
    iconColor: icon === 'error' ? '#ff8b76' : '#e8c572',
    confirmButtonText: 'OK',
    confirmButtonColor: '#d4a642',
    background: '#171518',
    color: '#fff',
    backdrop: 'rgba(0, 0, 0, 0.78)',
    customClass: {
      popup: 'film-submission-alert',
      title: 'film-submission-alert__title',
      htmlContainer: 'film-submission-alert__message',
      confirmButton: 'film-submission-alert__confirm',
    },
  });
}

export default function FilmSubmissionPage({ category }: FilmSubmissionPageProps) {
  const [teamName, setTeamName] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [team, setTeam] = useState<RegisteredFilmTeam | null>(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [filmTitle, setFilmTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [genre, setGenre] = useState('');
  const [language, setLanguage] = useState('');
  const [runningTime, setRunningTime] = useState('');
  const [completionDate, setCompletionDate] = useState('');
  const [filmLink, setFilmLink] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Partial<Record<FilmSubmissionFileLabel, File>>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Partial<Record<FilmSubmissionFileLabel, UploadedFilmSubmissionFile>>>({});

  const files = getFileRequirements(category);
  const categoryTitle = getCategoryTitle(category);

  const handleTeamIdentityChange = (nextTeamName: string, nextLeaderEmail: string) => {
    setTeamName(nextTeamName);
    setLeaderEmail(nextLeaderEmail);
    setTeam(null);
    setAlreadySubmitted(false);
    setSelectedFiles({});
    setUploadedFiles({});
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleFileChange = (label: FilmSubmissionFileLabel, file: File | undefined) => {
    setSelectedFiles((current) => ({ ...current, [label]: file }));
    setUploadedFiles((current) => {
      const next = { ...current };
      delete next[label];
      return next;
    });
    setErrorMessage('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const verification = await verifyFilmSubmissionTeam(
        category,
        teamName.trim(),
        leaderEmail.trim().toLowerCase(),
      );
      setTeam(verification.team);
      if (verification.submitted) {
        setAlreadySubmitted(true);
        const message = verification.message || 'A submission has already been received for this team.';
        setSuccessMessage(message);
        await showSubmissionAlert('Already submitted', message, 'info');
        return;
      }

      const registeredTeam = verification.team;
      const nextUploads = { ...uploadedFiles };
      const filesToUpload = files.filter(({ label }) => selectedFiles[label] && !nextUploads[label]);

      for (const [index, requirement] of filesToUpload.entries()) {
        const file = selectedFiles[requirement.label];
        if (!file) continue;
        setUploadStatus(`Uploading ${requirement.title} (${index + 1} of ${filesToUpload.length})…`);
        const uploaded = await uploadFilmSubmissionFile(
          file,
          category,
          registeredTeam.referenceId,
          registeredTeam.leaderEmail,
          requirement.label,
        );
        nextUploads[requirement.label] = uploaded;
        setUploadedFiles({ ...nextUploads });
      }

      const missingUploads = files.some(({ label, required }) => required && !nextUploads[label]);
      if (missingUploads) {
        throw new Error('Please select every required submission file.');
      }

      setUploadStatus('Saving your submission…');
      await submitFilmEntry({
        category,
        referenceId: registeredTeam.referenceId,
        leaderEmail: registeredTeam.leaderEmail,
        filmTitle: filmTitle.trim(),
        synopsis: synopsis.trim(),
        genre,
        language,
        runningTime,
        completionDate,
        filmLink: filmLink.trim(),
        files: nextUploads,
        declarations: DECLARATIONS.map(() => true),
      });
      setAlreadySubmitted(true);
      const message = 'Your film submission has been received. Thank you!';
      setSuccessMessage(message);
      await showSubmissionAlert('Submission received!', message, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Your submission could not be completed.';
      setErrorMessage(message);
      await showSubmissionAlert('Submission not completed', message, 'error');
    } finally {
      setIsSubmitting(false);
      setUploadStatus('');
    }
  };

  return (
    <main className="film-submission">
      <header className="film-submission__hero">
        <p className="film-submission__eyebrow">CINERO’26 · OFFICIAL FILM SUBMISSION</p>
        <h1 id="film-submission-page-title">{categoryTitle} <span>Film Submission</span></h1>
        <p>Submit your team’s short film and required materials. Each registered team may submit once.</p>
      </header>

      <section className="film-submission__content" aria-labelledby="film-submission-page-title">
        <div className="film-submission__notice" role="note">
          This page is for registered {categoryTitle.toLowerCase()} teams only. Enter the team name and leader email
          used during registration; they are checked before the submission is accepted.
        </div>

        <section className="film-submission__card" aria-live="polite">
          {alreadySubmitted ? (
            <>
              <div className="film-submission__team">
                <span>REGISTERED TEAM</span>
                <h2>{team?.teamName || teamName}</h2>
                <p>{team?.leaderEmail || leaderEmail}</p>
              </div>
              <div className="film-submission__success" role="status">{successMessage}</div>
            </>
          ) : (
            <form className="film-submission__form" onSubmit={handleSubmit} aria-busy={isSubmitting}>
              <fieldset disabled={isSubmitting}>
                <h2>Section 01 – Film Information</h2>
                <label>
                  Team name
                  <input
                    type="text"
                    required
                    maxLength={180}
                    autoComplete="organization"
                    value={teamName}
                    onChange={(event) => handleTeamIdentityChange(event.currentTarget.value, leaderEmail)}
                  />
                </label>
                <label>
                  Registered team leader email
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={leaderEmail}
                    onChange={(event) => handleTeamIdentityChange(teamName, event.currentTarget.value)}
                  />
                </label>
                <label>
                  Title of the short film
                  <input
                    type="text"
                    required
                    maxLength={200}
                    value={filmTitle}
                    onChange={(event) => setFilmTitle(event.currentTarget.value)}
                  />
                </label>
                <label>
                  Film synopsis / brief description
                  <textarea
                    required
                    rows={5}
                    maxLength={5000}
                    value={synopsis}
                    onChange={(event) => setSynopsis(event.currentTarget.value)}
                  />
                </label>
                <div className="film-submission__two-column">
                  <label>
                    Film genre
                    <select required value={genre} onChange={(event) => setGenre(event.currentTarget.value)}>
                      <option value="">Select a genre</option>
                      {GENRES.map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                  <label>
                    Film language
                    <select required value={language} onChange={(event) => setLanguage(event.currentTarget.value)}>
                      <option value="">Select a language</option>
                      {(category === 'school'
                        ? ['Sinhala', 'Tamil', 'English', 'Other']
                        : ['Sinhala', 'Tamil', 'English']
                      ).map((option) => <option key={option} value={option}>{option}</option>)}
                    </select>
                  </label>
                  <label>
                    Running time (minutes:seconds)
                    <input
                      type="text"
                      required
                      inputMode="numeric"
                      placeholder="08:30"
                      pattern="(0[2-9]|1[0-4]):[0-5][0-9]|15:00"
                      title="Enter minutes and seconds, for example 08:30."
                      value={runningTime}
                      onChange={(event) => setRunningTime(event.currentTarget.value)}
                    />
                    <small>Must be between 02:00 and 15:00, including credits.</small>
                  </label>
                  <label>
                    Date of film completion
                    <input
                      type="date"
                      required
                      min="2026-01-01"
                      max={SRI_LANKA_TODAY}
                      value={completionDate}
                      onChange={(event) => setCompletionDate(event.currentTarget.value)}
                    />
                  </label>
                </div>

                <label>
                  Final short film Google Drive link
                  <input
                    type="url"
                    required
                    placeholder="https://drive.google.com/..."
                    value={filmLink}
                    onChange={(event) => setFilmLink(event.currentTarget.value)}
                  />
                  <small>Set access so anyone with the link can view the film.</small>
                </label>

                <h2>Section 02 – Submission Materials</h2>
                <div className="film-submission__uploads">
                  {files.map((requirement) => (
                    <label className="film-submission__upload" key={requirement.label}>
                      <span>
                        {requirement.title}{requirement.required ? ' *' : ''}
                      </span>
                      <input
                        key={JSON.stringify([teamName, leaderEmail, requirement.label])}
                        type="file"
                        required={requirement.required}
                        accept={requirement.accept}
                        onChange={(event) => handleFileChange(requirement.label, event.currentTarget.files?.[0])}
                      />
                      <small>
                        {selectedFiles[requirement.label]?.name
                          || (uploadedFiles[requirement.label] ? 'Uploaded and ready to submit.' : requirement.hint)}
                      </small>
                    </label>
                  ))}
                </div>

                <h2>Section 03 – Declaration</h2>
                <div className="film-submission__declarations">
                  {DECLARATIONS.map((declaration, index) => (
                    <label key={declaration}>
                      <input type="checkbox" required />
                      <span><strong>{index + 1}.</strong> {declaration}</span>
                    </label>
                  ))}
                </div>

                {errorMessage && <p className="film-submission__error" role="alert">{errorMessage}</p>}
                {successMessage && <p className="film-submission__success" role="status">{successMessage}</p>}
                {uploadStatus && <p className="film-submission__upload-status" role="status">{uploadStatus}</p>}
                <button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'SUBMITTING…' : 'SUBMIT FILM'}
                </button>
              </fieldset>
            </form>
          )}
        </section>

        <p className="film-submission__privacy">
          The submission is saved once per registered team. Please check your film link and files before submitting.
          The final film is submitted as a Google Drive link.
        </p>
      </section>
    </main>
  );
}
