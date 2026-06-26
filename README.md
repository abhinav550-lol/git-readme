# GitREADME

GitREADME is a full-stack web app that helps GitHub users generate a polished profile README from real GitHub data, preview it in the browser, refine it in Markdown, and publish it back to GitHub.

The app is split into a React frontend and a TypeScript/Express backend. It uses GitHub OAuth for authentication, GitHub API data for profile and repository insights, Redis and BullMQ for background work, MongoDB for persistence, and AI-assisted generation for README sections and profile assembly.

## What it does

- Sign in with GitHub OAuth and load the authenticated user's profile.
- Fetch repositories, language usage, contribution data, and repository README content from GitHub.
- Generate profile README sections such as the introduction, tech stack, stats, featured repositories, and socials.
- Combine selected sections into a complete GitHub profile README.
- Preview the generated Markdown before publishing.
- Edit the generated Markdown directly in the UI.
- Push the final README to the user's GitHub profile repository.
- Support elevated OAuth permissions for richer profile and repository access when needed.
- Rate-limit AI-backed generation endpoints to protect the service from abuse.

## Key Features

### Authentication and Access

- GitHub OAuth login with session-based authentication.
- Logged-in users can access their GitHub identity, repositories, and profile metadata.
- Logout flow clears the active session cleanly.

### README Generation

- AI-powered generation for individual profile sections.
- Full profile assembly from selected sections.
- Markdown preview with an inline editor for final tweaks.
- Publishing flow that updates the user's profile repository README.md.

### GitHub Data and Insights

- User profile lookup and repository listing.
- Repository README extraction for project context.
- Language statistics and contribution statistics.
- Dynamic cards for language and contribution summaries.

### Reliability and Performance

- Redis-backed caching and queue infrastructure.
- Background worker for stats-related jobs.
- Input validation with Zod.
- Centralized error handling and session helpers.
- Route-level rate limiting for generation endpoints.

## Project Structure

This repository is organized as a monorepo:

- `backend/` - Express API, GitHub integrations, AI prompts, Redis, queues, and persistence.
- `frontend/` - React app for authentication, profile generation, preview, and publishing.

### Backend Highlights

- `controllers/` - request handlers for auth, profiles, and app data.
- `routes/` - API route definitions.
- `github/` - GitHub API helpers and card generators.
- `ai/` - prompt templates and LLM response generation.
- `queue/` - BullMQ queues and worker processes.
- `cache/` - Redis connection helpers.
- `utils/` - session, auth, token, and rate limit utilities.
- `validations/` - request schemas.

### Frontend Highlights

- `src/components/` - landing page, dashboard, docs, profile generation, and preview UI.
- `src/api/` - API wrappers and mutations.
- `src/store/` - Redux auth state.
- `src/components/parts/profile/` - individual profile section builders.

## Main User Flow

1. The user opens the app and signs in with GitHub.
2. The backend exchanges the OAuth code and stores the session.
3. The dashboard loads the user's repositories and profile data.
4. The user selects sections to generate for a GitHub profile README.
5. The backend generates section content and composes a final Markdown document.
6. The user previews the README, edits the Markdown if needed, and publishes it to GitHub.

## API Overview

### Health and App Data

- `GET /health` - health check.
- `GET /api/app/user-count` - total user count.

### Authentication and User Data

- `GET /api/user/auth/github` - start GitHub OAuth.
- `GET /api/user/auth/github/callback` - OAuth callback.
- `GET /api/user/auth/me` - current authenticated user.
- `POST /api/user/auth/github/logout` - end the session.
- `GET /api/user/repos` - list user repositories.
- `GET /api/user/repos/:repoName/readme` - fetch a repository README.
- `GET /api/user/user-languages` - get language usage for the user.
- `PUT /api/user/profile-repo/readme` - update the README.md in the profile repository.

### Profile Generation

- `GET /api/profile/data/contribution-stats`
- `GET /api/profile/card/contribution-stats`
- `GET /api/profile/data/language-stats`
- `GET /api/profile/card/language-stats`
- `POST /api/profile/section/generate-introduction`
- `POST /api/profile/section/generate-techstack`
- `POST /api/profile/section/generate-stats`
- `POST /api/profile/section/generate-repos`
- `POST /api/profile/section/generate-socials`
- `POST /api/profile/section/generate-profile`
- `POST /api/profile/section/generate-additional`

## Tech Stack

### Frontend

- React 19
- TypeScript
- Vite
- Redux Toolkit
- React Router
- React Query
- Tailwind CSS
- Framer Motion
- React Toastify

### Backend

- Node.js
- Express
- TypeScript
- MongoDB
- Redis
- BullMQ
- Zod
- Session-based authentication
- GitHub API integration

## Environment Variables

### Backend

Create a `.env` file in `backend/` with the required values:

- `PORT`
- `CLIENT_URL`
- `FRONTEND_URL`
- `SESSION_SECRET`
- `JWT_SECRET`
- `MONGODB_URI`
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_USERNAME`
- `REDIS_PASSWORD`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_REDIRECT_URI`
- `GITHUB_TOKEN`
- `GROQ_API_KEY`
- `API_BASE_URL`
- `TOKEN_CRYPTO_KEY`
- `TOKEN_CRYPTO_ALGORITHM`
- `TOKEN_CRYPTO_KEY_ENCODING`
- `TOKEN_CRYPTO_IV_LENGTH`
- `NODE_ENV`

### Frontend

Create a `.env` file in `frontend/`:

- `VITE_BACKEND_URL`

## Getting Started

### 1. Install Dependencies

From the repository root:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure Environment Variables

Set the backend and frontend variables listed above before starting the app.

### 3. Run the Backend

```bash
cd backend
npm run dev
```

### 4. Run the Background Worker

```bash
cd backend
npm run worker
```

### 5. Run the Frontend

```bash
cd frontend
npm run dev
```

## Available Scripts

### Backend

- `npm run dev` - start the API in watch mode.
- `npm run worker` - start the queue worker in watch mode.

### Frontend

- `npm run dev` - start the Vite development server.
- `npm run build` - type-check and build the app.
- `npm run lint` - run ESLint.
- `npm run preview` - preview the production build.

## Roadmap Ideas

These are natural next steps for the project if you want to keep expanding it:

- Add stronger per-user AI quota controls across every generation endpoint.
- Expand the repository context flow so each project can collect optional notes from the user before generation.
- Add more profile publishing options beyond the default profile repository workflow.
- Support richer README export and sharing flows.

## Why This Project Exists

GitREADME is meant to reduce the friction of building a professional GitHub profile README. Instead of manually assembling badges, stats, repository lists, and social links, users can connect their GitHub account, generate a polished draft from live data, edit the result, and publish it with minimal effort.
