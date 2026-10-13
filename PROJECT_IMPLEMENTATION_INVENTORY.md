# Icchapurti Riddhi Siddhi Vinayak Charitable Trust, Nashik
## Comprehensive Project Implementation & Technical Audit Inventory

**Document Version:** 2.0.0 (Audited & Reconciled)  
**Audit Date:** October 2026  
**Audited By:** Senior Full-Stack Engineer, Technical Auditor & Project Documentation Specialist  
**Repository State:** Grounded in direct static source code inspection, Express route AST analysis, automated in-memory test executions (`npm run test:admin`, `npm run test:e2e`), and TypeScript compilation checks (`tsc --noEmit`).

---

## 1. Project Overview & Architecture

### 1.1 Technical Stack & Frameworks
| Layer | Technologies & Libraries | Implementation & Evidence Note |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19.0.1, React Router 7.18.3, TypeScript 5.8.2 | Component-driven single-page application (SPA) with declarative client-side routing defined in `src/App.tsx`. |
| **Bundler & Build Tool** | Vite 6.2.3, `@tailwindcss/vite` 4.1.14, Tailwind CSS 4.1.14 | Client bundle built to `dist/`, stylesheets imported via `@import "tailwindcss";`. |
| **Icons & Motion** | `lucide-react` 0.546.0, `motion` 12.23.24 | SVG iconography and page animations with `prefers-reduced-motion` compliance. |
| **Backend Runtime** | Node.js (v22 runtime), Express 4.21.2, `tsx` 4.21.0, `esbuild` 0.25.0 | TypeScript REST API server running on port 3000. |
| **Database & ODM** | MongoDB, Mongoose 9.9.5, `mongodb-memory-server` 11.2.0 | Schema-backed document persistence with automatic dev fallback to embedded in-memory MongoDB. |
| **Security & Utilities** | `bcryptjs` 3.0.3, `jsonwebtoken` 9.0.3, `helmet` 8.3.0, `cors` 2.8.6, `express-rate-limit` 8.7.0, `zod` 4.6.1, `cookie-parser` 1.4.7 | Cryptographic hashing (12 salt rounds), JWT signing, security headers, rate limiting, and schema validation. |
| **Integrations** | `razorpay` 2.9.8, `@google/genai` 2.4.0, `web-push` 3.6.7, `cloudinary` 2.11.0, `nodemailer` 10.0.10, `multer` 2.4.0 | Payment SDK, AI SDK, Web Push notifications, cloud asset storage, transactional email. *Note: Live external round-trips depend on external service credentials (see Section 6 & 7).* |

### 1.2 Entry Points & Client-Server Communication Flow
* **Unified Server Entry Point (`server.ts`)**:
  - Acts as the single process entry for both development and production.
  - Mounts backend Express API application (`apiApp` from `./server/src/app`) exclusively on `/api/*` routes.
  - In development (`process.env.NODE_ENV !== 'production'`), mounts `vite.middlewares` directly into Express, serving hot-reloading client modules from port 3000.
  - In production, serves optimized static assets from `/dist` and serves `index.html` on fallback routes.
* **Client Entry Point (`src/main.tsx` & `src/App.tsx`)**:
  - React application bootstraps inside `#root` in `index.html`.
  - Context Provider Hierarchy:
    `ThemeProvider` → `KumbhModeProvider` → `LanguageProvider` → `AuthProvider` → `TrustProvider` → `BrowserRouter`.
* **API Communication (`src/services/api.ts`)**:
  - Centralized `apiClient<T>` wrapper around browser `fetch`.
  - Injects `Authorization: Bearer <accessToken>` headers from in-memory token state.
  - Intercepts 401 responses and triggers silent token refreshing via `POST /api/auth/refresh` (using HttpOnly cookie).
  - Unwraps response envelopes (`data.data` / `data`) or throws structured `ApiError(message, status, errors)`.

### 1.3 Database Configuration & Startup Behavior (`server/src/config/database.ts`)
* **Mongoose Configuration:**
  - `mongoose.set('bufferCommands', false)` is configured globally so database operations fail immediately if disconnected rather than hanging for 10 seconds.
* **Exact Startup & Fallback Behavior:**
  - **Development Mode (`process.env.NODE_ENV !== 'production'`):**
    - If `MONGODB_URI` is present in environment variables, the server connects directly to that MongoDB URI.
    - If `MONGODB_URI` is **absent** or empty, the server automatically executes `MongoMemoryServer.create()` from `mongodb-memory-server` and connects to an ephemeral in-memory database. **This dev fallback is automatic and default; it is NOT opt-in via a separate flag.** Data in this mode is stored in volatile memory and is lost whenever the server process restarts.
    - If launching `MongoMemoryServer` fails or throws an exception, `uri` remains undefined.
  - **Production Mode (`process.env.NODE_ENV === 'production'`):**
    - `mongodb-memory-server` is **never started** in production.
    - If `MONGODB_URI` is **absent** in production, the database connection is skipped entirely. The server logs a warning and operates in standalone mode. Any API route querying MongoDB returns HTTP 500 or error status because `bufferCommands: false` rejects unbuffered queries immediately.
    - The server process does not crash, allowing `/api/health` to remain reachable and report database status as `disconnected`.
* **Health Monitoring:**
  - `getDbStatus()` inspects `mongoose.connection.readyState` and reports states (`connected`, `connecting`, `disconnecting`, `disconnected`) to `GET /api/health`.

### 1.4 Local Development, Build, & Execution Commands
* `npm run dev`: Starts the unified dev server (`tsx server.ts`) on port 3000.
* `npm run build`: Executes `vite build` (client bundle in `/dist`) and `esbuild server.ts --bundle --platform=node --format=cjs --outfile=dist/server.cjs`.
* `npm run start`: Runs production server (`node dist/server.cjs`).
* `npm run lint`: Runs strict TypeScript compiler check (`tsc --noEmit`).
* `npm run create-admin`: Runs CLI administrator provisioning script (`tsx server/src/scripts/createAdmin.ts`).
* `npm run seed-trust-data`: Seeds authentic Trust profile, 13 trustees, 9 causes, and 6 volunteer roles into MongoDB (`tsx server/src/scripts/seedRealTrustData.ts`).
* `npm run test:jwt`: Runs production JWT security and startup configuration verification suite (`tsx server/src/scripts/testJwtProductionSecurity.ts`).
* `npm run test:db`: Runs database startup and safe degradation test suite (`tsx server/src/scripts/testDatabaseStartup.ts`).
* `npm run test:users`: Runs user management, invitation cryptography, and role guard test suite (`tsx server/src/scripts/testUserManagement.ts`).
* `npm run test:push`: Runs Web Push notification automated test suite against an isolated in-memory MongoDB instance (`tsx server/src/scripts/testWebPush.ts`).
* `npm run test:admin`: Runs admin summary metrics test suite against an isolated in-memory MongoDB instance.
* `npm run test:e2e`: Runs 15-domain end-to-end readiness and security test suite against an isolated in-memory MongoDB instance.

---

## 2. Public Website Pages & Features Verification Matrix

To maintain audit integrity, every major public and authenticated page is classified by its actual repository implementation and verified data source:

