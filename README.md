# CINERO '26

> **A stage for every story.**

CINERO '26 is an inter-school and inter-university short-film festival website for the University of Sri Jayewardenepura community. It presents event information and guidelines, and provides team registration, film submission, photo-gallery, contact, and crew-management workflows.

| | |
|---|---|
| **Live website** | [www.cinero26.live](https://www.cinero26.live/) |
| **Repository** | [KubiForge/Cinero-26](https://github.com/KubiForge/Cinero-26) |
| **Event organizer shown on the site** | J'PURA VOICE Filming Division, University of Sri Jayewardenepura |
| **Repository organization** | KubiForge |

## Website preview

Visit the [live website](https://www.cinero26.live/) to see the current experience. No website screenshot is committed in this repository, so this README does not embed an unverified or generated preview.

## Event overview

The site presents CINERO '26 as a short-film festival for school students and university undergraduates. It describes the festival's purpose, participating categories, awards, key personnel, contact channels, and official rules.

The homepage timeline displays these milestones:

| Date | Milestone |
|---|---|
| 27 October 2026 | Registration opens |
| 15 November 2026 | Film submissions open |
| 4 December 2026 | Registration and submissions close |
| 13 December 2026 | Official short-film screening |
| 13 December 2026 | Awards ceremony |

The registration pages display fees of **LKR 2,000 per school team** and **LKR 1,000 per university team member**. Registration is date-gated from **27 October through 4 December 2026 (Sri Lanka time)** in the frontend and server handlers.

## Pages and routes

The React application uses a custom path-and-hash resolver; it does not use a routing library. Hash links select the single-page informational and registration views, while submissions, gallery, and crew tools use path routes.

| Route | Page / purpose | Access |
|---|---|---|
| `/` | Home: hero, festival introduction, interactive timeline, category guidelines cards, registration prompt, contact form, and footer | Public |
| `/#about` | Festival overview, concept and purpose, categories, awards, audience, and organizing personnel | Public |
| `/#guidelines-university` | University category rules and downloadable documents | Public |
| `/#guidelines-school` | School category rules and downloadable documents | Public |
| `/#register-page` | Four-step team registration form | Public while registration is open |
| `/submission` | Film-submission category selector | Public |
| `/submission/school` | Inter-School film-submission form | Public; team verification required |
| `/submission/university` | Inter-University film-submission form | Public; team verification required |
| `/gallery/upload` | Public photo uploader | Public |
| `/holi-gallery` | Holi Fest poster and approved event-photo gallery | Public |
| `/crew/login` | Crew sign-in | Public entry point |
| `/crew/dashboard` | Crew operations dashboard | Authenticated crew |
| `/crew/dashboard/school` | School-category dashboard | Authenticated crew |
| `/crew/dashboard/university` | University-category dashboard | Authenticated crew |
| `/crew/registrations/school` | Search and view school registration records | Authenticated crew |
| `/crew/registrations/university` | Search and view university registration records | Authenticated crew |
| `/crew/gallery-review` | Photo moderation queue | Authenticated crew |

The application also recognizes `#register-form` as a registration hash. Other homepage anchors include `#home`, `#guidelines`, `#timeline`, `#contact`, and `#register`. Additional hashes such as `#about-purpose`, `#guidelines-detail`, `#crew-dashboard`, `#crew-dashboard-school`, `#crew-dashboard-university`, `#crew-school-registrations`, `#crew-university-registrations`, `#crew-login`, and `#hr-crew-login` are navigation or compatibility states, not additional standalone pages.

Crew pages require a valid server-side session. Unauthenticated requests are redirected to `/crew/login`; local crew data and authenticated actions could not be verified without configured credentials and services.

## Features

| Area | Implemented functionality |
|---|---|
| Festival information | Home and About views with event purpose, categories, awards, audience, and organizing personnel |
| Event schedule | Five dated milestones; selecting a milestone changes the highlighted timeline detail |
| Category rules | Inter-School and Inter-University rules, category switching, and downloadable PDF guidelines |
| Team registration | Four-step form for category, team and institution details, fee/payment information, declarations, and confirmation |
| Film submissions | Category-specific form, registered-team verification, film details and Drive link, supporting documents, declarations, and one-submission-per-team checks |
| Photo uploads | Drag-and-drop or file selection; up to 10 images, 30 MB original size per image, optimization for larger files, upload progress, retry/resume support, and same-device IndexedDB recovery |
| Approved gallery | Approved-photo listing, image download links, and a lightbox preview |
| Crew tools | Session-protected dashboard, registration record search, and photo approve/reject/delete moderation |
| Contact | Inquiry form with selectable subject, plus email, phone, and social links |
| Navigation and media | Responsive navigation menu, section links, event-announcement modal, desktop/mobile hero media, and responsive image assets |

The website does not have a separate FAQ page or published sponsor directory. Sponsorship and media partnership is an inquiry option in the contact form, not a sponsor listing.

## Technology

| Technology | Use |
|---|---|
| TypeScript | Typed React application, browser services, and Vite configuration |
| React 19 / React DOM | UI composition and client-side page state |
| Vite 8 | Development server, asset handling, and production build |
| Vercel Functions (Node.js) | Server-side API handlers under `api/`; deployment rewrites and headers are in `vercel.json` |
| CSS | Component and page styles, responsive breakpoints, transitions, and motion preferences; no CSS framework is used |
| React Icons | Icons in registration and crew-management interfaces |
| SweetAlert2 | Form, upload, and moderation feedback dialogs |
| Google Apps Script | Webhook workflows for registration, film submissions, and gallery operations |
| Google Sheets | Registration and gallery metadata, plus crew read views |
| Google Drive | Supporting-file and photo storage, resumable uploads, and image delivery |
| Web3Forms | External contact-form submission |
| Google Fonts | Cinzel display typography and Outfit body typography |
| Browser APIs | Fetch, IndexedDB, Web Workers, Canvas image processing, media queries, and session storage |
| ESLint | TypeScript and React linting |

There is no routing, form, or animation library and no project-owned relational database. React state and the custom resolver manage page selection. Google Sheets is used for application records.

## Architecture and data flow

This is **not a frontend-only site**: it combines a React single-page application with Vercel serverless functions and Google Apps Script integrations.

```text
Browser
  ├─ React UI and static Vite-built assets
  ├─ Contact form ───────────────────────────> Web3Forms
  └─ Same-origin /api/* requests
       └─ Vercel Node.js functions
            ├─ Google Apps Script ────────────> Google Sheets
            │                                  Google Drive
            └─ Google OAuth / Drive API ──────> Approved image delivery
```

- **Application entry and routing:** `src/main.tsx` mounts the app. `src/App.tsx` resolves paths and hashes, selects views, and coordinates protected crew routes.
- **UI organization:** shared navigation, home sections, and footer are in `src/components/`; standalone public and crew views are in `src/pages/`.
- **Browser services:** `src/services/` contains API clients, image optimization, and upload persistence. Large gallery images can be optimized in a Web Worker with a Canvas fallback; recoverable upload state is stored in IndexedDB on the user's device.
- **Server API:** `api/` contains Vercel handlers. `lib/server/` provides shared crew authentication/session, Apps Script communication, and upload-session helpers.
- **Registration:** the browser sends registration data to `/api/registration`; the server forwards it to Apps Script, which writes registration records to Google Sheets. Supporting files use upload-session and chunk endpoints.
- **Film submissions:** the Apps Script integration verifies the registered team; metadata and supporting-file uploads are handled through the film-submission API and Google Drive.
- **Gallery:** Apps Script tracks photo uploads and review status. Crew actions moderate submitted photos; the public endpoint lists approved photos, and server-side handlers deliver image data from Drive.
- **Crew authentication:** server environment variables configure login and signed `crew_session` cookies. Crew APIs validate the session before returning protected records or accepting moderation actions.
- **Local API support:** `vite.config.ts` provides development middleware for selected API routes. It does not replace the external service configuration required for end-to-end testing.

### API route catalog

These are API endpoints, not browser pages.

| Endpoint | Responsibility |
|---|---|
| `/api/registration` | Accepts registrations while the configured registration window is open |
| `/api/registration-upload-session` | Creates a Drive upload session for registration documents |
| `/api/registration-upload-chunk` | Receives and forwards resumable upload chunks |
| `/api/film-submission` | Verifies registered teams and processes film submissions |
| `/api/film-submission-upload-session` | Rewrites to the film-submission handler's upload-session action |
| `/api/gallery` | Lists approved gallery photos |
| `/api/gallery-image` | Streams an approved Drive image and supports download responses |
| `/api/gallery-upload` | Looks up or finalizes gallery photo uploads |
| `/api/gallery-upload-session` | Creates or checks a gallery upload session |
| `/api/crew-login` | Authenticates crew credentials |
| `/api/crew-session` | Rewrites to the crew-login handler's session action |
| `/api/crew-registrations` | Returns authorized registration records |
| `/api/crew-gallery` | Lists pending photos and handles moderation |
| `/api/crew-gallery-image` | Streams an image for authorized photo review |

## Project structure

```text
.
├── api/                              # Vercel API handlers
│   ├── crew-gallery-image.js
│   ├── crew-gallery.js
│   ├── crew-login.js
│   ├── crew-registrations.js
│   ├── film-submission.js
│   ├── gallery-image.js
│   ├── gallery-upload-session.js
│   ├── gallery-upload.js
│   ├── gallery.js
│   ├── registration-upload-chunk.js
│   ├── registration-upload-session.js
│   └── registration.js
├── lib/server/                       # Shared server authentication and integrations
│   ├── crew-auth.js
│   ├── crew-session.js
│   ├── film-submission-upload-session.js
│   └── gallery.js
├── public/
│   ├── images/                       # Event, brand, background, poster, and personnel artwork
│   ├── PDFs/
│   │   ├── CINERO'26 School Declaration Form.pdf
│   │   ├── CINERO'26 University Declaration Form.pdf
│   │   ├── InterSchoolGuid.pdf
│   │   └── InterUniGuid.pdf
│   ├── video/                        # Desktop and mobile hero videos
│   └── cinero-favicon*.png
├── src/
│   ├── components/
│   │   ├── AboutSection.tsx
│   │   ├── AboutSection.css
│   │   ├── BrandLogo.tsx
│   │   ├── ContactSection.tsx
│   │   ├── ContactSection.css
│   │   ├── Footer.tsx
│   │   ├── Footer.css
│   │   ├── GuidelinesSection.tsx
│   │   ├── GuidelinesSection.css
│   │   ├── Hero.tsx
│   │   ├── Hero.css
│   │   ├── HoliAnnouncementModal.tsx
│   │   ├── HoliAnnouncementModal.css
│   │   ├── Navbar.tsx
│   │   ├── Navbar.css
│   │   ├── PageHeader.tsx
│   │   ├── PageHeader.css
│   │   ├── SocialLinks.tsx
│   │   ├── TimelineSection.tsx
│   │   └── TimelineSection.css
│   ├── data/siteLinks.ts             # Navigation, contact, and social-link data
│   ├── pages/
│   │   ├── About.tsx
│   │   ├── About.css
│   │   ├── CrewDashboard.tsx
│   │   ├── CrewDashboard.css
│   │   ├── CrewGalleryReview.tsx
│   │   ├── CrewGalleryReview.css
│   │   ├── CrewLogin.tsx
│   │   ├── CrewLogin.css
│   │   ├── FilmSubmission.tsx
│   │   ├── FilmSubmission.css
│   │   ├── GalleryUpload.tsx
│   │   ├── GalleryUpload.css
│   │   ├── Guidlines.tsx
│   │   ├── Guidlines.css
│   │   ├── HoliGallery.tsx
│   │   ├── HoliGallery.css
│   │   ├── Registration.tsx
│   │   ├── Registration.css
│   │   ├── RegistrationManagement.tsx
│   │   └── RegistrationManagement.css
│   ├── services/
│   │   ├── crewGalleryService.ts
│   │   ├── filmSubmissionService.ts
│   │   ├── galleryImageOptimizer.ts
│   │   ├── galleryService.ts
│   │   └── galleryUploadStore.ts
│   ├── workers/galleryImageOptimizer.worker.ts
│   ├── App.tsx                       # Custom route resolution and view assembly
│   ├── App.css
│   ├── index.css
│   ├── main.tsx                      # React entry point
│   └── sweetAlert.css
├── .env.example                      # Placeholder environment configuration
├── .gitignore
├── GoogleAppsScript.js               # Apps Script integration source
├── index.html                        # HTML entry and page metadata
├── package.json
├── package-lock.json
├── eslint.config.js
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts                    # Vite config and local API middleware
└── vercel.json                       # Vercel rewrites, headers, and cache rules
```

The asset directories contain optimized responsive WebP variants alongside source artwork. There is no committed screenshot directory.

## Local development

### Requirements

- Node.js version supported by Vite 8
- npm
- External service credentials for end-to-end contact, registration, submission, gallery, and crew workflows

### Install and run

```bash
npm ci
npm run dev
```

Vite prints the local URL when the development server starts. To configure integrations locally, copy `.env.example` to `.env.local` and replace placeholders only for services you intend to use (`Copy-Item .env.example .env.local` in PowerShell or `cp .env.example .env.local` in macOS/Linux shells). `.env.example` contains no live credentials; do not commit real secrets.

### Build, preview, and lint

```bash
npm run build
npm run preview
npm run lint
```

`npm run build` runs the TypeScript project build before creating the Vite production bundle. There is no automated test script in `package.json`.

## Deployment and configuration

The repository includes Vercel configuration in `vercel.json`, including the Vite framework, SPA fallback, API rewrites, caching rules, and response headers. The live site at [https://www.cinero26.live/](https://www.cinero26.live/) responded successfully during this audit with Vercel hosting headers. Domain-to-project settings are not stored in the repository.

Configure these values in the appropriate local or deployment environment. Server-only values must also be coordinated with the matching Google Apps Script properties where noted.

| Variable | Purpose |
|---|---|
| `VITE_WEB3FORMS_ACCESS_KEY` | Client-side contact-form access key |
| `GOOGLE_SHEET_WEBHOOK_URL` | Deployed Apps Script web-app endpoint |
| `GOOGLE_SHEET_READ_TOKEN` | Server-to-Apps-Script read authorization; set the matching Script Property |
| `GALLERY_UPLOAD_TOKEN` | Gallery upload authorization; set the matching Script Property |
| `GALLERY_REVIEW_TOKEN` | Photo-review authorization; set the matching Script Property |
| `GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL` | Service account for server-side Drive image reads |
| `GOOGLE_DRIVE_SERVICE_ACCOUNT_PRIVATE_KEY` | Service-account private key for server-side Drive image reads |
| `CREW_USERNAME` | Crew login username |
| `CREW_PASSWORD_HASH` | Lowercase SHA-256 hash of the crew password |
| `CREW_SESSION_SECRET` | Secret used to sign crew sessions (at least 32 characters) |
| `DEBUG_CREW_LOGIN` | Optional authentication diagnostics |

Keep server credentials in deployment settings and Apps Script properties, never in source control. The `VITE_` Web3Forms key is bundled for browser use; treat it according to the provider's client-key guidance.

## External services and links

- **Contact delivery:** the contact form sends JSON to [Web3Forms](https://api.web3forms.com/submit) when its access key is configured.
- **Registration and crew records:** Google Apps Script and Google Sheets handle registration writes and authorized record reads.
- **File uploads and galleries:** Google Drive stores registration documents, film-submission files, and gallery photos; approved gallery images are served through the site's API.
- **Social channels:** [Facebook](https://www.facebook.com/JapuraVoice), [Instagram](https://www.instagram.com/jpura_voice?rpxt=MWg0ZmgwcjJhem4zeQ==), [YouTube](https://www.youtube.com/@VoiceTVbyJpuraVoice), and [LinkedIn](https://www.linkedin.com/company/j-pura-voice).
- **Fonts:** Cinzel and Outfit are loaded from [Google Fonts](https://fonts.google.com/).
- **Contact:** [cinero2026@gmail.com](mailto:cinero2026@gmail.com) · [+94 76 807 1233](tel:+94768071233).

Availability and successful operation of external services depend on network access, configured accounts, credentials, permissions, and deployment settings.

## Website Design & Development

**Sathira Sugeesvara**

The complete website design and technical development were independently handled by **Sathira Sugeesvara**, as confirmed for this project. The website development contribution includes:

- Website architecture and implementation
- UI and frontend development
- Responsive design and reusable component development
- Routing and navigation
- Registration, submission, contact, gallery, and crew-facing integrations
- Deployment configuration

This individual website-development attribution is separate from organizing CINERO '26 and does not claim ownership of the event or its intellectual property. The deployed footer currently displays a Kubi Forge developer-credit link; this is distinct from the project-confirmed individual development attribution and the event organizer.

- **Portfolio:** [sathirasugeesvara.github.io](https://sathirasugeesvara.github.io/)
- **GitHub:** [github.com/SathiraSugeesvara](https://github.com/SathiraSugeesvara)

## Project organization and ownership

- **Event:** CINERO '26.
- **Event organizer named on the website:** J'PURA VOICE Filming Division, University of Sri Jayewardenepura.
- **Repository organization:** KubiForge; the repository is [KubiForge/Cinero-26](https://github.com/KubiForge/Cinero-26).
- **Website developer:** Sathira Sugeesvara, as described above.

Website development attribution is not event ownership or event organization. The repository's KubiForge organization likewise does not establish ownership of event intellectual property.

## Credits and acknowledgements

- CINERO '26 and its organizing team for event information and official materials.
- J'PURA VOICE Filming Division and the University of Sri Jayewardenepura.
- The open-source packages listed in `package.json`, and the Google, Web3Forms, and Vercel services used by the implementation.

## License

No `LICENSE` file or package license declaration is present in this repository. No open-source reuse terms are specified here; contact the project organization for permission and applicable terms.

## Audit and verification notes

- **Browser-inspected pages:** home, About, both guideline categories, registration, submission selector and both category forms, photo upload, public Holi gallery, and crew login.
- **Browser interactions exercised:** timeline selection, guideline category switching, registration empty-field validation, responsive menu open/close state, announcement dismissal, mobile layout, and live gallery lightbox open/close.
- **Live gallery:** the approved-photo API and page loaded successfully; the gallery displayed two approved photos during the audit. Photo download was not exercised.
- **Not submitted or verified end-to-end:** contact delivery, registration persistence, film-team verification/submission, file uploads, and crew records/moderation. These workflows require configured external services, credentials, and/or deliberate real submissions.
- **Local configuration limits:** the unconfigured local gallery API returned an error, and crew authentication was unavailable without server credentials. Protected crew pages therefore could not be inspected with authenticated data.
- **External links:** the live site, repository, developer links, and most social destinations responded to link checks. Web3Forms and LinkedIn returned HTTP 403 to HEAD requests; this may reflect unsupported HEAD requests or access restrictions and does not verify their normal browser or POST behavior.

