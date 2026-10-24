# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Web3Forms contact form

1. Create a Web3Forms access key for `cinero2026@gmail.com` at [web3forms.com](https://web3forms.com/).
2. Copy `.env.example` to `.env.local` and set `VITE_WEB3FORMS_ACCESS_KEY` to the generated key.
3. Restart the Vite development server. For production, add the same variable to the hosting provider's build environment.

The access key is used by the browser to submit the form, so it is included in the client bundle. Use a key created for the intended recipient email.

## Registration form and Google Sheets

1. Open the target Google Sheet and its Apps Script project.
2. Paste the code from `GoogleAppsScript.js` into the Apps Script editor and save it. The script is configured to write to the spreadsheet ID in the code.
3. Deploy the Apps Script project as a web app that executes as you and allows access to anyone, then copy its `/exec` URL.
4. Set `GOOGLE_SHEET_WEBHOOK_URL` to that URL in `.env.local` for local serverless development and in Vercel's Environment Variables for production.
5. Redeploy the Vercel project after setting the environment variable. If you change the Apps Script code, create a new deployment version.

The registration page posts to the `/api/registration` serverless function. Keep the Apps Script URL in `GOOGLE_SHEET_WEBHOOK_URL` without the `VITE_` prefix so it is not bundled into the public browser code.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