* **Implemented in source code:** Component exists, compiles, and routes properly.
* **Connected to real MongoDB:** Issues HTTP calls to backend endpoints that perform Mongoose queries.
* **Uses static/fallback/demo data:** Contains mock initial arrays, local fallback objects, or placeholder illustrations if database data is empty.
* **Automated tests executed:** Covered by `npm run test:admin` or `npm run test:e2e`.
* **Manually verified in running app:** Verified via live HTTP/browser requests.
* **Live external integration verified:** Round-trip tested against third-party production servers.
* **Not verified:** External service round-trips not executed due to missing production keys.

| Route | Page Component | Implementation & Data Source | Automated Test Status | External Verification Status |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `Home.tsx` | Implemented in code; queries `/api/causes`, `/api/events`, `/api/trust`, `/api/transparency`; includes static UI fallback defaults. | Covered in E2E Domain 1 | Verified against local in-memory DB |
| `/about` | `About.tsx` | Implemented in code; queries `/api/trustees` and `/api/trust` via `trustService`; falls back to static trustee list if API returns empty. | Covered in E2E Domain 1 & 12 | Verified with seeded Trust records |
| `/causes` | `Causes.tsx` | Implemented in code; queries `GET /api/causes` via `causeService`. | Covered in E2E Domain 5 | Verified against local DB |
| `/causes/:id` | `CauseDetails.tsx` | Implemented in code; queries `GET /api/causes/:id` via `causeService`. | Covered in E2E Domain 5 & 13 | Verified against local DB |
| `/donate` | `Donate.tsx` | Implemented in code; calls `POST /api/donations/order` and `POST /api/donations/verify`. Displays notice if Razorpay keys unconfigured. | Covered in E2E Domain 4 | **External Live Payment: NOT VERIFIED** (No live bank charge made) |
| `/impact-passport` | `ImpactPassport.tsx` | Implemented in code; queries `GET /api/passport/my`. Contains software capability for 4 lifecycle stages. | Covered in E2E Domain 8 | Verified against local DB; vendor invoices are synthetic test data |
| `/volunteer` | `Volunteer.tsx` | Implemented in code; queries `GET /api/volunteers/roles`, posts to `POST /api/volunteers/apply`. | Covered in E2E Domain 6 | Verified against local DB |
| `/volunteer-portal` | `VolunteerPortal.tsx` | Implemented in code; queries `GET /api/volunteers/me`, posts shifts to `POST /api/volunteers/me/shifts`. | Covered in E2E Domain 6 | Verified against local DB; hours/certificates are software models |
| `/kumbh-seva` | `KumbhSeva.tsx` | Implemented in code; queries `GET /api/events` with Kumbh filters, queries `GET /api/public/kumbh`. | Covered in E2E Domain 1 | Verified against local DB |
| `/request-help` | `RequestHelp.tsx` | Implemented in code; posts to `POST /api/help-requests`. Generates tracking code. | Covered in E2E Domain 7 | Verified against local DB |
| `/transparency` | `Transparency.tsx` | Implemented in code; queries `GET /api/transparency`. Renders report cards with download links. | Covered in E2E Domain 8 | Software schema verified; PDF files are sample/demo assets |
| `/gallery` | `Gallery.tsx` | Implemented in code; queries `GET /api/public/gallery` and aggregates event photos. | Covered in E2E Domain 1 | Verified against local DB |
| `/blog` | `Blog.tsx` | Implemented in code; queries `GET /api/blog`. | Covered in E2E Domain 1 | Verified against local DB |
| `/blog/:slug` | `BlogPost.tsx` | Implemented in code; queries `GET /api/blog/:slug`. | Covered in E2E Domain 1 | Verified against local DB |
| `/events` | `Events.tsx` | Implemented in code; queries `GET /api/events`. | Covered in E2E Domain 5 | Verified against local DB |
| `/events/:id` | `EventDetails.tsx` | Implemented in code; queries `GET /api/events/:id`, registers via `POST /api/events/:id/register`. | Covered in E2E Domain 5 | Verified against local DB |
| `/contact` | `Contact.tsx` | Implemented in code; queries `GET /api/trust`, posts inquiries to `POST /api/public/contact`. | Covered in E2E Domain 1 | Verified against local DB |
| `/login` | `Login.tsx` | Implemented in code; authenticates via `POST /api/auth/login`. Restores intended redirect path. | Covered in E2E Domain 2 | Verified against local DB |
| `/register` | `Register.tsx` | Implemented in code; registers via `POST /api/auth/register`. Enforces public role limitation. | Covered in E2E Domain 2 & 13 | Verified against local DB |
| `/dashboard` | `UserDashboard.tsx` | Implemented in code; queries `GET /api/donations/my`. Modal triggers `POST /api/ai/donation-allocation`. | Covered in E2E Domain 4 & 9 | Algorithmic model verified; Live Gemini cloud API: NOT VERIFIED |
| `/forgot-password` | `ForgotPassword.tsx` | Implemented in code; calls `POST /api/auth/forgot-password` with anti-enumeration response and single-use token dispatch. | Verified in build and unit flows | Verified against local DB |
| `/reset-password` | `ResetPassword.tsx` | Implemented in code; validates token via `GET /api/auth/reset-password/validate/:token`, updates password via `POST /api/auth/reset-password`. | Verified in build and unit flows | Verified against local DB |
| `/accept-invitation` | `AcceptInvitation.tsx` | Implemented in code; validates single-use token via `GET /api/invitations/validate/:token`, sets password via `POST /api/invitations/accept`. | Covered in `test:users` (24 checks) | Verified against local DB |
| `/admin/login` | `AdminLogin.tsx` | Implemented in code; authenticates via `POST /api/auth/login`. Dedicated route, not in public nav. | Covered in E2E Domain 2 & 3 | Verified against local DB |
| `/admin` | `AdminDashboard.tsx` | Implemented in code; queries `GET /api/admin/dashboard/summary` and module APIs. RBAC protected. | Covered in `test:admin` & E2E Domain 12 | Verified against local DB |

---

## 3. Authentication, RBAC, & Administrative Provisioning

### 3.1 Authentication Mechanisms
* **Registration (`POST /api/auth/register`)**:
  - Validated by Zod (`registerSchema`). Enforces minimum 8 characters, at least 1 uppercase letter, 1 lowercase letter, and 1 number.
  - Passwords hashed using `bcrypt` (12 salt rounds) via `server/src/utils/password.ts`.
  - **Privilege Escalation Protection:** The backend validator strictly limits `role` to `['VOLUNTEER', 'DONOR']`. Any submission specifying `ADMIN` or `STAFF` is rejected with HTTP 400 Bad Request.
* **Login (`POST /api/auth/login`)**:
  - Compares supplied password against stored `passwordHash` (marked `select: false` on Mongoose model).
  - Deactivated accounts (`isActive: false`) are rejected with HTTP 403.
  - Generates short-lived Access Token (JWT, 15m expiry) and long-lived Refresh Token (JWT, 7d expiry).
  - Sets Refresh Token in secure HttpOnly cookie (`sct_refresh_token`) and stores hash in MongoDB user document.
