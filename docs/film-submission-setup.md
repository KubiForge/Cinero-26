# CINERO'26 Film Submission Pages

Share one submission landing page with teams:

- Submission category selector: `/submission`

It displays one card for each category. The category-specific pages remain available:

- Inter-School: `/submission/school`
- Inter-University: `/submission/university`

The selected form starts with Section 01 and does not ask for a registration reference ID. Before creating a submission, the server matches the entered team name and leader email against the registrations for that category.

## Vercel routing and function limit

The React/Vite site is deployed as static files from `dist`; the SPA rewrite in `vercel.json` serves direct routes such as `/submission` from `index.html`. The 12 API entry points under `api/` remain serverless functions. The existing `/api/crew-session` and `/api/film-submission-upload-session` URLs are preserved through rewrites to their shared handlers so they do not require extra functions. Keep shared server modules outside `api/` and check the Hobby plan function limit before adding API entry points.

## Google Apps Script deployment

1. Copy the updated `GoogleAppsScript.js` into the Apps Script project attached to the existing registration spreadsheet.
2. In **Project Settings → Script properties**, make sure `GOOGLE_SHEET_READ_TOKEN` matches the Vercel environment variable with the same name.
3. If Drive permissions have not yet been granted, run `authorizeDrive` once in the Apps Script editor and approve the requested permissions.
4. Create a new web-app deployment version (or update the existing deployment). Set **Execute as** to an account that can edit the registration spreadsheet and create private Drive folders/files; set access to **Anyone**. The server-side token protects the data operations.
5. Confirm the deployed URL ends in `/exec` and is the URL configured in Vercel.

### Vercel environment variables

Film submissions need no new Vercel environment variables. The Vercel project must already have these server-side variables:

- `GOOGLE_SHEET_WEBHOOK_URL`: the deployed Apps Script web-app URL ending in `/exec`.
- `GOOGLE_SHEET_READ_TOKEN`: the same secret as the Apps Script script property.

Add them in **Vercel → Project → Settings → Environment Variables** only if they are missing, then redeploy. Do not expose the token through a `VITE_` variable. The film submission Drive root folder ID is created and saved automatically in Apps Script; do not set it manually.

For local submission testing with `npm run dev`, put the same two server-only variables in the git-ignored `.env.local` file. Do not commit the file or expose the token in browser code.

## Storage and upload rules

On the first upload, the script creates the private Drive folder `CINERO'26 Film Submissions`, then a folder for the team's reference ID and name. Each team's uploaded materials go into that folder. Successful submissions create the `School Film Submissions` or `University Film Submissions` tab in the existing Google spreadsheet.

Both categories provide a Google Drive link to the final film and must allow anyone with the link to view it. School teams upload a principal-signed confirmation letter and may upload a poster. University teams upload the poster, completed script PDF, and one PDF containing the team declaration and all members' university ID cards.

Each registered team can submit once. Teams should check all details and link-sharing permissions before submitting.
