# Service Marketplace

A full-stack service marketplace platform built for the Ethiopian market, connecting customers with local service providers.

## Tech Stack

**Backend**
- Node.js + Express
- Sequelize ORM + PostgreSQL (Supabase)
- Passport.js (Google OAuth 2.0)
- JWT Authentication
- Chapa Payment Gateway (Ethiopia)

**Frontend**
- React + TypeScript
- Vite
- Tailwind CSS
- React Router

## Features

- Google OAuth 2.0 authentication
- JWT-based protected routes
- Browse and search service providers
- Ethiopian location fields (city, sub-city, woreda)
- Provider profile creation and management
- Booking system
- Reviews and ratings
- Payment integration (Chapa)

## Project Structure

service-marketplace/
├── backend/
│   ├── config/          # Database and Passport configuration
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth middleware
│   ├── models/          # Sequelize models
│   ├── routes/          # Express routes
│   ├── app.js
│   └── server.js
└── frontend/
├── src/
│   ├── components/  # Reusable components
│   ├── context/     # React context
│   ├── pages/       # Page components
│   └── services/    # API services
└── index.html


## Getting Started

### Prerequisites
- Node.js v18+
- PostgreSQL (or Supabase account)
- Google Cloud Console project
- Chapa account (for payments)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
PORT=3000
DB_URL=your_supabase_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:3000
CHAPA_SECRET_KEY=your_chapa_secret_key
CHAPA_PUBLIC_KEY=your_chapa_public_key
```

Start the server:

```bash
node --watch server.js
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /auth/google | Google OAuth login | No |
| GET | /auth/google/callback | OAuth callback | No |
| GET | /categories | Get all categories | No |
| POST | /categories | Create category | Yes |
| GET | /providers | Get all providers | No |
| POST | /providers/profile | Create provider profile | Yes |
| GET | /bookings | Get user bookings | Yes |
| POST | /bookings | Create booking | Yes |
| GET | /reviews | Get all reviews | No |
| POST | /reviews | Create review | Yes |
| POST | /payments | Initialize payment | Yes |
| GET | /payments/verify/:tx_ref | Verify payment | No |

## License

MIT