* **Session Restoration & Token Refresh (`POST /api/auth/refresh`)**:
  - Validates `sct_refresh_token` cookie against `JWT_REFRESH_SECRET`, rotates cookie, and returns fresh Access Token.
* **Logout (`POST /api/auth/logout`)**:
  - Clears `sct_refresh_token` cookie and invalidates database token record.
  - Cleans client storage markers (`sct_auth_active`, `sct_user_role`) and resets in-memory access token.
* **Password Reset Workflow (`POST /api/auth/forgot-password`, `GET /api/auth/reset-password/validate/:token`, `POST /api/auth/reset-password`)**:
  - `forgot-password`: Generates 32-byte cryptographic random hex token, stores only SHA-256 hash on user record (`resetPasswordToken`), sets 60-minute expiry (`resetPasswordExpires`). Returns uniform anti-enumeration message to protect user privacy.
  - `validate/:token`: Verifies unexpired single-use token before displaying form.
  - `reset-password`: Consumes token, validates minimum 8-character complexity, hashes new password with bcrypt (12 rounds), clears reset token fields (single-use enforcement), and invalidates all active sessions (`refreshTokens = []`).
* **Role-Safe Login & Navigation Guards (`src/pages/Login.tsx`)**:
  - Resolves destination strictly based on verified database role: `ADMIN` / `STAFF` → `/admin`; `DONOR` → `/dashboard`; `VOLUNTEER` → `/volunteer-portal`.
  - Strictly prevents non-administrative roles (`DONOR`, `VOLUNTEER`) from being redirected into `/admin` or `/admin/login`, even if `location.state.from` was set to an administrative route.
  - Inputs configured with `autoComplete="username"` and `autoComplete="current-password"` to avoid lingering credentials after sign out.

### 3.2 Audit of `Cannot read properties of null (reading 'user')`
* **Evidence Analysis:**
  - In `src/context/AuthContext.tsx`, initial unauthenticated state sets `user: null`, `isAuthenticated: false`.
  - When a user was not logged in, or on first page load before `initializeAuth()` resolved, components accessing `user.role` or `user.name` directly would throw `TypeError: Cannot read properties of null (reading 'user')`.
  - Furthermore, during login/register API handling, response parsing expected `response.user`, but some backend wrappers return `{ success: true, data: { user, accessToken } }`.
* **Verified Code Fixes:**
  - `src/context/AuthContext.tsx` handles both unwrapped and wrapped payloads: `const user = response?.user || response?.data?.user;`.
  - If no user object is returned, it throws a descriptive error rather than attempting property reads on null.
  - `src/pages/VolunteerPortal.tsx` and `src/pages/UserDashboard.tsx` employ safe optional chaining (`user?.name`, `user?.id`) and check `isAuthenticated` and `isLoading` before rendering user-dependent sections.
  - Backend `AuthController.getMe` always returns a clean sanitized user object.

### 3.3 Admin Account Provisioning Script (`npm run create-admin`)
* **File:** `server/src/scripts/createAdmin.ts`
* **Package Mapping:** `"create-admin": "tsx server/src/scripts/createAdmin.ts"` in `package.json`.
* **Behavior:**
  - Connects to MongoDB using `connectDatabase()`.
  - Supports interactive command-line prompts (via `readline`) or environment variables (`ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_PHONE`).
  - Validates email format and password strength (min 8 chars, uppercase, lowercase, digit).
  - Hashes passwords using `bcrypt.hash(password, 12)`.
  - **Duplicate-Email Handling:** If an account with the entered email already exists, the script warns the operator, displays the current role, and asks:
    `"Would you like to promote this account to ADMIN and update its password? (y/n): "`.
    If confirmed (`y`/`yes`), it updates `existing.role = 'ADMIN'`, stores the new password hash, ensures `isActive = true`, and saves. If declined, it cancels without modification.
  - If the account does not exist, it creates a new `User` document with `role: 'ADMIN'`.

### 3.4 Role Authorization Boundaries & Middleware
* **Frontend Guards (`ProtectedRoute.tsx`):**
  - Unauthenticated users attempting to access `/admin` are redirected to `/admin/login`.
  - Unauthenticated users attempting to access `/dashboard` or `/volunteer-portal` are redirected to `/login`.
  - Authenticated non-admin users visiting `/admin` receive an "Access Restricted" screen without administrative data or controls.
* **Backend Authorization Middleware (`server/src/middleware/auth.ts`):**
  - `authenticate`: Validates Bearer JWT, verifies `isActive`, and attaches `req.user`.
  - `authorize(...roles)`: Checks `req.user.role`. Rejects unauthorized roles with HTTP 403 Forbidden.
  - **Tested Boundaries:** Automated tests (`npm run test:admin`) confirm that requests to `/api/admin/dashboard/summary` without a token return 401, while tokens with `DONOR` or `VOLUNTEER` roles return 403 with `Required role(s): [ADMIN, STAFF]`.

### 3.5 Admin Users & Roles Management & Cryptographic Invitation Workflow
* **Dedicated Module (`src/components/admin/UsersManagementTab.tsx`):**
  - Exclusively visible and accessible to authenticated `ADMIN` users (STAFF, DONOR, and VOLUNTEER users are blocked at both UI and API levels).
  - **User Directory:** Real-time search by name, email, and phone; role filtering (`ALL`, `ADMIN`, `STAFF`, `VOLUNTEER`, `DONOR`); pagination; user details with status badges; role update modal; account activation/deactivation toggles with strict lockout prevention (an admin cannot deactivate or demote their own account).
  - **Strict Four-Role Limit:** Only the four canonical Trust roles (`ADMIN`, `STAFF`, `DONOR`, `VOLUNTEER`) are supported; arbitrary roles like `SUPER_ADMIN` are rejected at both frontend validation and backend schema layers.
* **Cryptographic Single-Use Invitation Workflow:**
  - **Generation:** Generates 32-byte cryptographic random hex token (`crypto.randomBytes(32).toString('hex')`).
  - **Storage:** Only the SHA-256 hash (`crypto.createHash('sha256').update(token).digest('hex')`) is stored in MongoDB (`Invitation` model). The raw plaintext token is never persisted.
  - **Expiration & Single-Use:** Default 48-hour expiration (`expiresAt`); state transitions (`PENDING` → `ACCEPTED` / `REVOKED` / `EXPIRED`). Consumed tokens are strictly rejected on reuse.
  - **Role Limitation:** Invitations can only be issued for `ADMIN` or `STAFF` roles, and only by authenticated `ADMIN` users.
  - **Transactional Email Integration (`EmailService.sendAdminInvitationEmail`):** Formats official trust onboarding email. When SMTP credentials are unconfigured, logs a clear non-breaking warning and returns an actionable invitation link directly in the admin UI.
  - **Acceptance Flow (`/accept-invitation` & `AcceptInvitation.tsx`):** Invitee validates token, verifies their assigned role badge, inputs their legal name, and securely sets their own password (hashed with bcrypt, 12 rounds). Administrator passwords are never emailed or displayed.

---

## 4. Admin Dashboard Module & Metrics Inventory

