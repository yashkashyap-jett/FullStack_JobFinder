# JobFinder

JobFinder is a full-stack job board for two user roles:

- **Candidates** can create a profile, browse and filter jobs, save bookmarks, upload a resume, and track or withdraw applications.
- **Recruiters** can manage a company profile, upload a company logo, publish jobs, and review or update applicant statuses.

The project is split into a React frontend and an Express/MongoDB backend.

## Tech stack

| Area | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Router, Tailwind CSS, Axios |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB |
| Authentication | JWT access tokens and HTTP-only refresh-token cookies |
| File storage | ImageKit (resumes, profile photos, company logos) |

## Project structure

```text
.
├── jobFinderFrontend/   # React/Vite client (runs on port 5173)
└── jobFinderBackend/    # Express API (runs on port 3000)
```

## Prerequisites

- Node.js 18 or newer
- npm
- A MongoDB connection string
- An ImageKit private API key for file uploads

## Getting started

1. Install the backend dependencies:

   ```bash
   cd jobFinderBackend
   npm install
   ```

2. Create `jobFinderBackend/.env` with your own values:

   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/jobFinder
   JWT_SEC=replace-with-a-long-random-secret
   PRIVATE_KEY=your-imagekit-private-key
   ```

   `PRIVATE_KEY` is required for resume, profile-photo, and company-logo uploads. Keep this file private; it is already ignored by Git.

3. Start the backend in one terminal:

   ```bash
   npm run dev
   ```

   The API starts at `http://localhost:3000`.

4. In another terminal, install and run the frontend:

   ```bash
   cd jobFinderFrontend
   npm install
   npm run dev
   ```

5. Open the URL displayed by Vite (normally `http://localhost:5173`). The Vite dev server proxies API requests to the backend automatically.

## Available scripts

| Directory | Command | Purpose |
| --- | --- | --- |
| `jobFinderBackend` | `npm run dev` | Start the API with Nodemon |
| `jobFinderFrontend` | `npm run dev` | Start the Vite development server |
| `jobFinderFrontend` | `npm run build` | Create a production frontend build |
| `jobFinderFrontend` | `npm run lint` | Run Oxlint |
| `jobFinderFrontend` | `npm run preview` | Preview the production build |

## API overview

All endpoints are served from `http://localhost:3000`. Protected routes require an `Authorization: Bearer <access-token>` header; role-specific routes also enforce either `candidate` or `recruiter` access.

| Base path | Main capabilities |
| --- | --- |
| `/auth` | Register, log in, refresh access token, log out |
| `/candidate` | Create, view, and update a candidate profile; upload a resume or profile image; view dashboard data |
| `/recruiter` | Create, view, and update a company profile; upload a logo; view dashboard data |
| `/jobs` | Public job listing/detail pages; recruiter job creation, editing, and deletion |
| `/applications` | Apply, view candidate applications, withdraw; recruiter applicant review and status updates |
| `/bookmarks` | Candidate job bookmarks |

The public `GET /jobs` endpoint supports filtering and pagination query parameters including `search`, `location`, `minSalary`, `maxSalary`, `sort`, `view`, `page`, `limit`, and `postedBy`.

## Upload rules

- Resumes: PDF only, maximum 5 MB (`resume` form field).
- Profile photos and company logos: PNG, JPEG/JPG, or WebP, maximum 5 MB (`profile` and `companyLogo` form fields respectively).

## Local authentication note

The backend currently sends refresh cookies with `secure: true` and `sameSite: "strict"`. Browsers only persist `secure` cookies over HTTPS, so token refresh/logout-cookie behavior may not work on a plain `http://localhost` setup. For local development, use HTTPS or adjust that cookie setting in a development-only configuration.

## Security

Do not commit `.env` files, JWT secrets, MongoDB credentials, or ImageKit private keys. Rotate any credential that has ever been accidentally shared.
