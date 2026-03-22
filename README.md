# Placement Prediction Dashboard

A modern web application built with React + TypeScript, a Node.js backend, MongoDB via Prisma, and a Python ML service to help students track and improve placement readiness.

## Features

### Core functionality
- Dashboard overview with placement probability, readiness metrics, and KPI cards
- Student profile management with academic details, skills, target companies, coding profiles, and resume upload
- System-generated roadmap based on profile, analytics, and company gaps
- Manual roadmap builder so users can maintain their own custom preparation plan
- Company matching with fit scores, explanations, reasons, and skill gap analysis
- Analytics and optimization with Monte Carlo simulation outputs
- Weekly progress tracking and roadmap adaptation
- GitHub and LeetCode sync for external preparation signals

### AI and ML capabilities
- Gemini-powered roadmap generation and dashboard insight support when `GEMINI_API_KEY` is configured
- ML-powered placement prediction service running separately through Flask
- Simulation-driven recommendations for improving placement probability
- Company-specific improvement guidance based on matched skills and missing skills

### Technical highlights
- React 18 with TypeScript
- Node.js + Express backend
- Prisma ORM with MongoDB
- Python Flask ML service
- Material UI component system
- Recharts for data visualization
- React Query for server-state management
- JWT authentication
- PDF export support
- Responsive layout for mobile, tablet, and desktop

## Project structure

```text
placement-prediction-engine-main/
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   ├── .env
│   └── package.json
├── ml/
│   ├── api.py
│   ├── requirements.txt
│   └── *.pkl / model assets
├── src/
│   ├── api/
│   │   └── api.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopNavbar.tsx
│   │   ├── ui/
│   │   │   ├── CompanyTable.tsx
│   │   │   ├── GaugeChart.tsx
│   │   │   ├── KpiCard.tsx
│   │   │   ├── LineChartSkills.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── RadarSkillGapChart.tsx
│   │   │   └── WeekCard.tsx
│   │   ├── MonteCarloChart.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── RoadmapQuestionnaire.tsx
│   ├── pages/
│   │   ├── AnalyticsPage.tsx
│   │   ├── CompaniesPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   └── RoadmapPage.tsx
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   └── pdfExport.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── theme.ts
├── .env
├── package.json
├── vite.config.ts
└── README.md
```

## Setup

### Prerequisites
- Node.js 18+
- npm
- Python 3.10+
- MongoDB Atlas or a local MongoDB instance
- Optional: Google Gemini API key

### Install dependencies

```bash
npm install
cd backend
npm install
cd ..
```

### Frontend environment

Create or update the root `.env` file:

```env
VITE_API_URL=http://localhost:3000
```

### Backend environment

Create `backend/.env`:

```env
JWT_SECRET=your-secret-key-min-32-chars
DATABASE_URL=<your-mongodb-atlas-connection-string>
PORT=3000
CORS_ORIGIN=http://localhost:5173
FRONTEND_URL=http://localhost:5173
GEMINI_API_KEY=<your-gemini-api-key>
```

### ML environment

Install Python dependencies:

```bash
npm run setup:ml
```

This installs the packages from `ml/requirements.txt`.

## Running the project

### Start frontend + backend

```bash
npm run dev
```

### Start frontend + backend + ML together

```bash
npm run dev:all
```

### Start only the ML service

```bash
npm run dev:ml
```

### Local URLs
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3000`
- ML health: `http://127.0.0.1:5000/health`

## Default login

```text
Email: poojithadoppa8@gmail.com
Password: Poojitha@2006
```

## How the product flow works

### Dashboard
The dashboard shows the current placement probability using persisted profile data, resume-derived inputs, synced coding-profile data, and tracked analytics.

### Analytics
The analytics page uses Monte Carlo-style simulation outputs and optimization insights to show how different improvement strategies can increase placement probability.

### Company matching
Company matches are computed from stored profile strength, synced external signals, and required company skills. Each recommendation includes:
- fit score
- explanation
- reasons
- skill gaps
- recompute freshness

### Roadmaps
The app supports two roadmap modes:

- System generated roadmap
  - built from saved roadmap preferences
  - informed by persisted profile data, analytics, and company gaps
  - kept separate from manual planning

- Manual roadmap
  - user-created and user-edited
  - saved independently
  - does not overwrite the system-generated roadmap

## API overview

### Auth
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

### Profile and integrations
- `GET /api/profile`
- `PUT /api/profile`
- `POST /api/profile/resume`
- `GET /api/integrations`
- `POST /api/integrations/sync`

### Roadmaps
- `GET /api/roadmap`
- `GET /api/roadmap/manual`
- `POST /api/roadmap/manual`
- `POST /api/roadmap/preferences`
- `GET /api/roadmap/preferences`
- `POST /api/roadmap/progress`
- `GET /api/roadmap/progress-history`

### Analytics
- `GET /api/analytics`
- `GET /api/placement-summary`
- `GET /api/skill-analytics`
- `GET /api/company-matches`
- `POST /api/company-matches/recompute`
- `GET /api/optimization-insights`
- `GET /api/ml-health`

### Agent endpoints
- `POST /agent/generate-roadmap`
- `GET /agent/dashboard-insights`

## Important notes

### MongoDB
This project is designed to be used with MongoDB persistence. Many key flows such as profile storage, roadmap storage, integrations, analytics history, and company matching depend on a valid `DATABASE_URL`.

### Gemini
If `GEMINI_API_KEY` is missing, the app still runs, but Gemini-powered roadmap and insight generation will be limited.

### ML service
The ML service is separate from the Node backend. If it is not running, ML-based prediction and simulation features will degrade or show status warnings.

### Scikit-learn warning
You may see a model version warning while starting the ML service if the installed scikit-learn version differs from the version used when the model file was created. The service can still start, but retraining or re-exporting the model is recommended for long-term stability.

## Build

### Frontend

```bash
npm run build
```

### Backend

```bash
cd backend
npm run build
```

## Deployment notes

- Use real environment secrets in production
- Use a real MongoDB deployment
- Run the ML service as a separate process/service
- Configure `CORS_ORIGIN`, `FRONTEND_URL`, and `VITE_API_URL` to match deployed URLs
- Review `PRODUCTION_CHECKLIST.md` before deploying

## Technology stack

- Frontend: React, TypeScript, Vite, Material UI, React Query, Recharts
- Backend: Node.js, Express, Prisma, JWT, Zod
- Database: MongoDB
- ML: Python, Flask, scikit-learn
- AI: Google Gemini

## Support

If you extend this project:
- add new pages in `src/pages/`
- add reusable components in `src/components/`
- update shared types in `src/types/index.ts`
- add backend routes/controllers/services in `backend/src/`
- keep frontend and backend env values aligned
