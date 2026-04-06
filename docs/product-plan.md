# PropertyVault - V1 Final Product Plan

> A personal and family property asset management tool.
> Open source. Cloud-hosted V1. Self-host path planned after V1.

*Revised: April 2026*

---

## 1. Product Vision

A unified platform for individuals and families to digitize, track, and manage all property assets - land plots, rental homes, and commercial spaces - in one place. Built for the Indian context: joint ownership, manual rent tracking, Tamil Nadu-style land records, and document-heavy transactions.

**Not a marketplace. Not a broker tool. A private asset register with rental management layered on top.**

Technical implementation decisions, deployment architecture, and stack choices live in `docs/architecture.md`. This document is the product scope and delivery plan only.

---

## 2. Core Product Decisions

These decisions are locked for V1 and should drive the schema, APIs, and UI.

- **Account** is the tenant boundary. All data belongs to exactly one account. A direct sign-up creates exactly one account (personal or family), while an invited user joins the inviter's account. A user cannot belong to multiple accounts in V1.
- **Users** are authenticated people who can log in and operate the product.
- **Roles** are account-level only. Two roles: **Admin** (full access) and **Viewer** (read only). The account creator is automatically an Admin. Admins can invite others and promote any member to Admin.
- **Persons** are business records used for owners, family members, and related contacts. A person does not need login access.
- **Groups** are optional containers for family branches or organizations. They are data-organization tools, not permission boundaries.
- **Assets** belong directly to an account and may optionally be linked to one group.
- **Ownership** is modeled through ownership stake records, not through group membership.
- **Rental operations** use an append-only ledger model: lease terms are snapshotted into monthly charges, and payments are applied against those charges. Monthly charge generation is idempotent — duplicate charges for the same lease and month are prevented.
- **Units** allow only one active lease at a time in V1.
- **Leases** are single-tenant in V1. Co-tenancy and multi-party leases are out of scope.
- **Transactional email** is used for auth flows only (password reset, invite links) via Resend. Product notifications are in-app only in V1.
- **V1 delivery** is cloud-first. Self-host packaging follows after the hosted product and core workflows are stable.

---

## 3. Deployment Model

| Mode | Description |
|---|---|
| **Cloud hosted** | Primary V1 delivery model. Subscription covers hosting, storage, backups, scheduling, and support. |
| **Self-hosted** | Planned after V1 using the same product workflows and domain model, but not part of the initial delivery critical path. |
| **Advanced self-host** | Bring-your-own infrastructure remains a future documentation path, not a V1 support promise. |

Storage provider choices, runtime topology, and scheduler implementation are defined in `docs/architecture.md`.

Operational configuration such as database credentials, object storage credentials, and encryption secrets is instance-level configuration, not per-account user configuration.

---

## 4. Data Model

```
Account
 ├── Users (authenticated members of the account)
 ├── Groups (optional family or organisation containers)
 ├── Persons (owners/family contacts/business records)
 ├── Assets
 │    ├── Ownership stakes (historical + current)
 │    ├── Documents
 │    └── [If rental] Units -> Tenant records -> Leases -> Monthly charges -> Payments
 ├── Notifications
 └── Audit log
```

### Key Rules

- An **Account** is the hard isolation boundary. No data crosses account boundaries. Each user creates exactly one account.
- **Two roles only**: Admin (full access) and Viewer (read only). The creator is an Admin by default.
- A **User** can log in. A **Person** cannot log in unless separately invited as a user.
- A **Group** is optional. Solo users can manage assets directly under the account with no groups. Groups do not affect permissions.
- An **Asset** belongs to one account and may optionally belong to one group.
- A **Person** may be ungrouped or linked to multiple groups inside the same account.
- An **Asset** can have one or more owners through ownership stake records whose active percentages must sum to 100%.
- Ownership history is maintained by closing prior active stakes and creating new stakes in one transaction.
- A **Unit** can have at most one active lease at a time in V1.
- A **Lease** belongs to one tenant record and one unit in V1.
- **Documents** can be attached to group, person, asset, tenant, or lease records.
- Every create, update, soft delete, restore, and key workflow action is written to an immutable audit log.

---

## 5. Modules and Features - V1 Scope

### Module 1: Auth and Account

