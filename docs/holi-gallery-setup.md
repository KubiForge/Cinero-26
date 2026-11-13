# Holi photo upload and gallery setup

The upload page sends each photo to the server, which saves it privately in Google Drive and adds a `PENDING` row to the `Gallery_Photos` sheet. The public gallery returns only rows whose `Status` is `APPROVED`; image bytes are served through the server-side Drive proxy.

## 1. Configure Apps Script

1. Open the Apps Script project containing `GoogleAppsScript.js` and replace its code with the updated file.
2. In **Project Settings → Script properties**, add:
   - `GOOGLE_SHEET_READ_TOKEN`: the same random 64-character-or-longer token used by Vercel.
   - `GALLERY_UPLOAD_TOKEN`: a separate random 64-character-or-longer token used by Vercel.
   - `GALLERY_REVIEW_TOKEN`: another separate random 64-character-or-longer token used by Vercel.
   - `GALLERY_DRIVE_READER_EMAIL`: the Google service-account email configured below.
3. Run `authorizeDrive()` and `initializeGalleryPhotosSheet()` once in the Apps Script editor and approve the requested permissions.
4. Deploy a new **Web app** version. Set **Execute as** to the script owner and access to **Anyone**. The server-side tokens authorize data operations; never put them in the browser.

The script creates a private `CINERO'26 Holi Gallery Uploads` Drive folder on the first upload and grants the configured service account viewer access. Keep the spreadsheet and Drive folder restricted to the organizing team.

## 2. Configure Google Drive access

1. Create a Google Cloud service account and enable the Google Drive API for its project.
2. Create a private key for the service account.
3. Keep the service-account private key server-side. Do not commit it or add it to any `VITE_` variable.

## 3. Configure the server

Set these variables in Vercel (and in `.env.local` for local server development):

- `GOOGLE_SHEET_WEBHOOK_URL`: the deployed Apps Script Web app URL.
- `GOOGLE_SHEET_READ_TOKEN`: exactly the same token as the Apps Script property.
- `GALLERY_UPLOAD_TOKEN`: exactly the same token as the Apps Script property.
- `GALLERY_REVIEW_TOKEN`: exactly the same token as the Apps Script property.
- `GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL`: the service-account email.
- `GOOGLE_DRIVE_SERVICE_ACCOUNT_PRIVATE_KEY`: the full private key; preserve its newlines (Vercel accepts multiline values).

Redeploy after changing Vercel environment variables. Local API routes are available through `npm run dev`.

## 4. Review uploads

Each successful submission adds a private photo and a `PENDING` row to `Gallery_Photos`. Crew members can sign in at `/crew/login`, open **Gallery photo review** from the dashboard, and approve, reject, or delete pending photos. Approved photos appear in the public `/holi-gallery` and can be viewed and downloaded. Rejected photos stay private; deleting moves the Drive file to Trash and records the `DELETED` status in the sheet. Do not approve a photo until it is cleared for public viewing.

The upload page supports up to 10 photos per batch, with a 3 MB maximum per photo to fit the serverless request limit. The “under review” confirmation appears only after the server confirms the photo was saved.