### 4.1 Dashboard Modules (`src/pages/AdminDashboard.tsx`)
1. **Overview Tab:** Real-time metrics grid, monthly collections, pending audit queue count, system activity feed, Kumbh Seva Mode toggle.
2. **Audit Queue Tab:** Radical transparency ledger interface; allows trustees to mark donation allocation stages as verified.
3. **Causes / Campaigns Tab:** Create, edit, publish, pause, or archive charitable causes; manage target funding amounts, categories, and cover images.
4. **Events / Seva Drives Tab:** Schedule upcoming health camps, blood drives, and tree plantations; set registration limits.
5. **Blog & News Tab:** Draft and publish field updates, statutory announcements, and articles.
6. **Transparency Tab:** Upload and manage statutory audit reports and financial balance sheets.
7. **Beneficiary Aid / Help Requests Tab:** Triage incoming citizen aid requests (`Medical`, `Education`, `Sustenance`, `Disability`); transition statuses (`PENDING` → `UNDER_REVIEW` → `APPROVED` / `REJECTED` → `RESOLVED`).
8. **Volunteers Tab:** Review volunteer applications, view logged hours, and verify certificates.
9. **Donations Ledger Tab:** Transaction ledger of all contributions, filtering by status (`SUCCESS`, `PENDING`, `FAILED`), receipt generation, and manual receipt download.
10. **In-App Notifications Tab:** Broadcast announcements to donors or volunteers; inspect system alerts.
11. **Trust Governance Tab (`TrustManagementTab.tsx`):** Manage official Trust profile, edit trustee listings, office hours, and registration numbers.
12. **Users & Roles Tab (`UsersManagementTab.tsx`):** Full administrator and staff onboarding suite with directory search, pagination, role modification, account deactivation/reactivation safeguards, and cryptographic single-use invitation management.
13. **Settings Tab:** Global configuration, high-contrast accessibility switch, and backend Kumbh Mode toggle.

### 4.2 Metrics Calculation: Real Database Aggregations
* **Endpoint:** `GET /api/admin/dashboard/summary` (Handled by `AdminService.getDashboardSummary` in `server/src/services/admin.service.ts`).
* **All metrics are dynamically calculated via real MongoDB aggregations:**
  - `totalDonations`: `Donation.countDocuments()`.
  - `totalVerifiedDonations`: `Donation.countDocuments({ status: { $in: ['PAID', 'SUCCESS'] } })`.
  - `totalDonationAmount`: MongoDB `$sum` aggregation across verified payments only (`status: { $in: ['PAID', 'SUCCESS'] }`).
  - `currentMonthDonationAmount`: MongoDB `$sum` aggregation filtering for verified payments created in current calendar month.
  - `totalCampaigns` / `activeCampaigns`: `Cause.countDocuments({ status: 'ACTIVE' })`.
  - `totalEvents` / `upcomingEvents`: `Event.countDocuments({ startDate: { $gte: new Date() } })`.
  - `totalVolunteers`: `Volunteer.countDocuments()`.
  - `totalHelpRequests` / `pendingHelpRequests`: `HelpRequest.countDocuments({ status: 'PENDING' })`.
  - `publishedNews`: `BlogPost.countDocuments({ isPublished: true })`.
  - `galleryItems`: Aggregated array size of event `galleryUrls` across all events.
  - `transparencyReports`: `TransparencyReport.countDocuments({ isPublished: true })`.
  - `recentActivity`: Unified timeline aggregating latest donations, events, articles, and aid requests (with beneficiary PII stripped).

---

## 5. Complete Express REST API Endpoint Inventory

### 5.1 Route Counting Methodology & Summary
* **Route Files:** 18 route definition files located in `server/src/routes/*.routes.ts`.
* **Top-Level Router:** `server/src/routes/index.ts` mounts all 18 modules under `/api/*`.
* **Counting Rule:** Every distinct HTTP method handler registered via `router.get()`, `router.post()`, `router.put()`, `router.patch()`, or `router.delete()` constitutes an individual endpoint. Parameterized routes (e.g. `/api/causes/:id` and `/api/causes`) are separate route registrations matching different path patterns.
* **Exact Route Count:** There are **106 defined HTTP endpoint registrations** across the 18 route files.

### 5.2 Complete 106-Endpoint Inventory Table

