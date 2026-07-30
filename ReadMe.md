# Service Marketplace

This repository contains a service marketplace application with two main parts:

- `backend/` - Express backend API
- `frontend/` - React + Vite frontend

## Prerequisites

- Node.js (v18 or later recommended)
- npm
- PostgreSQL database accessible from the backend

## Setup

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 3. Configure backend environment

Create a `.env` file inside `backend/` and add at least the following values:

```env
PORT=5000
DB_URL=postgres://username:password@hostname:port/database
```

If your project uses Google OAuth or other third-party providers, add those keys as needed.

## Run the project

### Run backend in development

```bash
cd backend
npm run dev
```

This starts the Express server using `nodemon`.

### Run frontend in development

```bash
cd frontend
npm run dev
```

This starts the Vite development server.

## Build the frontend

To create a production build for the frontend:

```bash
cd frontend
npm run build
```

## Notes

- The backend connects to PostgreSQL using `DB_URL` from `backend/config/database.js`.
- The backend server listens on the port defined in `backend/server.js` via `process.env.PORT`.
- There is no shared root-level run script; use the `backend` and `frontend` folders separately.
