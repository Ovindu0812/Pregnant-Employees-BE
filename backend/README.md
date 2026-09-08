# SafeMum Backend API

Backend for the university research project **Risk Assessment and Legal Empowerment Platform for Pregnant Employees in Sri Lanka**.

This is a research prototype. Its rule-based output is general workplace information—not medical diagnosis, treatment, professional legal advice, or a clinically validated risk score. Legal records must be verified against authoritative Sri Lankan sources before publication.

## Stack and structure

- Node.js 18+, Express 5, JavaScript
- Supabase Auth and Supabase PostgreSQL
- JWT bearer authentication through Supabase
- PostgreSQL Row Level Security (RLS)

```text
backend/
├── src/config/          Supabase clients
├── src/controllers/     HTTP handlers
├── src/middleware/      authentication, authorization, validation, errors
├── src/routes/          REST route definitions
├── src/services/        transparent risk and recommendation rules
├── src/utils/           response/error/mapping helpers
├── supabase/schema.sql  tables, triggers, grants, and RLS policies
└── test/                Node tests
```

## Installation

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`. With Supabase's current API Keys screen, put the **Publishable key** in `SUPABASE_ANON_KEY` and the backend-only **Secret key** in `SUPABASE_SERVICE_ROLE_KEY`. These names preserve this project's existing configuration; the new key types are valid replacements for the legacy anon/service-role keys.

```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-publishable-key
SUPABASE_SERVICE_ROLE_KEY=your-secret-key
PORT=5000
FRONTEND_URL=http://localhost:5173
FRONTEND_ORIGINS=http://localhost:5173,http://localhost:5174
NODE_ENV=development
```

Never put the secret key in the frontend `.env`.

Legacy `.env` values remain supported:

```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

The service-role key is server-only. Never put it in React code, expose it in an API response, commit `.env`, or use it as the frontend's Supabase key.

## Supabase setup

1. Create a Supabase project.
2. Open **SQL Editor**, paste all of `supabase/schema.sql`, and run it once.
   If the tables already exist, run `supabase/registration_trigger.sql` to install or repair only the Auth-to-profile trigger.
3. In **Authentication > URL Configuration**, configure the frontend site/redirect URL.
4. Copy the project URL, anon key, and service-role key into `.env`.
5. Register the first account through the API.
6. Promote that account in SQL Editor (replace the UUID):

```sql
update public.profiles
set role = 'admin'
where id = 'REGISTERED-USER-UUID';
```

The schema creates `profiles` (linked to `auth.users`), `risk_assessments`, `recommendations`, `legal_information`, and `feedback`. The registration trigger creates a profile with role `user`. RLS limits normal users to their own private records. Active legal information and recommendations are publicly readable. Admin policies permit management, while the API also verifies the stored role before using its server-only client.

No legal claims are seeded. Add only verified legal content; mark drafts explicitly as placeholders and leave them inactive.

## Run and verify

```bash
npm test
npm run dev
```

Production-style start: `npm start`

API base URL: `http://localhost:5000/api`

```bash
curl http://localhost:5000/api/health
```

Expected: `{"success":true,"message":"SafeMum API is running"}`

## Endpoints

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a user/profile |
| POST | `/auth/login` | Public | Get Supabase session tokens |
| POST | `/auth/refresh` | Public | Exchange a valid refresh token for a new JWT session |
| POST | `/auth/logout` | User | Revoke/logout session |
| GET | `/auth/me` | User | Current authenticated user |
| GET/PUT | `/users/me` | User | Read/update allowed profile fields |
| POST | `/assessments` | User | Score and save an assessment |
| GET | `/assessments` | User | Own assessment history |
| GET | `/assessments/:id` | Owner/admin | One assessment |
| GET | `/legal` | Public | Active content; supports `?category=` |
| GET | `/legal/:id` | Public | One active legal record |
| GET | `/recommendations` | Public | Active content; supports `?riskLevel=&category=` |
| GET | `/recommendations/:id` | Public | One active recommendation |
| POST | `/feedback` | User | Feedback for own assessment |
| GET | `/feedback/me` | User | Own feedback |
| GET | `/admin/dashboard` | Admin | Aggregate counts |
| GET | `/admin/users` | Admin | Profiles without auth secrets |
| PATCH | `/admin/users/:id/role` | Admin | Change stored role |
| GET | `/admin/assessments` | Admin | All assessments |
| GET | `/admin/feedback` | Admin | All feedback |
| GET/POST | `/admin/recommendations` | Admin | List/create recommendations |
| PUT/DELETE | `/admin/recommendations/:id` | Admin | Update/delete recommendation |
| POST | `/admin/legal` | Admin | Create legal record |
| PUT/DELETE | `/admin/legal/:id` | Admin | Update/delete legal record |

