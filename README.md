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
│   └── 📄 registration.js         # Production Vercel Serverless Function
├── 📁 public/                    # Static assets & brand media
├── 📁 src/
│   ├── 📁 components/            # Modular reusable components
│   │   ├── 📄 BrandLogo.tsx      # SVG brand logo component
│   │   ├── 📄 ContactSection.tsx # Web3Forms contact form & alerts
│   │   ├── 📄 GuidelinesSection  # Rules & submission guidelines
│   │   ├── 📄 Hero.tsx           # Cinematic landing hero
│   │   ├── 📄 Navbar.tsx         # Mobile-responsive slide-out navigation
│   │   ├── 📄 SocialLinks.tsx    # Official festival social channels
│   │   └── 📄 TimelineSection    # Interactive event roadmap
│   ├── 📁 data/                  # Static constants, links & districts
│   ├── 📁 pages/
│   │   ├── 📄 About.tsx          # About festival & organizing body
│   │   ├── 📄 Guidlines.tsx      # Full guidelines documentation
│   │   └── 📄 Registration.tsx   # 5-Step interactive registration form
│   ├── 📄 App.tsx                # Main SPA routing and view management
│   └── 📄 main.tsx               # React DOM entry point
├── 📄 GoogleAppsScript.js        # Full Apps Script backend code
├── 📄 vercel.json                # Vercel routing & HTTP Security Headers
├── 📄 vite.config.ts             # Dev proxy middleware & Vite build configs
└── 📄 package.json               # Dependencies & build scripts
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory (never committed to Git):

```env
# Contact Form (Web3Forms)
VITE_WEB3FORMS_ACCESS_KEY=your_web3forms_key_here

# Google Apps Script Webhook Endpoint
GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

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
