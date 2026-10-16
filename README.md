# ROGELE Web

The web client for ROGELE, a learning management platform for schools.

The application is the browser interface for three audiences:

- Administrators, who manage users, classes, subjects, plans, and settings.
- Teachers, who create lessons, assign homework, build quizzes, and grade
  submissions.
- Learners and external users, who browse lessons, submit homework, take
  quizzes, and manage subscriptions.

The web client communicates exclusively with the ROGELE API. It never connects
directly to a database or any other backend service.

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running Locally](#running-locally)
- [Project Structure](#project-structure)
- [Authentication](#authentication)
- [Branding and Theming](#branding-and-theming)
- [Notifications](#notifications)
- [API Communication](#api-communication)
- [Roles and Routes](#roles-and-routes)
- [Development Workflow](#development-workflow)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [License](#license)

## Overview

ROGELE Web is a Next.js application built with the App Router. It provides
three distinct experiences behind a single authentication system:

- `/dashboard` and related pages — the learner and teacher experience
- `/admin` and sub-pages — the administration panel
- `/login` and related pages — public authentication flows

The layout is responsive, supports light and dark themes, and pulls its
branding — school name, tagline, logo, and colors — from the API at runtime.

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript (strict mode)
- Tailwind CSS
- Lucide icons
- Recharts (analytics charts)
- React Hook Form with Zod validation
- TanStack Query for server state

## Requirements

- Node.js 18.17 or later
- pnpm 9 or later

## Installation

    git clone https://github.com/Hisaalu/rogele-web.git
    cd rogele-web
    pnpm install

## Configuration

Configuration lives in `.env.local` at the project root and is not committed.

    ROGELEDB_API_URL=http://localhost:8080
    ANALYTICS_API_URL=http://localhost:9000
    NEXT_PUBLIC_API_URL=http://localhost:8080
    SESSION_SECRET=change-me-to-a-long-random-string-at-least-32-chars
    NEXT_PUBLIC_APP_URL=http://localhost:3000

`ROGELEDB_API_URL` is used by server components and the internal proxy route.
`ANALYTICS_API_URL` points to the Python analytics service.
`SESSION_SECRET` signs the auth cookies and must be at least 32 characters.

## Running Locally

    pnpm dev

The app is available at http://localhost:3000. The ROGELE API must be running
and reachable at `ROGELEDB_API_URL`.

## Project Structure

    src/
      app/
        (auth)/                Public auth pages
        (app)/                 Learner and teacher experience
        (admin)/               Admin panel
          admin/
            page.tsx           Overview
            analytics/
            activity/
            users/
            classes/
            subjects/
            plans/
            subscriptions/
            payments/
            notifications/
            email-campaigns/
            settings/
            profile/
        api/
          auth/                Login, logout, refresh
          proxy/               Catch-all proxy to the Go API
          analytics/           Proxy to the Python service
      components/
        brand/                 Logo, branding provider
        layout/                Sidebar, header, user menu
        notifications/         Bell, list
        ui/                    Buttons, dialogs, inputs, tables
      lib/
        api-client.ts          Typed fetch wrapper
        auth.ts                Cookie-based session helpers
        server-api.ts          Server-side API client
        branding.ts            Fetches branding from the API
        *.server.ts            Server-only fetchers per resource
        *.client.ts            Client mutators per resource
      types/                   TypeScript models matching the API DTOs

## Authentication

The web app uses httpOnly cookies. The browser never sees the JWT directly.

1. The login form posts to `/api/auth/login`, which proxies to
   `POST /api/v1/auth/login` on the Go API.
2. On success, the route sets three cookies:
   - `rogele_access_token` (httpOnly, short-lived)
   - `rogele_refresh_token` (httpOnly, long-lived)
   - `rogele_user` (non-sensitive user info for server rendering)
3. Middleware redirects unauthenticated requests to `/login` and signed-in
   users away from the auth pages.
4. Server components use `serverApiRequest`, which reads the access token
   cookie and injects the `Authorization` header.
5. Client components call `/api/proxy/...`, which forwards to the API with the
   cookie token attached.

## Branding and Theming

Branding is loaded at runtime from `GET /api/v1/config/public`:

    {
      "branding": {
        "school_name": "Rays of Grace",
        "tagline": "E-Learning",
        "logo_url": "",
        "favicon_url": "",
        "color_primary": "#7f2677",
        "color_accent": "#f06724",
        "support_email": "",
        "website_url": ""
      }
    }

`BrandingProvider` publishes these values via React context and sets CSS
variables `--brand-primary` and `--brand-accent` on the document root. Next.js
metadata uses the school name and favicon for the title and tab icon.

Admins edit branding at `/admin/settings`. Changes take effect within 60
seconds.

The theme (light, dark, or system) is stored in `localStorage` under
`rogele.theme` and applied before first paint by an inline script in the root
layout. There is no flash of the wrong theme.

## Notifications

Every authenticated user has a notification bell in the header. The bell:

- Shows an unread count fetched from
  `GET /api/v1/notifications/me/unread-count`.
- Polls every 30 seconds.
- Opens a dropdown with the latest 10 notifications.
- Marks a notification read and navigates to its link when clicked.
- Offers "Mark all read" inside the dropdown.

The full list lives at `/notifications` with filters by type and unread-only.
The admin bell's "View all" goes to `/admin/notifications`, which provides a
composer for broadcasts and a history of everything sent.

## API Communication

Server components use `serverApiRequest` from `src/lib/server-api.ts`, which
reads the access token cookie and injects the `Authorization` header.

Client components use the `*.client.ts` helpers, which call `/api/proxy/...`.
The proxy reads the same cookie, forwards to the Go API, and returns the
response body. It exports handlers for `GET`, `POST`, `PUT`, `PATCH`, `DELETE`,
`HEAD`, and `OPTIONS`.

Non-JSON responses are handled defensively: plain text responses are wrapped
as error messages instead of throwing a JSON parse exception.

## Roles and Routes

Two layout guards enforce access:

- The `(app)` group requires a session and redirects admins to `/admin`. It
  wraps `/dashboard`, `/lessons`, `/homework`, `/quizzes`, `/subscription`,
  `/profile`, and `/notifications`.
- The `(admin)` group requires `role === 'admin'` and redirects non-admins to
  `/dashboard`. It wraps every page under `/admin`.

`/login`, `/register`, `/forgot-password`, and `/reset-password` are public.
Middleware redirects signed-in users away from them.

## Development Workflow

    pnpm dev            # Dev server
    pnpm type-check     # Type-check the project
    pnpm lint           # Lint
    pnpm format         # Prettier
    pnpm build          # Production build
    pnpm start          # Run production build

Before committing, make sure `pnpm type-check` and `pnpm build` both pass.

## Building for Production

    pnpm build

The build produces `.next/`. Serve it with `pnpm start`, or place it behind a
reverse proxy (nginx, Caddy, Cloudflare) that terminates TLS and forwards to
`localhost:3000`.

Environment variables at runtime:

- `ROGELEDB_API_URL` — URL of the Go API
- `ANALYTICS_API_URL` — URL of the Python analytics service
- `SESSION_SECRET` — must match between builds for cookies to remain valid
- `NEXT_PUBLIC_APP_URL` — public URL of this app

## Deployment

The app runs as a Node.js process. Recommended targets:

- **Vercel** — zero-config for Next.js. `ROGELEDB_API_URL` must be reachable
  from Vercel's servers.
- **Docker + a VPS** — build an image that runs `pnpm start` and expose port
  3000. Place Cloudflare or Caddy in front for TLS.
- **Railway, Render, Fly.io** — all support Node.js processes and environment
  variables.

Cookies use `secure: true` when `NODE_ENV=production`, so the app must be
served over HTTPS in production.

## License

This project is proprietary. All rights reserved.