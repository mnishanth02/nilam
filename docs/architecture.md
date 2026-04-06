# PropertyVault — V1 Architecture & Tech Stack

> Architecture document for PropertyVault, a personal and family property asset management tool.
> Covers tech stack decisions, system architecture, data model, deployment, and design system.

*Finalized: 6 April 2026*

This file is the single source of truth for technical stack, deployment architecture, and implementation decisions. Product scope, module boundaries, and delivery milestones live in `docs/product-plan.md`.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [Monorepo Structure](#3-monorepo-structure)
4. [Backend Architecture](#4-backend-architecture)
5. [Database Schema](#5-database-schema)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Frontend Architecture](#7-frontend-architecture)
8. [Design System](#8-design-system)
9. [File Storage](#9-file-storage)
10. [Background Jobs](#10-background-jobs)
11. [Deployment Architecture](#11-deployment-architecture)
12. [Environment Variables](#12-environment-variables)
13. [Cross-cutting Concerns](#13-cross-cutting-concerns)
14. [Implementation Plan](#14-implementation-plan)
15. [Decisions Log](#15-decisions-log)
16. [Open Considerations](#16-open-considerations)

---

## 1. Architecture Overview

PropertyVault follows a **separated frontend-backend** architecture designed for portability, type safety, and low-cost development. V1 delivery is intentionally cloud-first; later self-host packaging should reuse the same domain model, storage abstraction, and job runner boundaries.

```
┌──────────────────────────────────────────────────────────────────────┐
│                          Client (Browser)                            │
│                                                                      │
│  Next.js 16 (App Router) ──── Hono RPC (hc) ──── TanStack Query    │
│  Tailwind CSS v4 + shadcn/ui                                        │
│  Deployed on: Vercel                                                 │
└──────────────────────┬───────────────────────────────────────────────┘
                       │ HTTPS (type-safe via Hono RPC)
                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        API Server (Hono + Bun)                       │
│                                                                      │
│  Middleware: CORS → Request ID → Rate Limit → Auth → Tenant → Audit │
│  Routes → Zod Validators → Services → Drizzle ORM → PostgreSQL     │
│  Serves scheduler adapters at /api/inngest                           │
│  Deployed on: Railway                                                │
└───────┬─────────────────────┬────────────────────┬───────────────────┘
        │                     │                    │
        ▼                     ▼                    ▼
┌──────────────┐  ┌────────────────────┐  ┌────────────────────┐
│  Neon        │  │  Cloudflare R2     │  │  Inngest Adapter   │
│  PostgreSQL  │  │  (S3-compatible)   │  │  Shared Job Runner │
│  (Drizzle)   │  │  Presigned URLs    │  │  Cron triggers     │
└──────────────┘  └────────────────────┘  └────────────────────┘
```

### Key Architectural Principles

- **Account-scoped isolation**: All data belongs to exactly one account (organization). Every query filters by `accountId`. A direct sign-up creates one account, invited users join that account, and users cannot belong to multiple accounts in V1.
- **Two-role model**: Admin (full access) and Viewer (read only). No group-level permissions.
- **Type safety end-to-end**: Zod schemas shared between API and frontend. Hono RPC provides zero-overhead type inference.
- **Append-only ledger**: Rental operations use an immutable ledger — monthly charges once generated are never recomputed.
- **Portable backend**: Hono on Bun is platform-agnostic. Can move between Railway, Fly.io, Render, or Azure without code changes.
- **Scheduler abstraction**: Recurring jobs are modeled as internal application handlers. Inngest is the cloud scheduler adapter, not the business-logic boundary.
- **Direct file uploads**: Files go directly from browser to R2 via presigned URLs. The API never proxies file bytes.

---

## 2. Tech Stack

### Core Stack

| Layer | Technology | Purpose |
|---|---|---|
| Monorepo | Turborepo + pnpm workspaces | Package management, build orchestration, shared code |
| Frontend | Next.js 16 (App Router) | SSR, routing, React Server Components, Turbopack (default bundler) |
| Backend API | Hono | HTTP framework, middleware, type-safe RPC |
| Runtime | Bun | API server runtime (local + production) |
| Database | PostgreSQL (Neon) | Relational data, full-text search, audit log |
| ORM | Drizzle ORM | Type-safe SQL, migrations, schema management |
| Auth | Better Auth | Email/password, sessions, organization plugin for account/roles, invite flow |
| Email | Resend | Transactional email (password reset, invite links) — not product notifications |
| Validation | Zod | Shared schema validation (API + forms) |
| Job runner | Shared internal handlers + Inngest adapter | Keep recurring business logic independent from scheduler choice |

### Toolchain Requirements

Next.js 16 requires **Node.js ≥ 20.9** and **TypeScript ≥ 5.1**. These minimums apply to local dev, CI runners, and Vercel builds. Bun (used for the API runtime) ships its own TypeScript transpiler and is not affected.

### Frontend Libraries

| Library | Version | Purpose |
|---|---|---|
| `@tanstack/react-query` | v5 | Server state management, caching, mutations |
| `@tanstack/react-table` | v8 | Data tables for assets, tenants, payments |
| `react-hook-form` | v7 | Form state management |
| `@hookform/resolvers` | — | Zod integration for react-hook-form |
| `hono/client` | — | Type-safe API client (Hono RPC) |
| `tailwindcss` | v4 | Utility-first CSS framework |
| `shadcn/ui` | — | Accessible UI component library |
| `sonner` | — | Toast notifications |
| `lucide-react` | — | Icon library (consistent, tree-shakeable) |
| `date-fns` | — | Date formatting and manipulation |
| `nuqs` | — | URL search parameter state management |
| `react-dropzone` | — | File upload drag-and-drop UX |
| `recharts` | — | Dashboard charts and visualizations |
| `@react-pdf/renderer` | — | PDF receipt and report generation |
| `cmdk` | — | Command palette for quick navigation |

### Backend Libraries

| Library | Purpose |
|---|---|
| `hono` | API framework with built-in middleware |
| `drizzle-orm` + `drizzle-kit` | ORM and migration tooling |
| `@neondatabase/serverless` | Neon PostgreSQL serverless driver with connection pooling |
| `better-auth` | Authentication framework with Drizzle adapter |
| `resend` | Transactional email delivery (password reset, invite links) |
| `zod` | Input validation on all API endpoints |
| `inngest` | Cloud scheduler adapter for recurring jobs |
| `@aws-sdk/client-s3` | S3-compatible client for Cloudflare R2 and future MinIO/S3 compatibility |
| `@aws-sdk/s3-request-presigner` | Presigned URL generation for direct uploads |

### Hosting & Infrastructure

| Service | Platform | Free Tier | Monthly Dev Cost |
|---|---|---|---|
| Frontend | Vercel | Hobby (free) | $0 |
| API | Railway | $5 credit/month | $0 |
| Background jobs | Inngest | 50,000 executions/month | $0 |
| Database | Neon | 0.5 GB storage, 1 project, branching | $0 |
| File storage | Cloudflare R2 | 10 GB storage, 10M reads/month, zero egress | $0 |
| Email | Resend | 3,000 emails/month, 100/day | $0 |
| Error monitoring | Sentry | 5,000 errors/month | $0 |
| **Total** | | | **$0/month** |

---

## 3. Monorepo Structure

```
nilam/
├── apps/
│   ├── web/                              # Next.js 16 → Vercel
│   │   ├── app/
│   │   │   ├── (auth)/                   # Public auth pages
│   │   │   │   ├── login/
│   │   │   │   ├── signup/
│   │   │   │   ├── forgot-password/
│   │   │   │   └── reset-password/
│   │   │   └── (app)/                    # Authenticated app shell
│   │   │       ├── dashboard/
│   │   │       ├── groups/
│   │   │       ├── persons/
│   │   │       ├── assets/
│   │   │       ├── tenants/
│   │   │       ├── leases/
│   │   │       ├── payments/
│   │   │       ├── documents/
│   │   │       ├── notifications/
│   │   │       ├── settings/
│   │   │       └── audit-log/
│   │   ├── components/                   # App-specific components
│   │   ├── lib/
│   │   │   ├── api.ts                    # Hono RPC client (hc) setup
│   │   │   └── hooks/                    # TanStack Query hooks per domain
│   │   ├── next.config.ts
│   │   └── tailwind.config.ts
│   │
│   └── api/                              # Hono → Railway (Bun runtime)
│       ├── src/
│       │   ├── app.ts                    # Hono app entrypoint
│       │   ├── routes/                   # Route modules per domain
│       │   │   ├── auth.ts
│       │   │   ├── groups.ts
│       │   │   ├── persons.ts
│       │   │   ├── assets.ts
│       │   │   ├── units.ts
│       │   │   ├── tenants.ts
│       │   │   ├── leases.ts
│       │   │   ├── payments.ts
│       │   │   ├── documents.ts
│       │   │   ├── notifications.ts
│       │   │   ├── dashboard.ts
│       │   │   ├── audit-log.ts
│       │   │   ├── exports.ts
│       │   │   └── settings.ts
│       │   ├── middleware/
│       │   │   ├── auth.ts               # Better Auth session resolution
│       │   │   ├── tenant.ts             # Account context injection + isolation
│       │   │   ├── audit.ts              # Post-response audit logging
│       │   │   └── rate-limit.ts         # Rate limiting
│       │   ├── services/                 # Business logic per domain
│       │   │   ├── group.service.ts
│       │   │   ├── person.service.ts
│       │   │   ├── asset.service.ts
│       │   │   ├── ownership.service.ts
│       │   │   ├── unit.service.ts
│       │   │   ├── tenant.service.ts
│       │   │   ├── lease.service.ts
│       │   │   ├── charge.service.ts
│       │   │   ├── payment.service.ts
│       │   │   ├── document.service.ts
│       │   │   ├── notification.service.ts
│       │   │   └── export.service.ts
│       │   └── inngest/
│       │       ├── client.ts             # Inngest client instance
│       │       └── functions.ts          # Cron job definitions
│       └── package.json
│
├── packages/
│   ├── db/                               # Drizzle schema + migrations
│   │   ├── schema/
│   │   │   ├── auth.ts                   # Better Auth tables
│   │   │   ├── accounts.ts              # Better Auth org plugin schema extensions
│   │   │   ├── groups.ts                # groups, person_groups
│   │   │   ├── persons.ts               # persons, person_groups
│   │   │   ├── assets.ts                # assets, asset_tags, land/rental details
│   │   │   ├── ownership.ts             # ownership_stakes, transfers
│   │   │   ├── units.ts
│   │   │   ├── tenants.ts
│   │   │   ├── leases.ts                # leases, rent_components
│   │   │   ├── charges.ts               # monthly_charges, charge_lines
│   │   │   ├── payments.ts              # payments, allocations
│   │   │   ├── documents.ts
│   │   │   ├── notifications.ts
│   │   │   └── audit-log.ts
│   │   ├── migrations/                   # Generated SQL migrations
│   │   ├── client.ts                     # Drizzle client factory (Neon serverless driver)
│   │   ├── seed.ts                       # Development seed data
│   │   └── index.ts                      # Re-exports schema + client
│   │
│   ├── auth/                             # Better Auth configuration
│   │   ├── server.ts                     # Auth instance (used by API)
│   │   └── client.ts                     # Auth client (used by web)
│   │
│   ├── ui/                               # Shared UI library (shadcn/ui)
│   │   ├── components/                   # shadcn component files
│   │   ├── lib/
│   │   │   └── utils.ts                  # cn() helper, shared utilities
│   │   └── globals.css                   # Design tokens, Tailwind theme
│   │
│   ├── validators/                       # Shared Zod schemas
│   │   ├── auth.ts
│   │   ├── group.ts
│   │   ├── person.ts
│   │   ├── asset.ts
│   │   ├── unit.ts
│   │   ├── tenant.ts
│   │   ├── lease.ts
│   │   ├── payment.ts
│   │   ├── document.ts
│   │   └── index.ts
│   │
│   └── shared/                           # Types, constants, utilities
│       ├── types/                        # Shared TypeScript types
│       ├── constants/                    # Enums, config values
│       ├── storage.ts                    # S3-compatible storage abstraction (R2)
│       └── utils/                        # Pure utility functions
│
├── pnpm-workspace.yaml
├── turbo.json
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

### Workspace Configuration

**`pnpm-workspace.yaml`**:
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

**`turbo.json`** pipeline:
- `build` — builds all packages and apps in dependency order
- `dev` — starts web (Next.js dev) + api (Bun with watch mode) in parallel
- `db:generate` — generates Drizzle migrations
- `db:migrate` — applies migrations to the database
- `lint` — runs linting across the workspace
- `typecheck` — runs TypeScript type checking

---

## 4. Backend Architecture

### Hono API Server

The API is a standalone Hono application running on Bun. It is deployed to Railway as an always-on service.

**Entrypoint** (`apps/api/src/app.ts`):
```
Hono App
  ├── Middleware stack (applied globally)
  ├── Better Auth routes (/api/auth/*)
  ├── Inngest serve endpoint (/api/inngest)
  └── API v1 routes (/api/v1/*)
```

### API Route Map

All application routes are prefixed with `/api/v1/`. Auth routes are managed by Better Auth at `/api/auth/*`.

```
POST/GET  /api/auth/*                     # Better Auth (login, signup, session, etc.)
POST      /api/inngest                    # Inngest webhook endpoint

GET       /api/v1/dashboard               # Dashboard aggregates

CRUD      /api/v1/groups                  # Group management
CRUD      /api/v1/persons                 # Person registry
CRUD      /api/v1/assets                  # Asset registry
GET/POST  /api/v1/assets/:id/ownership    # Ownership history + transfer
CRUD      /api/v1/assets/:id/units        # Unit management

CRUD      /api/v1/tenants                 # Tenant management

CRUD      /api/v1/leases                  # Lease management
POST      /api/v1/leases/:id/activate     # Activate lease (generates charges)
POST      /api/v1/leases/:id/terminate    # Terminate lease
POST      /api/v1/leases/:id/renew        # Renew (creates linked lease)
GET       /api/v1/leases/:id/charges      # Monthly charges (read-only once generated)

CRUD      /api/v1/payments                # Payment entry
POST      /api/v1/payments/bulk           # Bulk payment entry
GET       /api/v1/payments/:id/receipt    # PDF receipt generation

CRUD      /api/v1/documents               # Document vault
POST      /api/v1/documents/presign       # Presigned upload URL
GET       /api/v1/documents/:id/url       # Presigned download URL

GET       /api/v1/notifications           # Notification center
POST      /api/v1/notifications/:id/read  # Mark notification as read

GET       /api/v1/audit-log               # Audit log viewer
GET       /api/v1/exports/:type           # CSV/PDF exports

POST      /api/v1/settings/invite         # Invite user to account (sends email via Resend)
CRUD      /api/v1/settings/users          # User management (Admin/Viewer roles)
DELETE    /api/v1/settings/account         # Account deletion (danger zone)
```

### Middleware Stack

Middleware is applied in order. Each layer adds context or guards the request.

```
Request
  │
  ├── 1. CORS                      Allow configured web origin
  ├── 2. Request ID                 Generate X-Request-Id header
  ├── 3. Rate Limiting              Auth: 10/min, General: 100/min
  ├── 4. Better Auth Session        Resolve session from cookie → userId
  ├── 5. Account Context            Inject accountId from the user's single account membership into context
  ├── 6. Role Authorization         Check account-level role (Admin / Viewer) per route
  └── 7. Audit Logging              Post-response hook writes to audit_log (with fallback to async queue on write failure)
  │
  ▼
Route Handler → Zod Validation → Service → Drizzle Query → Response
```

### Service Layer Pattern

Routes are thin handlers. Business logic lives in service functions.

```
Route (parse input)
  → Zod validator (validate input)
    → Service function (business logic)
      → Drizzle query (database operations)
        → Response (serialize output)
```

Services contain:
- Ownership percentage validation (must sum to 100%)
- Lease invariant checks (no overlapping active leases per unit)
- Monthly charge generation (snapshot from lease terms)
- Payment allocation (oldest unpaid charge first)
- Encryption/decryption of sensitive fields (Aadhaar, PAN)

---

## 5. Database Schema

### Overview

The database is PostgreSQL hosted on Neon with serverless connection pooling. Drizzle ORM manages the schema and migrations. The `@neondatabase/serverless` driver is used for connections.

### Better Auth Managed Tables

These tables are created and managed by Better Auth's Drizzle adapter:

| Table | Purpose |
|---|---|
| `users` | id, email, name, image, emailVerified, createdAt, updatedAt |
| `sessions` | id, userId, token, expiresAt, ipAddress, userAgent |
| `accounts` | id, userId, provider, providerAccountId (auth provider accounts) |
| `verifications` | id, identifier, value, expiresAt (email verification tokens) |

### Application Tables

All application tables include `accountId` for tenant isolation.

#### Account & Access Control

Better Auth's organization plugin manages the account and membership tables. The plugin creates `organization`, `member`, and `invitation` tables automatically. These map to the product's Account concept:

| Better Auth Table | Maps To | Key Columns | Notes |
|---|---|---|---|
| `organization` | Account | id, name, slug, logo, timezone, deletedAt, createdAt | The tenant boundary. `timezone` and `deletedAt` are first-class schema fields added via customization. |
| `member` | Account Member | id, organizationId, userId, role, createdAt | `role`: ADMIN / VIEWER. Creator is ADMIN by default. |
| `invitation` | Invite | id, organizationId, email, role, status, inviterId, expiresAt | Pending invites. Email sent via Resend. |

Application tables that extend beyond Better Auth:

| Table | Key Columns | Notes |
|---|---|---|
| `groups` | id, accountId, name, description, createdAt, deletedAt | Optional family/org containers. Data organization only — no permission scoping. |

#### Person Registry

| Table | Key Columns | Notes |
|---|---|---|
| `persons` | id, accountId, name, phone, email, aadhaarEncrypted, panEncrypted, personType, relationshipTag, notes, createdAt, deletedAt | Non-login business records |
| `person_groups` | id, personId, groupId | Many-to-many link |

#### Asset Registry

| Table | Key Columns | Notes |
|---|---|---|
| `assets` | id, accountId, groupId (nullable), name, assetType, street, city, district, state, pincode, purchasePrice, purchaseDate, estimatedValue, valueUpdatedAt, status, notes, createdAt, deletedAt | Base asset entity. `assetType`: LAND or RENTAL_PROPERTY. `status`: ACTIVE / SOLD / DISPUTED |
| `asset_tags` | id, assetId, tag | User-defined tags for filtering |
| `land_details` | id, assetId (1:1), surveyNumber, pattaNumber, chittaRef, landArea, landAreaUnit, landType, taluk, village, ecStatus, ecExpiryDate, propertyTaxAccountNumber, propertyTaxLastPaidDate, propertyTaxDueDate, boundaryNotes | Tamil Nadu land record fields |
| `rental_property_details` | id, assetId (1:1), propertySubtype, numberOfUnits, builtUpArea, amenities | Rental-specific fields. `propertySubtype`: Residential / Apartment / Shop / Office / Warehouse |

#### Ownership

| Table | Key Columns | Notes |
|---|---|---|
| `ownership_stakes` | id, assetId, personId, percentage (decimal), isActive, effectiveFrom, effectiveTo, createdAt | Active stakes must sum to 100% |
| `ownership_transfers` | id, assetId, reason, effectiveDate, notes, documentId (nullable), createdAt | Transfer event record |
| `ownership_transfer_lines` | id, transferId, personId, previousPercentage, newPercentage | Per-person change in a transfer |

#### Rental Operations

| Table | Key Columns | Notes |
|---|---|---|
| `units` | id, assetId, name, floor, areaSqFt, unitType, maintenanceOverride, createdAt, deletedAt | `unitType`: residential / commercial |
| `tenants` | id, accountId, name, phone, email, emergencyContact, idProofType, idProofNumber, occupation, photoUrl, status, createdAt, deletedAt | `status`: ACTIVE / PAST / BLACKLISTED |
| `leases` | id, unitId, tenantId, status, startDate, endDate, rentDueDay, annualEscalationPercent, securityDepositAmount, securityDepositReceivedDate, securityDepositStatus, rentAdvanceAmount, previousLeaseId, createdAt, deletedAt | `status`: DRAFT / ACTIVE / EXPIRED / TERMINATED. `previousLeaseId` forms renewal chain |
| `lease_rent_components` | id, leaseId, label, amount, isRecurring | e.g., "Base Rent", "Maintenance", "Parking" |
| `lease_move_in_checklists` | id, leaseId, leaseSigned, depositReceived, keysHandedOver, electricityMeterReading, waterMeterReading, notes, completedAt | Structured move-in capture. One checklist per lease. |
| `lease_move_out_checklists` | id, leaseId, noticeDate, inspectionNotes, pendingDuesAmount, refundAmount, keysReturned, completedAt | Structured move-out capture. One checklist per lease. |
| `deposit_deduction_lines` | id, moveOutChecklistId, label, amount, notes | Deposit settlement line items recorded during move-out. |
| `monthly_charges` | id, leaseId, unitId, month (YYYY-MM), totalExpected, totalPaid, status, generatedAt | Immutable once generated. `status`: PENDING / PARTIAL / PAID / OVERDUE |
| `monthly_charge_lines` | id, monthlyChargeId, label, amount | Snapshot of rent components for that month |
| `payments` | id, accountId, leaseId, tenantId, amount, paymentDate, paymentMode, reference, notes, createdAt | Payment event |
| `payment_allocations` | id, paymentId, monthlyChargeId, amount | How a payment is distributed across charges |
| `rent_advance_applications` | id, leaseId, monthlyChargeId, amount, appliedAt | Tracks how the lease's stored rent advance is consumed over time |

#### Documents, Notifications, Audit

| Table | Key Columns | Notes |
|---|---|---|
| `documents` | id, accountId, entityType, entityId, name, typeTag, s3Key, mimeType, sizeBytes, expiryDate, notes, uploadedBy, createdAt, deletedAt | Polymorphic: attaches to group, person, asset, tenant, or lease |
| `notifications` | id, accountId, type, title, message, entityType, entityId, dedupeKey, createdAt | Account-scoped notification event |
| `notification_recipients` | id, notificationId, userId, isRead, readAt, dismissedAt | Per-user read and dismiss state for notification center UX |
| `audit_log` | id, accountId, userId, action, entityType, entityId, summary (jsonb), createdAt | Append-only, immutable |

### Key Indexes

| Table | Index | Purpose |
|---|---|---|
| All tables | `accountId` | Tenant isolation — every query filters by this |
| `assets` | `(accountId, assetType, status)` | Filtered asset listings |
| `assets` | GIN on `(name, street, city)` | Full-text search on asset fields |
| `land_details` | GIN on `(surveyNumber, pattaNumber)` | Full-text search on land record identifiers |
| `ownership_stakes` | `(assetId, isActive)` | Current ownership lookup |
| `leases` | Partial unique index on `(unitId)` where status = `ACTIVE` and `deletedAt` is null | Enforces one active lease per unit |
| `leases` | `(tenantId)` | Tenant's leases |
| `lease_move_in_checklists` | Unique `(leaseId)` | One move-in checklist per lease |
| `lease_move_out_checklists` | Unique `(leaseId)` | One move-out checklist per lease |
| `deposit_deduction_lines` | `(moveOutChecklistId)` | Deposit settlement lookup |
| `monthly_charges` | `(leaseId, month)` | Charge lookup by period |
| `monthly_charges` | Unique `(leaseId, month)` | Idempotency — prevents duplicate charges for the same lease and month |
| `monthly_charges` | `(status)` | Overdue charge queries |
| `payments` | `(leaseId)` | Payment history per lease |
| `payments` | `(tenantId, paymentDate)` | Tenant payment timeline |
| `rent_advance_applications` | `(leaseId, appliedAt)` | Advance usage history |
| `documents` | `(entityType, entityId)` | Documents for any entity |
| `notifications` | `(accountId, createdAt DESC)` | Account notification feed |
| `notification_recipients` | `(userId, isRead, dismissedAt)` | User unread count and inbox queries |
| `audit_log` | `(accountId, entityType, entityId)` | Per-entity audit trail |
| `audit_log` | `(accountId, createdAt DESC)` | Global activity feed |

### Encryption

Aadhaar and PAN fields are encrypted at the application layer using **AES-256-GCM**. The encryption master key is provided via the `ENCRYPTION_SECRET` environment variable.

- Stored as encrypted blobs in `aadhaarEncrypted` / `panEncrypted` columns
- Decrypted only on authorized read requests
- Masked in normal UI views (only last 4 digits shown)
- Decrypt operations are audited

---

## 6. Authentication & Authorization

### Better Auth Setup

Better Auth runs inside the Hono API server with the Drizzle adapter for database-backed sessions. The **organization plugin** is used for account management, roles, and invites, with application-level enforcement that each user belongs to only one account in V1.

**Features used:**
- Email + password authentication (credentials provider)
- Database-backed session management
- Organization plugin → each organization is an Account (the tenant boundary), with single-account membership enforced in app logic
- Custom roles: Admin and Viewer (via `createAccessControl`)
- `sendInvitationEmail` callback → sends invite via Resend
- `sendResetPassword` callback → sends password reset via Resend
- Rate limiting plugin on auth endpoints

**Organization plugin configuration (illustrative snippet — production access control must cover every V1 domain route, not just the examples below):**
```typescript
import { betterAuth } from "better-auth";
import { organization } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const statements = {
  asset: ["create", "read", "update", "delete"],
  member: ["create", "read", "update", "delete"],
} as const;

const ac = createAccessControl(statements);
const adminRole = ac.newRole({
  asset: ["create", "read", "update", "delete"],
  member: ["create", "read", "update", "delete"],
});
const viewerRole = ac.newRole({
  asset: ["read"],
  member: ["read"],
});

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        to: user.email,
        subject: "Reset your password",
        html: `<a href="${url}">Reset password</a>`,
      });
    },
  },
  plugins: [
    organization({
      ac,
      roles: { admin: adminRole, viewer: viewerRole },
      async sendInvitationEmail(data) {
        const inviteLink = `${process.env.BETTER_AUTH_URL}/accept-invitation/${data.id}`;
        await resend.emails.send({
          to: data.email,
          subject: `You're invited to ${data.organization.name}`,
          html: `<a href="${inviteLink}">Accept invitation</a>`,
        });
      },
    }),
  ],
});
```

### Auth Flow

```
1. Sign Up
   User submits email + password
   → Better Auth creates `user` record
   → App creates organization (= account) via org plugin → user becomes ADMIN
   → Session cookie set

2. Login
   User submits credentials
   → Better Auth validates → creates session
   → Session cookie set (httpOnly, secure, sameSite=lax)

3. Authenticated Request
   Browser sends session cookie
   → Hono middleware resolves session → injects userId
   → Org plugin resolves the user's single account membership → injects accountId
   → All queries filter by accountId

4. Invite Flow
   Admin invites user by email
   → Org plugin generates invite → sendInvitationEmail sends via Resend
   → Invitee completes signup into the inviting account
   → Joins account as VIEWER by default
   → Admin can promote to ADMIN

5. Session Management
   Sessions stored in database
   → 30-day sliding window expiry
   → Users can view active sessions and logout others
```

### Role Model

**Account-level roles (two roles only):**

| Role | Permissions |
|---|---|
| **Admin** | Full access — CRUD all entities, manage users, invite members, delete account. The account creator is automatically an Admin. Any Admin can promote a Viewer to Admin. |
| **Viewer** | Read only — view all data, no modifications |

There are no group-level roles in V1. Groups are data-organization containers and do not affect permissions. All account members see all account data regardless of group assignment.

---

## 7. Frontend Architecture

### Next.js App Router Layout

```
app/
├── (auth)/                         # Public layout (centered card)
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── forgot-password/page.tsx
│   └── reset-password/page.tsx
│
├── (app)/                          # Authenticated layout (sidebar + main)
│   ├── layout.tsx                  # Sidebar navigation, top bar, notification bell
│   ├── dashboard/page.tsx
│   ├── groups/
│   │   ├── page.tsx                # Group list
│   │   └── [groupId]/page.tsx      # Group detail + dashboard
│   ├── persons/
│   │   ├── page.tsx                # Person list
│   │   └── [personId]/page.tsx     # Person profile + linked assets
│   ├── assets/
│   │   ├── page.tsx                # Asset list with filters
│   │   ├── new/page.tsx            # Create asset form
│   │   └── [assetId]/
│   │       ├── page.tsx            # Asset detail (tabbed)
│   │       ├── ownership/page.tsx  # Ownership history + transfer
│   │       ├── documents/page.tsx  # Attached documents
│   │       └── units/
│   │           └── [unitId]/page.tsx
│   ├── tenants/
│   │   ├── page.tsx
│   │   └── [tenantId]/page.tsx
│   ├── leases/
│   │   ├── page.tsx
│   │   ├── new/page.tsx
│   │   └── [leaseId]/
│   │       ├── page.tsx
│   │       └── payments/page.tsx
│   ├── payments/page.tsx           # All payments view
│   ├── documents/page.tsx          # Document vault (cross-entity)
│   ├── notifications/page.tsx
│   ├── settings/
│   │   ├── profile/page.tsx
│   │   ├── users/page.tsx
│   │   └── export/page.tsx
│   └── audit-log/page.tsx
```

### Data Fetching Pattern

```
Hono API
  ↓ (HTTPS, cookies forwarded)
hc client (type-safe, from hono/client)
  ↓
TanStack Query hooks (useQuery / useMutation)
  ↓
React Components (Server Components for SSR, Client Components for interactivity)
```

**API Client Setup** (`apps/web/lib/api.ts`):
- Creates `hc` typed client pointing to `NEXT_PUBLIC_API_URL`
- Forwards auth cookies on every request
- Full type inference from API route definitions — no manual type writing

**Custom Hooks** (`apps/web/lib/hooks/`):
- `useAssets()`, `useAsset(id)`, `useCreateAsset()`, `useUpdateAsset()`, etc.
- Mutations invalidate relevant queries automatically
- Optimistic updates for fast UI response

**SSR Strategy**:
- Server Components use `prefetchQuery` to fetch data on the server
- TanStack Query dehydrates/hydrates the cache for client-side use
- API called directly from Vercel → Railway (no browser round-trip for initial load)
- Next.js 16 provides the `"use cache"` directive for explicit, opt-in caching. Since PropertyVault is account-scoped and auth-heavy, authenticated views remain dynamic by default. Use `"use cache"` only for data that is safe to share or where private cache boundaries are explicitly set.

**Async Request APIs (Next.js 16)**:
- Dynamic request APIs are async in Next.js 16. Route `params`, `searchParams`, and server-side helpers like `cookies()` and `headers()` must be `await`-ed before use.
- Example: `const { assetId } = await params` in `[assetId]/page.tsx`
- This applies to all dynamic route pages, layouts, and server-side logic that accesses request context.

---

## 8. Design System

### Visual Identity: Terracotta + Cream

A warm, approachable aesthetic with premium feel. Inspired by Indian earth tones — terracotta clay, cream paper, warm stone.

### Color Palette

| Token | Hex | Usage |
|---|---|---|
| `--background` | `#FFFAF5` | Page background |
| `--surface` | `#FFF3E8` | Cards, panels, table rows |
| `--surface-hover` | `#FFEBD8` | Hovered cards, table rows |
| `--border` | `#E8D5C4` | Borders, dividers |
| `--border-strong` | `#D4B8A0` | Active/focused borders |
| `--primary` | `#C2705B` | Primary buttons, links, active navigation |
| `--primary-hover` | `#A85A47` | Primary hover state |
| `--primary-foreground` | `#FFFFFF` | Text on primary backgrounds |
| `--secondary` | `#8B6F5E` | Secondary buttons, less prominent actions |
| `--text` | `#3D2C2E` | Primary body text |
| `--text-muted` | `#7A6B63` | Secondary text, descriptions, timestamps |
| `--success` | `#7BA075` | Paid, active, success indicators |
| `--warning` | `#D4A017` | Overdue, expiring soon, attention needed |
| `--destructive` | `#C94C4C` | Delete, error, terminated, failed |
| `--accent` | `#E8A87C` | Badges, highlights, category indicators |

### Typography

| Element | Font Family | Weight | Size Range |
|---|---|---|---|
| Headings | DM Sans | 600 (SemiBold) | 24–32px |
| Subheadings | DM Sans | 500 (Medium) | 18–20px |
| Body text | Inter | 400 (Regular) | 14–16px |
| Labels & captions | Inter | 500 (Medium) | 12–14px |
| Monospace (amounts, IDs) | JetBrains Mono | 500 (Medium) | 14px |

### Component Styling Rules

| Property | Value | Notes |
|---|---|---|
| Card radius | `rounded-lg` (8px) | All cards and panels |
| Modal radius | `rounded-xl` (12px) | Dialogs and overlays |
| Input/button radius | `rounded-md` (6px) | Form elements |
| Card shadow | `shadow-sm` with warm tint | Soft, subtle depth |
| Card padding | `p-6` | Generous breathing room |
| Section padding | `p-4` | Inner sections |
| Hover transition | `150ms ease` | Buttons, cards, links |
| Modal transition | `200ms ease` | Open/close animations |
| Icon size | 20px | Lucide icons default |
| Icon stroke | 1.75 | Slightly thicker than default |

### UI Patterns

| Pattern | Implementation |
|---|---|
| **Sidebar navigation** | Collapsible side nav. Icon + label. Active state uses terracotta left border accent bar. Grouped sections (Properties, Tenants, Finance, System). |
| **Data tables** | Sticky header, alternating row hover, inline row actions (edit, view, delete), bulk selection checkbox for exports. Powered by TanStack Table. |
| **Detail pages** | Header: breadcrumb → title → action buttons. Below: tabbed content sections. |
| **Forms** | Label above input, inline validation messages, grouped fieldsets with section headings. |
| **Modals** | Used for confirmations, quick-create forms. Full page forms for complex multi-section entities. |
| **Dashboard cards** | Rounded card with soft shadow. Icon + metric number + label. Color-coded by status. |
| **Empty states** | Centered illustration + heading + description + CTA button. Guides user to next action. |
| **Loading states** | Skeleton loaders matching the shape of the content being loaded. |

---

## 9. File Storage

### Architecture

Files are stored in **Cloudflare R2** and accessed via S3-compatible presigned URLs. The API server never proxies file bytes — uploads and downloads go directly between the browser and R2. R2 is the default cloud provider for V1, while the storage layer stays S3-compatible so future MinIO or AWS S3 support does not require domain-level changes.

### Storage Abstraction

`packages/shared/storage.ts` wraps the AWS S3 SDK to provide a clean interface:

- `generateUploadUrl(key, contentType, expiresIn)` — presigned PUT URL
- `generateDownloadUrl(key, expiresIn)` — presigned GET URL
- `deleteObject(key)` — remove a file

Uses `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` with provider-specific configuration supplied through environment variables.

### Configuration

| Setting | Value |
|---|---|
| `S3_ENDPOINT` | `https://<account-id>.r2.cloudflarestorage.com` |
| `S3_REGION` | `auto` |
| `S3_FORCE_PATH_STYLE` | `true` |
| `S3_BUCKET` | `nilam-dev` (dev) / `nilam` (prod) |
| `S3_ACCESS_KEY` | R2 API token access key |
| `S3_SECRET_KEY` | R2 API token secret key |

### Upload Flow

```
1. Frontend calls POST /api/v1/documents/presign
   → sends: { filename, contentType }

2. API generates:
   → unique S3 key: documents/{accountId}/{uuid}/{filename}
   → presigned PUT URL (5-minute expiry)
   → returns: { uploadUrl, s3Key }

3. Frontend uploads file directly to R2 via presigned URL
   → PUT request with file body and Content-Type header

4. Frontend calls POST /api/v1/documents
   → sends: { s3Key, name, typeTag, entityType, entityId, ... }
   → API creates document record in database
```

### Download / Preview Flow

```
1. Frontend calls GET /api/v1/documents/:id/url

2. API checks:
   → user is authenticated
   → user has access to the document's account
   → generates presigned GET URL (15-minute expiry)

3. Frontend:
   → PDF / JPG / PNG: renders in-browser preview
   → DOCX: triggers download
```

### R2 Setup Checklist

1. Create R2 bucket via Cloudflare dashboard (`nilam-dev`)
2. Generate R2 API token with S3-compatible credentials
3. Configure CORS on the bucket to allow uploads from the web origin
4. Add credentials to `.env`

### Supported File Types

| Type | Max Size | Behavior |
|---|---|---|
| PDF | 10 MB | In-browser preview |
| JPG / PNG | 10 MB | In-browser preview |
| DOCX | 10 MB | Download only |

---

## 10. Background Jobs

### Shared Job Runner

Recurring work is modeled as **internal application job handlers**. In V1 cloud deployments, **Inngest** is the scheduler adapter that triggers those handlers. This keeps reminder and ledger logic independent from any single scheduling product.

### How It Works

```
1. Define reusable job handlers in the API codebase alongside domain services
2. Expose an Inngest adapter in apps/api/src/inngest/functions.ts for cloud schedules
3. Inngest triggers the adapter on the configured schedule
4. The adapter calls the shared job handlers that perform the actual domain work
5. Future self-host cron or manual backfill commands can call the same handlers
```

### Scheduled Jobs

| Job | Schedule | Logic |
|---|---|---|
| Generate monthly charges | Daily, 00:05 (account timezone) | For all active leases, snapshot rent components into monthly charge records for the current month. Idempotent: skips if charge already exists for `(leaseId, month)`. Applies rent escalation on lease anniversary months. |
| Lease expiry notifications | Daily, 08:00 | Check leases expiring in 60 or 30 days, create in-app notifications |
| Rent overdue notifications | Daily, 09:00 | Check unpaid charges past due date, create or update overdue notifications |
| EC expiry reminders | Daily, 08:00 | Check land assets with Encumbrance Certificate expiring in 90 days |
| Property tax reminders | Daily, 08:00 | Check assets with property tax due in 30 days |
| Document expiry reminders | Daily, 08:00 | Check documents with expiry date in 30 days |
| Orphaned file cleanup | Daily, 02:00 | List R2 objects, compare against `documents` table, delete objects with no matching DB record older than 24 hours |

### Free Tier Usage

7 jobs × 30 days/month = **~210 executions/month**.
Inngest free tier: **50,000 executions/month**.
Usage is well within limits.

### Local Development

Run the Inngest Dev Server locally for testing cron jobs:

```sh
npx inngest-cli@latest dev
```

Opens a local dashboard at `http://localhost:8288` where you can trigger functions manually, inspect payloads, and view execution logs.

---

## 11. Deployment Architecture

V1 is cloud-first. The production reference deployment is Vercel + Railway + Neon + Cloudflare R2 + Inngest. Self-host packaging is a later compatibility track, not a V1 delivery dependency.

### Service Map

```
┌─────────────────────────────────────────────────┐
│                    Internet                       │
└───────┬─────────────────────────┬────────────────┘
        │                         │
        ▼                         ▼
┌───────────────┐        ┌──────────────────┐
│  Vercel       │        │  Railway         │
│  (Frontend)   │───────▶│  (Hono API)      │
│  Next.js 16   │  HTTP  │  Bun runtime     │
│  Free hobby   │        │  $5 credit/mo    │
└───────────────┘        └──────┬───────────┘
                                │
                 ┌──────────────┼──────────────┐
                 │              │              │
                 ▼              ▼              ▼
          ┌───────────┐ ┌────────────┐ ┌───────────┐
          │ Neon      │ │ Cloudflare │ │ Inngest   │
          │ PostgreSQL│ │ R2         │ │ Jobs      │
          │ Free tier │ │ Free tier  │ │ Free tier │
          └───────────┘ └────────────┘ └───────────┘
```

### Platform Details

#### Vercel (Frontend)

- Auto-deploy from GitHub on push to `main`
- Build command: `turbo build --filter=web`
- Framework preset: Next.js
- Environment variables: `NEXT_PUBLIC_API_URL` pointing to Railway URL

#### Railway (API)

- Connect GitHub repo → auto-deploy `apps/api` directory
- Runtime: Bun (auto-detected or set via `nixpacks.toml`)
- Start command: `bun run src/app.ts`
- Custom domain or `*.up.railway.app` URL
- Environment variables: database, R2, auth, Inngest credentials

#### Neon (Database)

- Create project + database (`nilam_dev`)
- Connection pooling enabled by default (serverless driver)
- Database branching for dev/staging environments
- Connection string provided as `DATABASE_URL`

#### Inngest (Scheduler Adapter)

- Create account → obtain event key + signing key
- Functions auto-discovered when API is deployed (Inngest pings `/api/inngest`)
- Cron schedules configured in code — no external configuration needed
- Adapter layer calls shared internal job handlers so the scheduler can be swapped later without changing domain logic
- Dashboard for monitoring job executions and debugging

#### Cloudflare R2 (File Storage)

- Create bucket (`nilam-dev`)
- Generate API token with S3-compatible access
- Configure CORS for web origin
- Zero egress fees — ideal for document-heavy workflows

### Local Dev Workflow

```sh
# 1. Install dependencies
pnpm install

# 2. Start development servers (Turborepo runs both in parallel)
pnpm dev
# → web: http://localhost:3000 (Next.js)
# → api: http://localhost:4000 (Hono + Bun)

# 3. Start Inngest Dev Server (separate terminal)
npx inngest-cli@latest dev
# → dashboard: http://localhost:8288

# 4. Database operations
pnpm db:generate    # Generate migration from schema changes
pnpm db:migrate     # Apply migrations to Neon
pnpm db:seed        # Seed development data
```

---

## 12. Environment Variables

All configuration is provided via environment variables. No secrets in code.

```env
# ──────────────────────────────────────────────
# Database (Neon Serverless PostgreSQL)
# ──────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/nilam?sslmode=require

# ──────────────────────────────────────────────
# Cloudflare R2 (S3-compatible File Storage)
# ──────────────────────────────────────────────
S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
S3_BUCKET=nilam-dev
S3_ACCESS_KEY=<r2-access-key-id>
S3_SECRET_KEY=<r2-secret-access-key>
S3_REGION=auto
S3_FORCE_PATH_STYLE=true

# ──────────────────────────────────────────────
# Authentication (Better Auth)
# ──────────────────────────────────────────────
BETTER_AUTH_SECRET=<random-32-char-secret>
BETTER_AUTH_URL=http://localhost:4000
# Production: set to the public API origin used for reset and invite links

# ──────────────────────────────────────────────
# Transactional Email (Resend)
# ──────────────────────────────────────────────
RESEND_API_KEY=<resend-api-key>
RESEND_FROM_EMAIL=noreply@yourdomain.com
# Must use a domain verified in Resend

# ──────────────────────────────────────────────
# Background Jobs (Inngest)
# ──────────────────────────────────────────────
INNGEST_EVENT_KEY=<inngest-event-key>
INNGEST_SIGNING_KEY=<inngest-signing-key>

# ──────────────────────────────────────────────
# Encryption (Aadhaar / PAN at-rest encryption)
# ──────────────────────────────────────────────
ENCRYPTION_SECRET=<random-32-byte-hex-key>

# ──────────────────────────────────────────────
# Web / CORS
# ──────────────────────────────────────────────
CORS_ORIGIN=http://localhost:3000

# ──────────────────────────────────────────────
# Frontend
# ──────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:4000
```

---

## 13. Cross-cutting Concerns

### Soft Deletes

All operational entities support soft deletion via a `deletedAt` timestamp column. Soft-deleted records are hidden from normal UI views but can be restored by account Admins. Account deletion is the only hard-delete path and permanently removes all data.

### Account Deletion Cascade

Account deletion is a destructive, irreversible operation. The cascade order:
1. Revoke all active sessions for all account members
2. Soft-delete all entities (for audit trail during the deletion window)
3. Queue background job to delete all R2 files for the account (by `documents/{accountId}/*` prefix)
4. Hard-delete all database records in dependency order, including documents, notifications, audit rows, invitations, and core domain tables
5. Remove the organization record and any now-orphaned membership rows

This runs as a background job to handle large accounts without timing out.

### Input Validation

All inputs are validated server-side using Zod schemas from `packages/validators/`. Key validations:
- Ownership percentages must sum to 100% for active stakes
- Lease end date must be after start date
- Units cannot have overlapping active leases
- File uploads must be within size limits and allowed MIME types
- Payment allocations cannot exceed charge amounts

### Data Integrity

- Ownership transfers execute in a single transaction so current stakes are never left in a partial state.
- Active leases are protected with a database-level partial unique index, not only a service-layer pre-check.
- Monthly charge rows and charge lines are append-only after generation; rent history changes only through payments, allocations, and advance applications.
- Monthly charges have a unique constraint on `(leaseId, month)` to prevent duplicate generation.
- Move-in, move-out, and deposit deduction records are structured child records so operational history remains auditable.

### Charge Generation & Rent Escalation

Monthly charges are generated by two triggers:
1. **On lease activation**: Generates the activation month's charge if it does not already exist.
2. **Daily cron job**: Generates the current month's charge for any active lease that is still missing a record for that month (catch-up for newly active leases and month rollovers).

Both paths are idempotent — the unique constraint on `(leaseId, month)` prevents duplicates.

**Rent escalation** is applied on the lease anniversary. When generating charges, the system checks whether the charge month crosses a lease anniversary. If the lease started on 2025-06-15 with a 5% annual escalation, all charges from 2026-06 onward use the escalated amount. Escalation compounds annually.

### Timezone Handling

All scheduled jobs fire in UTC via Inngest. Job handlers convert to the account's configured timezone (stored on the `organization.timezone` field, default `Asia/Kolkata`) before evaluating date-based rules. "1st of month" and "due date" calculations use the account timezone, not UTC.

### Account-scoped Data Isolation

All application queries must filter by `accountId`. Some tables (`units`, `leases`, `monthly_charges`, etc.) do not have a direct `accountId` column — they inherit isolation through joins to parent tables (e.g., `units` → `assets` → `accountId`). Service layer functions must always join through the parent chain to enforce isolation. Key rule: **never query a child table without joining to the parent's `accountId` filter.**

### Search

V1 search uses PostgreSQL full-text search with GIN indexes. Indexed fields:
- Assets: name, street, city (on `assets` table)
- Land details: survey number, patta number (on `land_details` table)
- Persons: name, phone
- Tenants: name, phone
- Documents: name, type tag

No OCR, semantic search, or document content indexing in V1.

### Notification Semantics

- Notifications are created as account-scoped events.
- Read and dismiss state is tracked per user through `notification_recipients`, which supports unread counts and personal inbox state in shared accounts.
- V1 uses in-app notifications for reminders. Transactional auth flows (password reset, invite links) use Resend email and are not part of the notification module.
- **Visibility:** All account members see all account-level notifications regardless of group. Group-scoped notification filtering is not in V1.

### Orphaned File Handling

Direct-to-R2 upload creates a window where uploads can succeed but the subsequent DB record creation fails. To prevent storage leaks:
- Presigned URLs use the `documents/{accountId}/{uuid}/{filename}` key pattern
- A daily background job lists R2 objects and compares against the `documents` table
- Objects with no matching DB record that are older than 24 hours are deleted
- Document soft-deletes do not immediately remove R2 objects; the cleanup job handles it

### Error Handling

- User-friendly error messages — no stack traces in production
- Structured error responses: `{ error: string, code: string, details?: object }`
- Rate limit errors return 429 with retry-after header
- Validation errors return 400 with field-level error details

### Error Monitoring

Production errors are tracked via **Sentry** (`@sentry/node` for the API, `@sentry/nextjs` for the frontend). Sentry captures unhandled exceptions, slow transactions, and API error rates. Structured logging via `console.log` in development; production logging through Railway's built-in log aggregation.

### Rate Limiting

Rate limiting uses in-memory storage via Hono's built-in rate limiter. This is sufficient for V1 with a single Railway instance. If horizontal scaling is needed, rate limit state should move to Redis or a database-backed counter.

### Audit Trail

Every significant action is written to the `audit_log` table:
- Entity CRUD operations (create, update, soft delete, restore)
- Ownership transfers
- Lease lifecycle events (activate, terminate, renew)
- Payment entries
- Document uploads and downloads
- Sensitive data access (Aadhaar/PAN decryption)
- Move-in, move-out, and deposit settlement updates

Log entries are immutable and retained for the life of the account. Audit writes use a post-response hook with an async fallback queue — if the audit write fails, it is retried via a short-lived in-process queue to avoid silent audit gaps.

### Loading & Empty States

- **Loading**: Skeleton loaders matching the shape of upcoming content
- **Empty states**: Centered layout with illustration, heading, description, and CTA button guiding the user to create their first record

### Responsive Design

The web app is built mobile-first with Tailwind breakpoints. Sidebar collapses to a bottom nav or hamburger menu on small screens. Data tables scroll horizontally on mobile with sticky first columns.

### Testing Strategy

V1 uses a pragmatic testing approach focused on business-critical logic:
- **Unit tests** (Vitest): Ownership percentage validation, payment allocation logic, charge generation, rent escalation calculations, role authorization checks
- **Integration tests** (Vitest + test database): API route tests for critical workflows — lease activation, payment entry, ownership transfer, invite flow
- **No E2E tests in V1**: Frontend testing deferred to V2. Manual testing covers UI flows.
- Test database uses Neon branching for isolated test environments

### CI/CD Pipeline

- **GitHub Actions** runs on every push and PR: `pnpm lint`, `pnpm typecheck`, `pnpm test`
- Vercel auto-deploys `apps/web` on push to `main` (blocked if CI fails)
- Railway auto-deploys `apps/api` on push to `main`
- Database migrations are applied manually via `pnpm db:migrate` before deploy (automated migration in CI is a post-V1 improvement)

---

## 14. Implementation Plan

### Phase 0: Foundation (1–2 weeks)

- Turborepo scaffold with pnpm workspaces
- Drizzle schema for core tables + migrations
- Better Auth setup (signup, login, session, organization plugin)
- Resend integration for transactional email
- Hono API with middleware stack
- S3 storage adapter for R2
- Shared job handlers + Inngest adapter
- Tailwind + shadcn/ui theme with terracotta palette
- Railway + Vercel + Neon + R2 + Inngest setup
- Sentry error monitoring setup
- GitHub Actions CI pipeline (lint + typecheck + test)
- Dev workflow: `pnpm dev` starts everything

### Phase 1: Core Entities (2–3 weeks)

- Account roles (Admin/Viewer) and invite flow via Better Auth org plugin
- Group management
- Person registry (CRUD + search)
- Audit log foundation
- Aadhaar/PAN encryption

### Phase 2: Asset Registry (2–3 weeks)

- Asset CRUD with land and rental property subtypes
- Ownership stakes and transfer history
- Document vault (upload, download, preview)
- Asset search with full-text indexing
- Tags and filters

### Phase 3: Rental Operations (2–3 weeks)

- Unit management
- Tenant registry
- Lease management (create, activate, terminate, renew)
- Move-in / move-out checklists
- Lease invariant enforcement

### Phase 4: Finance (2–3 weeks)

- Monthly charge generation on lease activation (with idempotency)
- Daily charge generation cron with rent escalation
- Payment entry with allocation against charges
- Bulk payment entry
- Overdue detection and flagging
- PDF rent receipt generation
- Rent summary reports

### Phase 5: Polish & Ship (2–3 weeks)

- Notification system (Inngest cron jobs + in-app notification center)
- Dashboard with key widgets
- Data exports (CSV, PDF)
- Settings (profile, users, account deletion)
- Orphaned file cleanup job
- Hosted launch hardening
- README and deployment documentation

**Total estimated: ~12–17 weeks solo, part-time.**

---

## 15. Decisions Log

| # | Decision | Choice | Rationale |
|---|---|---|---|
| 1 | Package manager | pnpm workspaces | Turborepo native, fast installs, disk-efficient |
| 2 | Runtime | Bun (local + production) | Fast startup, native TypeScript, same everywhere |
| 3 | Frontend hosting | Vercel (free hobby) | Best Next.js support, zero-config deploys |
| 4 | API hosting | Railway ($5 free credit) | Bun-native, always-on, no cold starts, great DX |
| 5 | Background jobs | Shared internal job runner + Inngest adapter | Keeps scheduled domain logic portable while using Inngest for cloud delivery |
| 6 | Database | Neon (free tier) | Serverless PostgreSQL, branching, connection pooling, $0 |
| 7 | File storage | Cloudflare R2 (free tier) | S3-compatible default with zero egress fees and a clean path to future MinIO or S3 support |
| 8 | API framework | Hono | Portable across platforms, type-safe RPC, mobile-ready |
| 9 | ORM | Drizzle | Lightweight, SQL-like, Neon serverless driver support |
| 10 | Auth | Better Auth (organization plugin) | Self-hostable, org plugin handles accounts/roles/invites, session management |
| 11 | Type sharing | Hono RPC (`hc` client) | Zero-overhead type inference from route definitions |
| 12 | Monorepo | Turborepo | Efficient builds, shared packages across apps |
| 13 | Validation | Zod | Shared schemas between API validation and form validation |
| 14 | UI framework | Tailwind v4 + shadcn/ui | Utility-first CSS, accessible components, customizable |
| 15 | Design aesthetic | Terracotta + cream | Warm, approachable, premium Indian aesthetic |
| 16 | File upload pattern | S3 presigned URLs | Direct browser → R2 upload, no API proxying |
| 17 | Vendor strategy | Multi-vendor free tiers | $0/month dev cost, no vendor lock-in |
| 18 | Transactional email | Resend | Simple API, good DX, free tier covers V1 volume |
| 19 | Error monitoring | Sentry | Industry standard, free tier, Next.js + Node.js SDKs |
| 20 | Role model | Admin + Viewer | Two roles only. No group-level roles. Simplest model that covers V1 needs. |
| 21 | Account model | Single account membership | Direct sign-up creates an account; invited users join that account. No multi-account membership in V1. |

---

## 16. Open Considerations

### 1. ~~Better Auth Organization Plugin~~ — RESOLVED

Better Auth's organization plugin is confirmed for V1. It handles account creation, role management (Admin/Viewer via `createAccessControl`), invite flow with `sendInvitationEmail` callback, and schema customization for additional fields (timezone, deletedAt). Custom `app_accounts`/`account_members` tables are no longer needed.

### 2. Railway Free Tier Limits

Railway provides $5 in free credits per month, which covers approximately 500 hours of a small service. For a 24/7 always-on API, this may be exceeded in production. During development and intermittent testing, $0 is achievable.

**If exceeded:** The Hono API is fully portable. Migration options include Fly.io, Render, or container-based hosting.

### 3. Hono RPC Limitations

Hono RPC works best for standard request/response patterns. For streaming responses (large exports) or server-sent events (real-time notifications), use standard `fetch` instead of the `hc` client. V1 uses polling for notification updates — real-time push can be added in V2.

### 4. Neon Free Tier Constraints

Neon's free tier provides 0.5 GB of storage and one project. This is sufficient for V1 with moderate data. If storage needs grow, Neon's paid tier starts at $19/month — or migrate to any standard PostgreSQL provider (Drizzle makes this a driver-level change).

### 5. Self-Hosted Path (Future)

Self-host packaging is intentionally post-V1. When ready:
- Package the Hono API + Next.js + worker into Docker images
- Swap Neon → local PostgreSQL
- Swap R2 → MinIO (S3-compatible)
- Swap Inngest → cron container running the same job functions
- Swap Resend → any SMTP provider or self-hosted email
- Ship as a one-command `docker compose up`

### 6. Resend Free Tier

Resend's free tier allows 3,000 emails/month and 100 emails/day. V1 usage (password resets + invites) is well within limits. If volume grows, Resend's paid tier starts at $20/month.

### 7. Sentry Free Tier

Sentry's free developer tier allows 5,000 errors/month and 10,000 transactions/month. Sufficient for V1. Performance monitoring can be enabled selectively for critical API routes.

---

*Document version: V1.2 — Revised Architecture — 6 April 2026*
