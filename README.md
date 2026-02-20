# Creator Analytics Dashboard

Project that implements a full-stack Creator Analytics Dashboard. Users can register/login, add creators (identity only), upload profile images to AWS S3, and view backend-generated mock analytics with charts.

## Tech stack
- Frontend: React (Vite), Tailwind CSS, react-chartjs-2 (Chart.js), Axios
- Backend: Node.js, Express, Mongoose (MongoDB)
- Auth: JWT, password hashing with bcryptjs
- File storage: AWS S3 (uploads via `multer-s3`)

## Project structure
- `backend/` — Express API, models, routes
- `frontend/` — React app (Vite), pages and components

## Environment variables
Create `.env` in `backend/` with:

- `MONGODB_URI` — MongoDB connection string (or uses local fallback)
- `JWT_SECRET` — JWT signing secret
- `AWS_ACCESS_KEY_ID` — AWS credentials
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET` — S3 bucket name
 - `AWS_S3_BUCKET` or `S3_BUCKET_NAME` — S3 bucket name
- `PORT` — optional backend port (default 4000)

Frontend env (optional):
- `VITE_API_BASE` — backend API base (e.g. `https://api.example.com/api`). If unset, defaults to `http://localhost:4000/api`.
 - `VITE_API_BASE` — frontend env var for backend API base (e.g. `https://api.example.com/api`). If unset, defaults to `http://localhost:4000/api`.

Keep secrets out of source control.

## API Endpoints

Authentication
- `POST /api/auth/register` — body: `{ name, email, password }` → returns `{ token, user }`
- `POST /api/auth/login` — body: `{ email, password }` → `{ token, user }`
- `GET /api/auth/me` — auth required → user
- `POST /api/auth/logout` — no-op (client removes token)

Creators
- `POST /api/creators` — auth required; body: `{ name, platform, username, profileImageUrl }` (identity only)
- `GET /api/creators` — list user's creators (admin sees all)
- `GET /api/creators/:id` — get creator (identity)
- `PUT /api/creators/:id` — update identity fields
- `DELETE /api/creators/:id` — delete

Upload
- `POST /api/upload/creator-image` — `multipart/form-data` field `image` (auth required) → returns `{ url }` (S3 URL)

Analytics (mocked/generated)
- `GET /api/analytics/dashboard` — returns `{ totalCreators, totalFollowers, avgEngagement }` for the user (or global for admin)
- `GET /api/analytics/creator/:creatorId` — returns analytics record (includes `creator` identity in response)
- `POST /api/analytics/refresh/:creatorId` — regenerates and appends a new snapshot

## Analytics generation
- All analytics are generated server-side by `backend/utils/analyticsGenerator.js`.
- Snapshot rules (example):
  - `followers`: random between 5,000 and 500,000
  - `engagementRate`: random between 1% and 10%
  - `avgLikes` ≈ `followers * engagementRate`
  - `historical`: time series (30 days by default) stored with each analytics document for charts
- Refreshing a creator appends a new historical data point and updates summary fields.

## AWS S3 setup
1. Create an S3 bucket (private write; public read allowed for uploaded objects if you want direct image URLs).
2. Add the bucket name to `AWS_S3_BUCKET` and ensure `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` have `s3:PutObject` and `s3:GetObject` permissions.
3. The backend uses `multer-s3` to upload images and returns the `location` URL.

Security notes
- Passwords are hashed with `bcryptjs`.
- JWT tokens are validated by middleware (`backend/middleware/auth.js`).
- Role checks enforced server-side: default `user` and `admin`.

## Run locally

Backend
```bash
cd backend
npm install
# create .env with required vars
npm run dev
```

Frontend
```bash
cd frontend
npm install
# optionally set VITE_API_BASE
npm run dev
```

## Deployment

Backend (suggested)
- Use Render / Railway / EC2. Ensure env vars are configured in the host.
- Use MongoDB Atlas for production DB.

Frontend (suggested)
- Use Vercel or Netlify. Provide `VITE_API_BASE` as an environment variable that points to your backend API URL.

## Live URLs
- Frontend: (add your deployed frontend URL here)
- Backend API: (add your backend API URL here)

## Notes / Next steps
- Admin UI and platform-wide analytics can be implemented as a bonus.
- Add better validation and tests as needed.

---
If you want, I can now: 1) prepare deployment manifests / scripts for Render + Vercel, or 2) implement admin panel and RBAC UI. Which should I do next?