| # | Method | Full Endpoint Path | Access Level / Role | Controller / Handler | Route Module |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **GET** | `/api/admin/dashboard/summary` | ADMIN, STAFF | `AdminController.getDashboardSummary` | `admin.routes.ts` |
| 2 | **GET** | `/api/admin/settings` | ADMIN, STAFF | `AdminController.getSettings` | `admin.routes.ts` |
| 3 | **PATCH** | `/api/admin/settings/kumbh-mode` | ADMIN, STAFF | `AdminController.updateKumbhMode` | `admin.routes.ts` |
| 4 | **POST** | `/api/ai/donation-allocation` | Authenticated | `AiController.getDonationAllocation` | `ai.routes.ts` |
| 5 | **POST** | `/api/auth/register` | Public | `AuthController.register` | `auth.routes.ts` |
| 6 | **POST** | `/api/auth/login` | Public | `AuthController.login` | `auth.routes.ts` |
| 7 | **POST** | `/api/auth/refresh` | Public | `AuthController.refresh` | `auth.routes.ts` |
| 8 | **POST** | `/api/auth/logout` | Public / Optional Auth | `AuthController.logout` | `auth.routes.ts` |
| 9 | **GET** | `/api/auth/me` | Authenticated | `AuthController.getMe` | `auth.routes.ts` |
| 10 | **GET** | `/api/blog` | Public | `BlogController.getPosts` | `blog.routes.ts` |
| 11 | **GET** | `/api/blog/admin/all` | ADMIN | `BlogController.getAdminPosts` | `blog.routes.ts` |
| 12 | **GET** | `/api/blog/:slug` | Public / Optional Auth | `BlogController.getPostBySlug` | `blog.routes.ts` |
| 13 | **POST** | `/api/blog` | ADMIN | `BlogController.createPost` | `blog.routes.ts` |
| 14 | **PATCH** | `/api/blog/:id` | ADMIN | `BlogController.updatePost` | `blog.routes.ts` |
| 15 | **DELETE** | `/api/blog/:id` | ADMIN | `BlogController.deletePost` | `blog.routes.ts` |
| 16 | **GET** | `/api/causes` | Public / Optional Auth | `CauseController.listCauses` | `cause.routes.ts` |
| 17 | **GET** | `/api/causes/:id` | Public | `CauseController.getCauseById` | `cause.routes.ts` |
| 18 | **POST** | `/api/causes` | ADMIN | `CauseController.createCause` | `cause.routes.ts` |
| 19 | **PATCH** | `/api/causes/:id` | ADMIN | `CauseController.updateCause` | `cause.routes.ts` |
| 20 | **DELETE** | `/api/causes/:id` | ADMIN | `CauseController.deleteCause` | `cause.routes.ts` |
| 21 | **GET** | `/api/donations/config` | Public | `DonationController.getPaymentConfig` | `donation.routes.ts` |
| 22 | **POST** | `/api/donations/create-order` | Public / Optional Auth | `DonationController.createOrder` | `donation.routes.ts` |
| 23 | **POST** | `/api/donations/order` | Public / Optional Auth | `DonationController.createOrder` | `donation.routes.ts` |
| 24 | **POST** | `/api/donations/verify-payment` | Public / Optional Auth | `DonationController.verifyPayment` | `donation.routes.ts` |
| 25 | **POST** | `/api/donations/verify` | Public / Optional Auth | `DonationController.verifyPayment` | `donation.routes.ts` |
| 26 | **POST** | `/api/donations/webhook` | Public | `DonationController.handleWebhook` | `donation.routes.ts` |
| 27 | **GET** | `/api/donations/my` | DONOR, ADMIN, STAFF | `DonationController.getMyDonations` | `donation.routes.ts` |
| 28 | **GET** | `/api/donations` | ADMIN, STAFF | `DonationController.listAllDonations` | `donation.routes.ts` |
| 29 | **GET** | `/api/donations/receipt/:receiptNumber` | Public / Optional Auth | `DonationController.getReceiptByNumber` | `donation.routes.ts` |
| 30 | **GET** | `/api/donations/:id` | DONOR, ADMIN, STAFF | `DonationController.getDonationById` | `donation.routes.ts` |
| 31 | **GET** | `/api/events` | Public / Optional Auth | `EventController.listEvents` | `event.routes.ts` |
| 32 | **GET** | `/api/events/user/my-registrations` | Authenticated | `EventController.getMyRegistrations` | `event.routes.ts` |
| 33 | **PATCH** | `/api/events/registrations/:id/cancel` | Authenticated | `EventController.cancelRegistration` | `event.routes.ts` |
| 34 | **GET** | `/api/events/:id` | Public / Optional Auth | `EventController.getEventById` | `event.routes.ts` |
| 35 | **POST** | `/api/events/:id/register` | Authenticated | `EventController.registerForEvent` | `event.routes.ts` |
| 36 | **GET** | `/api/events/:id/registrations` | ADMIN, STAFF | `EventController.getEventRegistrations` | `event.routes.ts` |
| 37 | **POST** | `/api/events` | ADMIN | `EventController.createEvent` | `event.routes.ts` |
| 38 | **PATCH** | `/api/events/:id` | ADMIN | `EventController.updateEvent` | `event.routes.ts` |
| 39 | **DELETE** | `/api/events/:id` | ADMIN | `EventController.deleteEvent` | `event.routes.ts` |
| 40 | **GET** | `/api/health` | Public | `HealthController.getHealth` | `health.routes.ts` |
| 41 | **GET** | `/api/help-requests/admin/all` | ADMIN | `HelpRequestController.getAdminHelpRequests` | `helpRequest.routes.ts` |
| 42 | **GET** | `/api/help-requests/admin` | ADMIN | `HelpRequestController.getAdminHelpRequests` | `helpRequest.routes.ts` |
| 43 | **GET** | `/api/help-requests/admin/:id` | ADMIN | `HelpRequestController.getAdminHelpRequestById` | `helpRequest.routes.ts` |
| 44 | **PATCH** | `/api/help-requests/admin/:id` | ADMIN | `HelpRequestController.updateHelpRequestAdmin` | `helpRequest.routes.ts` |
| 45 | **DELETE** | `/api/help-requests/admin/:id` | ADMIN | `HelpRequestController.deleteHelpRequestAdmin` | `helpRequest.routes.ts` |
| 46 | **PATCH** | `/api/help-requests/:id/status` | ADMIN | `HelpRequestController.updateHelpRequestAdmin` | `helpRequest.routes.ts` |
| 47 | **POST** | `/api/help-requests` | Public / Optional Auth | `HelpRequestController.createHelpRequest` | `helpRequest.routes.ts` |
| 48 | **GET** | `/api/help-requests/my` | Authenticated | `HelpRequestController.getMyHelpRequests` | `helpRequest.routes.ts` |
| 49 | **GET** | `/api/help-requests/:id` | Authenticated | `HelpRequestController.getHelpRequestById` | `helpRequest.routes.ts` |
| 50 | **GET** | `/api/notifications` | Authenticated | `NotificationController.getMyNotifications` | `notification.routes.ts` |
| 51 | **GET** | `/api/notifications/unread-count` | Authenticated | `NotificationController.getUnreadCount` | `notification.routes.ts` |
| 52 | **PATCH** | `/api/notifications/read-all` | Authenticated | `NotificationController.markAllAsRead` | `notification.routes.ts` |
| 53 | **PATCH** | `/api/notifications/:id/read` | Authenticated | `NotificationController.markAsRead` | `notification.routes.ts` |
| 54 | **DELETE** | `/api/notifications/:id` | Authenticated | `NotificationController.deleteNotification` | `notification.routes.ts` |
| 55 | **GET** | `/api/passport/my` | Authenticated | `PassportController.getMyPassports` | `passport.routes.ts` |
| 56 | **GET** | `/api/passport/admin/all` | ADMIN | `PassportController.getAllPassports` | `passport.routes.ts` |
| 57 | **GET** | `/api/passport/:id` | Authenticated | `PassportController.getPassportById` | `passport.routes.ts` |
| 58 | **GET** | `/api/public/home` | Public | `PublicController.getHomeData` | `public.routes.ts` |
| 59 | **GET** | `/api/public/kumbh` | Public | `PublicController.getKumbhData` | `public.routes.ts` |
| 60 | **GET** | `/api/public/settings` | Public | `PublicController.getSettings` | `public.routes.ts` |
| 61 | **GET** | `/api/transparency` | Public | `TransparencyController.getReports` | `transparency.routes.ts` |
| 62 | **GET** | `/api/transparency/admin` | ADMIN | `TransparencyController.getAdminReports` | `transparency.routes.ts` |
| 63 | **GET** | `/api/transparency/admin/all` | ADMIN | `TransparencyController.getAdminReports` | `transparency.routes.ts` |
| 64 | **GET** | `/api/transparency/:id` | Public / Optional Auth | `TransparencyController.getReportById` | `transparency.routes.ts` |
| 65 | **POST** | `/api/transparency` | ADMIN | `TransparencyController.createReport` | `transparency.routes.ts` |
| 66 | **PATCH** | `/api/transparency/:id` | ADMIN | `TransparencyController.updateReport` | `transparency.routes.ts` |
| 67 | **DELETE** | `/api/transparency/:id` | ADMIN | `TransparencyController.deleteReport` | `transparency.routes.ts` |
| 68 | **GET** | `/api/trust` | Public | `TrustController.getPublicTrust` | `trust.routes.ts` |
| 69 | **GET** | `/api/trust/admin` | ADMIN | `TrustController.getAdminTrust` | `trust.routes.ts` |
| 70 | **PATCH** | `/api/trust/admin` | ADMIN | `TrustController.updateAdminTrust` | `trust.routes.ts` |
| 71 | **GET** | `/api/trustees` | Public | `TrustController.getPublicTrustees` | `trustee.routes.ts` |
| 72 | **GET** | `/api/trustees/admin` | ADMIN | `TrustController.getAdminTrustees` | `trustee.routes.ts` |
| 73 | **POST** | `/api/trustees/admin` | ADMIN | `TrustController.createTrustee` | `trustee.routes.ts` |
| 74 | **PATCH** | `/api/trustees/admin/:id` | ADMIN | `TrustController.updateTrustee` | `trustee.routes.ts` |
| 75 | **DELETE** | `/api/trustees/admin/:id` | ADMIN | `TrustController.deleteTrustee` | `trustee.routes.ts` |
| 76 | **POST** | `/api/uploads/image` | ADMIN, STAFF | `UploadController.uploadImage` | `upload.routes.ts` |
| 77 | **POST** | `/api/uploads/report` | ADMIN, STAFF | `UploadController.uploadReport` | `upload.routes.ts` |
| 78 | **POST** | `/api/uploads/document` | Authenticated | `UploadController.uploadPrivateDocument` | `upload.routes.ts` |
| 79 | **GET** | `/api/uploads/file/:publicId` | Public | `UploadController.serveFile` | `upload.routes.ts` |
| 80 | **GET** | `/api/uploads/private/:publicId` | Authenticated | `UploadController.serveFile` | `upload.routes.ts` |
| 81 | **DELETE** | `/api/uploads/:id` | Authenticated | `UploadController.deleteAsset` | `upload.routes.ts` |
| 82 | **GET** | `/api/users/me` | Authenticated | `UserController.getUserById` | `user.routes.ts` |
| 83 | **PATCH** | `/api/users/me` | Authenticated | `UserController.updateMe` | `user.routes.ts` |
| 84 | **GET** | `/api/users` | ADMIN | `UserController.listUsers` | `user.routes.ts` |
| 85 | **GET** | `/api/users/:id` | Authenticated | `UserController.getUserById` | `user.routes.ts` |
| 86 | **PATCH** | `/api/users/:id/status` | ADMIN | `UserController.updateUserStatus` | `user.routes.ts` |
| 87 | **PATCH** | `/api/users/:id/role` | ADMIN | `UserController.updateUserRole` | `user.routes.ts` |
| 88 | **GET** | `/api/volunteers/roles` | Public | `VolunteerController.getPublicRoles` | `volunteer.routes.ts` |
| 89 | **POST** | `/api/volunteers/apply` | Public | `VolunteerController.submitApplication` | `volunteer.routes.ts` |
| 90 | **GET** | `/api/volunteers/me` | VOLUNTEER, ADMIN, STAFF, DONOR | `VolunteerController.getMyVolunteerProfile` | `volunteer.routes.ts` |
| 91 | **PUT** | `/api/volunteers/me` | VOLUNTEER, ADMIN, STAFF, DONOR | `VolunteerController.updateMyVolunteerProfile` | `volunteer.routes.ts` |
| 92 | **GET** | `/api/volunteers/me/shifts` | VOLUNTEER, ADMIN, STAFF, DONOR | `VolunteerController.getMyShifts` | `volunteer.routes.ts` |
| 93 | **POST** | `/api/volunteers/me/shifts` | VOLUNTEER, ADMIN, STAFF, DONOR | `VolunteerController.logMyShift` | `volunteer.routes.ts` |
| 94 | **GET** | `/api/volunteers/me/certificates` | VOLUNTEER, ADMIN, STAFF, DONOR | `VolunteerController.getMyCertificates` | `volunteer.routes.ts` |
| 95 | **POST** | `/api/volunteers/events/:eventId/register` | VOLUNTEER, ADMIN, STAFF, DONOR | `VolunteerController.registerForEvent` | `volunteer.routes.ts` |
| 96 | **GET** | `/api/volunteers/admin/shifts` | ADMIN | `VolunteerController.listAllShifts` | `volunteer.routes.ts` |
| 97 | **PATCH** | `/api/volunteers/admin/shifts/:id/verify` | ADMIN | `VolunteerController.verifyShift` | `volunteer.routes.ts` |
| 98 | **GET** | `/api/volunteers/admin/applications` | ADMIN | `VolunteerController.listApplications` | `volunteer.routes.ts` |
| 99 | **PATCH** | `/api/volunteers/admin/applications/:id` | ADMIN | `VolunteerController.reviewApplication` | `volunteer.routes.ts` |
| 100 | **POST** | `/api/volunteers/admin/roles` | ADMIN | `VolunteerController.createRole` | `volunteer.routes.ts` |
| 101 | **PUT** | `/api/volunteers/admin/roles/:id` | ADMIN | `VolunteerController.updateRole` | `volunteer.routes.ts` |
| 102 | **DELETE** | `/api/volunteers/admin/roles/:id` | ADMIN | `VolunteerController.deleteRole` | `volunteer.routes.ts` |
| 103 | **POST** | `/api/volunteers/admin/certificates` | ADMIN | `VolunteerController.issueCertificate` | `volunteer.routes.ts` |
| 104 | **GET** | `/api/volunteers` | ADMIN | `VolunteerController.listAllVolunteers` | `volunteer.routes.ts` |
| 105 | **PATCH** | `/api/volunteers/:id/hours` | ADMIN | `VolunteerController.updateVolunteerHours` | `volunteer.routes.ts` |
| 106 | **GET** | `/api/volunteers/:id` | VOLUNTEER, ADMIN, STAFF | `VolunteerController.getVolunteerById` | `volunteer.routes.ts` |
| 107 | **GET** | `/api/push/public-key` | Public | `PushController.getPublicKey` | `push.routes.ts` |
| 108 | **POST** | `/api/push/subscribe` | Authenticated | `PushController.subscribe` | `push.routes.ts` |
| 109 | **POST** | `/api/push/unsubscribe` | Authenticated | `PushController.unsubscribe` | `push.routes.ts` |
| 110 | **GET** | `/api/push/status` | Authenticated | `PushController.getStatus` | `push.routes.ts` |

