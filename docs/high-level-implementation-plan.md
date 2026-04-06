# PropertyVault — High-Level Implementation Plan

> Based on `docs/product-plan.md` and `docs/architecture.md`
>  
> Refined after review with Claude Opus 4.6, Claude Sonnet 4.6, and GPT-5.4.

## Goal

Turn the existing product scope and architecture into a planning-first rollout sequence that teams can use to organize delivery. This plan stays intentionally high level: it focuses on **phase order**, **module order**, and **feature order within each module**, without dropping into coding or implementation-task detail.

## Sequencing principles

1. Start with the **account boundary and operating rules** before building domain workflows.
2. Build **upstream records before dependent workflows**: people before ownership, assets before rental, leases before rent tracking.
3. Introduce **shared capabilities before the modules that rely on them**, especially auditability, document handling, search, and reminders.
4. Treat **rental management as a branch of the asset register**, not as a separate product track.
5. Leave **aggregation layers** such as dashboards, exports, and broad account controls until the underlying data is stable and trustworthy.

## Critical planning rules

- The **account** remains the hard isolation boundary for all data.
- **Admin** and **Viewer** are the only roles in V1.
- **Groups** are organizers only; they do not change permissions.
- **Ownership** must always resolve to a valid current state.
- A **unit** can have only one active lease at a time in V1.
- **Rent tracking** stays manual in V1.
- **Reminders** stay in-app in V1.
- **Cloud-hosted delivery** comes first; self-host follows after V1 stabilizes.

## Phase 0 — Foundation and operating model

**Sequence**
1. Confirm the V1 delivery boundary: hosted-first, single-account membership, two-role access, and strict out-of-scope guardrails.
2. Lock the core operating rules for account lifecycle, member lifecycle, soft delete / restore behavior, and account closure.
3. Define the privacy and trust baseline for sensitive person data, document access, and account-scoped activity history.
4. Establish shared foundations for document handling, indexed search, scheduled reminders, and account-wide auditability.
5. Align the product's timezone, reminder, and recurring-work behavior before date-driven features begin.

**Why this phase comes first**
This phase prevents downstream rework. It fixes the rules that every later module depends on: who belongs to the account, what can be seen or changed, what must be tracked, and how shared capabilities behave across the product.

## Phase 1 — Account and member access

**Sequence**
1. Sign up, sign in, and password reset.
2. Personal profile and core account preferences.
3. Member invite and join flow.
4. Role assignment and member management.
5. Session visibility and session control.

**Why this phase comes next**
No business record should appear before the system knows which account it belongs to and who is allowed to act on it.

## Phase 2 — Shared organization records

**Sequence**
1. Optional group creation and maintenance.
2. Person registry for owners, family members, and related contacts.
3. Person-to-group linking.
4. Group and person profile views.
5. Group and person list, filter, and search experiences.

**Why this phase comes next**
These are the shared reference records for the product. Ownership, asset organization, and many later workflows depend on them.

## Phase 3 — Asset register, ownership, and documents

**Sequence**
1. Base asset records, statuses, tags, and common asset details.
2. Land-specific and rental-property-specific detail branches.
3. Ownership assignment and current ownership visibility.
4. Ownership change history and transfer trail.
5. Document attachments, preview/download behavior, and expiry metadata.
6. Asset list, filter, search, and detail experiences.

**Why this phase comes next**
The asset register is the backbone of the product. Ownership and documents should arrive with it, not after it, because they are part of a complete property record and they feed later reminders, reviews, and rental workflows.

## Phase 4 — Rental operations foundation

**Sequence**
1. Unit management under rental assets.
2. Tenant registry and tenant record visibility.
3. Lease lifecycle: draft, activation, renewal, expiry, and termination.
4. Move-in checklist and move-out checklist.
5. Deposit settlement and end-of-lease reconciliation context.

**Why this phase comes next**
Rental operations depend on the asset branch already being stable. Finance should not begin until units, tenants, and leases have a clear lifecycle.

## Phase 5 — Rent tracking

**Sequence**
1. Expected monthly charges driven from lease terms.
2. Payment entry and payment history.
3. Allocation handling, partial payments, and advance handling.
4. Overdue visibility, running balances, and property-level rent summaries.
5. Receipt generation and payment confirmation outputs.

**Why this phase comes next**
This phase depends on a trustworthy lease lifecycle. It is where V1's manual rent model becomes operational, so it should stay focused on ledger-style rent tracking rather than expand into broader accounting.

## Phase 6 — Reminders and portfolio oversight

**Sequence**
1. Notification center and per-user read/dismiss behavior.
2. Asset-driven reminders: document expiry, EC expiry, and property tax due.
3. Lease-driven and rent-driven reminders: lease expiry and overdue rent.
4. Dashboard overview: portfolio value, asset mix, rent summary, vacant units, overdue tenants, and recent activity.

**Why this phase comes next**
Reminders depend on the earlier modules in different ways: some rely on asset and document data, others rely on lease and rent data. The dashboard also becomes useful only after the core records and workflows are already producing trustworthy signals.

## Phase 7 — Reporting, settings, and lifecycle controls

**Sequence**
1. Export and reporting outputs for assets, tenants, payments, and rent summaries.
2. Consolidated settings for account preferences, member management, and export access.
3. Account-wide audit browsing and review experiences.
4. Account deletion and other high-risk lifecycle controls.

**Why this phase comes last**
These are oversight and governance layers. They are most valuable once the rest of the product is already producing stable data and repeatable workflows.

## Dependency snapshot

- Account and access must be in place before any shared or business record.
- Groups and persons must exist before ownership can be modeled cleanly.
- Assets must exist before units, documents, reminders, and portfolio views can make sense.
- Units and tenants must exist before leases.
- Leases must exist before rent tracking.
- Asset and document metadata enable part of the reminder system; lease and rent data enable the rest.
- Dashboards, reports, settings, and audit review are downstream consumers of earlier modules.

## V1 guardrails and deferrals

Keep the first release disciplined:

- No multi-account switching
- No group-level or asset-level permission models
- No payment gateway
- No tenant portal
- No native mobile app
- No multilingual UI in V1
- No advanced accounting, tax tooling, or P&L workflows
- No OCR, document versioning, or document-content search
- No co-tenant lease model
- No self-host packaging on the critical path

## Recommended planning use

Use this document as the **delivery-sequencing plan**. For every phase, detailed planning should answer three questions before work starts:

1. What must already exist from earlier phases?
2. What is the minimum complete capability for this phase?
3. What should be explicitly deferred so the phase stays inside V1 scope?
