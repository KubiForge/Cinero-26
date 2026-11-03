# 🎬 CINERO'26 — All Island Inter-University & Inter-School Short Film Festival

<p align="center">
  <a href="https://cinero-26.live" target="_blank">
    <img src="https://img.shields.io/badge/Live%20Website-cinero--26.live-D4A642?style=for-the-badge&logo=googlechrome&logoColor=black" alt="Live Site" />
  </a>
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Google%20Apps%20Script-API-34A853?style=for-the-badge&logo=google&logoColor=white" alt="Google Apps Script" />
  <img src="https://img.shields.io/badge/Vercel-Serverless-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
  <img src="https://img.shields.io/badge/SweetAlert2-11.26-D4A642?style=for-the-badge&logo=sweetalert2&logoColor=white" alt="SweetAlert2" />
</p>

---

## 🌐 Official Festival Website
🔗 **Live URL**: [https://cinero-26.live](https://cinero-26.live)

---

## 🌟 Overview

**CINERO'26** is the official web portal for Sri Lanka's premier All-Island Short Film Festival organized by **J'PURA VOICE FILMING DIVISION** (University of Sri Jayewardenepura). The platform delivers a high-impact cinematic experience, comprehensive festival rules, interactive timelines, and an enterprise-grade automated team registration system connected directly to **Google Sheets** and **Google Drive**.

---

## 🚀 Key Highlights & Architecture

- **Cinematic Dark Luxury Aesthetic**: Built with glassmorphism, responsive typography, and tailored gold/amber accents.
- **Dynamic 5-Step Registration Pipeline**:
  - Category selection: *Inter-School* vs. *Inter-University*.
  - Flexible Team Sizing: Supports **4 to 15 members** with dynamic member input rows and automated fee calculation.
  - Base64 direct file uploads for Student ID verification & payment receipts.
  - Interactive SweetAlert2 dialogs for user guidance and validation alerts.
- **Enterprise Serverless Integration**:
  - Secure Serverless API proxy masking Google Webhook endpoints.
  - Vite dev server middleware handling local testing out-of-the-box.
  - Google Apps Script webhook storing structured records in Google Sheets and managing files in Google Drive.
- **Bank-Grade Data Privacy & Security**:
  - Uploaded files are strictly restricted to committee spreadsheet editors (`DriveApp.Access.PRIVATE`).
  - Payload bomb protection (size limiting up to 20MB) and rigorous regex sanitization.
  - Production-ready HTTP Security Headers (anti-clickjacking, XSS protection, MIME sniffing prevention).

---

## 🛠️ Technology Stack & Techniques

### Frontend & UI/UX
| Technology | Description |
| :--- | :--- |
| **React 19** | Modern functional components, custom hooks, and state management. |
| **TypeScript** | Strict compile-time safety and self-documenting data interfaces. |
| **Vite 8** | Next-generation instant HMR and optimized production bundling. |
| **Vanilla CSS3** | Custom design system with CSS variables, fluid clamping (`clamp()`), and flex/grid architectures (Zero bloated frameworks). |
| **SweetAlert2** | Accessible, responsive dark-themed modals matching festival brand colors. |
| **React Icons** | Feather, FontAwesome, and Ionicons for intuitive iconography. |

### Backend & Cloud Architecture
| Technology | Description |
| :--- | :--- |
| **Vercel Serverless Functions** | Edge-ready Node.js API handlers (`/api/registration.js`) routing data securely. |
| **Google Apps Script (V8)** | Webhook processing JSON payloads with concurrency locks (`LockService`). |
| **Google Sheets API** | Structured database recording timestamped team information and member details. |
| **Google Drive API** | Cloud storage bucket automatically storing decapsulated Base64 documents with private access control. |
| **Web3Forms API** | Direct asynchronous contact and inquiry dispatching system. |

---

## 📁 Project Directory Structure

```text
Cinero'26/
├── 📁 api/
│   ├── 📄 registration.js         # Existing registration serverless function
│   └── 📄 crew.js                # Crew portal proxy to private Apps Script
├── 📁 public/                    # Static assets & brand media
├── 📁 src/
│   ├── 📁 components/            # Modular reusable components
│   │   ├── 📄 BrandLogo.tsx      # SVG brand logo component
│   │   ├── 📄 ContactSection.tsx # Web3Forms contact form & alerts
│   │   ├── 📄 CrewNavbar.tsx     # Responsive crew dashboard navigation
│   │   ├── 📄 DashboardStatCard.tsx
│   │   ├── 📄 GuidelinesSection  # Rules & submission guidelines
│   │   ├── 📄 Hero.tsx           # Cinematic landing hero
│   │   ├── 📄 Navbar.tsx         # Mobile-responsive slide-out navigation
│   │   ├── 📄 ProtectedCrewRoute.tsx
│   │   ├── 📄 RegistrationAnalytics.tsx
│   │   ├── 📄 RegistrationTable.tsx
│   │   ├── 📄 SocialLinks.tsx    # Official festival social channels
│   │   └── 📄 TimelineSection    # Interactive event roadmap
│   ├── 📁 data/                  # Static constants, links & districts
│   ├── 📁 pages/
│   │   ├── 📄 About.tsx          # About festival & organizing body
│   │   ├── 📄 CrewLogin.tsx      # Crew sign-in page
│   │   ├── 📄 CrewDashboard.tsx  # Protected registration dashboard
│   │   ├── 📄 Guidlines.tsx      # Full guidelines documentation
│   │   └── 📄 Registration.tsx   # 5-Step interactive registration form
│   ├── 📁 lib/
│   │   └── 📄 crewApi.ts         # In-memory session and crew API client
│   ├── 📁 types/
│   │   └── 📄 crew.ts            # Crew API types
│   ├── 📄 App.tsx                # Main SPA routing and view management
│   └── 📄 main.tsx               # React DOM entry point
├── 📄 GoogleAppsScript.js        # Full Apps Script backend code
├── 📄 CrewGoogleAppsScript.js    # Separate protected crew dashboard service
├── 📄 vercel.json                # Vercel routing & HTTP Security Headers
├── 📄 vite.config.ts             # Dev proxy middleware & Vite build configs
└── 📄 package.json               # Dependencies & build scripts
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (never committed to Git):

```env
# Contact Form (Web3Forms)
VITE_WEB3FORMS_ACCESS_KEY=your_web3forms_key_here

# Google Apps Script Webhook Endpoint
GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

# Separate server-side crew dashboard Apps Script endpoint (never use a VITE_ prefix)
GOOGLE_APPS_SCRIPT_CREW_URL=
```

## 🎬 CINERO’26 Crew Coordinator Portal

The crew portal is available at `/crew/login` and `/crew/dashboard`. It reads the existing registration spreadsheet through a separate Google Apps Script deployment and the same-origin `/api/crew` proxy. Keep the existing registration form, `/api/registration` endpoint, registration Apps Script deployment, and its webhook URL unchanged.

The current registration writer in `GoogleAppsScript.js` creates these tabs and headers:

- `University Registrations`: `Timestamp`, `Reference ID`, `Category`, `Team Name`, `Team Size`, `University / Institute` (among other registration fields).
- `School Registrations`: `Timestamp`, `Reference ID`, `Category`, `Team Name`, `Team Size`, `School Name` (among other registration fields).

The crew API reads only the fields needed for the dashboard. It does not return contact details, student IDs, payment data, signatures, or uploaded-file links. Participant totals are shown only when every non-empty registration row has a valid team size. Missing sheets or required headers cause an explicit error rather than fabricated statistics.

### Configure the separate Apps Script service

1. Create a **new standalone Apps Script project**. Do not edit the existing registration Apps Script project.
2. Copy `CrewGoogleAppsScript.js` into its script editor.
3. In **Project Settings → Script Properties**, add:
   - `SPREADSHEET_ID`: the ID of the existing spreadsheet from its URL. Keep the spreadsheet private and do not put this ID in React source or commit it.
   - `CREW_USERNAME`: `crew.cinero`
   - `CREW_INITIAL_PASSWORD`: set the chosen private password here. Use a unique, strong password before public deployment; never commit it or put it in frontend code.
4. Select `setupCrewCredentials` in the Apps Script editor and run it once. It stores a salted PBKDF2-HMAC-SHA-256 hash and removes `CREW_INITIAL_PASSWORD` from Script Properties.
5. Run `authorizeCrewSpreadsheetAccess` once and approve spreadsheet access. The account that runs/deploys the script must have access to the existing spreadsheet.
6. Select **Deploy → New deployment → Web app**. Choose **Execute as: Me** and set access to **Anyone** so the website's server-side proxy can call it. The spreadsheet remains private; only the Apps Script accesses its contents, and protected actions require a valid session.
7. Copy the new web app `/exec` URL. This must be a separate URL from the existing registration webhook.

To rotate credentials, set a new `CREW_USERNAME` and `CREW_INITIAL_PASSWORD` in Script Properties and run `setupCrewCredentials` again. The initial plaintext password is removed after hashing. Do not deploy with a shared or weak password.

Sessions are stored in Apps Script cache, expire after 30 minutes, and are validated server-side on every protected request. The browser keeps the opaque token in memory only; it is not saved in local or session storage. Login attempts are temporarily rate-limited. Logout removes the server-side session.

### Connect and deploy the website

- **Local:** set `GOOGLE_APPS_SCRIPT_CREW_URL` in the root `.env` to the new crew deployment URL, then restart Vite. The local Vite middleware proxies `/api/crew`; this setting must not use a `VITE_` prefix.
- **Vercel:** add `GOOGLE_APPS_SCRIPT_CREW_URL` as a server-side Environment Variable for each deployment environment, then redeploy. The browser calls only `/api/crew`; the Vercel function keeps the Apps Script URL private.

### Test the crew portal

1. Start the website and visit `/crew/login`. Sign in with the username and password configured in Script Properties.
2. Confirm successful login opens `/crew/dashboard`; category totals and records should match the existing private spreadsheet.
3. Search by team name or registration ID, filter categories, view a record, and test refresh.
4. Confirm an invalid password is rejected, a direct visit to `/crew/dashboard` without a valid in-memory session redirects to `/crew/login`, and logout invalidates the session.
5. Check browser network requests: dashboard data should be fetched from the website's `/api/crew`, never directly from Google Sheets or Apps Script.
6. Run `npm run build` and `npm run lint` before deployment.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/cinero-26.git

# Navigate to project directory
cd cinero-26

# Install dependencies
npm install
```

### 3. Local Development
```bash
# Start Vite development server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
# Run TypeScript validation and compile bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 Deployment & Custom Domain Setup

### 1. Deploying on Vercel
1. Push your repository to GitHub / GitLab.
2. Import the project into **[Vercel](https://vercel.com)**.
3. In **Settings ➔ Environment Variables**, add:
   - `GOOGLE_SHEET_WEBHOOK_URL`: Your Google Apps Script Web App URL.
   - `VITE_WEB3FORMS_ACCESS_KEY`: Your Web3Forms access token.
4. Click **Deploy**. Vercel will automatically configure both the Vite SPA and `/api/registration` serverless function.

### 2. Connecting Custom Domain (`cinero-26.live`)
1. Go to your Vercel Project Dashboard ➔ **Settings** ➔ **Domains**.
2. Enter **`cinero-26.live`** and click **Add** (also recommend adding `www.cinero-26.live`).
3. In your Domain Registrar DNS settings (where you purchased the domain), configure the DNS records:
   - **Type A**: Name `@` ➔ Value `76.76.21.21`
   - **Type CNAME**: Name `www` ➔ Value `cname.vercel-dns.com`
4. Once DNS propagates, your site will be live securely with automatic SSL at **[https://cinero-26.live](https://cinero-26.live)**.

---

## 🛡️ Security & Privacy Compliance

- **Restricted Asset Protection**: Student IDs and bank transaction slips uploaded by applicants are stored under private permissions in Google Drive and can only be accessed by authorized committee editors.
- **Zero-Trust Client Submissions**: The frontend does not expose Google Script endpoints directly to prevent spamming and DDoS exploitation.
- **Strict Anti-Abuse Controls**: Built-in 20MB payload ceiling prevents memory saturation attacks.

---

<p align="center">
  <b>CINERO'26</b> • Organized with ❤️ by <b>J'PURA VOICE FILMING DIVISION</b><br/>
  <i>University of Sri Jayewardenepura, Sri Lanka</i>
</p>