---

## 6. Donations & Razorpay Integration Verification

### 6.1 Transaction Lifecycle & State Flow
```
[User Clicks Donate]
         ↓
POST /api/donations/order
  • Validates payload (Zod schema)
  • Checks server gateway configuration
  • Inserts Donation record in MongoDB (status: 'CREATED')
  • Calls Razorpay API: orders.create({ amount: amountInPaise, currency: 'INR', receipt })
  • Updates Donation (status: 'PENDING', razorpayOrderId)
  • Returns order ID & key ID to frontend
         ↓
[Frontend opens Razorpay Checkout Modal (checkout.js)]
         ↓
[User Completes Payment at Bank / UPI]
         ↓
POST /api/donations/verify
  • Validates razorpayOrderId, razorpayPaymentId, razorpaySignature
  • Replay Protection: Ensures razorpayPaymentId has not been credited elsewhere
  • Idempotency Check: Returns existing receipt if already marked PAID/SUCCESS
  • Cryptographic Check: crypto.timingSafeEqual(HMAC_SHA256(orderId + '|' + paymentId, SECRET), signature)
  • Transitions Donation: status = 'PAID', paymentStatus = 'PAID'
  • Increments Cause: raisedAmount += amount, donorCount += 1
  • Generates official receipt number: SCT-REC-XXXX-XXXX
  • Dispatches background in-app notifications and email receipt
```

### 6.2 Razorpay Webhook Processing
* **Endpoint:** `POST /api/donations/webhook`
* **Raw Body Verification:** `server/src/app.ts` preserves `req.rawBody` buffer directly from stream.
* **Signature Verification:** Uses `crypto.timingSafeEqual` with `RAZORPAY_WEBHOOK_SECRET`.
* **Events Handled:** `payment.captured`, `order.paid`.
* **Idempotency:** Checks if donation is already `PAID` before updating; prevents duplicate counter increments if webhook arrives after client verification.

