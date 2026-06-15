# TechQuiz Frontend

TechQuiz is a web application for creating, sharing, and taking technical
quizzes. Users can register or sign in, browse available quizzes, create custom
quizzes, join a quiz with a share code, submit answers, and view scores with
AI-generated feedback.

This directory contains the React frontend. It communicates with the FastAPI
backend through a REST API and uses Supabase for user authentication.

## Features

- User registration, email verification, login, and logout
- Login using either an email address or a registered name
- Protected routes for authenticated users
- Dashboard with default quizzes and user-created quizzes
- Quiz creation with multiple questions and answer options
- Shareable quiz codes
- Question-by-question quiz experience with progress tracking
- Quiz submission, score calculation, and AI-generated feedback
- Quiz deletion with confirmation
- Animated page elements and toast notifications
- Responsive dark-themed interface

## Technology Stack

- **React 19** - user interface
- **Vite 8** - development server and production build
- **React Router** - client-side routing and protected pages
- **Supabase JS** - authentication and session management
- **Zustand** - lightweight global state management
- **Tailwind CSS** - utility-based styling
- **Framer Motion** - transitions and animations
- **Lucide React** - interface icons
- **ESLint** - code quality checks

## Application Flow

1. `main.jsx` mounts the React application.
2. `App.jsx` restores the Supabase session and listens for authentication
   changes.
3. React Router redirects unauthenticated users to `/login`.
4. Authenticated users can browse, create, join, take, and delete quizzes.
5. API functions in `src/services/api.js` communicate with the FastAPI backend.
6. Supabase manages account creation, login, logout, and session persistence.
7. Zustand stores the current user and application toast notifications.

## Frontend Structure

```text
frontend/
|-- public/
|   |-- favicon.svg
|   `-- icons.svg
|-- src/
|   |-- assets/
|   |   `-- hero.png
|   |-- components/
|   |   |-- Navbar.jsx
|   |   `-- Toast.jsx
|   |-- pages/
|   |   |-- CreateQuiz.jsx
|   |   |-- Dashboard.jsx
|   |   |-- Login.jsx
|   |   |-- QuizPage.jsx
|   |   `-- Results.jsx
|   |-- services/
|   |   |-- api.js
|   |   `-- supabase.js
|   |-- store/
|   |   |-- useAuthStore.js
|   |   `-- useToastStore.js
|   |-- App.jsx
|   |-- App.css
|   |-- index.css
|   `-- main.jsx
|-- .env
|-- eslint.config.js
|-- index.html
|-- package.json
|-- postcss.config.js
|-- tailwind.config.js
|-- vercel.json
`-- vite.config.js
```

### Main Files

| File or directory | Responsibility |
| --- | --- |
| `src/main.jsx` | Creates the React root and renders the application. |
| `src/App.jsx` | Defines routes, restores authentication, and protects private pages. |
| `src/pages/` | Contains the main screens shown by React Router. |
| `src/components/` | Contains reusable navigation and notification components. |
| `src/services/api.js` | Wraps requests to the FastAPI quiz endpoints. |
| `src/services/supabase.js` | Creates and exports the Supabase client. |
| `src/store/useAuthStore.js` | Stores the current authenticated user. |
| `src/store/useToastStore.js` | Stores and removes success, error, and information messages. |
| `src/index.css` | Contains global styles and shared visual utilities. |
| `vite.config.js` | Configures Vite and the React plugin. |

## Pages and Routes

| Route | Page | Description |
| --- | --- | --- |
| `/login` | `Login.jsx` | Registers users and signs them in using email or name. |
| `/` | `Dashboard.jsx` | Lists quizzes, accepts quiz codes, and manages created quizzes. |
| `/create` | `CreateQuiz.jsx` | Builds and publishes a custom quiz. |
| `/quiz/:id` | `QuizPage.jsx` | Loads a quiz by ID or code and submits the selected answers. |
| `/results/:quizId` | `Results.jsx` | Displays the score, accuracy, and AI-generated feedback. |

All routes except `/login` require an authenticated Supabase session.

## API Integration

`src/services/api.js` uses `VITE_API_URL` as its base URL. During local
development, the frontend expects the backend at:

```text
http://localhost:8000/api
```

The service module provides functions for:

- Loading default and user-created quizzes
- Finding quizzes by ID or share code
- Creating and deleting quizzes
- Submitting quiz answers
- Loading attempt results and feedback

## Environment Variables

Create or update `.env` in the frontend directory:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_API_URL=http://localhost:8000/api
```

Only expose the Supabase anonymous/public key in the frontend. Service-role
keys and other server secrets must stay in the backend environment.

## Local Development

### Prerequisites

- Node.js 20 or newer
- npm
- The FastAPI backend running on `http://localhost:8000`
- A configured Supabase project

### Install and Run

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in a browser.

## Available Commands

```bash
npm run dev
```

Starts the Vite development server.

```bash
npm run build
```

Creates an optimized production build in `dist/`.

```bash
npm run preview
```

Serves the production build locally for verification.

```bash
npm run lint
```

Runs ESLint across the frontend source.

## Backend Connection

Start the backend before using features that load or modify quizzes:

```bash
cd ../backend
uvicorn main:app --reload --host localhost --port 8000
```

The backend must allow `http://localhost:5173` in its CORS configuration.