| Feature | Detail |
|---|---|
| Sign up / Login | Email + password |
| Password reset | Email-based reset flow |
| Profile | Name, phone, preferred language (EN only in V1, Tamil later) |
| Account settings | Profile, password change, timezone |
| Session management | Active sessions list, ability to log out other sessions |

No OAuth in V1. No magic link in V1.

### Module 2: Access Control and Roles

| Feature | Detail |
|---|---|
| Account-level roles | **Admin** (full access — CRUD all entities, manage users, invite members, account settings) and **Viewer** (read only — view all data, no modifications) |
| Default role | The user who creates the account is automatically an Admin |
| Promote to Admin | Any Admin can promote a Viewer to Admin |
| Invite flow | Admin invites a user by email → invitee receives an email via Resend → invitee completes signup into the inviting account → joins as Viewer by default |
| Data isolation | Strict account-level isolation |

There are no group-level roles and no per-asset permissions in V1. Groups are data-organization containers, not permission boundaries.

### Module 3: Group Management

| Feature | Detail |
|---|---|
| Create a group | Name, description |
| Add persons to group | Link one or more person records to a group |
| Group dashboard | Assets, persons, and recent activity within the group |
| Multiple groups | A single account can manage multiple groups |

Groups are optional data-organization containers. They do not affect permissions — all account members see all account data regardless of group assignment.

### Module 4: Person / Owner Registry

| Feature | Detail |
|---|---|
| Add person | Name, phone, email (optional), Aadhaar number (optional), PAN (optional), notes |
| Person type | Owner / Family member / Related contact |
| Link to groups | Optional; a person can belong to multiple groups in the same account |
| Person profile | Shows all assets they own fully or partially |
| Relationship tag | Owner, Spouse, Child, Sibling, Parent, Other |
| Person search | Search/filter across persons by name, phone, group |

Person records are non-login business records in V1.

### Module 5: Asset Registry

Two asset types share a common base entity.

#### 5.1 Base Asset Fields

| Field | Detail |
|---|---|
| Asset name | Free text label, e.g. "Anna Nagar Plot", "Shop No. 3" |
| Asset type | `LAND` or `RENTAL_PROPERTY` |
| Group link | Optional link to one group |
| Address / Location | Street, city, district, state, pincode |
| Ownership | One or more persons with percentage share; active shares must total 100% |
| Purchase price | Amount in INR |
| Purchase date | Date |
| Current estimated value | Manual entry in INR |
| Value last updated | Auto-set when estimated value changes |
| Notes | Free text |
| Status | Active / Sold / Disputed |
| Documents | Attached files |
| Tags | User-defined tags for filtering |

#### 5.2 Ownership History

| Feature | Detail |
|---|---|
| Transfer log | Every ownership change records prior and new stake state, effective date, and reason |
| Transfer reason | Purchase / Inheritance / Gift / Partition / Sale / Other |
| Linked document | Transfer entry can link to supporting documents |
| Current vs historical | Current ownership is derived from active stake records; history is viewable separately |
| Validation | Transfers must preserve a valid 100% active ownership state |

#### 5.3 Land / Plot Fields

| Field | Detail |
|---|---|
| Survey number | Text |
| Patta number | Text |
| Chitta / Adangal ref | Text |
| Land area | Number + unit (cents / acres / sqft / grounds) |
| Land type | Agricultural / Non-agricultural / Plot / Farm |
| Taluk | Text |
| Village / Hobli | Text |
| EC status | Up to date / Expired / Not available |
| EC expiry date | Date |
| Property tax account number | Text |
| Property tax last paid date | Date |
| Property tax due date | Annual date used for reminders |
| Boundary notes | Free text |

#### 5.4 Rental Property Fields

| Field | Detail |
|---|---|
| Property subtype | Residential home / Apartment / Shop / Office / Warehouse |
| Number of units | Integer |
| Built-up area | Sq ft |
| Amenities / Notes | Free text |

#### 5.5 Asset List and Search

| Feature | Detail |
|---|---|
| List view | Sortable columns for name, type, value, status |
| Filters | Type, status, group, owner, tags |
| Search | PostgreSQL-backed indexed search across asset name, address, survey number, patta number, and tags |

### Module 6: Unit Management