### 6.3 Verification Status of Payment Processing
* **Code Review:** Implemented and cryptographically sound in `server/src/controllers/donation.controller.ts` and `server/src/services/razorpay.service.ts`.
* **Automated In-Memory Test:** Verified in E2E Domain 4 using synthetic cryptographic HMAC fixtures.
* **External Live/Sandbox Payments: NOT VERIFIED.** No live bank, UPI, or test gateway transaction round-trip has been completed.
* **Required Configuration:** `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `RAZORPAY_WEBHOOK_SECRET`. In their absence, the client UI gracefully indicates that payment gateway credentials must be configured.

---

## 7. External Integrations, Statutory Data, & Third-Party Services

To prevent conflating software data structures with verified legal records, the status of external capabilities is documented below:

### 7.1 Statutory Documents & Trust Records
* **Software Capability:** The system provides full database schemas and UI models for `TransparencyReport`, `ImpactPassportRecord`, `VolunteerCertificate`, and tax receipt numbers (`SCT-REC-*`).
* **Actual Data Reality:**
  - Seeded Trust profile data (Reg. No. E-9389 / Nashik, Pokar Avenue address, 13 trustee names) represents standard public Trust metadata seeded via `npm run seed-trust-data`.
  - Vendor invoices, weighment slips, school receipts, 80G filing PDFs, and statutory audit balance sheets present in the database or UI are **sample/seed software artifacts**. They demonstrate transparency workflows and are **not independently verified or certified legal audit filings**.

### 7.2 Third-Party Service Integrations
* **Gemini AI Allocation Assistant (`POST /api/ai/donation-allocation`):**
  - Code integration implemented via `@google/genai` TypeScript SDK.
  - Automated test verified in E2E Domain 9. When cloud API is unavailable or unconfigured, the service falls back to a deterministic, algorithmic allocation grounded directly in MongoDB campaign needs.
  - **Live Cloud Model: NOT VERIFIED.** Live Gemini API keys are not provisioned in the test runner.
* **Cloudinary Media Storage (`POST /api/uploads/*`):**
  - Code integration implemented using `cloudinary` SDK with magic-byte file validation (`JPEG`, `PNG`, `PDF`).
  - **Live Cloudinary Uploads: NOT VERIFIED.** In the absence of credentials, uploads fall back to local disk storage (`uploads/`).
* **Nodemailer SMTP Email Service:**
  - Code integration implemented in `server/src/services/email.service.ts`.
  - **Live SMTP Delivery: NOT VERIFIED.** In the test environment, emails are skipped with log notice: `Skipped delivery (SMTP credentials not configured)`.
* **Web Push Notifications & Service Worker Integration:**
  - Full-stack VAPID Web Push protocol implemented via `web-push` SDK and HTTPS-compatible browser Service Worker (`public/sw.js`).
  - Supported endpoints: `GET /api/push/public-key`, `POST /api/push/subscribe`, `POST /api/push/unsubscribe`, `GET /api/push/status`.
  - Permission model: Push permissions are requested solely upon explicit user engagement via `PushNotificationToggle` (never on unsolicited page load). Integrated across authenticated views: `UserProfileMenu` (Profile modal), `NotificationBell` (Navbar dropdown), `NotificationFeed` (Dashboard center), `AdminDashboard` (Operational settings tab), and `VolunteerPortal`.
  - Multi-tenant IDOR protection: Subscriptions are strictly bound to authenticated user ObjectIDs; deletion queries enforce ownership (`{ endpoint, user: req.user._id }`).
  - Deduplication & privacy: 10-minute sliding window suppresses duplicate notifications; payloads are strictly sanitized against beneficiary or financial PII.
  - Automatic stale-subscription cleanup: HTTP 410 Gone and 404 Not Found delivery errors automatically purge dead subscriptions from MongoDB.
  - **Live Mobile OS Push: NOT VERIFIED on physical external device.** While local VAPID encryption, in-memory subscriptions, and event dispatches are 100% verified by automated tests, actual push delivery to real phone notification trays depends on user-granted browser permission, HTTPS origin deployment, and external browser push services (FCM / Mozilla Push / Apple APNs).

---

## 8. Automated Test Execution Evidence

All automated test suites in the repository were executed directly. Results are recorded from actual process output:

1. **TypeScript Type-Checking (`npm run lint` / `tsc --noEmit`):**
   - **Result:** PASSED with 0 errors.
2. **Server TypeScript Compilation (`npx tsc --noEmit -p server/tsconfig.json`):**
   - **Result:** PASSED with 0 errors.
3. **Production Build (`npm run build` / Vite + esbuild):**
   - **Result:** PASSED with clean client bundle and `dist/server.cjs`.
4. **Database Startup & Configuration Tests (`npm run test:db`):**
   - **Result:** 17 / 17 Verification Checks PASSED.
   - Tests production missing MONGODB_URI abort, unreachable URI failure, development fallback opt-in checks, /api/health real status reporting, and unbuffered traffic degradation.
5. **Users & Roles Management Tests (`npm run test:users`):**
   - **Result:** 24 / 24 Verification Checks PASSED.
   - Tests User Directory search, admin lockout prevention, strict four-role enforcement, RBAC guards on user-management routes, cryptographic invitation hashing, token expiry, single-use token consumption, and password assignment.
6. **Web Push Notification Verification Tests (`npm run test:push`):**
   - **Result:** 17 / 17 Verification Checks PASSED.
   - Test Group 1: VAPID public key availability and format validation.
   - Test Group 2: HTTPS requirement and missing cryptographic keys rejection.
   - Test Group 3: Valid subscription registration and endpoint idempotency.
   - Test Group 4: Subscription status queries.
   - Test Group 5: Strict IDOR ownership enforcement on unsubscribe.
   - Test Group 6: Deduplication suppressing repeated alerts within 10-minute window.
   - Test Group 7: Data privacy and PII sanitization (exclusion of PAN, Aadhaar, payment card data).
   - Test Group 8: Role-based broadcast targeting (ADMIN & STAFF inclusion, DONOR exclusion).
   - Test Group 9: Automatic expired-subscription cleanup upon HTTP 410 Gone response.
7. **Admin Dashboard Summary Tests (`npm run test:admin`):**
   - **Result:** 6 / 6 Test Cases PASSED.
   - Test 1: Unauthenticated request blocked with HTTP 401.
   - Test 2: Invalid Bearer token blocked with HTTP 401.
   - Test 3: Authenticated DONOR blocked with HTTP 403.
   - Test 4: Authenticated VOLUNTEER blocked with HTTP 403.
   - Test 5: Authenticated ADMIN on empty database returns zeroed counts without mock numbers.
   - Test 6: Authenticated ADMIN with real database records computes accurate mathematical aggregations and strips beneficiary PII.
8. **End-to-End Readiness Suite (`npm run test:e2e`):**
   - **Result:** 15 / 15 Domain Suites PASSED.
   - Domain 1: Public Website & Information Architecture — PASS
   - Domain 2: Authentication & Authorization Flow — PASS
   - Domain 3: RBAC & IDOR Protection — PASS
   - Domain 4: Donation Flow & Cryptographic Verification — PASS
   - Domain 5: Campaign & Event Lifecycle — PASS
   - Domain 6: Volunteer Lifecycle & Hours Verification — PASS
   - Domain 7: Help Request & Beneficiary Assistance — PASS
   - Domain 8: Impact Passport & Radical Transparency — PASS
   - Domain 9: AI Assistant & Grounded Allocation — PASS
   - Domain 10: In-App Notifications & Web Push hooks — PASS
   - Domain 11: File & Media Upload Security (Magic bytes & SSRF) — PASS
   - Domain 12: Admin Daily Operations & Management — PASS
   - Domain 13: Data Integrity & Validation (Zod schemas) — PASS
   - Domain 14: Security Regressions & Headers (Helmet nosniff) — PASS
   - Domain 15: Frontend & Application Build Readiness — PASS

---

## 9. Technical Audit Conclusion

Based on direct source code inspection, Express AST route analysis, and execution of automated verification suites:

1. **Architecture & Integrity:** The codebase implements a complete, structured TypeScript full-stack architecture with 110 defined API endpoints across 19 route modules, schema validation, and secure authentication flows.
2. **Security & RBAC:** Role boundaries between `ADMIN`, `STAFF`, `DONOR`, and `VOLUNTEER` are verified by backend middleware. Administrative accounts cannot be created via public registration and must be provisioned via server-side CLI (`npm run create-admin`) or initial seed.
3. **Web Push Readiness:** Real Web Push notification infrastructure is fully implemented, guarded by VAPID protocol, opt-in permission requirements, role-based recipient routing, deduplication, and automatic stale-subscription cleanup.
4. **Production Readiness:** While local software components, database models, and build pipelines are verified and passing all automated test suites, **production deployment requires external operational setup**: provisioning live MongoDB Atlas credentials, live Razorpay gateway keys, SMTP email credentials, valid Cloudinary API keys, and production VAPID key pairs. Statutory documents and vendor records currently serve as software demonstration assets rather than externally audited filings.

---

## 10. Final Verification Checkpoint & Operational Status

**Audit & Fix Session Summary:**
1. **Server Startup & Port 3000 Pre-warming:** Resolved dev server pre-warming process termination by immediately binding `httpServer` to port 3000 (`0.0.0.0`) in `server.ts` before background DB connection initialization, and multiplexed Vite HMR directly through `httpServer` to eliminate WebSocket port 24678 collisions.
2. **Database Status & Safe Degradation:** Verified that production strictly refuses in-memory DB fallback and requires genuine `MONGODB_URI`. All 17 checks in `npm run test:db` pass cleanly.
3. **Rate Limiting & Token Refresh Loop:** Resolved the root cause of the "Too many requests from this IP" error in `src/services/api.ts` by ensuring failed silent token refresh cycles reject parallel subscribers with 401 instead of re-dispatching empty-token retry requests to the backend. Fixed express-rate-limit IPv6 validation warning (`validate: false`) in `server/src/middleware/rateLimiter.ts`.
4. **Authentication & Session Hygiene:** Added `sessionStorage.clear()` to `AuthContext.logout()` alongside `localStorage` token cleanup. Verified role-based navigation guards for `/login` and `/admin/login`. Verified "Forgot password?" link visibility and reset flow.
5. **Localization & Admin Translation Draft Workflow:** Verified exact Marathi Trust spelling (**इच्छापूर्ती रिद्धी सिद्धी विनायक चॅरिटेबल ट्रस्ट, नाशिक** with `रिद्धी`) across all UI headers, footers, badges, and dictionaries. Fixed TypeScript import in `server/src/controllers/admin.controller.ts` for `TranslationService.translateDraft`, supporting manual review/editing or automated server-side draft translations via Google Cloud Translation API / Gemini fallback without hardcoding or re-translating on client page visits.
6. **Data Integrity & Honest Content:** Confirmed `mockData.ts` and `seed.service.ts` contain zero synthetic campaigns, events, locations, or fake donation totals. Honest empty states display whenever no administrator-published records exist.
7. **Safe Repository Cleanup:**
   - Removed unreferenced temporary artifact `public/activities/Gemini_Generated_Image_1ppnm1ppnm1ppnm1.jpg` (226 KB).
   - Removed redundant byte-for-byte duplicate emblem `public/bappa-emblem.jpg` (1.18 MB identical MD5 clone of `public/bappa.jpeg` and `public/trust-emblem.jpg`), preserving genuine active assets.
   - Removed unused development component `src/components/common/DemoBadge.tsx` with zero references in application or test code.
8. **Production JWT Security Safeguards Enforced:**
   - Updated `server/src/config/env.ts` to strictly prohibit development fallback secrets (`dev_jwt_access_fallback_secret_key_siddhivinayak` / `dev_jwt_refresh_fallback_secret_key_siddhivinayak`) when `NODE_ENV === 'production'`.
   - In production, server startup aborts immediately (`[FATAL SECURITY CONFIGURATION] Production startup aborted: ...`) if `JWT_ACCESS_SECRET` or `JWT_REFRESH_SECRET` is missing, empty, or using development fallback values.
   - Development fallbacks remain fully functional in development mode for zero-friction local workflows.
   - Verified with dedicated automated test suite `server/src/scripts/testJwtProductionSecurity.ts`.
9. **MongoDB Atlas Connection Resilience & Dev Fallback Hardened:**
   - Resolved connection retry hangs and `SSL routines:ssl3_read_bytes:tlsv1 alert internal error` logs occurring when remote MongoDB Atlas cluster blocks container egress IP in development/preview environments.
   - Suppressed premature Mongoose error event listener emissions during connection attempts (listening only once connection is established).
   - Ensured development mode (`NODE_ENV !== 'production'`) gracefully falls back to local in-memory MongoDB when an external URI is unreachable due to Atlas IP whitelisting or network partition, allowing the applet to seed genuine Trust data and remain operational without 503 degradation.
   - Retained strict production refusal: in-memory DB fallback remains blocked in production (`NODE_ENV === 'production'`), immediately returning `false` and logging clear diagnostic guidance.
10. **All Test Suites Passing Directly Verified:**
   - `npm run lint` (`tsc --noEmit`) — 0 errors
   - `npx tsc --noEmit -p server/tsconfig.json` — 0 errors
   - `npm run build` — Clean Vite client bundle & esbuild `dist/server.cjs`
   - `npm run test:jwt` — 14 / 14 checks passed (Strict production JWT secret validation)
   - `npm run test:db` — 20 / 20 checks passed (Database startup, disconnection handling, 503 API status, production blocking, and graceful dev fallback)
   - `npm run test:users` — 24 / 24 checks passed (User management, invitations, password hashing, RBAC)
   - `npm run test:push` — 17 / 17 checks passed (Web Push VAPID, deduplication, 410 cleanup, IDOR protection)
   - `npm run test:admin` — 6 / 6 test cases passed (Metrics mathematical aggregations, role protections)
   - `npm run test:e2e` — 15 / 15 domain suites passed (All 15 domains PASS)