Protected calls need `Authorization: Bearer ACCESS_TOKEN`. Keep the refresh token secure and use Supabase's refresh flow when the access token expires.

## Postman test sequence

Create a Postman environment with `baseUrl = http://localhost:5000/api`. After login, save `session.accessToken` as `token`. Add `Authorization: Bearer {{token}}` to protected calls.

### 1. Register

`POST {{baseUrl}}/auth/register`

```json
{
  "fullName": "Research User",
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

If Supabase email confirmation is enabled, confirm the email before login. Registration then returns `session: null` by design.

### 2. Login and profile

`POST {{baseUrl}}/auth/login`

```json
{"email":"user@example.com","password":"SecurePass123"}
```

Copy `session.accessToken`, call `GET {{baseUrl}}/auth/me` and `GET {{baseUrl}}/users/me`, then update with `PUT {{baseUrl}}/users/me`:

```json
{
  "full_name": "Research User",
  "phone": "+94 77 000 0000",
  "occupation": "Office Employee",
  "workplace": "Example Workplace"
}
```

The API never accepts `role` here. Database column grants and RLS also block direct self-promotion.

### 3. Create and retrieve an assessment

`POST {{baseUrl}}/assessments`

```json
{
  "pregnancyStage": "Second Trimester",
  "occupation": "Office Employee",
  "workingHours": 9,
  "prolongedStanding": true,
  "heavyLifting": false,
  "chemicalExposure": false,
  "workplaceStress": true,
  "repetitiveMovement": true,
  "nightShift": false,
  "environmentalHazards": false
}
```

Then call `GET {{baseUrl}}/assessments` and `GET {{baseUrl}}/assessments/ASSESSMENT_UUID`. A different normal user's token must receive `404` for that UUID.

The prototype rules in `src/services/riskService.js` are: standing +1, heavy lifting +2, chemical exposure +2, stress +1, repetitive movement +1, night shift +1, environmental hazards +2, and working over 8 hours +1. Totals 0–2 are LOW, 3–5 MEDIUM, and 6+ HIGH.

### 4. Feedback

`POST {{baseUrl}}/feedback`

```json
{
  "assessmentId": "ASSESSMENT_UUID",
  "rating": 4,
  "comment": "The recommendations were useful."
}
```

Then call `GET {{baseUrl}}/feedback/me`. Only one feedback entry per user/assessment is accepted.

### 5. Public content

Call `GET {{baseUrl}}/legal`, `GET {{baseUrl}}/legal?category=maternity`, and `GET {{baseUrl}}/recommendations` without a token. Empty arrays are expected until an admin adds active records.

### 6. Admin authorization

Call `GET {{baseUrl}}/admin/dashboard` with a normal token and confirm `403`. Promote a test user using the SQL above, log in again, and repeat with the admin token.

Create a clearly marked inactive legal placeholder at `POST {{baseUrl}}/admin/legal`:

```json
{
  "title": "PLACEHOLDER — pending legal verification",
  "category": "maternity",
  "summary": "Placeholder content; not verified or published.",
  "content": "PLACEHOLDER ONLY. Replace after verification against authoritative Sri Lankan sources.",
  "sourceReference": null,
  "active": false
}
```

Create a recommendation at `POST {{baseUrl}}/admin/recommendations`:

```json
{
  "category": "physical",
  "riskLevel": "MEDIUM",
  "title": "Discuss task adjustments",
  "description": "Consider discussing suitable task adjustments with the relevant workplace contact.",
  "active": true
}
```

## Errors and remaining work

Errors consistently return `{"success":false,"message":"..."}`. Validation uses 400, missing/invalid authentication 401, access denial 403, missing records 404, conflicts 409, and unexpected failures 500. Stack traces are never returned.

Before deployment:

- Validate scoring thresholds and recommendation wording through the research methodology and qualified experts.
- Review Sri Lankan legal content against authoritative, current sources before activation.
- Configure production domains, email delivery, session policy, backups, monitoring, and secret management.
- Run credential-dependent end-to-end tests against the project's Supabase instance.