| Feature | Detail |
|---|---|
| Add unit | Unit name/number, floor, area (sq ft), type (residential/commercial) |
| Derived unit state | Vacant if no active lease, Occupied if active lease exists |
| Manual override | Under Maintenance can be set manually and blocks new lease activation |
| Unit history | Timeline of leases and occupants |
| Quick status actions | Mark under maintenance / clear maintenance |

### Module 7: Tenant Management

| Feature | Detail |
|---|---|
| Add tenant | Name, phone, email, emergency contact, ID proof type + number, occupation |
| Tenant photo | Optional upload |
| Tenant documents | Upload ID copy, agreement, and related files |
| Tenant status | Active / Past / Blacklisted |
| Tenant search | Search/filter by name, phone, property, status |

Tenant records are non-login records in V1. Tenant self-service is out of scope.

### Module 8: Lease Management

| Feature | Detail |
|---|---|
| Create lease | Tenant, unit, start date, end date, rent components, security deposit, optional rent advance |
| Lease status | Draft / Active / Expired / Terminated |
| Rent components | Base rent + 0-N recurring line items such as maintenance, water, electricity, parking |
| Rent due date | Day of month |
| Rent escalation | Annual percentage increase used only when creating future monthly expected charges |
| Security deposit | Amount, date received, status (Held / Partially Refunded / Fully Refunded) |
| Rent advance | Separate from deposit; can be applied against future monthly charges |
| Lease document | Upload signed agreement |
| Lease renewal | Creates a new linked lease with copied tenant and unit details, but new dates and rent terms |
| Lease invariant | A unit cannot have overlapping active leases |
| Lease expiry alert | Feeds notification system |

### Module 9: Move-in / Move-out Workflow

| Feature | Detail |
|---|---|
| Move-in checklist | Lease signed, deposit received, keys handed over, meter readings, move-in notes |
| Move-out checklist | Notice date, inspection notes, pending dues, deposit deductions, refund amount, keys returned |
| Deposit settlement | Deduction line items with reason + net refund |
| Unit state update | Unit becomes vacant when move-out is completed and no replacement lease is active |
| Final reconciliation | Outstanding dues are shown before move-out completion |

This is structured data capture, not a complex workflow engine.

### Module 10: Rent Tracking (Manual - V1)

No payment gateway integration in V1. Tracking is manual, but the ledger rules are explicit.

| Feature | Detail |
|---|---|
| Monthly charge generation | When a lease becomes active, the system snapshots the activation month's expected charges from the lease terms. A daily cron backfills the current month for any active lease missing a charge record. Generation is idempotent — a unique constraint on `(leaseId, month)` prevents duplicate charges. |
| Record payment | Capture payment date, amount, mode, reference, notes, and allocation against one or more open monthly charges |
| Default allocation | Oldest unpaid charge first, with ability to adjust allocation during entry |
| Partial payments | Supported; multiple payments can be applied to the same month |
| Advance handling | Rent advance is stored separately and can be applied to future charges |
| Pending calculation | Pending amount is computed from generated monthly charges minus allocated payments |
| Payment history | Full tenant timeline with running balance |
| Overdue indicator | Flags unpaid charges after due date and tracks months overdue |
| Monthly summary | Per property: expected vs collected vs pending |
| Bulk payment entry | Record multiple tenant payments in one workflow |
| Rent receipt generation | One PDF receipt per payment event with tenant, property, unit, amount, covered charges, payment mode, and issuer signature block |

Historical dues are never recomputed from edited lease data. Existing monthly charges remain immutable once generated. Rent escalation is applied on the lease anniversary: when each month's charge is generated, the system checks whether that month crosses the anniversary and applies the escalation percentage to subsequent months.

### Module 11: Document Vault

Documents can be attached to group, person, asset, tenant, or lease records.

| Feature | Detail |
|---|---|
| Upload document | Name, type tag, date, notes |
| Expiry date | Optional; drives reminders |
| View / Download | Available from the entity it is attached to |
| Preview | In-browser preview for PDF and image files |
| DOCX behavior | Download only in V1 |
| Bulk upload | Upload multiple files and tag them in batch |
| Storage backend | S3-compatible abstraction |
| File types | PDF, JPG, PNG, DOCX |
| File size limit | 10 MB per file |
| Document search | Indexed search across document name and type tag |

