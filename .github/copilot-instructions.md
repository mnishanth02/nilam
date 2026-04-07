# Nilam — Copilot Instructions

## Project overview

- Nilam is the PropertyVault base template for property management workflows.
- The repository is a `pnpm` + Turborepo monorepo (`pnpm@10`, Node `>=20.19.0`).
- `apps/web` is a **Next.js 16** App Router app deployed to **Vercel**.
- `apps/api` is a standalone **Hono** app running on **Bun** and deployed to **Railway**.
- Shared packages live in `packages/`.

## Packages

| Package | Purpose |
|---------|---------|
| `@nilam/db` | Drizzle ORM schema, migrations, Neon serverless Postgres access, and database utilities. **Server-only — never import in client bundles.** |
| `@nilam/auth` | Better Auth server (`@nilam/auth/server`) and client (`@nilam/auth/client`) helpers, including the organization plugin and access control roles. |
| `@nilam/validators` | Shared Zod schemas, `ErrorCode` enum, `queryKeys` factory, `QUERY_DEFAULTS`, and API contract types. Consumed by API, web, and future mobile apps. |
| `@nilam/shared` | Shared S3 storage helpers (`@nilam/shared/storage`) and cross-app utilities. |
| `@nilam/ui` | shadcn/ui primitives plus Nilam design tokens. |
| `@nilam/typescript-config` | Shared TypeScript configurations for Next.js, library, and base presets. |

## Architecture

### Separation of concerns

The web app and API are **separate deployments on separate origins**:

- **Web** (`apps/web`) — handles UI rendering, route protection via `src/proxy.ts`, and client-side interactions. It calls the API over HTTP using `NEXT_PUBLIC_API_URL`.
- **API** (`apps/api`) — handles all business logic, data access, authentication endpoints, and background jobs. It exposes routes under `/api/v1/*`, auth under `/api/auth/*`, and health at `/api/health`.

The web app does **not** have direct database access by design. All data flows through the standalone API.

### Authentication (Better Auth)

- Authentication uses **Better Auth** with email/password and the **organization plugin**.
- Sessions are **cookie-based** with `sameSite: 'lax'` and `secure: true` in production.
- `crossSubDomainCookies` is disabled — the web and API are on separate origins.
- **Trusted origins** are derived from the `CORS_ORIGIN` environment variable.
- The auth handler is mounted in Hono: `app.on(['POST', 'GET'], '/api/auth/**', ...)`.
- Access control roles (`admin`, `viewer`) are defined in `packages/auth/src/server.ts` using `createAccessControl`.
- The web app resolves sessions via `authClient.getSession()` with cookie forwarding.

### Route protection (Next.js Proxy)

- Next.js 16 renamed middleware to **proxy**. The file is `apps/web/src/proxy.ts`.
- The proxy uses `getSessionCookie()` from `better-auth/cookies` for **optimistic cookie-based gating** — redirecting unauthenticated users to `/login` and authenticated users away from auth pages.
- Proxy is an optimistic check only. **Real authorization happens server-side** in the `(app)` layout via `getServerSession()` and in the API via `sessionMiddleware`.

### Hono API structure

- Global middleware chain: `requestId` → `cors` → route-specific middleware.
- `/api/v1/*` middleware: `sessionMiddleware` → `tenantMiddleware` → `auditMiddleware` → `generalRateLimiter`.
- `/api/auth/*` middleware: `authRateLimiter` → Better Auth handler.
- **RPC type safety**: The web app imports `AppType` from `@nilam/api` and uses `hc<AppType>` from `hono/client`. For types to propagate correctly, route handlers **must be chained** (not registered with separate statements) and the chained result must be exported as `AppType`.

### Data fetching patterns

- **Server Components** use `serverFetch()` (in `apps/web/src/lib/server-api-client.ts`) which forwards the `cookie` header from the incoming request to the API.
- **Client Components** use the Hono RPC client (`apps/web/src/lib/api-rpc.ts`) with `credentials: 'include'`.
- **TanStack Query** (`@tanstack/react-query` v5) is scaffolded with a `QueryClientProvider`, shared defaults, and a query key factory. When implementing data-heavy screens:
  - Prefetch in Server Components using `queryClient.prefetchQuery()`.
  - Wrap client components with `<HydrationBoundary state={dehydrate(queryClient)}>`.
  - Use `useQuery` / `useMutation` in client components.
  - Prefer `queryOptions()` for reusable query definitions shared between server prefetch and client hooks.
- **Session lookup** via `getServerSession()` should be wrapped in React's `cache()` to avoid duplicate HTTP round-trips when called from both layout and page.

### Background jobs & email

- Background jobs run through **Inngest** (webhook handler at `/api/inngest`).
- Transactional email uses **Resend** via configurable email callbacks in `@nilam/auth`.

### Observability

