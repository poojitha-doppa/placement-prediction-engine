# Production Checklist

## Required Configuration

- Set `NODE_ENV=production`.
- Set a strong `JWT_SECRET` of at least 32 random characters.
- Set `FRONTEND_URL` and `CORS_ORIGIN` to the deployed frontend origin.
- Set a real `DATABASE_URL` for MongoDB.
- Set `GEMINI_API_KEY` and `YOUTUBE_API_KEY` only if those features are enabled.
- Remove any local `.env` files from deployment artifacts and secret stores.

## Deployment Steps

- Install dependencies in the root project and in [`backend`](C:/Users/ajayc/OneDrive/Desktop/placement-prediction-engine-main/backend).
- Build the frontend with `npm run build`.
- Build the backend with `cd backend && npm run build`.
- Start the backend with `node dist/index.js` from [`backend`](C:/Users/ajayc/OneDrive/Desktop/placement-prediction-engine-main/backend).
- Serve the frontend `dist` directory from static hosting or a CDN.
- Run the Flask ML service separately on port `5000` if ML analytics are required.

## Production Expectations

- Password reset responses should not expose reset links in production.
- Mock mode should be disabled operationally by requiring a valid MongoDB connection in deployed environments.
- Resume uploads require writable persistent storage for the `uploads` directory or a replacement object-store integration.
- AI and YouTube integrations should have rate limits, quota monitoring, and fallback messaging.

## Verification

- Verify `GET /health` returns `200`.
- Verify signup, login, profile update, roadmap generation, and reset-password flows against the deployed URLs.
- Verify the ML service health endpoint at `http://<ml-host>:5000/health` if analytics are enabled.
- Confirm CORS only allows the intended frontend origin.
- Confirm JWT secret, database URL, and API keys are injected through the deployment platform, not committed files.

## Remaining Risk

- Frontend dependency audit still reports dev-tooling vulnerabilities involving `vite`, `esbuild`, and `@typescript-eslint`.
- Frontend production build emits a large bundle warning and should be code-split before high-traffic deployment.
- Email delivery for password reset is still development-oriented and needs a real mail provider integration.
