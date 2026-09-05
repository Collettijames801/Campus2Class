# Campus2Class

A booking site connecting local Monmouth County families with honors college
tutors for Math and English. Parents take a short survey, get an instant
hourly quote, pick an open time slot, and pay through PayPal.

## What's inside

- `backend/` — Node/Express API + SQLite. Handles pricing logic, availability,
  and PayPal order creation/capture. This is the source of truth for pricing
  and bookings.
- `frontend/` — React (Vite) marketing site + booking flow, styled with
  Tailwind.

## Running it locally

**Backend:**
```
cd backend
npm install
cp .env.example .env   # then fill in your PayPal sandbox keys
npm start
```
Runs on http://localhost:4000

**Frontend** (separate terminal):
```
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:4000, VITE_PAYPAL_CLIENT_ID=<sandbox client id>
npm run dev
```
Runs on http://localhost:5173

## Setting up PayPal

1. Go to https://developer.paypal.com and log in with your PayPal Business
   account (create one if you don't have it — it's free).
2. Under **Apps & Credentials**, make sure you're in **Sandbox** mode, then
   create an app. Copy the **Client ID** and **Secret**.
3. Put the Client ID and Secret into `backend/.env` as `PAYPAL_CLIENT_ID` /
   `PAYPAL_CLIENT_SECRET`, and the Client ID into `frontend/.env` as
   `VITE_PAYPAL_CLIENT_ID`.
4. Test a full booking using a PayPal **Sandbox buyer account** (also created
   under Sandbox > Accounts on the developer dashboard) — don't use a real card.
5. When you're ready to go live: switch to **Live** mode on the developer
   dashboard, create a live app, and swap in the live Client ID/Secret. Set
   `PAYPAL_ENV=live` in the backend.

## Changing your availability

Edit `backend/src/availability.js` — the `WEEKLY_TEMPLATE` object controls
which days/times are open for booking. Update it whenever your class
schedule changes; it regenerates the next 21 days automatically.

## Changing pricing or adding courses

Edit `backend/src/pricing.js`. Each course has a `tier` (`middle`,
`standard`, `honors`, `ap`) and each tier has a hard-coded rate in
`TIER_RATES`. Add a new course by adding an entry to the `COURSES.math` or
`COURSES.english` array.

## Deploying (matches your existing Render + Vercel/GitHub pattern)

**1. Push to GitHub**
Create a new repo (e.g. `campus2class`) and push this whole folder.

**2. Backend → Render**
- New → Web Service → connect the repo → set **Root Directory** to `backend`
- Build command: `npm install`
- Start command: `npm start`
- Add environment variables: `PAYPAL_ENV`, `PAYPAL_CLIENT_ID`,
   `PAYPAL_CLIENT_SECRET`, `ADMIN_KEY`, `RESEND_API_KEY`, `EMAIL_FROM`
- Note the resulting URL (e.g. `https://campus2class-api.onrender.com`)

**3. Frontend → Vercel**
- New Project → import the same repo → set **Root Directory** to `frontend`
- Framework preset: Vite
- Environment variables: `VITE_API_URL` = your Render backend URL,
   `VITE_PAYPAL_CLIENT_ID` = your PayPal live client ID
- Deploy

For live payments, use a live PayPal app and set `PAYPAL_ENV=live` on Render.
Set `RESEND_API_KEY` to a Resend API key and `EMAIL_FROM` to an address on a
verified Resend domain. The booking is saved even if email delivery fails; the
customer-facing confirmation will say when the email could not be sent.

**4. Custom domain**
Buy a domain (e.g. from GoDaddy, like you did for the Battle of the Bands
site) and point it at the Vercel project the same way.

## Viewing bookings

`GET /api/bookings` on the backend returns all paid bookings as JSON. It's
protected — send header `x-admin-key: <your ADMIN_KEY>`. There's no admin
UI yet; this is meant to be checked manually or wired into a spreadsheet
later if it's worth building out.
