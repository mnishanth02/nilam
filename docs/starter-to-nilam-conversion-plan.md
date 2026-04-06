# Starter Kit → Nilam Base Template Conversion Plan

> Transform the `@starter/*` monorepo into the `@nilam/*` PropertyVault base template.
> This plan covers every structural change needed before product implementation begins.

*Created: 6 April 2026*
*Revised: 6 April 2026 — Multi-model review (GPT 5.4 + Claude Opus 4.6) applied. ~60 issues addressed.*

---

## 1. Summary

Convert the generic starter kit into a Nilam-ready base template by:

- Replacing Clerk with **Better Auth** (email/password, organization plugin, Resend email)
- Moving the API from a **Next.js-mounted package** to a **standalone `apps/api`** on Bun (deployed to Railway)
- Removing the **mobile app** entirely (not in Nilam V1)
- Restructuring packages to match the architecture doc (`packages/shared`, `packages/ui`, `packages/validators`)
- Resetting DB schema, validation, and routes to clean Nilam-ready stubs
- Applying the **terracotta + cream design system** tokens
- Adding **Inngest** (background jobs), **Resend** (email), and **Sentry** (error monitoring) scaffolds

---

## 2. Confirmed Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Package scope | `@nilam/*` (replace all `@starter/*`) | Product identity |
| Mobile app | Remove entirely | Not in V1 scope — responsive web only |
| API deployment | Standalone `apps/api` on Bun → Railway | Architecture doc: separated frontend-backend, portable Hono on Bun |
| Auth provider | Better Auth + organization plugin | Self-hostable, org plugin handles accounts/roles/invites, Drizzle adapter |
| Rate limiting | Hono built-in (in-memory) | Sufficient for single Railway instance in V1; swap to Redis if horizontally scaled |
| Background jobs | Inngest adapter + shared job handlers | Keeps domain logic portable; ~210 executions/month well within free tier |
| Transactional email | Resend | Password reset + invite links only; free tier covers V1 |
| Error monitoring | Sentry | Industry standard; free tier (5K errors/month) covers V1 |
| Convex instructions | Remove | Project uses Hono + Drizzle + Postgres, not Convex |
| Validators package name | `packages/validators` | Match architecture doc exactly |
| API entrypoint filename | `app.ts` (not `index.ts`) | Architecture doc uses `apps/api/src/app.ts` consistently; Railway start: `bun run src/app.ts` |
| Rate-limit middleware filename | `rate-limit.ts` (not `ratelimit.ts`) | Match architecture doc `rate-limit.ts` naming |
| Storage env var naming | `S3_*` (not `CLOUDFLARE_*`/`R2_*`) | Architecture doc uses S3-compatible naming; starter's `CLOUDFLARE_*`/`R2_*` vars must be renamed |
| Design system source of truth | `docs/design-system.md` §2 + §13 | Architecture doc §8 has simplified/outdated colors; design-system doc has WCAG-corrected values |
| Font loading strategy | `next/font/google` | Self-hosted fonts via Next.js 16 — no layout shift, better performance |
| CSS ownership | `packages/ui/src/globals.css` owns tokens | `apps/web/src/app/globals.css` imports via `@import "@nilam/ui/globals.css"` plus web-specific overrides |
| Next.js middleware file | `src/middleware.ts` | Next.js 16 uses `middleware.ts` (not `proxy.ts`). The starter's `proxy.ts` is a Clerk-specific pattern that is removed. |
| Resend dependency location | Injected from API layer | `packages/auth` defines callback interfaces; `apps/api` provides Resend implementations when creating the auth instance |

---

## 3. Gap Analysis

### 3.1 Full Comparison Table

