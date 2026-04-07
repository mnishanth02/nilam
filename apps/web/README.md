# Nilam Web App

The web app lives in `apps/web` and runs on Next.js 16 App Router.

## Environment setup

Create `apps/web/.env.local` from `apps/web/.env.example`.

```bash
cp apps/web/.env.example apps/web/.env.local
```

Key values:

- `NEXT_PUBLIC_API_URL`: base URL for the standalone Hono API.
- `BETTER_AUTH_SECRET`: Better Auth secret used by server-side auth helpers.
- `BETTER_AUTH_URL`: Better Auth API base URL.
- `DATABASE_URL`: database connection string used by server-side code.
- `SENTRY_DSN`: optional server-side Sentry DSN.

## Start the app

From the repo root:

```bash
pnpm dev:web
```

Or from this directory:

```bash
pnpm dev
```
