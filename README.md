# CivicAlert Backend

Node.js + Express + MongoDB backend for the CivicAlert mobile app.

## Features

- Express API with CORS and JSON parsing
- MongoDB (Mongoose) models: User, Report
- JWT authentication (register/login/me)
- Reports CRUD (create, list, get by id, update/delete own)
- Health check at `/health`

## Quick Start

### 1) Install dependencies

```powershell
cd c:\Users\User\Desktop\Projects\CivicAlert\CivicAlert-Backend
npm install
```

### 2) Configure environment

Copy `.env.example` to `.env` and update values as needed.

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/civicalert
JWT_SECRET=replace_me_in_production
JWT_EXPIRES_IN=7d
```

### 3) Run

- Development (auto-reload):

```powershell
npm run dev
```

- Production:

```powershell
npm start
```

The API will be available at `http://localhost:3000`.

## API Overview

- `GET /health` – service status
- `POST /api/auth/register` – { name?, email, password }
- `POST /api/auth/login` – { email, password }
- `GET /api/auth/me` – requires `Authorization: Bearer <token>`

- `GET /api/reports` – list reports (optional `?status=open|in_progress|resolved`)
- `GET /api/reports/:id` – get a report by id
- `POST /api/reports` – create (auth required)
- `GET /api/reports/me/list` – list my reports (auth required)
- `PATCH /api/reports/:id` – update own report (auth required)
- `DELETE /api/reports/:id` – delete own report (auth required)

## Project Structure

```
src/
  app.js             # Express app setup
  server.js          # Server entry + DB connect
  config/db.js       # Mongo connection
  middleware/
    auth.js          # JWT auth middleware
    errorHandler.js  # Error formatting
  models/
    User.js
    Report.js
  controllers/
    authController.js
    reportController.js
  routes/
    index.js
    authRoutes.js
    reportRoutes.js
```

## Notes

- Keep `.env` out of version control (see `.gitignore`).
- Default JWT secret is for dev only; set a strong value in production.
- If Express or Mongoose versions change, review breaking changes before upgrading.
