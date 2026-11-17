# Estantly web

The web front end for the [Estantly API](../../Go/stayhub-api): one React app with three areas.

| Area | Path | Who |
| --- | --- | --- |
| Guest site | `/`, `/search`, `/hotels/:slug`, `/checkout`, `/account/*` | Everyone; booking and account pages need sign-in |
| Hotel back office | `/admin`, `/admin/hotels/:hotelId/*` | Any signed-in user can list a property; the API checks the role per hotel (`hotel_admin` sees everything, `hotel_staff` gets bookings, check-in/out, rooms and reviews) |
| Platform admin | `/platform/*` | `platform_admin` only |

Stack: Vite, React 19, Tailwind CSS v4, React Router 7, TanStack Query, oxlint — the same base as CompanySite.

## Run it

```sh
cp .env.example .env    # VITE_API_PROXY points at the API (default http://localhost:8080)
npm install
npm run dev             # http://localhost:5173
```

In development Vite proxies `/api` and `/media` to the API, so there is no CORS setup. To work against the
deployed API instead, set `VITE_API_PROXY=https://stayhubapi.akiliunde.com`.

Demo accounts (from `server seed`), password `Estantly123!`: `guest@estantly.test`, `hotel.admin@estantly.test`
(Zuri and The Mora), `platform@estantly.test`.

```sh
npm run lint    # oxlint
npm run build   # → dist/
```

## Project layout

Each layer only talks to the one below it:

```
src/
  content.js        copy and fixed lists (types, amenities, statuses, nav) — the single source of truth
  config.js         environment (API origin)
  api/              HTTP only: one module per API area, no React
    client.js         fetch wrapper: bearer token, single-flight token refresh, ApiError
    session.js        the stored session, shared across tabs
    auth.js catalog.js guest.js admin.js platform.js
  auth/             AuthProvider (session → React), route guards
  lib/              pure helpers: money/date formatting, stay params, TanStack Query setup
  hooks/            reusable data hooks (favourites)
  components/
    ui/               design-system pieces: Button, Field, Card, Table, Modal, Badge…
    site/             guest-site pieces: Navbar, HotelCard, StayPicker, PayPanel
    admin/            back-office shell, hotel context, image uploader
  pages/            one file per screen: site/ auth/ account/ admin/ platform/
```

## How the tricky parts work

- **Tokens.** The access token (15 min) and the rotating refresh token live in `localStorage`. A refresh runs
  once per tab and under a Web Lock across tabs: the API revokes the whole session if a refresh token is reused.
- **Booking.** Checkout creates a `pending_payment` booking (the room is held for 15 minutes) with an
  `Idempotency-Key`, so a double click never books twice, then opens the booking page to pay.
- **Payment** (`components/site/PayPanel.jsx`). M-Pesa returns a `ussd_push`: the page polls `/confirm` until the
  guest approves on their phone. Card returns a `redirect` to Pesapal's hosted page, which sends the guest back
  to `/account/bookings/:ref`; that page finds the pending payment and polls it. Card numbers never touch Estantly.
- **Images.** Uploaded with `POST /admin/hotels/:id/uploads` and stored as URLs in the hotel's or room's `photos`.

## Deploy

`Dockerfile` builds the static site and serves it with nginx; `docker-compose.yml` puts it behind the shared
nginx-proxy (`global-proxy-network`), like the API.

```sh
VITE_API_URL=https://stayhubapi.akiliunde.com DOMAIN_NAME=estantly.akiliunde.com docker compose up -d --build
```

Then add `https://estantly.akiliunde.com` to `CORS_ORIGINS` in the API's `.env` and recreate the API container.