There is no document versioning and no OCR in V1.

### Module 12: Notifications and Reminders

In-app notification center only. No product email, SMS, or WhatsApp notifications in V1. Transactional auth email (password reset, invite links) is handled separately via Resend and is not part of the notification module.

| Feature | Detail |
|---|---|
| Notification center | Bell icon with unread count and list |
| Lease expiry | 60 days and 30 days before expiry |
| Rent overdue | Day after due date, then weekly while unpaid |
| EC expiry | 90 days before expiry |
| Property tax due | 30 days before annual due date |
| Document expiry | 30 days before expiry |
| Mark as read / dismiss | Per notification |

Reminder logic runs once daily. The concrete scheduler and job runner implementation are defined in `docs/architecture.md`.

### Module 13: Dashboard

Single-screen overview of the account.

| Widget | Detail |
|---|---|
| Total assets | Count by type |
| Total portfolio value | Sum of estimated values |
| Rent summary | Selectable month: expected vs collected vs pending |
| Overdue tenants | Amount and months overdue |
| Upcoming lease expirations | Next 60 days |
| Vacant units | Units without active lease |
| Upcoming reminders | Next 5 notifications |
| Recent activity | Last 10 significant audit log entries |

### Module 14: Audit Log

| Feature | Detail |
|---|---|
| Auto-logged events | Create, update, soft delete, restore, ownership transfer, lease renewal, payment entry, document upload/download |
| Log fields | Timestamp, actor, action type, entity type, entity ID, summary of change |
| View audit log | Per-entity and global account-wide view |
| Immutable | Entries cannot be edited or deleted while the account exists |
| Retention | Retained for the life of the account |

### Module 15: Data Export and Reports

| Feature | Detail |
|---|---|
| Rent payment export | CSV export of payment history with filters |
| Rent summary report | PDF monthly/yearly rent collection summary per property |
| Rent receipts | PDF per payment |
| Asset register export | CSV of all assets with key fields |
| Tenant list export | CSV of tenants with contact details and current status |

No advanced analytics suite in V1. Full account JSON export with documents archive is deferred to post-V1.

### Module 16: Settings and Configuration

| Feature | Detail |
|---|---|
| Account settings | Profile, password change, timezone |
| User management | Invite/remove users, promote Viewer to Admin |
| Data export | CSV exports of assets, tenants, and payments |
| Danger zone | Account deletion with confirmation |

Deployment and infrastructure configuration are documented in `docs/architecture.md`, not exposed as account-level UI settings.

---

## 6. Cross-cutting Concerns

| Concern | Approach |
|---|---|
| **Soft deletes** | Operational entities are soft-deleted and hidden from normal UI. Admins can restore them unless the account is permanently deleted. |
| **Account deletion** | Account deletion is the only hard-delete path. It permanently removes account data, audit logs, and stored documents. Deletion cascade: revoke all sessions → soft-delete all entities → delete all R2 files via background job → hard-delete database records → remove the account. |
| **Encryption at rest** | Aadhaar and PAN are encrypted at the application layer using an instance master key provided through environment configuration. |
| **Sensitive data access** | Aadhaar and PAN are masked in normal UI views and only shown to authorized users. Sensitive reads and document downloads are audited. |
| **Input validation** | Server-side validation on all inputs. Ownership totals must equal 100%. Lease end date must be after start date. Units cannot have overlapping active leases. |
| **Charge idempotency** | Monthly charges are generated both on lease activation and by a daily cron. A unique constraint on `(leaseId, month)` prevents duplicate charges. Generation logic checks for existing charges before inserting. |
| **Rent escalation** | Annual percentage increase is applied on the lease anniversary. The charge generation cron checks if the current month crosses the lease start anniversary and uses the escalated amount for subsequent charges. |
| **Timezone handling** | All scheduled jobs run relative to the account's configured timezone (default: Asia/Kolkata). Cron triggers fire in UTC; job handlers convert to the account timezone before evaluating date-based rules. |
| **Search scope** | V1 search is indexed database search over structured text fields only. No OCR, semantic search, or document content indexing. |
| **Responsive design** | The web app must work on mobile browsers and desktop browsers. |
| **Error handling** | User-friendly errors. No stack traces in production. Structured error monitoring via Sentry for production debugging. |
| **Loading states** | Skeleton loaders for data-fetching views. |
| **Empty states** | Clear empty states with next-step actions. |
| **Orphaned file cleanup** | If a presigned upload succeeds but the subsequent document record creation fails, or a document record is deleted, a daily background job reconciles R2 objects against database records and removes orphans. |

