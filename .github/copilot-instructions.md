# Nilam — Copilot Instructions

## Project overview

- Nilam is the PropertyVault base template for property management workflows.
- The repository is a `pnpm` + Turborepo monorepo.
- `apps/web` is a Next.js 16 App Router app deployed to Vercel.
- `apps/api` is a standalone Hono app running on Bun and deployed to Railway.
- Shared packages live in `packages/`.

## Packages

- `@nilam/db`: Drizzle ORM schema, migrations, Neon access, and database utilities.
- `@nilam/auth`: Better Auth server and client helpers, including the organization plugin.
- `@nilam/validators`: Shared Zod schemas, API contracts, and validation helpers.
- `@nilam/shared`: Shared storage helpers, cross-app utilities, and common types.
- `@nilam/ui`: shadcn/ui primitives plus Nilam design tokens and shared UI helpers.

## Architecture notes

- Authentication uses Better Auth.
- Sessions are cookie-based and organization-aware through the Better Auth organization plugin.
- The API is not mounted inside Next.js. Web clients call the standalone API over `NEXT_PUBLIC_API_URL`.
- Domain routes live under `/api/v1/*` in the Hono app.
- Background jobs run through Inngest, not Vercel cron.
- Transactional email uses Resend.
- Design tokens live in `packages/ui/src/globals.css` and use the terracotta + cream palette.
- Core domain concepts include assets, tenants, leases, charges, payments, documents, groups, and related property operations.

## Commands

- `pnpm install`
- `pnpm dev`
- `pnpm dev:web`
- `pnpm build`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm format`
- `pnpm format:check`
- `pnpm test`
- `pnpm test:unit`
- `pnpm db:generate`
- `pnpm db:migrate`
- `pnpm db:push`
- `pnpm db:seed`
- `pnpm db:reset`
- `pnpm db:studio`

## Working conventions

- Use Biome for linting and formatting.
- Keep server-only code in `apps/api` or server-only package entrypoints.
- Reuse `@nilam/validators` for request and form validation instead of duplicating schemas.
- Reuse `@nilam/ui` tokens and components before adding one-off styles.
- When working in `apps/web`, verify Next.js 16 behavior against the local docs in `node_modules/next/dist/docs/` before assuming older APIs still apply.