| Area | Starter Kit (Current) | Nilam (Target) | Action |
|---|---|---|---|
| Package scope | `@starter/*` | `@nilam/*` | Rename all |
| Auth provider | Clerk (`@clerk/nextjs`, `@clerk/backend`, `@hono/clerk-auth`) | Better Auth + org plugin | **Replace** |
| API location | `packages/api` (library, mounted in Next.js via catch-all route) | `apps/api` (standalone Hono app, Bun runtime) | **Move + restructure** |
| API proxy | `apps/web/src/app/api/[[...route]]/route.ts` | Removed — API is separate origin | **Remove** |
| Web middleware | `apps/web/src/proxy.ts` (Clerk `auth.protect()`) | Next.js middleware for Better Auth session | **Replace** |
| Mobile app | `apps/mobile` (Expo 55 + React Native) | Not in V1 | **Delete entirely** |
| DB schema | 2 tables: `projects`, `uploads` | 20+ domain tables (groups, persons, assets, ownership, units, tenants, leases, charges, payments, documents, notifications, audit_log, Better Auth managed tables) | **Replace** |
| Validation schemas | Project/upload Zod schemas | Domain Zod schemas (auth, group, person, asset, unit, tenant, lease, payment, document) | **Replace** |
| Rate limiting | Upstash Redis (`@upstash/ratelimit`, `@upstash/redis`) | Hono built-in (in-memory) | **Replace** |
| Background jobs | Vercel cron (single cleanup endpoint) | Inngest adapter + 7 scheduled job handlers | **Add** |
| Transactional email | None | Resend (password reset, invite links) | **Add** |
| Error monitoring | None | Sentry (`@sentry/node`, `@sentry/nextjs`) | **Add** |
| Storage abstraction | `packages/api/src/lib/storage.ts` | `packages/shared/src/storage.ts` | **Move to shared package** |
| UI library | shadcn components in `apps/web/src/components/ui/` | `packages/ui/` (shared package) | **Extract to package** |
| Design system | Default shadcn theme | Terracotta + cream palette, DM Sans / Inter / JetBrains Mono | **Configure** |
| Web route groups | `(public)`, `(auth)`, `(protected)` with Clerk components | `(auth)` with custom pages, `(app)` authenticated shell | **Restructure** |
| API routes | `/api/health`, `/api/projects`, `/api/uploads`, etc. | `/api/v1/*` with domain routes + `/api/auth/*` (Better Auth) | **Restructure** |
| Middleware stack | requestId → CORS → Clerk auth → requireAuth | CORS → requestId → rateLimit → Better Auth session → account context → role auth → audit | **Replace** |
| Validators package | `packages/validation` | `packages/validators` | **Rename** |
| New packages needed | — | `packages/shared`, `packages/ui` | **Create** |
| Frontend libs (deferred) | react-hook-form, sonner, hono | + @tanstack/react-table, lucide-react, date-fns, nuqs, react-dropzone, recharts, @react-pdf/renderer, cmdk | Add in product phases |
| Backend libs | hono, @aws-sdk, @upstash, @hono/clerk-auth | + better-auth, resend, inngest; minus @upstash/*, @hono/clerk-auth, @clerk/* | **Swap** |
| API runtime | Node.js (runs inside Next.js on Vercel) | Bun (standalone on Railway) | **Configure** |
| Hono RPC setup | Same-origin (API mounted in Next.js, no cross-origin) | Cross-origin (`NEXT_PUBLIC_API_URL` → Railway), `credentials: 'include'` | **Configure** |
| Env vars | `CLERK_*`, `UPSTASH_*`, `CLOUDFLARE_*`, `R2_*`, `CRON_SECRET` | `BETTER_AUTH_*`, `RESEND_*`, `INNGEST_*`, `ENCRYPTION_SECRET`, `S3_*`, `CORS_ORIGIN` | **Replace** |
| Tests | Project/upload route tests + mocks (Clerk, S3, Upstash) | Clean test setup for Better Auth + domain service stubs | **Reset** |
| E2E tests | Playwright tests for Clerk auth flows | No E2E in V1 (per architecture doc) | **Clear** |

### 3.2 Items That Stay the Same

These parts of the starter kit align with the Nilam architecture and need no changes:

| Area | Detail |
|---|---|
| Monorepo tooling | Turborepo + pnpm workspaces — identical |
| Next.js version | Next.js 16 (App Router, Turbopack) — identical |
| API framework | Hono — identical |
| Database | PostgreSQL on Neon with `@neondatabase/serverless` — identical |
| ORM | Drizzle ORM + drizzle-kit — identical |
| Validation library | Zod — identical |
| State management | TanStack Query v5 — identical |
| Forms | react-hook-form + @hookform/resolvers — identical |
| CSS framework | Tailwind CSS v4 — identical |
| API client | Hono RPC (`hc`) — identical |
| Toast notifications | Sonner — identical |
| Linter/formatter | Biome — identical |
| File storage SDK | @aws-sdk/client-s3 + @aws-sdk/s3-request-presigner — identical |
| TypeScript configs | `@starter/typescript-config` base/nextjs/react-native configs — rename only |
| pnpm-workspace.yaml | `apps/*`, `packages/*` — no change |
| vitest.shared.ts | Test config — keep (adjust workspace paths) |

---

## 4. Conversion Phases

### Phase A: Cleanup & Rename (do first — no dependencies)

**Goal**: Clean slate. Remove mobile, rename scope, update metadata.

| # | Task | Files Affected |
|---|---|---|
| A1 | **Delete `apps/mobile/`** entirely | `apps/mobile/**` |
| A2 | **Remove Convex instructions** — remove the convex.instructions.md prompt file or its reference | `.github/copilot-instructions.md` |
| A3 | **Rename `@starter/*` → `@nilam/*`** in every `package.json` name and workspace dependency | Root `package.json`, `apps/web/package.json`, `packages/api/package.json`, `packages/db/package.json`, `packages/auth/package.json`, `packages/validation/package.json`, `packages/typescript-config/package.json` |
| A4 | **Update all TypeScript imports** referencing `@starter/*` → `@nilam/*` | All `.ts`/`.tsx` files across workspace |
| A5 | **Update `next.config.ts`** — change `transpilePackages` from `@starter/*` to `@nilam/*` | `apps/web/next.config.ts` |
| A6 | **Remove mobile-only scripts** from root `package.json` | `dev:mobile`, `test:mobile` scripts. Also review `test:web`, `db:cleanup` and other scripts for needed updates. |
| A7 | **Update product metadata** — root package name to `nilam`, update README heading | `package.json`, `README.md` |
| A8 | **Remove mobile-specific pnpm config** — remove `@clerk/shared` and other mobile entries from `onlyBuiltDependencies` | `pnpm-workspace.yaml` (not root `package.json` — the config lives in the workspace file) |
| A9 | **Update CI/CD workflow** — remove Clerk env vars/secrets, remove mobile test steps, update build commands for new package structure, add `apps/api` build step | `.github/workflows/ci.yml` |

**Verification**: `grep -r "@starter" .` returns zero results. `apps/mobile` does not exist.

---

### Phase B: Restructure Packages (parallel with Phase C)

**Goal**: Match the architecture doc's package structure.

| # | Task | Detail |
|---|---|---|
| B1 | **Move `packages/api/` → `apps/api/`** | Move entire directory. Update `package.json`: add `"start": "bun run src/app.ts"`, add `"dev": "bun --watch src/app.ts"`, update name to `@nilam/api`. Rename entrypoint from `index.ts` to `app.ts` (per architecture doc). The API becomes a standalone Hono app on Bun, no longer a library consumed by Next.js. Copy/adapt `packages/api/biome.json` to `apps/api/biome.json`. |
| B2 | **Add `apps/api/turbo.json`** | Adapt existing `packages/api/turbo.json`. Configure build outputs, env vars for Railway deployment (DATABASE_URL, S3_*, BETTER_AUTH_*, RESEND_*, INNGEST_*, ENCRYPTION_SECRET, CORS_ORIGIN, SENTRY_DSN). |
| B3 | **Delete `apps/web/src/app/api/[[...route]]/route.ts`** | API catch-all route — API is now a separate origin. |
| B4 | **Rename `packages/validation/` → `packages/validators/`** | Rename directory. Update `package.json` name to `@nilam/validators`. Update all imports from `@nilam/validation` → `@nilam/validators` across workspace. |
| B5 | **Create `packages/shared/`** | New package `@nilam/shared` with: `src/storage.ts` (S3-compatible storage abstraction, moved from `packages/api/src/lib/storage.ts`), `src/types/index.ts`, `src/constants/index.ts`, `src/utils/index.ts`, `src/index.ts`, `package.json`, `tsconfig.json`. **Install `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`** as dependencies (moved from the API package). Update storage.ts to use new `S3_*` env var names (replacing `CLOUDFLARE_*`/`R2_*`). |
| B6 | **Create `packages/ui/`** | New package `@nilam/ui`. Note: `apps/web/src/components/ui/` may not exist yet in the starter — if shadcn components haven't been added, create the package from scratch. Setup: `src/components/` (shadcn component files), `src/lib/utils.ts` (`cn()` helper), `src/globals.css` (design tokens + Tailwind theme — this is the canonical token file), `src/index.ts`, `package.json`, `tsconfig.json`, `components.json` (shadcn config targeting this package). **Install `clsx`, `tailwind-merge`, and `class-variance-authority`** as dependencies. |
| B7 | **Update `vitest.workspace.ts`** | Change `packages/api` path to `apps/api`. Ensure `packages/db` and `packages/validators` paths are correct. |
| B8 | **Configure Tailwind v4 cross-package source** | In `apps/web/src/app/globals.css`, add `@import "@nilam/ui/globals.css"` and `@source "../../packages/ui/src"` (or equivalent Tailwind v4 content detection) so Tailwind processes classes used in the UI package. |
| B9 | **Declare workspace dependencies** | Add `@nilam/shared` to `apps/api/package.json`. Add `@nilam/ui` and `@nilam/shared` to `apps/web/package.json`. Keep `@nilam/api` as a workspace dependency in `apps/web` for Hono RPC type inference (type-only import — the web app does not run API code, it only uses the exported route types for `hc` client). |
| B10 | **Update root turbo.json dev task** | Ensure the `dev` task starts both `apps/web` (Next.js on :3000) and `apps/api` (Bun on :4000) in parallel. Document Bun installation as a prerequisite. |

**Verification**: `pnpm install` resolves. Workspace graph reflects new structure.

---

### Phase C: Replace Auth — Clerk → Better Auth (depends on Phase A)

**Goal**: Swap auth provider completely. No Clerk code remains.

| # | Task | Detail |
|---|---|---|
| C1 | **Remove Clerk dependencies** | `apps/web`: uninstall `@clerk/nextjs`. `packages/auth`: uninstall `@clerk/backend`. `apps/api` (was `packages/api`): uninstall `@hono/clerk-auth`. |
| C2 | **Install Better Auth** | `packages/auth`: install `better-auth`. Configure Drizzle adapter. |
| C3 | **Rewrite `packages/auth/src/server.ts`** | Better Auth instance with: `emailAndPassword` provider, `organization` plugin (roles: admin/viewer via `createAccessControl`), Drizzle adapter pointing to `@nilam/db`. Email callbacks (`sendResetPassword`, `sendInvitationEmail`) should be **configurable** — define callback interfaces that the API layer injects with Resend implementations when instantiating. Add `@nilam/db` as a dependency to `packages/auth`. |
| C4 | **Rewrite `packages/auth/src/client.ts`** | Better Auth client (`createAuthClient`) for web. Export `AuthUser`, `AuthSession` types. |
| C5 | **Update `packages/auth/package.json`** | Remove `@clerk/backend`. Add `better-auth`. Add `@nilam/db` (for Drizzle adapter). Update name to `@nilam/auth`. |
| C6 | **Install Resend** in `apps/api` | `resend` package. Used to provide email implementations that are injected into Better Auth callbacks at auth instance creation time. |
| C7 | **Delete `apps/api/src/middleware/clerk.ts`** | Clerk-specific auth middleware — replaced. |
| C8 | **Create `apps/api/src/middleware/auth.ts`** | Better Auth session resolution + role authorization middleware. Resolves session from cookie → injects `userId` and role into Hono context. Handles both session resolution and Admin/Viewer role checks per route (replaces both the old clerk middleware and the old requireAuth/requireResourceOwner). |
| C9 | **Create `apps/api/src/middleware/tenant.ts`** | Account context injection middleware. Resolves user's single account membership via org plugin → injects `accountId` into Hono context. All downstream queries filter by this `accountId`. |
| C10 | **Create `apps/api/src/middleware/audit.ts`** | Post-response audit logging hook. Writes to `audit_log` table. Async fallback queue on write failure. |
| C11 | **Configure cross-origin cookie/CORS** | Critical for cross-origin auth when API (Railway) and web (Vercel) are separate origins. Tasks: (1) Better Auth cookie config: `sameSite: 'none'`, `secure: true` in production. For local dev, use `sameSite: 'lax'` since both are on localhost (different ports). (2) CORS must set `Access-Control-Allow-Credentials: true` with exact origin (not `*`). (3) Document development vs production cookie strategy. (4) Note: Architecture doc's `sameSite=lax` claim needs correction for production cross-origin. |
| C12 | **Delete `apps/web/src/proxy.ts`** | Clerk middleware file — replaced by standard Next.js middleware. |
| C13 | **Create `apps/web/src/middleware.ts`** | Next.js middleware for Better Auth session checking. Redirect unauthenticated users to `/login`. Redirect authenticated users away from auth pages. |
| C14 | **Update `apps/web/src/app/layout.tsx`** | Remove `ClerkProvider`. Add Better Auth session provider or context. |
| C15 | **Delete `apps/web/src/components/sign-out-button.tsx`** | Clerk-specific component. |
| C16 | **Delete `apps/web/src/components/user-button.tsx`** | Clerk-specific component. |
| C17 | **Update env vars** | Remove: `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`. Add: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`. |

**Verification**: `grep -r "clerk\|Clerk\|CLERK" .` returns zero results.

---

### Phase D: Replace Rate Limiting (depends on Phase B)

**Goal**: Remove Upstash dependency. Use Hono built-in rate limiter.

> **Note**: Phase D depends on Phase B (API must be in `apps/api/`), not Phase C. Rate limiting is independent of auth and can run in parallel with C.

| # | Task | Detail |
|---|---|---|
| D1 | **Uninstall Upstash** from `apps/api` | Remove `@upstash/ratelimit`, `@upstash/redis`. |
| D2 | **Rewrite `apps/api/src/middleware/rate-limit.ts`** | Rename from `ratelimit.ts` to `rate-limit.ts` (match architecture doc). Replace Upstash-backed rate limiter with Hono's built-in rate limiter (in-memory sliding window). Auth endpoints: 10 req/min. General: 100 req/min. |
| D3 | **Delete `apps/api/src/test/mocks/upstash.ts`** | Upstash test mock — no longer needed. |
| D4 | **Delete or rewrite `apps/api/src/middleware/ratelimit.test.ts`** | Upstash-specific rate limit tests — rewrite for new Hono built-in limiter. |
| D5 | **Remove Upstash env vars** | Remove `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` from turbo.json, env templates, etc. |

**Verification**: `grep -r "upstash\|Upstash\|UPSTASH" .` returns zero results.

---

### Phase E: Reset Domain Layer (depends on Phase B)

**Goal**: Remove starter domain code. Add Nilam domain stubs ready for Phase 0-1 implementation.

| # | Task | Detail |
|---|---|---|
| **Schema** | | |
| E1 | Delete `packages/db/src/schema/projects.ts` | Starter schema |
| E2 | Delete `packages/db/src/schema/uploads.ts` | Starter schema |
| E3 | Delete `packages/db/drizzle/0000_nebulous_tony_stark.sql` | Starter migration |
| E4 | Delete `packages/db/drizzle/meta/` | Starter migration metadata |
| E5 | Create `packages/db/src/schema/auth.ts` | Better Auth managed tables (users, sessions, accounts, verifications) — Drizzle adapter schema definition |
| E6 | Create `packages/db/src/schema/accounts.ts` | Organization plugin extensions (organization, member, invitation tables with custom fields: timezone, deletedAt) |
| E7 | Create domain schema stubs | One file per domain module, each exporting an empty or minimal placeholder: `groups.ts`, `persons.ts`, `assets.ts`, `ownership.ts`, `units.ts`, `tenants.ts`, `leases.ts`, `charges.ts`, `payments.ts`, `documents.ts`, `notifications.ts`, `audit-log.ts` |
| E8 | Update `packages/db/src/schema/index.ts` | Export new schema files instead of projects/uploads |
| **Validation** | | |
| E9 | Delete `packages/validators/src/schemas/project.ts` + `.test.ts` | Starter validation |
| E10 | Delete `packages/validators/src/schemas/upload.ts` + `.test.ts` | Starter validation |
| E11 | Create domain validator stubs | One file per domain: `auth.ts`, `group.ts`, `person.ts`, `asset.ts`, `unit.ts`, `tenant.ts`, `lease.ts`, `payment.ts`, `document.ts` |
| E12 | Update `packages/validators/src/schemas/index.ts` | Export new validator files |
| E13 | Update `packages/validators/src/query-keys.ts` | Replace project/upload query keys with domain query key stubs (groups, persons, assets, tenants, leases, payments, documents, notifications) |
| **Routes** | | |
| E14 | Delete `apps/api/src/routes/projects.ts` + `.test.ts` | Starter routes |
| E15 | Delete `apps/api/src/routes/uploads.ts` + `.test.ts` | Starter routes |
| E16 | Delete `apps/api/src/routes/demo.ts` | Starter demo route |
| E17 | Delete `apps/api/src/routes/webhooks.ts` | Clerk webhooks — no longer needed. Check if `svix` or `@svix/webhooks` is a direct dependency and remove if present. |
| E18 | Delete `apps/api/src/routes/cleanup.ts` | Moves to Inngest job |
| E18b | Delete `apps/api/src/routes/public.ts` + `public.test.ts` | Starter public ping route — not needed |
| E19 | Keep `apps/api/src/routes/health.ts` | Rename/update for `/api/v1/` prefix awareness |
| E20 | Create domain route stubs | Placeholder route files: `auth.ts`, `groups.ts`, `persons.ts`, `assets.ts`, `units.ts`, `tenants.ts`, `leases.ts`, `payments.ts`, `documents.ts`, `notifications.ts`, `dashboard.ts`, `audit-log.ts`, `exports.ts`, `settings.ts`. Note: route stubs should include comments for key subroutes per architecture doc (e.g., `documents/presign`, `leases/:id/activate`, `payments/bulk`, `settings/invite`). |
| **Tests & Mocks** | | |
| E21 | Delete `apps/api/src/test/mocks/clerk.ts` | Clerk test mock |
| E22 | Delete `apps/api/src/routes/me.test.ts` | Tests Clerk-based auth |
| E23 | Update `apps/api/src/test/setup.ts` | Remove Clerk/Upstash mock imports. Add Better Auth test setup. |
| E23b | Keep `apps/api/src/test/request.ts` | Test request helper — update for new route structure and Better Auth |
| **Other** | | |
| E24 | Reset `packages/db/src/seed.ts` | Clear starter seed data. Add placeholder comment for domain seed. |
| E25 | Update `apps/api/src/app.ts` | Update route registrations to use domain route stubs. Register Better Auth routes at `/api/auth/*`. Register domain routes under `/api/v1/*`. |
| E26 | Keep `packages/validators/src/schemas/pagination.ts` | Shared pagination infrastructure — reusable for all domain routes. Keep in the validators package. |
| E27 | Keep `QUERY_DEFAULTS` export | Preserve `packages/validators/src/index.ts` `QUERY_DEFAULTS` React Query defaults — shared infrastructure used by both web and API. |

**Verification**: No `project` or `upload` domain references remain in schema, validation, or routes.

---

### Phase F: Add Background Jobs (depends on Phase B)

**Goal**: Add Inngest scaffold for scheduled jobs.

| # | Task | Detail |
|---|---|---|
| F1 | **Install `inngest`** in `apps/api` | Add to dependencies. |
| F2 | **Create `apps/api/src/inngest/client.ts`** | Inngest client instance (`new Inngest({ id: 'nilam' })`). |
| F3 | **Create `apps/api/src/inngest/functions.ts`** | Cron job stubs for all 7 scheduled jobs: monthly charge generation, lease expiry notifications, rent overdue notifications, EC expiry reminders, property tax reminders, document expiry reminders, orphaned file cleanup. Each stub calls a shared job handler function (architecture doc: "Shared internal handlers + Inngest adapter" — keep domain logic in service layer, not in Inngest-specific code). |
| F4 | **Add `/api/inngest` endpoint** | Register Inngest serve handler in API entrypoint (`app.ts`). |
| F5 | **Remove Vercel cron config** | Delete cron entry from `apps/web/vercel.json`. |
| F6 | **Add Inngest env vars** | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` to env templates and turbo.json. |

**Verification**: API starts without errors. `/api/inngest` endpoint responds.

---

### Phase G: Configure Web App (depends on Phases C, E)

**Goal**: Restructure the web app to match Nilam's route layout and remove all starter UI code.

| # | Task | Detail |
|---|---|---|
| G1 | **Rename `(protected)` → `(app)`** | Route group rename to match architecture doc. |
| G2 | **Remove `(public)` route group** | Starter public page — not in Nilam. **Add a root `/` redirect** to `/login` (unauthenticated) or `/dashboard` (authenticated) so the app has a clear entry point. |
| G3 | **Update `(auth)` routes** | Delete Clerk sign-in/sign-up catch-all pages (`sign-in/[[...sign-in]]/page.tsx`, `sign-up/[[...sign-up]]/page.tsx`). Create custom auth pages: `login/page.tsx`, `signup/page.tsx`, `forgot-password/page.tsx`, `reset-password/page.tsx`, `accept-invitation/[id]/page.tsx` (for invite link handling per architecture doc §6). |
| G4 | **Delete starter pages** | Remove `projects/`, `rate-limit-demo/`, `uploads/` pages. Replace `dashboard/page.tsx` with a placeholder (dashboard will be rebuilt in product phases, but the route must exist for post-login navigation). |
| G5 | **Delete `apps/web/src/features/projects/`** | Starter feature code. |
| G6 | **Delete `apps/web/src/features/uploads/`** | Starter feature code. |
| G7 | **Delete starter components** | `sidebar-nav.tsx` (will be rebuilt), `sign-out-button.tsx`, `user-button.tsx`. |
| G8 | **Update `apps/web/src/lib/api-client.ts`** | Configure for cross-origin API calls: `NEXT_PUBLIC_API_URL` pointing to Railway URL (e.g., `http://localhost:4000` in dev). Add `credentials: 'include'` for cookie forwarding. Import route types from `@nilam/api` for Hono RPC type inference (type-only dependency — no runtime code from the API package). |
| G9 | **Update `apps/web/src/lib/server-api-client.ts`** | Server-side API client for SSR prefetching. Forwards cookies from incoming Next.js request to the API. |
| G10 | **Update `apps/web/src/lib/env.ts`** | Replace Clerk env vars with Better Auth / Nilam env vars. |
| G11 | **Update `apps/web/src/app/(app)/layout.tsx`** | Authenticated shell layout (sidebar nav placeholder, top bar, notification bell placeholder). |
| G12 | **Update `apps/web/src/app/(auth)/layout.tsx`** | Public auth layout (centered card). |

**Verification**: Web app starts. Auth pages render. Authenticated layout loads.

---

### Phase H: Design System & Theming (parallel with Phase G)

**Goal**: Apply the terracotta + cream design system from `docs/design-system.md` (the canonical source — not the simplified architecture doc §8 which has outdated color values).

| # | Task | Detail |
|---|---|---|
| H1 | **Configure CSS `@theme` tokens** | Apply the full `@theme` block from `design-system.md` §2 + §13 to `packages/ui/src/globals.css`. Includes: all background/surface colors, border colors, primary (terracotta), secondary (warm gray-brown), text colors (`--color-text`, `--color-text-muted`, `--color-text-faint`), all semantic status colors (success, warning, info, destructive — each with `-foreground` and `-muted` variants), ring color, input color. Use the WCAG-corrected values from the design system doc (e.g., `--color-success: #3D6E38`, not the architecture doc's `#7BA075`). |
| H2 | **Configure shadcn `:root` alias block** | Add the `:root` block from design-system.md §13 that maps `@theme` tokens to the bare CSS variable names shadcn components expect (`--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--card`, `--popover`, `--border`, `--input`, `--ring`). **Critical for shadcn components to work.** |
| H3 | **Add radius tokens** | Add to `@theme`: `--radius-sm` (6px), `--radius-md` (8px), `--radius-lg` (12px), `--radius-xl` (16px), `--radius-full` (9999px). Map to shadcn's `--radius` variable. Card: `rounded-lg`, Modal: `rounded-xl`, Input/button: `rounded-md`. |
| H4 | **Add motion tokens** | Add to `:root`: `--duration-fast` (100ms), `--duration-base` (150ms), `--duration-slow` (300ms), `--ease-standard` (cubic-bezier(0.4, 0, 0.2, 1)). Add `@media (prefers-reduced-motion: reduce)` CSS block setting all durations to 0ms. |
| H5 | **Add font configuration** | Configure DM Sans (headings, weight 500-600), Inter (body, weight 400-500), JetBrains Mono (monospace, weight 500) via `next/font/google` in root layout with specific subsets and weights. Add `@theme` font tokens: `--font-sans` (Inter), `--font-heading` (DM Sans), `--font-mono` (JetBrains Mono). |
| H6 | **Add sidebar color tokens** | Add sidebar-specific tokens from design-system.md §13: `--sidebar-background`, `--sidebar-foreground`, `--sidebar-primary`, `--sidebar-primary-foreground`, `--sidebar-accent`, `--sidebar-accent-foreground`, `--sidebar-border`, `--sidebar-ring`. |
| H7 | **Add chart color tokens** | Add `--chart-1` through `--chart-6` from design-system.md §13 for dashboard charts (recharts). |
| H8 | **Apply component styling rules** | Card shadow: `shadow-sm` with warm tint. Hover transition: 150ms ease. Icon size: 20px, stroke: 1.75. Document these as conventions. |
| H9 | **Add `@import "tailwindcss"` directive** | Ensure the `@import` is present in `packages/ui/src/globals.css` per Tailwind v4 requirements. |
| H10 | **Add base accessibility styles** | Focus ring visibility, skip link, touch target minimums (44px), keyboard navigation patterns per design-system.md §9. |

**Verification**: Web app renders with terracotta background (`#FFFAF5`), primary buttons in terracotta (`#C2705B`), correct fonts. shadcn components render correctly with mapped token values.

---

### Phase I: Config & Env Final Cleanup (final phase)

**Goal**: All configuration files reflect Nilam. No starter references remain.

| # | Task | Detail |
|---|---|---|
| I1 | **Rewrite `.env.example`** | Full Nilam env var reference: `DATABASE_URL`, `TEST_DATABASE_URL`, `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `S3_REGION`, `S3_FORCE_PATH_STYLE`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`, `ENCRYPTION_SECRET`, `CORS_ORIGIN`, `NEXT_PUBLIC_API_URL`, `SENTRY_DSN`, `ALLOW_DB_RESET`, `TURBO_TOKEN`, `TURBO_TEAM`. |
| I1b | **Create per-app env examples** | Create `apps/web/.env.example` (web-specific: `NEXT_PUBLIC_API_URL`, `SENTRY_DSN`) and `apps/api/.env.example` (API-specific: `DATABASE_URL`, `S3_*`, `BETTER_AUTH_*`, `RESEND_*`, `INNGEST_*`, `ENCRYPTION_SECRET`, `CORS_ORIGIN`, `SENTRY_DSN`). |
| I2 | **Update root `turbo.json`** | Update global env vars. Update task env references: remove CLERK_*, UPSTASH_*. Add BETTER_AUTH_*, RESEND_*, INNGEST_*, ENCRYPTION_SECRET, S3_*, SENTRY_DSN. |
| I3 | **Update `apps/web/turbo.json`** | Update build env to Nilam vars. |
| I4 | **Update `apps/api/turbo.json`** | Set env vars for Railway build (DATABASE_URL, S3_*, BETTER_AUTH_*, etc.). |
| I5 | **Add Sentry scaffolds** | Install `@sentry/node` in `apps/api`. Install `@sentry/nextjs` in `apps/web`. Add basic config stubs (`sentry.server.config.ts`, `sentry.client.config.ts`). Add `SENTRY_DSN` to env templates. |
| I6 | **Rewrite `.github/copilot-instructions.md`** | Update for Nilam context: Better Auth (not Clerk), standalone API on Bun (not mounted in Next.js), domain structure (assets, tenants, leases, etc.), packages/validators (not validation). |
| I7 | **Update `apps/web/CLAUDE.md`** | Reflect Nilam architecture. |
| I8 | **Update `apps/web/AGENTS.md`** | Reflect Nilam architecture. |
| I9 | **Rewrite `README.md`** | Nilam/PropertyVault overview, dev setup instructions, monorepo structure, tech stack summary. |
| I10 | **Clean up E2E tests** | Clear all Clerk-based test files in `apps/web/e2e/`: `auth-flow.spec.ts`, `public-routes.spec.ts`, `rate-limit.spec.ts`, `health.spec.ts` (health endpoint is now on a different origin). Keep `playwright.config.ts` and directory as placeholder (V1 uses unit/integration tests, no E2E). |
| I11 | **Run full verification** | `pnpm install` → `pnpm typecheck` → `pnpm lint` → `pnpm build` → `pnpm dev`. |

---

## 5. Files Inventory

### 5.1 Files to DELETE

| File/Directory | Reason |
|---|---|
| `apps/mobile/` (entire directory) | No mobile app in V1 |
| `apps/web/src/app/api/[[...route]]/route.ts` | API moves to standalone — catch-all route removed |
| `apps/web/src/proxy.ts` | Clerk middleware — replaced by Better Auth middleware |
| `apps/web/src/features/projects/` | Starter feature code |
| `apps/web/src/features/uploads/` | Starter feature code |
| `apps/web/src/app/(protected)/projects/` | Starter route page |
| `apps/web/src/app/(protected)/uploads/` | Starter route page |
| `apps/web/src/app/(protected)/rate-limit-demo/` | Starter demo page |
| `apps/web/src/app/(public)/` | Starter public page group |
| `apps/web/src/components/sign-out-button.tsx` | Clerk-specific component |
| `apps/web/src/components/user-button.tsx` | Clerk-specific component |
| `packages/api/src/routes/projects.ts` + `.test.ts` | Starter routes |
| `packages/api/src/routes/uploads.ts` + `.test.ts` | Starter routes |
| `packages/api/src/routes/demo.ts` | Starter demo route |
| `packages/api/src/routes/webhooks.ts` | Clerk webhooks — not needed |
| `packages/api/src/routes/cleanup.ts` | Moves to Inngest job |
| `packages/api/src/routes/me.ts` + `.test.ts` | Clerk-based user route |
| `packages/api/src/routes/public.ts` + `.test.ts` | Starter public ping route |
| `packages/api/src/middleware/clerk.ts` | Clerk middleware |
| `packages/api/src/middleware/ratelimit.test.ts` | Upstash rate limit tests |
| `packages/api/src/test/mocks/clerk.ts` | Clerk test mock |
| `packages/api/src/test/mocks/upstash.ts` | Upstash test mock |
| `packages/db/src/schema/projects.ts` | Starter schema |
| `packages/db/src/schema/uploads.ts` | Starter schema |
| `packages/db/drizzle/0000_nebulous_tony_stark.sql` | Starter migration |
| `packages/db/drizzle/meta/` | Starter migration metadata |
| `packages/validation/src/schemas/project.ts` + `.test.ts` | Starter validation |
| `packages/validation/src/schemas/upload.ts` + `.test.ts` | Starter validation |
| `apps/web/e2e/auth-flow.spec.ts` | Clerk-based E2E test |
| `apps/web/e2e/public-routes.spec.ts` | Starter-specific test |
| `apps/web/e2e/rate-limit.spec.ts` | Upstash-specific test |
| `apps/web/e2e/health.spec.ts` | Health check now on different origin |
| `apps/web/src/app/(auth)/sign-in/` (entire directory) | Clerk sign-in catch-all route |
| `apps/web/src/app/(auth)/sign-up/` (entire directory) | Clerk sign-up catch-all route |
| `apps/web/src/app/(protected)/dashboard/page.tsx` | Replaced with placeholder in `(app)` |
| `apps/web/vercel.json` cron entry | Cleanup moves to Inngest |
| `apps/mobile/.env.local.example` | Mobile env example (deleted with app) |

### 5.2 Files to RENAME/MOVE

| From | To | Reason |
|---|---|---|
| `packages/api/` | `apps/api/` | Standalone API app per architecture doc |
| `packages/validation/` | `packages/validators/` | Match architecture doc naming |
| `apps/web/src/components/ui/` | `packages/ui/src/components/` | Shared UI package |
| `apps/web/src/app/(protected)/` | `apps/web/src/app/(app)/` | Match architecture doc route group naming |

### 5.3 Files to CREATE

| File/Directory | Purpose |
|---|---|
| **Packages** | |
| `packages/shared/package.json` | `@nilam/shared` package config |
| `packages/shared/tsconfig.json` | TypeScript config |
| `packages/shared/src/index.ts` | Package entrypoint |
| `packages/shared/src/storage.ts` | S3-compatible storage abstraction (from api/lib/storage.ts) |
| `packages/shared/src/types/index.ts` | Shared TypeScript types |
| `packages/shared/src/constants/index.ts` | Enums, config values |
| `packages/shared/src/utils/index.ts` | Pure utility functions |
| `packages/ui/package.json` | `@nilam/ui` package config |
| `packages/ui/tsconfig.json` | TypeScript config |
| `packages/ui/src/index.ts` | Package entrypoint |
| `packages/ui/src/lib/utils.ts` | `cn()` helper |
| `packages/ui/src/globals.css` | Design tokens + Tailwind theme |
| **API Middleware** | |
| `apps/api/src/middleware/auth.ts` | Better Auth session resolution |
| `apps/api/src/middleware/tenant.ts` | Account context injection (accountId) |
| `apps/api/src/middleware/audit.ts` | Post-response audit logging |
| **Inngest** | |
| `apps/api/src/inngest/client.ts` | Inngest client instance |
| `apps/api/src/inngest/functions.ts` | 7 cron job stubs |
| **DB Schema Stubs** | |
| `packages/db/src/schema/auth.ts` | Better Auth managed tables |
| `packages/db/src/schema/accounts.ts` | Organization plugin extensions |
| `packages/db/src/schema/groups.ts` | Groups + person_groups |
| `packages/db/src/schema/persons.ts` | Person registry |
| `packages/db/src/schema/assets.ts` | Assets + tags + land/rental details |
| `packages/db/src/schema/ownership.ts` | Ownership stakes + transfers |
| `packages/db/src/schema/units.ts` | Unit management |
| `packages/db/src/schema/tenants.ts` | Tenant management |
| `packages/db/src/schema/leases.ts` | Leases + rent components + checklists |
| `packages/db/src/schema/charges.ts` | Monthly charges + charge lines |
| `packages/db/src/schema/payments.ts` | Payments + allocations + advance |
| `packages/db/src/schema/documents.ts` | Document vault |
| `packages/db/src/schema/notifications.ts` | Notifications + recipients |
| `packages/db/src/schema/audit-log.ts` | Audit log |
| **Validator Stubs** | |
| `packages/validators/src/schemas/auth.ts` | Auth validation schemas |
| `packages/validators/src/schemas/group.ts` | Group validation schemas |
| `packages/validators/src/schemas/person.ts` | Person validation schemas |
| `packages/validators/src/schemas/asset.ts` | Asset validation schemas |
| `packages/validators/src/schemas/unit.ts` | Unit validation schemas |
| `packages/validators/src/schemas/tenant.ts` | Tenant validation schemas |
| `packages/validators/src/schemas/lease.ts` | Lease validation schemas |
| `packages/validators/src/schemas/payment.ts` | Payment validation schemas |
| `packages/validators/src/schemas/document.ts` | Document validation schemas |
| **API Route Stubs** | |
| `apps/api/src/routes/auth.ts` | Better Auth route handler |
| `apps/api/src/routes/groups.ts` | Group CRUD |
| `apps/api/src/routes/persons.ts` | Person CRUD |
| `apps/api/src/routes/assets.ts` | Asset CRUD |
| `apps/api/src/routes/units.ts` | Unit CRUD |
| `apps/api/src/routes/tenants.ts` | Tenant CRUD |
| `apps/api/src/routes/leases.ts` | Lease CRUD + lifecycle |
| `apps/api/src/routes/payments.ts` | Payment CRUD + bulk |
| `apps/api/src/routes/documents.ts` | Document vault |
| `apps/api/src/routes/notifications.ts` | Notification center |
| `apps/api/src/routes/dashboard.ts` | Dashboard aggregates |
| `apps/api/src/routes/audit-log.ts` | Audit log viewer |
| `apps/api/src/routes/exports.ts` | CSV/PDF exports |
| `apps/api/src/routes/settings.ts` | Settings + user management |
| **API Service Stubs** | |
| `apps/api/src/services/group.service.ts` | Group business logic |
| `apps/api/src/services/person.service.ts` | Person business logic |
| `apps/api/src/services/asset.service.ts` | Asset business logic |
| `apps/api/src/services/ownership.service.ts` | Ownership transfer logic |
| `apps/api/src/services/unit.service.ts` | Unit business logic |
| `apps/api/src/services/tenant.service.ts` | Tenant business logic |
| `apps/api/src/services/lease.service.ts` | Lease lifecycle logic |
| `apps/api/src/services/charge.service.ts` | Charge generation + escalation |
| `apps/api/src/services/payment.service.ts` | Payment allocation logic |
| `apps/api/src/services/document.service.ts` | Document vault logic |
| `apps/api/src/services/notification.service.ts` | Notification logic |
| `apps/api/src/services/export.service.ts` | Export generation |
| **Web Auth Pages** | |
| `apps/web/src/app/(auth)/login/page.tsx` | Custom login page |
| `apps/web/src/app/(auth)/signup/page.tsx` | Custom signup page |
| `apps/web/src/app/(auth)/forgot-password/page.tsx` | Forgot password page |
| `apps/web/src/app/(auth)/reset-password/page.tsx` | Reset password page |
| `apps/web/src/app/(auth)/accept-invitation/[id]/page.tsx` | Invite acceptance page (per architecture doc §6) |
| **Web Middleware** | |
| `apps/web/src/middleware.ts` | Better Auth session checking |
| **Sentry** | |
| `apps/web/sentry.client.config.ts` | Sentry client config |
| `apps/web/sentry.server.config.ts` | Sentry server config |
| `apps/api/src/lib/sentry.ts` | Sentry init for API |

### 5.4 Key Files to MODIFY

| File | Changes |
|---|---|
| Root `package.json` | Rename to `nilam`. Remove mobile scripts. Update filter refs to `@nilam/*`. |
| Root `turbo.json` | Update global env, task env vars for new naming. |
| `apps/web/package.json` | Rename to `@nilam/web`. Swap `@clerk/nextjs` → Better Auth client. Update workspace deps to `@nilam/*`. |
| `apps/web/next.config.ts` | Update `transpilePackages` to `@nilam/*`. |
| `apps/web/src/app/layout.tsx` | Remove `ClerkProvider`. Add Better Auth session provider. |
| `apps/web/src/lib/api-client.ts` | Cross-origin config: `NEXT_PUBLIC_API_URL` → Railway, `credentials: 'include'`. Type-only import of `@nilam/api` for Hono RPC. |
| `apps/web/src/lib/env.ts` | Replace Clerk env vars with Better Auth / Nilam env vars. |
| `apps/web/src/app/globals.css` | Terracotta + cream design tokens. |
| `packages/auth/package.json` | Rename. Swap `@clerk/backend` → `better-auth`. |
| `packages/auth/src/server.ts` | Complete rewrite: Better Auth instance with org plugin. |
| `packages/auth/src/client.ts` | Complete rewrite: Better Auth client. |
| `packages/db/package.json` | Rename to `@nilam/db`. |
| `packages/db/src/schema/index.ts` | Export new domain schema stubs. |
| `packages/db/drizzle.config.ts` | Verify schema path is correct. |
| `packages/db/src/seed.ts` | Clear starter data. Placeholder for domain seed. |
| `packages/validators/package.json` | Rename to `@nilam/validators`. |
| `packages/validators/src/index.ts` | Export new domain validators. |
| `packages/validators/src/query-keys.ts` | Domain query keys. |
| `packages/validators/src/schemas/index.ts` | Export new validator schemas. |
| `packages/typescript-config/package.json` | Rename to `@nilam/typescript-config`. |
| `vitest.workspace.ts` | Update `packages/api` → `apps/api` path. |
| `.github/copilot-instructions.md` | Rewrite for Nilam context. |
| `apps/web/CLAUDE.md` | Update for Nilam. |
| `apps/web/AGENTS.md` | Update for Nilam. |

---

## 6. Environment Variables Transition

### Remove (Starter / Clerk / Upstash / Old Storage)

```
CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
CLERK_WEBHOOK_SECRET
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL
NEXT_PUBLIC_CLERK_SIGN_UP_URL
CLERK_AUTHORIZED_PARTIES
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
EXPO_PUBLIC_API_BASE_URL
UPSTASH_REDIS_REST_URL
UPSTASH_REDIS_REST_TOKEN
CRON_SECRET
CORS_ALLOWED_ORIGINS
NEXT_PUBLIC_APP_URL
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_ACCESS_KEY_ID
CLOUDFLARE_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_PUBLIC_URL
```

### Add (Nilam / Better Auth / Resend / Inngest)

```env
# Authentication (Better Auth)
BETTER_AUTH_SECRET=<random-32-char-secret>
BETTER_AUTH_URL=http://localhost:4000

# Transactional Email (Resend)
RESEND_API_KEY=<resend-api-key>
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Background Jobs (Inngest)
INNGEST_EVENT_KEY=<inngest-event-key>
INNGEST_SIGNING_KEY=<inngest-signing-key>

# Encryption (Aadhaar / PAN)
ENCRYPTION_SECRET=<random-32-byte-hex-key>

# Error Monitoring (Sentry)
SENTRY_DSN=<sentry-dsn>

# Web / CORS
CORS_ORIGIN=http://localhost:3000

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000

# File Storage (S3-compatible — replaces CLOUDFLARE_*/R2_* from starter)
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_BUCKET=nilam-dev
S3_ACCESS_KEY=<r2-access-key-id>
S3_SECRET_KEY=<r2-secret-access-key>
S3_REGION=auto
S3_FORCE_PATH_STYLE=true
```

### Keep (Unchanged)

```env
DATABASE_URL=postgresql://...
TEST_DATABASE_URL=postgresql://...
ALLOW_DB_RESET=false
TURBO_TOKEN=
TURBO_TEAM=
```

> **Note**: Storage env vars are NOT kept from the starter — they use different names. The starter uses `CLOUDFLARE_*` and `R2_*` naming. Nilam uses `S3_*` naming per the architecture doc. All storage vars are listed in the "Add" section above.

---

## 7. Target Monorepo Structure (After Conversion)

```
nilam/
├── apps/
│   ├── web/                                # Next.js 16 → Vercel
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── (auth)/                 # Public auth pages
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── login/page.tsx
│   │   │   │   │   ├── signup/page.tsx
│   │   │   │   │   ├── forgot-password/page.tsx
│   │   │   │   │   ├── reset-password/page.tsx
│   │   │   │   │   └── accept-invitation/[id]/page.tsx
│   │   │   │   ├── (app)/                  # Authenticated app shell
│   │   │   │   │   └── layout.tsx          # Sidebar + main (placeholder)
│   │   │   │   ├── globals.css             # Terracotta + cream design tokens
│   │   │   │   └── layout.tsx              # Root layout (Better Auth provider)
│   │   │   ├── components/                 # App-specific components (placeholder)
│   │   │   ├── features/                   # Feature modules (empty — built in product phases)
│   │   │   ├── lib/
│   │   │   │   ├── api-client.ts           # Hono RPC client (cross-origin)
│   │   │   │   ├── server-api-client.ts    # Server-side API client (SSR)
│   │   │   │   ├── api-error.ts            # API error handling utilities
│   │   │   │   ├── env.ts                  # Env var helpers
│   │   │   │   └── query-client.ts         # TanStack Query client
│   │   │   ├── providers/
│   │   │   │   └── query-provider.tsx      # QueryClientProvider
│   │   │   └── middleware.ts               # Better Auth session middleware
│   │   ├── e2e/                            # Placeholder (no E2E in V1)
│   │   ├── public/
│   │   ├── sentry.client.config.ts         # Sentry client
│   │   ├── sentry.server.config.ts         # Sentry server
│   │   ├── next.config.ts
│   │   ├── postcss.config.mjs
│   │   ├── playwright.config.ts
│   │   ├── biome.json
│   │   ├── tsconfig.json
│   │   ├── turbo.json
│   │   └── package.json
│   │
│   └── api/                                # Hono → Railway (Bun runtime)
│       ├── src/
│       │   ├── app.ts                     # Hono app entrypoint (per architecture doc)
│       │   ├── routes/
│       │   │   ├── health.ts               # Health check
│       │   │   ├── auth.ts                 # Better Auth handlers
│       │   │   ├── groups.ts               # (stub)
│       │   │   ├── persons.ts              # (stub)
│       │   │   ├── assets.ts               # (stub)
│       │   │   ├── units.ts                # (stub)
│       │   │   ├── tenants.ts              # (stub)
│       │   │   ├── leases.ts               # (stub)
│       │   │   ├── payments.ts             # (stub)
│       │   │   ├── documents.ts            # (stub)
│       │   │   ├── notifications.ts        # (stub)
│       │   │   ├── dashboard.ts            # (stub)
│       │   │   ├── audit-log.ts            # (stub)
│       │   │   ├── exports.ts              # (stub)
│       │   │   └── settings.ts             # (stub)
│       │   ├── services/                   # (stubs — built in product phases)
│       │   ├── middleware/
│       │   │   ├── auth.ts                 # Better Auth session + role authorization
│       │   │   ├── tenant.ts               # Account context injection
│       │   │   ├── audit.ts                # Audit logging
│       │   │   ├── rate-limit.ts           # Hono built-in rate limiter (renamed from ratelimit.ts)
│       │   │   └── request-id.ts           # X-Request-Id header
│       │   ├── inngest/
│       │   │   ├── client.ts               # Inngest client
│       │   │   └── functions.ts            # Cron job stubs
│       │   ├── lib/
│       │   │   ├── errors.ts               # Error helpers
│       │   │   ├── ip.ts                   # Client IP helper
│       │   │   ├── logger.ts               # Logger
│       │   │   └── sentry.ts               # Sentry init
│       │   └── test/
│       │       ├── setup.ts                # Test setup (Better Auth mocks)
│       │       ├── db.ts                   # Test DB helpers
│       │       └── mocks/
│       │           └── r2.ts               # R2 mock
│       ├── vitest.config.ts
│       ├── biome.json
│       ├── tsconfig.json
│       ├── turbo.json
│       └── package.json
│
├── packages/
│   ├── db/                                 # @nilam/db — Drizzle schema + migrations
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── client.ts                   # Neon serverless client
│   │   │   ├── schema/
│   │   │   │   ├── index.ts                # Re-export all schemas
│   │   │   │   ├── auth.ts                 # Better Auth tables
│   │   │   │   ├── accounts.ts             # Org plugin extensions
│   │   │   │   ├── groups.ts               # (stub)
│   │   │   │   ├── persons.ts              # (stub)
│   │   │   │   ├── assets.ts               # (stub)
│   │   │   │   ├── ownership.ts            # (stub)
│   │   │   │   ├── units.ts                # (stub)
│   │   │   │   ├── tenants.ts              # (stub)
│   │   │   │   ├── leases.ts               # (stub)
│   │   │   │   ├── charges.ts              # (stub)
│   │   │   │   ├── payments.ts             # (stub)
│   │   │   │   ├── documents.ts            # (stub)
│   │   │   │   ├── notifications.ts        # (stub)
│   │   │   │   └── audit-log.ts            # (stub)
│   │   │   ├── seed.ts                     # Placeholder
│   │   │   ├── reset.ts
│   │   │   ├── cleanup.ts
│   │   │   ├── load-env.ts
│   │   │   ├── testing.ts
│   │   │   └── testing.test.ts
│   │   ├── drizzle/                        # Migrations (empty — generated fresh)
│   │   ├── drizzle.config.ts
│   │   ├── vitest.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── auth/                               # @nilam/auth — Better Auth configuration
│   │   ├── src/
│   │   │   ├── server.ts                   # Better Auth instance (server-only)
│   │   │   └── client.ts                   # Better Auth client (web-safe)
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── validators/                         # @nilam/validators — Shared Zod schemas
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── errors.ts                   # Error codes + types
│   │   │   ├── query-keys.ts              # Domain query key factory
│   │   │   └── schemas/
│   │   │       ├── index.ts
│   │   │       ├── auth.ts                 # (stub)
│   │   │       ├── group.ts                # (stub)
│   │   │       ├── person.ts               # (stub)
│   │   │       ├── asset.ts                # (stub)
│   │   │       ├── unit.ts                 # (stub)
│   │   │       ├── tenant.ts               # (stub)
│   │   │       ├── lease.ts                # (stub)
│   │   │       ├── payment.ts              # (stub)
│   │   │       └── document.ts             # (stub)
│   │   ├── vitest.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── shared/                             # @nilam/shared — Types, constants, utilities
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── storage.ts                  # S3-compatible storage abstraction
│   │   │   ├── types/index.ts
│   │   │   ├── constants/index.ts
│   │   │   └── utils/index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── ui/                                 # @nilam/ui — Shared UI library (shadcn/ui)
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── components/                 # shadcn component files
│   │   │   ├── lib/
│   │   │   │   └── utils.ts                # cn() helper
│   │   │   └── globals.css                 # Design tokens + Tailwind theme
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── typescript-config/                  # @nilam/typescript-config
│       ├── base.json
│       ├── nextjs.json
│       ├── react-native.json               # Keep for future; no harm
│       └── package.json
│
├── docs/
│   ├── architecture.md                     # Nilam architecture (existing)
│   ├── product-plan.md                     # Nilam product plan (existing)
│   ├── design-system.md                    # Existing
│   ├── high-level-implementation-plan.md   # Existing
│   └── starter-to-nilam-conversion-plan.md # This file
│
├── .github/
│   └── copilot-instructions.md             # Updated for Nilam
│
├── biome.json
├── package.json                            # name: nilam
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── turbo.json
├── vitest.shared.ts
├── vitest.workspace.ts
├── .env.example
└── README.md                               # Nilam overview
```

---

## 8. Dependency Changes

### 8.1 Packages to REMOVE

| Package | Location | Reason |
|---|---|---|
| `@clerk/nextjs` | `apps/web` | Replaced by Better Auth client |
| `@clerk/backend` | `packages/auth` | Replaced by Better Auth |
| `@hono/clerk-auth` | `apps/api` | Replaced by Better Auth middleware |
| `@upstash/ratelimit` | `apps/api` | Replaced by Hono built-in |
| `@upstash/redis` | `apps/api` | No longer needed |

### 8.2 Packages to ADD

| Package | Location | Purpose |
|---|---|---|
| `better-auth` | `packages/auth`, `apps/api` | Auth framework with org plugin |
| `resend` | `apps/api` | Transactional email delivery (injected into auth callbacks) |
| `inngest` | `apps/api` | Background job scheduler adapter |
| `@sentry/node` | `apps/api` | Error monitoring (API) |
| `@sentry/nextjs` | `apps/web` | Error monitoring (web) |
| `clsx` | `packages/ui` | Class name utility for `cn()` helper |
| `tailwind-merge` | `packages/ui` | Tailwind class merging for `cn()` helper |
| `class-variance-authority` | `packages/ui` | Component variant management for shadcn |
| `@aws-sdk/client-s3` | `packages/shared` (moved from api) | S3-compatible client for R2 |
| `@aws-sdk/s3-request-presigner` | `packages/shared` (moved from api) | Presigned URL generation |

### 8.3 Packages to ADD Later (Product Implementation Phases)

These are NOT part of this conversion. They will be added as features are implemented:

| Package | Phase | Purpose |
|---|---|---|
| `@tanstack/react-table` | Phase 2 (Assets) | Data tables |
| `date-fns` | Phase 1 | Date formatting |
| `nuqs` | Phase 2 | URL search params |
| `react-dropzone` | Phase 2 (Documents) | File upload UX |
| `recharts` | Phase 5 (Dashboard) | Charts |
| `@react-pdf/renderer` | Phase 4 (Receipts) | PDF generation |
| `cmdk` | Phase 5 | Command palette |

> **Note**: `lucide-react` should be installed during Phase G/H since it's needed for sidebar navigation icons and notification bell placeholder in the base template. Move from "deferred" to immediate if layout placeholders reference icons.

---

## 9. Verification Checklist

After all phases are complete, run through this checklist:

- [ ] `pnpm install` — all `@nilam/*` workspace packages resolve
- [ ] `pnpm typecheck` — zero type errors across all packages and apps
- [ ] `pnpm lint` — zero lint/format errors (Biome)
- [ ] `pnpm build` — both `apps/web` and `apps/api` build successfully
- [ ] `pnpm dev` — starts web (Next.js on :3000) + api (Bun on :4000) in parallel
- [ ] `grep -r "@starter" --include="*.ts" --include="*.tsx" --include="*.json" --include="*.yaml" .` — zero results (scope to source/config, not docs)
- [ ] `grep -ri "clerk" --include="*.ts" --include="*.tsx" --include="*.json" .` — zero results
- [ ] `grep -ri "upstash" --include="*.ts" --include="*.tsx" --include="*.json" .` — zero results
- [ ] `grep -ri "CLOUDFLARE_ACCOUNT_ID\|CLOUDFLARE_ACCESS_KEY\|R2_BUCKET_NAME" --include="*.ts" --include="*.json" .` — zero results (old storage vars)
- [ ] `apps/mobile/` directory does not exist
- [ ] `GET http://localhost:4000/api/health` returns 200
- [ ] `GET http://localhost:3000` loads with terracotta theme
- [ ] Auth pages (`/login`, `/signup`) render without errors
- [ ] No leftover starter domain references (projects, uploads) in source code
- [ ] Cross-origin cookie works: login at :3000 sends session cookie to :4000

---

## 10. Scope Boundaries

### Included in This Conversion

- All structural changes to convert starter → Nilam base template
- Auth provider swap (Clerk → Better Auth) with basic configuration
- Package restructure to match architecture doc
- Stub files for domain schemas, validators, routes, services (ready for Phase 0-1)
- Design system token configuration (CSS custom properties, fonts)
- Environment variable transition
- Basic Inngest, Sentry, Resend scaffolds (installed + configured, not fully wired)

### Excluded — Deferred to Product Implementation Phases

| Item | Deferred To |
|---|---|
| Actual domain schema implementation (DB table definitions) | Phase 0 |
| Better Auth full configuration (org plugin role enforcement) | Phase 0-1 |
| Domain route handler implementation | Phase 1+ |
| Service layer business logic | Phase 1+ |
| Frontend page implementation (dashboard, assets, tenants, etc.) | Phase 1+ |
| Seed data population | Phase 0-1 |
| CI/CD pipeline (GitHub Actions) | Phase 0 |
| Deployment setup (Railway, Vercel, Neon, R2, Inngest accounts) | Phase 0 |
| Inngest cron job handler implementation | Phase 4-5 |
| Sentry full integration (sourcemaps, performance monitoring) | Phase 0 |
| Resend email templates | Phase 1 |

---

## 11. Phase Dependencies

```
Phase A (Cleanup & Rename)
    │
    ├──▶ Phase B (Restructure Packages)
    │       │
    │       ├──▶ Phase E (Reset Domain Layer)
    │       │       │
    │       │       └──▶ Phase G (Configure Web App)
    │       │
    │       ├──▶ Phase D (Replace Rate Limiting) ← depends on B, NOT C
    │       │
    │       └──▶ Phase F (Add Background Jobs)
    │
    └──▶ Phase C (Replace Auth) ← depends on A + B1 (API must be in apps/api/) + E5/E6 (auth schema stubs)
            │
            └──▶ Phase G (Configure Web App)

Phase H (Design System) ──── should run BEFORE or early-parallel with Phase G
                              (G's layouts/pages need design tokens from H)
Phase I (Config Cleanup) ──── final phase, after all others
```

> **Corrected dependencies vs v1.0**: (1) Phase D now depends on B only (rate limiting is independent of auth). (2) Phase C now explicitly depends on B1 and E5/E6 (auth references `apps/api` paths and needs auth schema stubs). (3) Phase H should start before or alongside G since layouts need tokens.

---

## 12. Open Questions & Recommendations (Resolved)

| # | Question | Resolution |
|---|---|---|
| 1 | Keep `packages/typescript-config/react-native.json`? | **Keep it** — no harm, useful if mobile is added in V2. |
| 2 | Keep `apps/web/playwright.config.ts` and `e2e/` directory? | **Keep as placeholder** — clear test files but keep config. V1 uses unit/integration tests per architecture doc. |
| 3 | Keep `apps/web/vercel.json`? | **Keep file** but remove cron entry. Vercel config may be needed for other settings. |
| 4 | Should `packages/api/src/routes/me.ts` be kept? | **Resolved**: Delete it. Better Auth provides a session endpoint at `/api/auth/session` that returns current user + session data. Add a `/api/v1/me` route stub that returns user + account context for the authenticated shell. |
| 5 | Keep `packages/api/src/lib/storage.ts` in api or move to shared? | **Resolved**: Move to `packages/shared/src/storage.ts`. AWS SDK dependencies move with it. |
| 6 | Should `apps/api` have its own `biome.json`? | **Resolved**: Yes — copy/adapt from `packages/api/biome.json` during the B1 move. |

---

*Document version: 2.0 — 6 April 2026 (post multi-model review)*

---

## 13. Review Changelog (v1.0 → v2.0)

This section documents all issues found during the multi-model review (GPT 5.4 + Claude Opus 4.6) and how they were resolved.

### Critical Issues Fixed

| # | Issue | Resolution |
|---|---|---|
| 1 | **API entrypoint `index.ts` vs `app.ts`** — Architecture doc consistently uses `app.ts`; plan used `index.ts` | Changed to `app.ts` everywhere (B1, E25, target structure) |
| 2 | **R2/Storage env vars falsely listed as "Keep"** — Starter uses `CLOUDFLARE_*`/`R2_*`, not `S3_*` | Moved old vars to Remove list, added `S3_*` to Add list, added storage.ts update task |
| 3 | **Cross-origin cookie configuration missing** — Separate origins break `sameSite=lax` cookies | Added C11 task for cookie/CORS config with dev vs prod strategy |
| 4 | **CI/CD workflow not mentioned** — `.github/workflows/ci.yml` has Clerk env vars | Added A9 task to update CI workflow |
| 5 | **Bun runtime has no setup tasks** — No dev script, no turbo integration | Added dev script to B1, added B10 for turbo.json dev task |
| 6 | **C8/C11 conflict** — Creating and rewriting same file | Merged into single C8 (session + role auth); removed old C11 |
| 7 | **`packages/shared` missing AWS SDK deps** — Storage.ts depends on @aws-sdk packages | Added to B5 task |
| 8 | **Hono RPC type-sharing not addressed** — Web app needs API route types | Added B9 task for workspace dependencies + G8 clarification |
| 9 | **Phase ordering broken** — C references `apps/api/` before B1 creates it; D wrongly depends on C | Fixed dependency graph: D→B, C→A+B1+E5/E6 |

### Important Issues Fixed

| # | Issue | Resolution |
|---|---|---|
| 10 | **Design system Phase H severely underspecified** (4 tasks for 95KB spec) | Expanded to 10 tasks covering all token types |
| 11 | **Wrong color source** — H1 referenced architecture doc §8 (outdated) | Changed to design-system.md §2 + §13 |
| 12 | **Missing file deletions** — `public.ts`, `ratelimit.test.ts`, `health.spec.ts`, dashboard, sign-in/sign-up catch-alls | Added to Phase E, Phase D, Section 5.1 |
| 13 | **Missing env var removals** — `CORS_ALLOWED_ORIGINS`, `NEXT_PUBLIC_APP_URL`, `CLOUDFLARE_*`, `R2_*`, `EXPO_PUBLIC_*`, `CLERK_AUTHORIZED_PARTIES` | Added to Remove list |
| 14 | **Missing accept-invitation page** — Architecture doc §6 defines invite flow | Added to G3 and Section 5.3 |
| 15 | **Resend installed in wrong package** — `packages/auth` can't import from `apps/api` | Changed to injection pattern: auth defines interfaces, API provides Resend implementations |
| 16 | **Missing workspace dependency declarations** — New packages not wired up | Added B9 task |
| 17 | **Dual `globals.css` ownership unclear** | Clarified: `packages/ui` owns tokens, `apps/web` imports via `@import` |
| 18 | **Tailwind v4 cross-package setup missing** | Added B8 task for `@source` directive |
| 19 | **Missing `components.json` for shadcn** | Added to B6 |
| 20 | **Missing clsx/tailwind-merge/cva deps** for `packages/ui` | Added to B6 |
| 21 | **Missing root page redirect** — Deleting `(public)` leaves no `/` route | Added redirect to G2 |
| 22 | **Missing dashboard placeholder** — Post-login navigation needs a landing | Changed G4 to keep placeholder |
| 23 | **Phase H should precede G** — Layouts need design tokens | Updated dependency note |
| 24 | **`packages/auth` needs `@nilam/db` dependency** | Added to C5 |
| 25 | **Missing .env split per app** | Added I1b task |
| 26 | **Missing `SENTRY_DSN` in turbo.json** | Added to I2 |
| 27 | **`pnpm-workspace.yaml` config** — A8 wrongly pointed to package.json | Fixed to reference pnpm-workspace.yaml |
| 28 | **Rate-limit filename** — `ratelimit.ts` vs architecture doc's `rate-limit.ts` | Changed to `rate-limit.ts` |
| 29 | **Missing shared job handler pattern** | Updated F3 to emphasize service-layer handlers |
| 30 | **`lucide-react` deferred but needed for layout placeholders** | Added note to install during G/H if layout references icons |

### Minor Issues Fixed

| # | Issue | Resolution |
|---|---|---|
| 31 | Missing `pagination.ts` schema retention | Added E26 |
| 32 | Missing `QUERY_DEFAULTS` preservation | Added E27 |
| 33 | Missing `request.ts` test helper consideration | Added E23b |
| 34 | Missing `biome.json` copy for API | Added to B1 |
| 35 | Missing svix dependency check | Added to E17 |
| 36 | Missing `db:cleanup` script review | Added to A6 scope |
| 37 | Missing `ALLOW_DB_RESET`, `TEST_DATABASE_URL`, `TURBO_TOKEN`/`TURBO_TEAM` env vars | Added to Keep list |
| 38 | Font loading strategy unspecified | Decided: `next/font/google` |
| 39 | Verification grep too broad (matches docs) | Scoped to source/config files |
| 40 | Architecture doc path discrepancy (`apps/web/lib/` vs `apps/web/src/lib/`) | Noted for future arch doc update |

### Known Discrepancies Between Docs (to fix later)

These are inconsistencies in the *architecture doc* (not the conversion plan) that should be corrected:

1. Architecture doc uses `apps/web/app/` paths without `src/` prefix — actual starter uses `apps/web/src/app/`
2. Architecture doc says `sameSite=lax` for cookies — incorrect for cross-origin production setup
3. Architecture doc migration folder is `migrations/` — Drizzle convention is `drizzle/`
4. Architecture doc color values (§8) are simplified — design-system.md has the WCAG-corrected canonical values