---

## 7. What Is Not in V1

| Feature | Reason |
|---|---|
| Multi-account support | One account per creator. No switching between accounts. Simplifies UX and data model. |
| Full account JSON + documents archive export | Engineering complexity of streaming R2 files into a zip. Deferred to post-V1. CSV exports cover V1 needs. |
| UPI / payment gateway | Complexity and compliance overhead. Manual tracking is sufficient for V1. |
| WhatsApp / SMS / Email reminders | Third-party integration deferred to V2. Transactional auth email (via Resend) is the only email in V1. |
| Aadhaar e-KYC | Government API access required. |
| Mobile native app | Responsive web covers V1. |
| Multi-language UI | Tamil and other languages deferred to V2. |
| Expense tracking / P&L | Deferred to V2. |
| Tax / ITR helper | Deferred to V2. |
| Tenant portal | Deferred to V2. |
| Market value auto-fetch | No reliable source for V1. |
| E-sign for agreements | Deferred to V2. |
| OAuth / social login | Deferred to V2. |
| Document versioning | Deferred to V2. |
| Document OCR / content search | Deferred to V2. |
| Per-asset permissions | Deferred to V2. |
| Group-level roles | Groups are data-organization only. No permission scoping by group in V1. |
| Multi-currency | INR only in V1. |
| Co-tenant leases | Single-tenant leases only in V1. |

---

## 8. Open Source Strategy

| Decision | Approach |
|---|---|
| License | AGPL-3.0 |
| Self-host | Open-source codebase first; packaged self-host deployment follows after hosted V1 stabilization |
| Advanced infra | Bring-your-own database and object storage are future documentation paths |
| Cloud hosted | Same codebase, deployment-mode configuration |
| Monetization | Cloud subscription for hosting, storage, backups, and support |
| Differentiation | Cloud = zero setup and managed operations. Self-host = operator-managed path delivered later. |

---

## 9. V1 Milestones

| Phase | Scope | Duration |
|---|---|---|
| **Phase 0** | App scaffold, core schema, auth/session foundation, storage abstraction, scheduler entrypoint, local dev setup | 1-2 weeks |
| **Phase 1** | Auth, roles (Admin/Viewer), invite flow, group management, person registry, audit log foundation | 2-3 weeks |
| **Phase 2** | Asset registry, ownership history, land/rental fields, document vault, search/filter | 2-3 weeks |
| **Phase 3** | Units, tenants, leases, move-in/out workflow | 2-3 weeks |
| **Phase 4** | Rent ledger, payment entry, overdue logic, receipts, rent reports | 2-3 weeks |
| **Phase 5** | Notifications, dashboard, exports, settings, README, hosted launch hardening | 2-3 weeks |

**Total V1: ~12-17 weeks solo, part-time.**

---

## 10. Module Dependency Map

Build order matters.

```
Platform Foundation ----------------------┐
  │                                       │
  ├── Auth and Roles ---------------------┤
  │         │                             │
  │         ├── Group Management          │
  │         │      │                      │
  │         │      └── Person Registry    │
  │         │             │               │
  │         │             └── Asset Registry
  │         │                    │
  │         │                    ├── Ownership History
  │         │                    ├── Document Vault
  │         │                    └── Rental Property
  │         │                           │
  │         │                           ├── Units
  │         │                           │    │
  │         │                           │    └── Tenants
  │         │                           │          │
  │         │                           │          └── Leases
  │         │                           │                │
  │         │                           │                ├── Monthly Charges
  │         │                           │                ├── Move-in / Move-out
  │         │                           │                └── Payments / Receipts
  │         │                           │
  │         └── Audit Log (cross-cutting, build early)
  │
  ├── Notifications (depends on leases, documents, tax/expiry fields)
  ├── Dashboard (depends on asset, lease, payment, notification, audit data)
  └── Exports and Reports (depends on payment + asset data)
```

---

*Document version: V1.4 - Revised Plan - April 2026*