- **Sentry** is configured for both web (`@sentry/nextjs`) and API (`@sentry/node`).
- The web app needs `withSentryConfig` wrapping in `next.config.ts`, plus `instrumentation.ts` and `global-error.tsx` for full App Router integration.
- The API initializes Sentry conditionally when `SENTRY_DSN` is set.

## Commands

```
pnpm install          # Install dependencies
pnpm dev              # Start everything (Turbo)
pnpm dev:web          # Start only the web app (Turbopack)
pnpm build            # Build all apps and packages
pnpm typecheck        # Type-check all packages
pnpm lint             # Lint all packages (Biome)
pnpm format           # Format all files (Biome)
pnpm format:check     # Check formatting without writing
pnpm test             # Run all tests (Turbo)
pnpm test:unit        # Run unit tests (Vitest workspace)
pnpm test:web         # Run web E2E tests (Playwright)
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run Drizzle migrations
pnpm db:push          # Push schema to database
pnpm db:seed          # Seed database
pnpm db:reset         # Reset database
pnpm db:studio        # Open Drizzle Studio
```

## Working conventions

### General

- Use **Biome** for linting and formatting (2-space indent, single quotes, trailing commas, semicolons).
- Keep server-only code in `apps/api` or server-only package entrypoints (`@nilam/auth/server`, `@nilam/db`).
- Reuse `@nilam/validators` for request and form validation — do not duplicate Zod schemas.
- Reuse `@nilam/ui` tokens and components before adding one-off styles.
- Import error types (`ErrorCode`, `ApiError`, `FieldError`) from `@nilam/validators` — do not redefine in app code.

### Next.js 16 (apps/web)

- This app uses **Next.js 16 App Router** with **Turbopack**.
- Verify Next.js 16 behavior against local docs at `node_modules/next/dist/docs/` before assuming older APIs still apply.
- In Next.js 16, middleware is called **proxy** (`src/proxy.ts`). Export a named `proxy` function or default export.
- `transpilePackages` in `next.config.ts` is required because workspace packages export TypeScript source directly.
- Route groups: `(auth)` for public auth pages, `(app)` for the authenticated shell.
- Add `loading.tsx` and `error.tsx` files for route groups to enable streaming and graceful error recovery.
- Add `global-error.tsx` at the app root for unhandled error capture.

### Hono API (apps/api)

- **Chain route definitions** for RPC type safety. Do not use separate `.get()` / `.post()` statements — chain them and ensure `AppType` captures the full route surface.
- The API runs on **Bun**. The server export must include `hostname: '0.0.0.0'` for Railway container deployment.
- Use `secureHeaders()` from `hono/secure-headers` for response security headers.
- Better Auth integration: `app.on(['POST', 'GET'], '/api/auth/**', (c) => auth.handler(c.req.raw))`.
- Rate limiters use in-memory stores — acceptable for single-instance deployment; migrate to Redis (e.g., Upstash) when horizontally scaling.

### TanStack Query (apps/web)

- `QueryClientProvider` is in the root layout. The `getQueryClient()` singleton pattern (new per server request, reused in browser) is correct.
- Shared defaults: `staleTime: 60s`, `gcTime: 5min`, `retry: false` on server / `3` on client.
- Query keys live in `@nilam/validators` (`queryKeys`). Follow the hierarchical factory pattern with `all`, `lists()`, `list(params)`, `details()`, `detail(id)`.
- When building data screens, always prefetch in Server Components and hydrate for client components — do not rely on client-only fetching for initial page loads.

### Cross-origin auth flow

- The web and API are on separate origins. CORS is configured with `credentials: true` and explicit origin allowlisting from `CORS_ORIGIN`.
- Server-side fetch from web → API must forward the `cookie` header (and ideally `x-forwarded-for`, `user-agent` for tracing/rate-limiting accuracy).
- The Hono RPC client uses `credentials: 'include'` for browser-side cookie forwarding.

## Environment variables

Runtime env files are split by app:
- `apps/web/.env.local` — `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SENTRY_DSN`, and any Next.js-specific vars.
- `apps/api/.env` — `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `CORS_ORIGIN`, `RESEND_API_KEY`, `INNGEST_EVENT_KEY`, `S3_*`, `SENTRY_DSN`, etc.

The root `.env.example` is a reference only. Do not assume the web app has `DATABASE_URL` — it accesses data exclusively through the API.

## Known scaffolding state

This is a base template. The following are scaffolded but not yet implemented:
- Domain route handlers in `apps/api/src/routes/` (all stubs except `health.ts`).
- Service layer in `apps/api/src/services/` (all empty exports).
- Inngest background functions (all no-ops with TODO comments).
- `tenantMiddleware` (always sets `accountId: null`).
- `requireRole()` middleware (denies all access until wired to Better Auth org membership).
- `auditMiddleware` (pass-through no-op).
- DB schema files in `packages/db/src/schema/` (stubs — run `npx @better-auth/cli generate` for auth tables).
- E2E tests in `apps/web/e2e/` (all skipped).
- TanStack Query consumers (no `useQuery`/`useMutation` usage yet).
