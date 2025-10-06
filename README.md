# Pärnu Kalevi Jalgrattakool — Attendance Tracker

Mobile-first rakendus kahele treenerile õpilaste kohaloleku haldamiseks. Frontend on loodud React + Vite + TypeScript tehnoloogiatega ning toetub Google Apps Script backendile, mis suhtleb Google Sheetsi tabeliga.

## Kiirstart

1. Kopeeri `.env.example` fail `cp .env.example .env` käsuga ja täida vajalikud väärtused:
   ```
   VITE_SHARED_PASSWORD="salasona"
   VITE_API_BASE_URL="https://script.google.com/macros/s/DEPLOYMENT_ID/exec"
   VITE_API_KEY="API_KEY"
   VITE_TIMEZONE="Europe/Tallinn"
   ```
2. Paigalda sõltuvused:
   ```bash
   npm install
   ```
3. Käivita arenduskeskkond:
   ```bash
   npm run dev
   ```

## Testid

```bash
npm run test
```

## Peamised tehnoloogiad

- React 18 + TypeScript
- TailwindCSS
- Vite
- Vitest & React Testing Library
- Headless UI
