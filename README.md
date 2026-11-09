# Skriva (frontend)

Lecture notes platform for 300 level students at Bells University of Technology. Students browse courses and preview or download PDF notes. Lecturers add courses and upload notes.

Built from SKRIVA PRD v1.1 with React, Vite, React Router, Tailwind CSS and Lucide React.

## Run it

```
npm install
npm run dev
```

Build for production with `npm run build`. The output goes to `dist/`.

## Backend

Copy `.env.example` to `.env` and set the API address:

```
VITE_API_URL=http://localhost:5000/api
```

With `VITE_API_URL` set, login, courses, notes and PDFs use the backend. The endpoints and data shapes it expects are in [API.md](API.md).

With `VITE_API_URL` empty, the app runs on in-browser demo data: any password of 6+ characters logs in, and courses and notes are stored in the browser (IndexedDB), so they are only visible in the browser that created them. There are no pre-loaded courses or notes. Lecturers add courses on the Courses page, then upload notes under them.

## Structure

- `src/pages`: screens (landing, login, student, lecturer, profile)
- `src/components`: shared UI (layouts, cards, dialogs, forms)
- `src/api.js`: all backend requests
- `src/store.jsx`: app state; picks the backend or the browser as the data source
- `src/db.js`: in-browser storage used when there is no backend
- `src/data/mock.js`: departments and demo profiles

## Deploying

`vercel.json` sends every route to `index.html`, so pages like `/student/dashboard` still work after a refresh. Set `VITE_API_URL` in the host's environment variables.

## Scope

Open to 300 level students only. The landing page does not focus on COLCOMP.
