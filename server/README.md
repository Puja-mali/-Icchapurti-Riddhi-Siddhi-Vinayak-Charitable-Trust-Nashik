# Siddhivinayak Charitable Trust - Production Backend Foundation

Production-ready, enterprise-grade backend architecture built with **Node.js, Express, TypeScript, MongoDB, and Mongoose**. Features JWT authentication, role-based access control (RBAC), strict request validation, structured logging, centralized error handling, and robust security middleware.

---

## 1. How to Install Backend Dependencies

Navigate to the `server/` directory and install the required npm dependencies:

```bash
cd server
npm install
```

---

## 2. How to Create `.env` from `.env.example`

In the `server/` directory, copy the template file to `.env`:

```bash
cp .env.example .env
```

Open `.env` in your text editor and provide your specific configuration settings (detailed in Section 9 below).

---

## 3. How to Create a MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and log in or create a free account.
2. Click **Create** to deploy a new cluster (the free M0 Shared Cluster tier is ideal for development and prototyping).
3. Choose your preferred cloud provider and region (e.g., AWS / Mumbai `ap-south-1`).
4. Under **Security Quickstart**:
   - **Database Access**: Create a database user with a secure username and password (e.g., `siddhivinayak_admin`). Select the built-in role **Read and write to any database**.
   - **Network Access**: Add your current IP address, or allow access from anywhere (`0.0.0.0/0`) if deploying to cloud containers like Cloud Run or Render.
5. Create a database named `siddhivinayak_trust`.

---

## 4. How to Obtain the MongoDB Connection String

1. In MongoDB Atlas, navigate to **Database** and click **Connect**.
2. Select **Drivers** (Node.js).
3. Copy the SRV connection URI provided. It will look like:
   ```
   mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/siddhivinayak_trust?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with your database user credentials.
5. Paste this connection URI into your `server/.env` file as `MONGODB_URI`.

---

## 5. How to Start the Backend Locally

### Development Mode (with hot-reloading):
```bash
cd server
npm run dev
```

### Production Build:
```bash
cd server
npm run build
```

### Production Start:
```bash
cd server
npm start
```

---

## 6. How to Test `GET /api/health`

Verify the backend service vitality and database connectivity:

```bash
curl http://localhost:5000/api/health
```

### Expected Response Format:
```json
{
  "success": true,
  "message": "Siddhivinayak Charitable Trust Backend service is operational.",
  "data": {
    "server": {
      "status": "online",
      "uptimeSeconds": 42,
      "environment": "development",
      "timestamp": "2026-09-10T09:50:00.000Z"
    },
    "database": {
      "status": "connected",
      "configured": true,
      "databaseName": "siddhivinayak_trust"
    },
    "api": {
      "version": "1.0.0",
      "name": "Siddhivinayak Charitable Trust REST API"
    }
  }
}
```

---

## 7. How to Register a Real Test Account

Register a new user account with real credentials using `curl` or Postman:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Rajesh Sharma",
    "email": "rajesh.sharma@example.com",
    "phone": "+91 98200 12345",
    "password": "SecurePassword123!",
    "role": "DONOR"
  }'
```

### Expected Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "66dfb37c02b3...",
      "name": "Rajesh Sharma",
      "email": "rajesh.sharma@example.com",
      "phone": "+91 98200 12345",
      "role": "DONOR",
      "isActive": true,
      "isEmailVerified": false,
      "createdAt": "2026-09-10T09:55:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "15m"
    }
  }
}
```

---

## 8. How Authentication & RBAC Work

1. **Password Hashing**: User passwords are encrypted with `bcrypt` (12 salt rounds) before persistence. The `passwordHash` field is marked with `select: false` in Mongoose so it is never exposed in queries or API payloads.
2. **Dual-Token Flow**:
   - **Access Token**: Short-lived (15 minutes), passed in the HTTP `Authorization: Bearer <accessToken>` header for protected endpoints.
   - **Refresh Token**: Longer-lived (7 days), used via `POST /api/auth/refresh` to obtain a fresh access token without re-prompting for credentials.
3. **Authentication Middleware (`authenticate`)**:
   - Validates the JWT signature and expiration.
   - Queries MongoDB to ensure the user still exists and `isActive === true`. Deactivated accounts are immediately blocked with `403 Forbidden`.
   - Attaches the sanitized user object to `req.user`.
4. **Role-Based Authorization (`authorize(...roles)`)**:
   - Enforces role restrictions (`ADMIN`, `STAFF`, `VOLUNTEER`, `DONOR`).
   - Example: An admin route configured with `authorize('ADMIN')` will automatically reject donors and volunteers with a `403 Forbidden` response.

---

## 9. Required Environment Variables

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Local port for Express server | `5000` |
| `NODE_ENV` | Runtime environment | `development` or `production` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `http://localhost:3000` |
| `MONGODB_URI` | MongoDB Atlas or local MongoDB connection URI | `mongodb+srv://...` |
| `JWT_ACCESS_SECRET` | Secret key for signing short-lived access tokens | 256-bit random string |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens | 256-bit random string |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifespan | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifespan | `7d` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit sliding window (milliseconds) | `900000` (15 minutes) |
| `RATE_LIMIT_MAX_REQUESTS`| General API requests allowed per window | `100` |
| `AUTH_RATE_LIMIT_MAX_REQUESTS` | Sensitive auth attempts allowed per window | `20` |

---

## 10. Database Models Summary

1. **User**: Name, unique lowercase email, phone, encrypted password hash, role (`ADMIN`, `STAFF`, `VOLUNTEER`, `DONOR`), active state, timestamps.
2. **Campaign**: Title, description, goal and raised amounts, status (`DRAFT`, `ACTIVE`, `PAUSED`, `COMPLETED`, `ARCHIVED`), dates, image, createdBy.
3. **Donation**: Donor ref, campaign ref, amount, currency, paymentStatus (`PENDING`, `SUCCESS`, `FAILED`, `REFUNDED`), gateway, transactionId, unique receiptNumber, timestamps. *(Initialized with empty DB state — no fake transactions generated).*
4. **Volunteer**: User ref, skills array, availability, registeredEvents, volunteerHours.
5. **Event**: Title, description, location, eventDate, capacity, registeredVolunteers, status.
6. **HelpRequest**: Requester ref, title, description, category, verification documents, status, admin notes.
7. **ContactMessage**: Name, email, phone, subject, message, status (`NEW`, `IN_PROGRESS`, `RESOLVED`, `SPAM`).
8. **SiteSettings**: Site name, default & supported languages, kumbhMode, maintenanceMode, contact details.

---

## 11. Security Audit & Production Hardening TODOs

- [ ] **TODO (Security Review)**: Conduct formal penetration testing on JWT signing algorithms and token rotation.
- [ ] **TODO (Production Hardening)**: Replace in-memory rate limiting with Redis-backed store (`rate-limit-redis`) for horizontally scaled deployments.
- [ ] **TODO (Token Revocation)**: Implement Redis token blocklist for immediate token invalidation upon user logout or password change.
- [ ] **TODO (Email Verification)**: Integrate SMTP / SendGrid service to dispatch real confirmation links to `isEmailVerified`.
- [ ] **TODO (Admin Provisioning)**: Implement two-factor authentication (2FA/TOTP) and restricted super-admin invitation workflow.
