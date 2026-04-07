# Nilam / PropertyVault

Nilam is the PropertyVault base template for building modern property management software. The monorepo ships with a Next.js web app, a standalone Hono API, shared validation and UI packages, Better Auth, Drizzle + Neon, Inngest jobs, and Resend email hooks.

## Tech stack

- Web: Next.js 16 App Router on Vercel
- API: Hono on Bun, deployed to Railway
- Database: Drizzle ORM + Neon Postgres
- Auth: Better Auth with organization support
- Validation: Zod via `@nilam/validators`
- Jobs: Inngest
- Email: Resend
- UI: shadcn/ui + Nilam design tokens in `@nilam/ui`
- Tooling: pnpm, Turborepo, Biome, Vitest

## Monorepo structure

```text
nilam/
├── apps/
│   ├── api/              # Standalone Hono API on Bun
│   └── web/              # Next.js 16 App Router app
├── packages/
│   ├── auth/             # Better Auth server/client helpers
│   ├── db/               # Drizzle schema, migrations, Neon access
│   ├── shared/           # Shared storage helpers, types, utilities
│   ├── ui/               # shadcn/ui components and design tokens
│   ├── validators/       # Shared Zod schemas and contracts
│   └── typescript-config/# Shared TS config presets
├── turbo.json
├── pnpm-workspace.yaml
└── biome.json
```

## Domain focus

Nilam is oriented around property operations: assets, units, tenants, leases, charges, payments, documents, notifications, exports, and audit-friendly back-office workflows.

## Getting started

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Copy environment templates:
   ```bash
   cp apps/api/.env.example apps/api/.env.local
   cp apps/web/.env.example apps/web/.env.local
   ```
3. Fill in the required secrets and service URLs.
4. Prepare the database:
   ```bash
   pnpm db:migrate
   ```
   Or use `pnpm db:push` during early local setup.
5. Start development:
   ```bash
   pnpm dev
   ```
   Use `pnpm dev:web` to run only the web app.

## Available commands

```bash
pnpm dev
pnpm dev:web
pnpm build
pnpm typecheck
pnpm lint
pnpm format
pnpm format:check
pnpm test
pnpm test:unit
pnpm db:generate
pnpm db:migrate
pnpm db:push
pnpm db:seed
pnpm db:reset
pnpm db:studio
```

## Environment notes

- The repo root `.env.example` is a reference sheet for the shared variable set.
- Runtime files live per app: `apps/api/.env.local` and `apps/web/.env.local`.
- `NEXT_PUBLIC_API_URL` should point the web app at the Railway-hosted or local API.
- `CORS_ORIGIN` should match the web origin that the API accepts.

## Deployment

- `apps/web` deploys to Vercel.
- `apps/api` deploys to Railway and serves the standalone Hono application on Bun.
- Configure Better Auth, Neon, Resend, Inngest, S3-compatible storage, and Sentry through the app-specific environment variables.
