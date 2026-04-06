# PropertyVault — Design System

> Comprehensive design system reference for PropertyVault, a personal and family property asset management tool built for the Indian context.
>
> This document is the single source of truth for all visual design decisions, component patterns, and frontend conventions. Every UI implementation should reference this before writing markup.

---

## Table of Contents

1. [Design Philosophy & Principles](#1-design-philosophy--principles)
2. [Color System](#2-color-system)
3. [Typography System](#3-typography-system)
4. [Spacing & Layout System](#4-spacing--layout-system)
5. [Navigation & Information Architecture](#5-navigation--information-architecture)
6. [Component Patterns](#6-component-patterns)
7. [Animation & Motion Guidelines](#7-animation--motion-guidelines)
8. [Responsive Design](#8-responsive-design)
9. [Accessibility Standards](#9-accessibility-standards)
10. [Page-Level Design Patterns](#10-page-level-design-patterns)
11. [Icon & Imagery Guidelines](#11-icon--imagery-guidelines)
12. [Data Display Patterns](#12-data-display-patterns)
13. [Tailwind v4 + shadcn Configuration](#13-tailwind-v4--shadcn-configuration)

---

## 1. Design Philosophy & Principles

### Visual Philosophy

PropertyVault uses a **warm, grounded aesthetic** inspired by Indian earth tones — terracotta clay, cream handmade paper, warm sandstone, and aged wood. The visual language evokes the materiality of physical property documents: land deeds on thick paper, revenue stamps, and leather-bound ledgers. This isn't decoration — it signals that the tool is rooted in the real-world context of Indian property management.

The palette avoids the cold blue-gray clinical look of most SaaS tools. Instead, every surface feels warm and intentional. The result should feel like a **premium, trustworthy tool** that an Indian family would rely on for managing their most valuable assets.

### Core Design Principles

**1. Clarity over cleverness**
Every screen answers one question: "What am I looking at, and what can I do?" Labels are literal. Navigation is predictable. No hidden gestures, no mystery icons.

**2. Consistency is non-negotiable**
Same pattern, same place, every time. A status badge looks the same whether it's on a lease, a payment, or a tenant. A detail page always follows breadcrumb → header → tabs → content.

**3. Appropriate density**
Property management involves scanning tables of payments, tenants, and assets. The UI should be *comfortably dense* — not cramped, but not wastefully spacious. Tables are the primary data surface, not cards. White space is used to group, not to impress.

**4. Accessibility by default**
WCAG 2.1 AA minimum. Color is never the only indicator of status — always pair with icons or text. Focus rings are visible. Touch targets meet 44px minimum on mobile.

**5. Design for trust**
Financial data demands visual reliability. Numbers are always monospaced and right-aligned. Currency uses proper INR formatting. Destructive actions require explicit confirmation. Audit trails are visible. Nothing feels ambiguous or editable when it shouldn't be.

### Animation Philosophy

Animation serves exactly two purposes in PropertyVault:

1. **Spatial orientation** — helping the user understand where something came from or went (e.g., modal sliding in, sidebar collapsing)
2. **State feedback** — confirming that something happened (e.g., toast appearing, button press)

If an animation doesn't serve one of these, it doesn't exist. Property management is a task-oriented workflow. Users are checking rents, not admiring transitions.

### Trust Signals in the UI

- **Monospaced numbers** in all financial contexts — amounts, percentages, IDs
- **Explicit confirmation dialogs** for any destructive or irreversible action (delete, terminate lease, record payment)
- **Audit log visibility** — every entity detail page shows recent audit entries
- **Read-only visual distinction** — Viewer role sees the same layouts but with action buttons removed/disabled, not hidden. This prevents confusion about what's possible.
- **Append-only payment ledger** — payments can't be edited or deleted. The UI reflects this with no edit controls on payment records.

---

## 2. Color System

### Core Palette — CSS Custom Properties

The full token set, ready for `@theme` in Tailwind v4. Colors are specified as CSS hex values so Tailwind auto-generates utilities (e.g., `--color-success` → `bg-success`, `text-success`, `border-success`).

**Token architecture:** All authoritative tokens live in `@theme` as `--color-*`. A `:root` alias block (see Section 13) maps these to the bare names (`--background`, `--primary`, etc.) that shadcn components expect. Always use Tailwind utility classes in component code — never reference raw CSS variables inline.

```css
@theme {
  /* === Backgrounds === */
  --color-background: #FFFAF5;        /* Page background — warm off-white */
  --color-surface: #FFF3E8;           /* Cards, panels, table rows */
  --color-surface-hover: #FFEBD8;     /* Hovered cards, table rows */
  --color-surface-active: #FFE0C8;    /* Pressed/active surface */

  /* === Foreground (shadcn compatibility) === */
  --color-foreground: #3D2C2E;        /* Alias for --color-text; required by shadcn */

  /* === Borders === */
  --color-border: #E8D5C4;            /* Default borders, dividers */
  --color-border-strong: #D4B8A0;     /* Focused/active borders */

  /* === Primary (Terracotta) === */
  --color-primary: #C2705B;           /* Primary buttons, links, active nav */
  --color-primary-hover: #A85A47;     /* Primary hover */
  --color-primary-active: #934E3D;    /* Primary pressed */
  --color-primary-foreground: #FFFFFF; /* Text on primary */
  --color-primary-muted: #F0D5CB;     /* Light primary tint for backgrounds */

  /* === Secondary (Warm Gray-Brown) === */
  --color-secondary: #8B6F5E;         /* Secondary buttons, subdued actions */
  --color-secondary-hover: #755C4D;   /* Secondary hover */
  --color-secondary-foreground: #FFFFFF;

  /* === Text === */
  --color-text: #3D2C2E;              /* Primary body text */
  --color-text-muted: #7A6B63;        /* Secondary text, descriptions */
  --color-text-faint: #A89A91;        /* Placeholders, disabled text */

  /* === Semantic Status === */
  --color-success: #3D6E38;           /* Paid, active, success — darkened for text contrast */
  --color-success-foreground: #FFFFFF;
  --color-success-muted: #E8F0E6;     /* Success background tint */

  --color-warning: #846810;           /* Overdue, expiring, attention — darkened for text contrast */
  --color-warning-foreground: #FFFFFF;
  --color-warning-muted: #FBF3DB;     /* Warning background tint */

  --color-info: #336D90;              /* System info, neutral highlights — darkened for text contrast */
  --color-info-foreground: #FFFFFF;
  --color-info-muted: #E7F1F8;

  --color-destructive: #B54040;       /* Delete, error, terminated — darkened for text contrast */
  --color-destructive-hover: #9A3535;
  --color-destructive-foreground: #FFFFFF;
  --color-destructive-muted: #FCEAEA; /* Destructive background tint */

  /* === Accent === */
  --color-accent: #E8A87C;            /* Badges, highlights, categories */
  --color-accent-foreground: #3D2C2E;
  --color-accent-muted: #FDF0E6;      /* Accent background tint */

  /* === Neutral (for shadcn compatibility) === */
  --color-muted: #F5EDE5;             /* Muted backgrounds */
  --color-muted-foreground: #7A6B63;

  /* === Input & Ring === */
  --color-input: #E8D5C4;             /* Input borders */
  --color-ring: #C2705B;              /* Focus ring color */

  /* === Sidebar === */
  --color-sidebar: #FAF0E6;           /* Sidebar background */
  --color-sidebar-foreground: #3D2C2E;
  --color-sidebar-border: #E8D5C4;
  --color-sidebar-accent: #C2705B;    /* Active item indicator */
  --color-sidebar-accent-foreground: #C2705B;
  --color-sidebar-muted: #7A6B63;

  /* === Chart Colors (for Recharts) === */
  --color-chart-1: #C2705B;           /* Primary series — terracotta */
  --color-chart-2: #7BA075;           /* Secondary series — sage green */
  --color-chart-3: #E8A87C;           /* Tertiary — warm peach */
  --color-chart-4: #8B6F5E;           /* Quaternary — warm brown */
  --color-chart-5: #D4A017;           /* Quinary — gold */
  --color-chart-6: #6B9BC3;           /* Senary — muted blue (contrast) */
}
```

### Status Color Mapping

Status colors are used consistently across every entity type:

| Status | Color Token | Dot | Badge BG | Badge Text | Usage |
|---|---|---|---|---|---|
| Active / Paid / Success | `--color-success` | `bg-success` | `bg-success-muted` | `text-success` | Active leases, paid charges, active tenants |
| Pending / Draft | `--color-accent` | `bg-accent` | `bg-accent-muted` | `text-accent-foreground` | Draft leases, pending payments |
| Info / System | `--color-info` | `bg-info` | `bg-info-muted` | `text-info` | Informational banners, export ready, sync status |
| Warning / Overdue / Expiring | `--color-warning` | `bg-warning` | `bg-warning-muted` | `text-warning` | Overdue rent, expiring leases, approaching tax due dates |
| Error / Terminated / Failed | `--color-destructive` | `bg-destructive` | `bg-destructive-muted` | `text-destructive` | Terminated leases, failed operations, blacklisted tenants |
| Inactive / Past / Sold | `--color-text-muted` | `bg-text-muted` | `bg-muted` | `text-muted-foreground` | Past tenants, sold assets, expired leases |
| Disputed | `--color-warning` | `bg-warning` | `bg-warning-muted` | `text-warning` | Disputed assets |
| Partial | `--color-warning` | `bg-warning` | `bg-warning-muted` | `text-warning` | Partially paid monthly charges |

### Entity-Specific Status Badges

**Asset Status**
| Status | Color | Icon |
|---|---|---|
| `ACTIVE` | success | `CheckCircle2` |
| `SOLD` | text-muted | `MinusCircle` |
| `DISPUTED` | warning | `AlertTriangle` |

**Lease Status**
| Status | Color | Icon |
|---|---|---|
| `DRAFT` | accent | `FileEdit` |
| `ACTIVE` | success | `CheckCircle2` |
| `EXPIRED` | text-muted | `Clock` |
| `TERMINATED` | destructive | `XCircle` |

**Monthly Charge Status**
| Status | Color | Icon |
|---|---|---|
| `PENDING` | accent | `Clock` |
| `PARTIAL` | warning | `AlertCircle` |
| `PAID` | success | `CheckCircle2` |
| `OVERDUE` | destructive | `AlertTriangle` |

**Tenant Status**
| Status | Color | Icon |
|---|---|---|
| `ACTIVE` | success | `UserCheck` |
| `PAST` | text-muted | `UserMinus` |
| `BLACKLISTED` | destructive | `UserX` |

**Security Deposit Status**
| Status | Color | Icon |
|---|---|---|
| `RECEIVED` | success | `CheckCircle2` |
| `PENDING` | warning | `Clock` |
| `PARTIALLY_REFUNDED` | accent | `ArrowDownCircle` |
| `FULLY_REFUNDED` | text-muted | `ArrowDownCircle` |
| `FORFEITED` | destructive | `XCircle` |

### Data Visualization Colors

For Recharts dashboards, use `--color-chart-1` through `--color-chart-6` in order. These are chosen for:

- Sufficient contrast against the warm `#FFFAF5` background
- Distinguishable for common color-blindness types (deuteranopia, protanopia)
- Consistent with the app's warm palette without clashing

**Recharts color usage:**

```tsx
// Chart colors are intentionally brighter than semantic tokens — optimized for data viz.
const CHART_COLORS = [
  'var(--color-chart-1)', // #C2705B — primary metric
  'var(--color-chart-2)', // #7BA075 — secondary metric
  'var(--color-chart-3)', // #E8A87C — tertiary
  'var(--color-chart-4)', // #8B6F5E — quaternary
  'var(--color-chart-5)', // #D4A017 — quinary
  'var(--color-chart-6)', // #6B9BC3 — senary (blue contrast)
];
```

**Chart-specific rules:**
- Pie charts / donut: Use `chart-1` through `chart-5` max. More than 5 slices → group smallest into "Other" (use `text-muted`).
- Bar charts: Single series uses `chart-1`. Multi-series uses `chart-1`, `chart-2`, etc.
- Line charts: Primary line uses `chart-1` with 2px stroke. Secondary lines 1.5px stroke.
- Area charts: Fill at 20% opacity of the stroke color.

### Color Accessibility — Contrast Ratios

All text/background combinations must meet WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text and UI components). Ratios are computed against the final hex values above.

| Foreground | Background | Ratio | Pass (AA) |
|---|---|---|---|
| `--color-text` (#3D2C2E) | `--color-background` (#FFFAF5) | 12.7:1 | ✅ |
| `--color-text` (#3D2C2E) | `--color-surface` (#FFF3E8) | 12.0:1 | ✅ |
| `--color-text-muted` (#7A6B63) | `--color-background` (#FFFAF5) | 4.9:1 | ✅ |
| `--color-text-muted` (#7A6B63) | `--color-surface` (#FFF3E8) | 4.7:1 | ✅ |
| `--color-primary` (#C2705B) | `--color-background` (#FFFAF5) | 3.5:1 | ✅ UI components only (3:1) |
| `--color-primary-foreground` (#FFF) | `--color-primary` (#C2705B) | 3.6:1 | ✅ UI components / large text |
| `--color-primary-foreground` (#FFF) | `--color-primary-hover` (#A85A47) | 5.0:1 | ✅ |
| `--color-success` (#3D6E38) | `--color-success-muted` (#E8F0E6) | 5.2:1 | ✅ |
| `--color-success` (#3D6E38) | `--color-background` (#FFFAF5) | 5.8:1 | ✅ |
| `--color-warning` (#846810) | `--color-warning-muted` (#FBF3DB) | 4.8:1 | ✅ |
| `--color-warning` (#846810) | `--color-background` (#FFFAF5) | 5.1:1 | ✅ |
| `--color-info` (#336D90) | `--color-info-muted` (#E7F1F8) | 4.9:1 | ✅ |
| `--color-info` (#336D90) | `--color-background` (#FFFAF5) | 5.4:1 | ✅ |
| `--color-destructive` (#B54040) | `--color-destructive-muted` (#FCEAEA) | 4.8:1 | ✅ |
| `--color-destructive` (#B54040) | `--color-background` (#FFFAF5) | 5.4:1 | ✅ |

**Rules:**
- The primary terracotta on white is 3.6:1 — meets WCAG SC 1.4.11 for UI components (3:1 threshold). For primary-colored text links, use `--color-primary-hover` (#A85A47, 4.8:1) to meet the stricter text contrast requirement.
- All semantic status colors (success, warning, info, destructive) now pass AA (4.5:1+) when used as text on their respective muted backgrounds. This makes `text-success` on `bg-success-muted` safe in all contexts.
- Chart colors (Section 2, Chart Colors) are intentionally brighter than their semantic counterparts — they are optimized for visual distinction on chart backgrounds, not text readability.

### Dark Mode Token Structure (V2)

V1 ships light mode only. Token structure supports future dark mode by swapping CSS custom property values:

```css
/* Future: dark mode */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #1A1412;
    --color-surface: #241E1A;
    --color-surface-hover: #2E2622;
    --color-border: #3D332C;
    --color-border-strong: #5A4A3E;
    --color-text: #F0E8E0;
    --color-text-muted: #A89A91;
    --color-foreground: #F0E8E0;
    /* Primary and semantic colors adjust for dark backgrounds */
    --color-primary: #E08A72;
    --color-success: #6AAF64;
    --color-warning: #C9A830;
    --color-info: #6BACDA;
    --color-destructive: #E06060;
  }
}
```

No dark-mode implementation in V1. The token architecture ensures the switch is a CSS-only change.

---

## 3. Typography System

### Font Stack

```css
@theme {
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-heading: 'DM Sans', 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

**Loading strategy:** Google Fonts with `display=swap`. Preconnect to `fonts.googleapis.com` and `fonts.gstatic.com`. Load only required weights:
- DM Sans: 500, 600
- Inter: 400, 500
- JetBrains Mono: 500

### Complete Type Scale

| Token | Font | Weight | Size (px) | Size (rem) | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|---|---|
| `h1` | DM Sans | 600 | 32 | 2.0 | 1.2 (38px) | -0.02em | Page titles (Dashboard, Assets) |
| `h2` | DM Sans | 600 | 24 | 1.5 | 1.25 (30px) | -0.01em | Section headings within pages |
| `h3` | DM Sans | 500 | 20 | 1.25 | 1.3 (26px) | -0.01em | Card titles, tab section headings |
| `h4` | DM Sans | 500 | 18 | 1.125 | 1.35 (24px) | 0 | Subsection headings, dialog titles |
| `h5` | Inter | 500 | 16 | 1.0 | 1.4 (22px) | 0 | Form section headings, sidebar group labels |
| `h6` | Inter | 500 | 14 | 0.875 | 1.4 (20px) | 0.01em | Minor headings, table group labels |
| `body-lg` | Inter | 400 | 16 | 1.0 | 1.5 (24px) | 0 | Primary body text, descriptions |
| `body` | Inter | 400 | 14 | 0.875 | 1.5 (21px) | 0 | Default body text, table cells |
| `body-sm` | Inter | 400 | 13 | 0.8125 | 1.45 (19px) | 0 | Dense UI text, secondary info in tables |
| `label` | Inter | 500 | 14 | 0.875 | 1.4 (20px) | 0.01em | Form labels, filter labels |
| `label-sm` | Inter | 500 | 12 | 0.75 | 1.35 (16px) | 0.02em | Badge text, small labels |
| `caption` | Inter | 400 | 12 | 0.75 | 1.35 (16px) | 0.01em | Help text, timestamps, metadata |
| `overline` | Inter | 500 | 11 | 0.6875 | 1.4 (15px) | 0.08em | Uppercase section labels, category tags |
| `mono` | JetBrains Mono | 500 | 14 | 0.875 | 1.5 (21px) | 0 | Currency amounts, IDs, survey numbers |
| `mono-sm` | JetBrains Mono | 500 | 12 | 0.75 | 1.35 (16px) | 0 | Small amounts in tables, reference codes |

### Heading Usage Rules

- **h1**: One per page. The page title in the page header. Never inside a card.
- **h2**: Major sections within a page. Dashboard uses h2 for "Rent Summary", "Recent Activity", etc.
- **h3**: Card titles in dashboards, dialog titles, tab-panel section heads.
- **h4**: Used for subsections within a tab panel or form section headings.
- **h5–h6**: Sidebar group labels, minor structural labels. Use sparingly.

### Number & Currency Formatting

All financial values use `font-mono` (JetBrains Mono):

```tsx
// INR currency display — always use monospace
<span className="font-mono text-sm tabular-nums">₹12,45,000</span>

// Percentage display — ownership stakes
<span className="font-mono text-sm tabular-nums">33.33%</span>

// IDs and reference numbers
<span className="font-mono text-xs text-muted-foreground">PAY-2024-001234</span>
```

**Indian number system:** Use the `en-IN` locale for `Intl.NumberFormat`. This produces `12,45,000` (lakhs/crores) instead of `1,245,000`.

```ts
const formatINR = (amount: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
// → "₹12,45,000"
```

For amounts with paise (rare in rent context), use `maximumFractionDigits: 2`.

### Truncation & Overflow Rules

| Context | Behavior | Max Lines |
|---|---|---|
| Table cell (name/address) | `truncate` (single line, ellipsis) | 1 |
| Card title | `line-clamp-1` | 1 |
| Card description | `line-clamp-2` | 2 |
| Detail page heading | No truncation — full text | — |
| Breadcrumb segments | `truncate` with `max-w-[200px]` | 1 |
| Notification message | `line-clamp-2` in dropdown, full in page | 2 / — |

### Responsive Typography

| Token | Desktop (≥1024px) | Tablet (768–1023px) | Mobile (<768px) |
|---|---|---|---|
| `h1` | 32px | 28px | 24px |
| `h2` | 24px | 22px | 20px |
| `h3` | 20px | 18px | 18px |
| `body-lg` | 16px | 16px | 16px |
| `body` | 14px | 14px | 14px |

Only `h1` and `h2` reduce on smaller screens. Body text stays consistent for readability.

### Long Content Resilience

Property data frequently includes long strings — survey numbers, door numbers, file names, and full addresses. Apply these rules:

| Content Type | Strategy | Tailwind |
|---|---|---|
| Entity names in tables | Single-line truncate with ellipsis | `truncate` |
| Addresses in tables | Truncate to city/state | `truncate max-w-[200px]` |
| Addresses in detail pages | Full multi-line display | `break-words` |
| IDs / reference codes | Horizontal scroll within chip | `overflow-x-auto whitespace-nowrap` |
| Document filenames | Truncate with extension visible | `truncate` (middle-truncate in JS if needed) |
| Flex children with truncation | Prevent flex blowout | `min-w-0` on the flex child |

### RTL Readiness (V2)

V1 targets English and Indic languages (LTR). To avoid costly rewrites later:

- Prefer CSS logical properties where possible: `ms-4` (margin-inline-start) over `ml-4`.
- Align icons via flexbox (`gap-*`), not absolute `left`/`right` positioning.
- The sidebar active indicator (3px left border) should use `border-inline-start` in the CSS.

---

## 4. Spacing & Layout System

### Spacing Scale (4px Base Grid)

| Token | Value | Tailwind | Usage |
|---|---|---|---|
| `space-0` | 0px | `p-0` / `m-0` | Reset |
| `space-0.5` | 2px | `p-0.5` | Micro adjustments (badge padding) |
| `space-1` | 4px | `p-1` | Tight spacing (inline icon gap) |
| `space-1.5` | 6px | `p-1.5` | Button icon gap |
| `space-2` | 8px | `p-2` | Compact padding (badge, small cards) |
| `space-3` | 12px | `p-3` | Input padding, compact list items |
| `space-4` | 16px | `p-4` | Default section padding, card internal sections |
| `space-5` | 20px | `p-5` | Comfortable padding |
| `space-6` | 24px | `p-6` | Card padding, form group spacing |
| `space-8` | 32px | `p-8` | Page section vertical spacing |
| `space-10` | 40px | `p-10` | Large section gaps |
| `space-12` | 48px | `p-12` | Auth card padding |
| `space-16` | 64px | `p-16` | Page top/bottom padding |

### Page Layout Structure

```
┌─────────────────────────────────────────────────────┐
│                    Browser Viewport                   │
│ ┌──────────┬──────────────────────────────────────┐  │
│ │          │  Page Header (breadcrumb + title)     │  │
│ │          │  h-16 (64px) fixed top               │  │
│ │ Sidebar  ├──────────────────────────────────────┤  │
│ │          │                                      │  │
│ │ w-64     │  Main Content                        │  │
│ │ (256px)  │  max-w-7xl (1280px)                  │  │
│ │          │  mx-auto                             │  │
│ │ collapsed│  px-6 (24px gutters)                 │  │
│ │ w-16     │  py-6 (24px top/bottom)              │  │
│ │ (64px)   │                                      │  │
│ │          │                                      │  │
│ └──────────┴──────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

| Layout Element | Value | Notes |
|---|---|---|
| Sidebar width (expanded) | 256px (`w-64`) | Fixed on desktop |
| Sidebar width (collapsed) | 64px (`w-16`) | Icon-only mode |
| Top header height | 64px (`h-16`) | Contains breadcrumb + actions |
| Content max-width | 1280px (`max-w-7xl`) | Centered, prevents ultra-wide stretching |
| Content horizontal padding | 24px (`px-6`) | Both sides |
| Content vertical padding | 24px (`py-6`) | Top and bottom |
| Full-width breakpoint | Below 1536px, content fills available space | Above 1536px, content is centered |

### Card Internal Spacing

```
┌─────────────────────────────────┐
│ p-6 (24px)                      │
│  ┌─────────────────────────┐    │
│  │ Title (h3)              │    │
│  │ Description (caption)   │    │
│  │ gap-1 (4px) between     │    │
│  └─────────────────────────┘    │
│  ← mb-4 (16px) →               │
│  ┌─────────────────────────┐    │
│  │ Content area            │    │
│  └─────────────────────────┘    │
│  ← mt-4 (16px) →               │
│  ┌─────────────────────────┐    │
│  │ Footer actions          │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

- Card outer padding: `p-6` (24px)
- Title to description gap: `gap-1` (4px)
- Title block to content: `mb-4` (16px)
- Content to footer: `mt-4` (16px)
- Between cards in a grid: `gap-4` (16px) on mobile, `gap-6` (24px) on desktop

### Form Field Spacing

| Element | Spacing | Tailwind |
|---|---|---|
| Label to input | 6px | `mb-1.5` on label |
| Input to help text | 4px | `mt-1` |
| Input to error message | 4px | `mt-1` |
| Between form fields | 16px | `space-y-4` on form group |
| Between form sections | 32px | `space-y-8` |
| Form section heading to first field | 16px | `mb-4` on heading |

### Section Spacing Within Pages

| Context | Vertical Spacing | Tailwind |
|---|---|---|
| Page header to first content | 24px | `mb-6` |
| Between dashboard card rows | 24px | `gap-6` |
| Between table and filters | 16px | `mb-4` |
| Tab bar to tab content | 24px | `mt-6` on panel |
| Between sections in detail page | 32px | `space-y-8` |

### Responsive Breakpoints

| Name | Width | Tailwind Prefix | Usage |
|---|---|---|---|
| Mobile | < 640px | (default) | Single column, bottom nav |
| Small tablet | ≥ 640px | `sm:` | 2-column grids start |
| Tablet | ≥ 768px | `md:` | Sidebar overlay available |
| Desktop | ≥ 1024px | `lg:` | Persistent sidebar, full table view |
| Large desktop | ≥ 1280px | `xl:` | Wider content, 4-column dashboard grid |
| Ultra-wide | ≥ 1536px | `2xl:` | Content max-width cap |

---

## 5. Navigation & Information Architecture

### Sidebar Navigation — Detailed Specification

The sidebar is the primary navigation. It is always visible on desktop (≥1024px) and collapsible to icon-only mode.

**Sections and Items:**

```
┌────────────────────────┐
│ 🏠 PropertyVault       │  ← Logo + app name (collapses to icon)
│ ────────────────────── │
│                        │
│ OVERVIEW               │  ← Section label (overline text, uppercase)
│  📊 Dashboard          │
│                        │
│ PROPERTY               │
│  🏢 Assets             │
│  👤 Persons            │
│  👥 Groups             │
│                        │
│ RENTAL                 │
│  🏠 Units              │  (only visible when rental assets exist)
│  🧑‍💼 Tenants           │
│  📋 Leases             │
│                        │
│ FINANCE                │
│  💰 Payments           │
│  📄 Documents          │
│                        │
│ SYSTEM                 │
│  🔔 Notifications      │  (with unread badge)
│  📜 Audit Log          │
│  ⚙️ Settings           │
│                        │
│ ────────────────────── │
│ 👤 User avatar + name  │  ← Bottom: user info + logout
│  Collapse toggle       │
└────────────────────────┘
```

**Navigation item specification:**

| Property | Value |
|---|---|
| Item height | 40px |
| Icon size | 20px (Lucide, stroke 1.75) |
| Icon to label gap | 12px |
| Horizontal padding | 12px |
| Active indicator | 3px left border, `--color-primary` |
| Active background | `--color-primary-muted` (very subtle tint) |
| Active text color | `--color-primary` |
| Default text color | `--color-text-muted` |
| Hover background | `--color-surface-hover` |
| Section label style | `overline` (11px, 500 weight, uppercase, 0.08em spacing) |
| Section gap | 24px between groups |

**Sidebar icon mapping:**

| Navigation Item | Lucide Icon |
|---|---|
| Dashboard | `LayoutDashboard` |
| Assets | `Building2` |
| Persons | `Users` |
| Groups | `FolderTree` |
| Units | `DoorOpen` |
| Tenants | `UserCheck` |
| Leases | `FileText` |
| Payments | `IndianRupee` |
| Documents | `Files` |
| Notifications | `Bell` |
| Audit Log | `ScrollText` |
| Settings | `Settings` |

**Collapse behavior:**
- Toggle button at bottom of sidebar (icon: `PanelLeftClose` / `PanelLeftOpen`)
- Transition: 200ms ease-out
- Collapsed: icon-only, 64px wide, tooltips on hover showing label
- Section labels hidden when collapsed
- User info collapses to avatar only

### Breadcrumb Patterns

Breadcrumbs appear in the page header for all pages except Dashboard.

**Format:** `Home / Section / Entity Name / Sub-page`

| Page | Breadcrumb |
|---|---|
| Assets list | `Assets` |
| Asset detail | `Assets / Green Villa` |
| Asset units | `Assets / Green Villa / Units` |
| Unit detail | `Assets / Green Villa / Units / Unit 3` |
| Lease detail | `Leases / Lease #L-2024-045` |
| Lease payments | `Leases / Lease #L-2024-045 / Payments` |
| Person detail | `Persons / Rajesh Kumar` |
| Settings profile | `Settings / Profile` |

**Breadcrumb rules:**
- Each segment is a clickable link except the last (current page)
- Entity names truncate at 200px with ellipsis
- Maximum 4 segments. If deeper, collapse middle segments with `...`
- Home icon (`Home`, 16px) can optionally replace the first "Dashboard" text

### Page Header Pattern

Every page has a consistent header:

```
┌──────────────────────────────────────────────────────┐
│ Breadcrumb: Assets / Green Villa                      │
│                                                        │
│ ┌────────────────────────────────┐ ┌──────────────┐  │
│ │ h1: Green Villa                │ │ [Edit] [More] │  │
│ │ description: Rental property   │ │  action btns  │  │
│ │ in Adyar, Chennai             │ └──────────────┘  │
│ └────────────────────────────────┘                    │
└──────────────────────────────────────────────────────┘
```

| Element | Spec |
|---|---|
| Breadcrumb | `caption` style, `text-muted`, 8px below top edge |
| Title | `h1` (32px DM Sans 600) |
| Description | `body` (14px Inter), `text-muted`, 4px below title |
| Action buttons | Right-aligned, vertically centered with title |
| Bottom border | 1px `border-border`, full width, 16px below description |

### Tab Navigation (Detail Pages)

Detail pages use horizontal tabs for content sections:

**Asset detail tabs:** Overview | Ownership | Units | Documents | Audit Log
**Lease detail tabs:** Overview | Payments | Documents | Audit Log
**Person detail tabs:** Overview | Assets | Documents
**Tenant detail tabs:** Overview | Leases | Documents

| Property | Value |
|---|---|
| Tab height | 40px |
| Tab font | `label` (14px Inter 500) |
| Active tab | `text-primary`, 2px bottom border `border-primary` |
| Inactive tab | `text-muted-foreground`, no border |
| Hover | `text-foreground`, subtle background |
| Tab spacing | 0px (tabs touch), 24px horizontal padding each |
| Tab bar bottom border | 1px `border-border` |

### Command Palette (cmdk)

Opens with `⌘K` (Mac) / `Ctrl+K` (Windows/Linux).

**Categories (in order):**
1. **Recent** — Last 5 visited entities
2. **Navigation** — All sidebar destinations
3. **Assets** — Search by name, survey number, location
4. **Persons** — Search by name
5. **Tenants** — Search by name
6. **Leases** — Search by ID or tenant name
7. **Actions** — "Create Asset", "Record Payment", "Add Tenant", etc. (Admin only)

**Visual spec:**
- Modal overlay with backdrop blur
- Width: 560px, max-height: 400px
- Search input at top with `Search` icon
- Results grouped by category with section labels
- Each result: icon + primary text + secondary text (muted)
- Selected item: `bg-surface-hover` background
- Keyboard: `↑↓` to navigate, `Enter` to select, `Esc` to close

**Keyboard shortcuts (displayed in sidebar footer or help dialog):**

| Shortcut | Action |
|---|---|
| `⌘K` | Open command palette |
| `⌘/` | Focus search in current table |
| `⌘N` | Create new (context-dependent) |
| `Esc` | Close modal / command palette |

### Mobile Navigation

**Below 1024px:** Sidebar converts to an overlay (hamburger menu).

**Below 768px:** Consider a bottom tab bar with 5 key items:
- Dashboard, Assets, Tenants, Payments, More (→ opens sheet with remaining items)

| Property | Value |
|---|---|
| Bottom nav height | 56px + safe area inset |
| Icon size | 24px |
| Label font | 10px Inter 500 |
| Active color | `text-primary` |
| Inactive color | `text-muted-foreground` |

### Back Navigation

- Breadcrumbs serve as back navigation on desktop
- On mobile, a `←` back arrow appears in the page header, navigating to the parent route
- Browser back button is respected — all navigation uses standard URL routing (Next.js App Router)

---

## 6. Component Patterns

### Buttons

**Variants:**

| Variant | Background | Text | Border | Usage |
|---|---|---|---|---|
| `primary` | `bg-primary` | `text-primary-foreground` | none | Main CTAs: Save, Create, Record Payment |
| `secondary` | `bg-surface` | `text-secondary` | 1px `border-border` | Secondary actions: Cancel, Export, Filter |
| `outline` | transparent | `text-foreground` | 1px `border-border` | Tertiary: Edit, View Details |
| `ghost` | transparent | `text-muted-foreground` | none | Inline actions, icon-only buttons in tables |
| `destructive` | `bg-destructive` | `text-destructive-foreground` | none | Delete, Terminate, Remove |
| `link` | transparent | `text-primary` | none | Inline text links styled as buttons |

**Sizes:**

| Size | Height | Padding (H) | Font | Icon |
|---|---|---|---|---|
| `sm` | 32px | 12px | 13px | 16px |
| `default` | 36px | 16px | 14px | 18px |
| `lg` | 40px | 20px | 14px | 20px |
| `icon` | 36px | 0 (square) | — | 18px |
| `icon-sm` | 32px | 0 (square) | — | 16px |

**States:**

```
Default → Hover (darken 10%) → Active (darken 15%) → Disabled (opacity 50%, cursor not-allowed)
                                                     → Loading (spinner replaces icon, text stays)
```

**Loading state:** Replace leading icon with a 16px spinner (`Loader2` with `animate-spin`). Button text remains visible. Button is disabled during loading.

**Icon button pattern:**

```tsx
<Button variant="ghost" size="icon-sm">
  <MoreHorizontal className="h-4 w-4" />
</Button>
```

### Cards

**Standard Card:**
```
Border radius: rounded-lg (8px)
Border: 1px border-border
Background: bg-surface
Shadow: shadow-sm (0 1px 2px 0 rgb(0 0 0 / 0.05))
Padding: p-6
```

**Stat Card (Dashboard):**
```
┌──────────────────────┐
│ p-6                  │
│ Icon (20px, muted)   │
│ Label (caption)      │
│ Value (h2, mono)     │
│ Trend (caption, ↑↓)  │
└──────────────────────┘
```
- Value uses `font-mono tabular-nums` for financial numbers
- Trend indicator: green `↑` for positive, red `↓` for negative, gray `→` for flat

**Entity Card (for mobile card view of table data):**
```
┌──────────────────────────────────┐
│ p-4                              │
│ [Status badge]          [Menu ⋮] │
│ Title (h4)                       │
│ Subtitle (body-sm, muted)        │
│ ──────────── (border divider)    │
│ Key-value pairs (2-col grid)     │
│ label: value    label: value     │
└──────────────────────────────────┘
```

### Data Tables (TanStack Table v8)

**Visual specification:**

| Element | Spec |
|---|---|
| Header background | `bg-muted` (#F5EDE5) |
| Header text | `label-sm` (12px Inter 500, uppercase, `text-muted-foreground`) |
| Header height | 40px |
| Row height | 48px (default), 40px (compact mode) |
| Row background | `bg-surface` (odd), `bg-background` (even) — optional, may use uniform |
| Row hover | `bg-surface-hover` transition 100ms |
| Row selected | `bg-primary-muted` |
| Cell padding | 12px horizontal, 8px vertical |
| Border | 1px `border-border` between rows (horizontal only, no vertical borders) |
| Sort indicator | `ChevronUp` / `ChevronDown` (14px) next to header text |
| Selection checkbox | 18px, `accent-primary` when checked |

**Pagination:**
- Bottom of table, right-aligned
- Shows: "Showing 1–20 of 156 results"
- Page navigation: `«` `‹` `1 2 3 ... 8` `›` `»`
- Rows per page selector: 10, 20, 50

**Empty state (in-table):**
- Centered within the table body area
- Icon (48px, muted) + heading (h4) + description (body-sm, muted) + CTA button
- Example: `📋 No tenants yet — Add your first tenant to get started [+ Add Tenant]`

**Loading skeleton:**
- Match exact row structure with pulsing gray bars
- 5 skeleton rows by default
- Skeleton bar widths vary per column to look natural (name: 60%, status: 30%, date: 40%, amount: 25%)

**Inline actions (row-level):**
- Appear on hover or via `⋮` menu button always visible at row end
- Hover row actions: `Edit` and `Delete` as ghost icon buttons, appear on hover (desktop only)
- Menu actions: `⋮` (`MoreHorizontal`) button → dropdown with: View, Edit, Delete, plus entity-specific actions
- On mobile: always show the `⋮` menu, no hover actions

**Table toolbar (above table):**
```
┌──────────────────────────────────────────────────────┐
│ [🔍 Search...]  [Status ▾] [Type ▾]  │  [+ Create]  │
│                  Filters (left)       │  Actions (R)  │
└──────────────────────────────────────────────────────┘
```

### Forms

**Field layout:**

```
┌──────────────────────────────────┐
│ Label *                          │  ← label (14px Inter 500)
│ ┌──────────────────────────────┐ │     * for required fields (red)
│ │ Input value                  │ │  ← 6px gap from label
│ └──────────────────────────────┘ │
│ Help text or error message       │  ← 4px gap from input
└──────────────────────────────────┘     caption (12px), muted or destructive
```

**Form input styles:**

| Property | Value |
|---|---|
| Height | 36px (default), 40px (lg) |
| Border | 1px `border-input` |
| Border radius | `rounded-md` (6px) |
| Background | `bg-background` |
| Text | `body` (14px Inter 400) |
| Placeholder | `text-text-faint` |
| Focus | `border-border-strong` + `ring-ring` 2px with 50% opacity |
| Error | `border-destructive`, error message below in `text-destructive` |
| Disabled | `bg-muted`, 50% opacity |
| Padding | 12px horizontal, 8px vertical |

**Required field indicator:** Red asterisk `*` after label text. Screen reader text: "required".

**Form sections:**

```tsx
<div className="space-y-8">
  {/* Section 1 */}
  <div>
    <h5 className="text-base font-medium mb-4">Property Details</h5>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Fields */}
    </div>
  </div>

  {/* Section 2 */}
  <div>
    <h5 className="text-base font-medium mb-4">Location</h5>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Fields */}
    </div>
  </div>
</div>
```

**Form action bar:**
```
┌──────────────────────────────────────────────────────┐
│                              [Cancel]  [Save Asset]  │
│                              secondary    primary     │
└──────────────────────────────────────────────────────┘
```
- Sticky at bottom on long forms (below `md:` breakpoint)
- `gap-3` between buttons
- Save button shows loading spinner during submission

**Unsaved changes warning:** If a form has unsaved changes and the user navigates away, show a confirmation dialog: "You have unsaved changes. Are you sure you want to leave?"

### Modals / Dialogs

**Size variants:**

| Size | Width | Usage |
|---|---|---|
| `sm` | 400px | Confirmation dialogs, simple prompts |
| `default` | 560px | Quick-create forms (add tenant, record payment) |
| `lg` | 720px | Complex forms with multiple sections |
| `xl` | 900px | Document preview, detailed views |
| `full` | 100% - 48px margins | Mobile full-screen dialogs |

**Confirmation dialog pattern:**

```
┌──────────────────────────────────┐
│ p-6                              │
│ ⚠️ Delete Tenant?                │  ← h4 + warning icon
│                                  │
│ This will permanently remove     │  ← body, text-muted
│ Rajesh Kumar and all associated  │
│ records. This cannot be undone.  │
│                                  │
│              [Cancel] [Delete]   │  ← secondary + destructive
└──────────────────────────────────┘
```

**Close behavior:**
- `X` button in top-right corner (always present)
- `Esc` key closes the dialog
- Clicking backdrop closes *non-form* dialogs. Form dialogs require explicit close/cancel to prevent accidental data loss.
- Focus is trapped within the dialog

### Badges / Status Indicators

**Badge component:**

```tsx
<Badge variant="success">Active</Badge>
<Badge variant="warning">Overdue</Badge>
<Badge variant="destructive">Terminated</Badge>
<Badge variant="default">Draft</Badge>
<Badge variant="muted">Past</Badge>
```

**Badge spec:**
- Height: 22px
- Padding: 6px horizontal, 2px vertical
- Font: `label-sm` (12px Inter 500)
- Border radius: `rounded-full` (9999px)
- Icon (optional): 12px, before text, 4px gap

**Status dot pattern (compact):**

```tsx
<div className="flex items-center gap-2">
  <div className="h-2 w-2 rounded-full bg-success" />
  <span className="text-sm">Active</span>
</div>
```

Used in table cells where a full badge would be too heavy.

### Toasts (Sonner)

| Type | Icon | Border-left color | Usage |
|---|---|---|---|
| Success | `CheckCircle2` | `--color-success` | "Payment recorded successfully" |
| Error | `XCircle` | `--color-destructive` | "Failed to save asset" |
| Warning | `AlertTriangle` | `--color-warning` | "Lease expiring in 7 days" |
| Info | `Info` | `--color-info` | "Export ready for download" |

**Toast spec:**
- Position: bottom-right
- Width: 356px
- Duration: 4000ms (success), 6000ms (error), 5000ms (warning/info)
- Background: `bg-surface`
- Border: 1px `border-border`
- Left accent border: 3px, type-specific color
- Dismissible: swipe right or click `X`
- Stack: max 3 visible, newest on top

### Dropdowns & Menus

**Action menu (row-level `⋮`):**

```
┌──────────────────┐
│ 👁 View Details   │
│ ✏️ Edit           │
│ ─────────────── │  ← separator
│ 🗑 Delete         │  ← destructive text color
└──────────────────┘
```

| Property | Value |
|---|---|
| Min width | 180px |
| Item height | 36px |
| Item padding | 8px 12px |
| Icon size | 16px |
| Icon to label gap | 8px |
| Hover background | `bg-surface-hover` |
| Separator | 1px `border-border`, 4px vertical margin |
| Border radius | `rounded-md` (6px) |
| Shadow | `shadow-md` |

**Filter dropdowns:**
- Use `Popover` + `Command` (cmdk) for searchable selects
- Checkbox-style multi-select for status filters
- "Clear all" button at bottom when filters are active
- Active filter count shown as badge on filter button

### Search

**Global search (cmdk):** See Command Palette section above.

**Inline table search:**
- Input with `Search` icon prefix
- Placeholder: "Search assets..." (context-specific)
- Debounced: 300ms
- Clears with `X` button when has value
- Updates `?q=` URL parameter via nuqs for shareable/bookmarkable state

### File Upload (react-dropzone)

**Dropzone styling:**

```
┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│                               │  Dashed 2px border, border-border
│     📤 Upload icon (32px)    │  Background: bg-background
│                               │
│  Drop files here or browse   │  body text, --text
│  PDF, JPG, PNG up to 10MB   │  caption, --text-muted
│                               │
└─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘

Drag-over state:
  Border: 2px solid border-primary
  Background: bg-primary-muted
```

**Upload progress:**

```
┌──────────────────────────────────────┐
│ 📄 lease-agreement.pdf     ✕ Remove │
│ ████████████░░░░░░░░░░  65%         │
│ 1.2 MB of 1.8 MB                    │
└──────────────────────────────────────┘
```

**File type icons:**

| Type | Icon |
|---|---|
| PDF | `FileText` (red tint) |
| Image (JPG/PNG) | `Image` (blue tint) |
| DOCX | `FileText` (blue tint) |
| Spreadsheet | `FileSpreadsheet` (green tint) |
| Other | `File` (gray) |

### Empty States

**Structure:**

```
┌──────────────────────────────────────┐
│           (centered, max-w-sm)       │
│                                      │
│          [Illustration/Icon]         │  48px icon, --text-muted
│                                      │
│          No tenants yet              │  h3 (20px DM Sans 500)
│                                      │
│    Add your first tenant to start    │  body-sm, --text-muted
│    managing your rental properties   │  max 2 lines
│                                      │
│         [+ Add Tenant]               │  primary button
│                                      │
└──────────────────────────────────────┘
```

**Per-module empty states:**

| Module | Icon | Heading | CTA |
|---|---|---|---|
| Assets | `Building2` | No assets yet | + Add Asset |
| Persons | `Users` | No persons added | + Add Person |
| Groups | `FolderTree` | No groups created | + Create Group |
| Tenants | `UserCheck` | No tenants yet | + Add Tenant |
| Leases | `FileText` | No leases | + Create Lease |
| Payments | `IndianRupee` | No payments recorded | + Record Payment |
| Documents | `Files` | No documents | + Upload Document |
| Notifications | `Bell` | You're all caught up | (no CTA) |
| Audit Log | `ScrollText` | No activity yet | (no CTA) |

### Loading States — Skeletons

Skeletons match the layout of the content they replace. Use Tailwind's `animate-pulse` with `bg-muted` rounded bars.

**Table skeleton:**

```
┌────────────────────────────────────────────────┐
│ [████████] [████] [██████████] [████] [██]     │  ← header
│──────────────────────────────────────────────── │
│ [██████████] [███] [████████] [█████] [██]     │
│ [████████] [████] [██████████████] [███] [██]  │
│ [████████████] [██] [████████] [████] [██]     │
│ [██████] [█████] [██████████] [████] [██]      │
│ [████████████] [███] [████████] [█████] [██]   │
└────────────────────────────────────────────────┘
```

- 5 rows for table skeletons
- Bar widths randomized within range per column
- Skeleton bar heights: 12px for text, 22px for badges, 20px for icons

**Card skeleton (dashboard stat):**

```
┌──────────────────┐
│ [██] small icon   │
│ [████████]  label │
│ [████████████]  $ │
│ [████]   trend    │
└──────────────────┘
```

**Detail page skeleton:** Match the tab layout: skeleton for breadcrumb (1 bar), title (1 bar, wider), description (1 bar, medium), tab bar (4 short bars), and content area (varies).

### Notification Bell

**Bell icon in header/sidebar:**

```tsx
<div className="relative">
  <Bell className="h-5 w-5" />
  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-destructive
                     text-[10px] font-medium text-destructive-foreground
                     flex items-center justify-center px-1">
      {unreadCount > 99 ? '99+' : unreadCount}
    </span>
  )}
</div>
```

**Notification dropdown panel:**

```
┌──────────────────────────────────┐
│ Notifications          Mark all  │  ← header with action
│ ──────────────────────────────── │
│ 🔴 Rent overdue for Unit 3      │  ← unread (bold, dot indicator)
│    Green Villa · 2 hours ago     │
│ ──────────────────────────────── │
│    Lease expiring: Rajesh Kumar  │  ← read (normal weight)
│    Maple Apartments · Yesterday  │
│ ──────────────────────────────── │
│ ⋮  more items                    │
│ ──────────────────────────────── │
│ View all notifications →         │  ← link to /notifications
└──────────────────────────────────┘
```

| Property | Value |
|---|---|
| Dropdown width | 380px |
| Max height | 480px (scrollable) |
| Item padding | 12px 16px |
| Unread indicator | 8px colored dot (left side) matching notification type |
| Timestamp | `caption` style, `text-text-faint` |
| Dividers | 1px `border-border` |

### Component State Matrix

Every interactive component must define these states. Missing states cause visual bugs and accessibility regressions.

| State | Visual Treatment | Notes |
|---|---|---|
| Default | Base styling | — |
| Hover | Darken background 10% or swap to hover token | Desktop only; no hover on touch |
| Active/Pressed | Darken 15%, optional `scale-[0.98]` | — |
| Focus-visible | 2px `--color-ring` outline, 2px offset | Keyboard only (`:focus-visible`) |
| Disabled | 50% opacity, `cursor-not-allowed`, `aria-disabled` | Remove from tab order if non-focusable |
| Loading | Spinner replaces leading icon, label stays visible, interaction disabled | Never change layout width |
| Error | `--color-destructive` border + icon + message | Never rely on red border alone |
| Selected/Checked | `--color-primary-muted` background + check icon | Don't use background tint only |

### Form Error Summary

When a form has ≥ 2 validation errors on submit, show an error summary above the form:

```tsx
<div role="alert" aria-live="polite"
  className="rounded-md border border-destructive/30 bg-destructive-muted p-4">
  <p className="font-medium text-destructive">Please fix the highlighted fields:</p>
  <ul className="mt-2 list-disc pl-5 text-sm text-destructive">
    <li><a href="#field-name" className="underline">Property name is required</a></li>
    <li><a href="#field-pin" className="underline">Pincode must be 6 digits</a></li>
  </ul>
</div>
```

Each `<a>` scrolls to and focuses the corresponding field.

### Alert / Inline Banner

For page-level messages (fetch failures, offline state, success confirmations):

```tsx
<div className="flex items-start gap-3 rounded-md border px-4 py-3"
  role="status">
  <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
  <div>
    <p className="text-sm font-medium">Couldn't load payments</p>
    <p className="text-sm text-muted-foreground">Check your connection and try again.</p>
  </div>
  <Button variant="outline" size="sm" className="ml-auto shrink-0">Retry</Button>
</div>
```

Variants follow semantic colors: `border-destructive/30 bg-destructive-muted` for errors, `border-warning/30 bg-warning-muted` for warnings, `border-info/30 bg-info-muted` for informational, `border-success/30 bg-success-muted` for success.

### Additional Required Components

These components should be in the shadcn/ui set for PropertyVault:

1. **Sheet / Drawer** — Mobile filter panels, row action menus, entity quick view.
2. **Combobox / Searchable Select** (Radix + cmdk) — Asset picker, person picker, city/state selection.
3. **Date Picker & Range Picker** — Audit log filters, lease date ranges. Must support keyboard nav and `dd/MM/yyyy` input format.
4. **Inline Editable vs. Read-Only** — Read-only values must never look like editable inputs. Use plain text with `text-muted-foreground` label above.

### Empty vs. No Results (Distinct Patterns)

**Empty state** (nothing exists yet): Use onboarding tone with primary CTA. See the per-module empty states table above.

**No results** (data exists but filter/search returned none):

```
┌──────────────────────────────────────┐
│           (centered, max-w-sm)       │
│                                      │
│          [Search icon, 48px]         │
│                                      │
│     No results for "Adyar"          │  h4
│                                      │
│     Try adjusting your filters or    │  body-sm, muted
│     clearing your search term.       │
│                                      │
│    [Clear filters]  [Reset search]   │  outline buttons
│                                      │
└──────────────────────────────────────┘
```

### Offline & Network State Patterns

Property data is high-trust — users must know if they're seeing stale data.

**Offline banner** (persistent, top of viewport below header):
- Trigger: `navigator.onLine === false`
- Style: `bg-warning-muted text-warning`, full-width, `py-2 px-4`
- Copy: "You're offline. Showing last saved data."
- Dismiss: not dismissible while offline; auto-hides when connection restores

**"Last synced" timestamp** (list pages and detail headers):
- Display in page header metadata: `Last synced: 15 Mar 2025, 2:30 PM`
- If stale > 15 min: append an `Info` badge: "Stale — pull to refresh"

**Retry semantics:**
- Idempotent GETs: auto-retry 1–2× with exponential backoff, then show inline banner with manual Retry button.
- Mutating POSTs (payments, deletes): never silently retry. Show explicit "Try again" button. Ensure server-side idempotency keys.

---

## 7. Animation & Motion Guidelines

### Core Principle

**SUBTLE. FUNCTIONAL. FAST.** Animations in PropertyVault exist only to provide spatial orientation and state feedback. The app manages financial data — it should feel responsive and reliable, not playful.

### Animation Reference Table

| Animation | Duration | Easing | CSS/JS | Implementation |
|---|---|---|---|---|
| Button hover | 150ms | `ease` | CSS | `transition-colors duration-150` |
| Button press | 100ms | `ease-in` | CSS | `active:scale-[0.98]` (subtle press) |
| Card hover | 150ms | `ease` | CSS | `transition-colors duration-150` (background only) |
| Table row hover | 100ms | `ease` | CSS | `transition-colors duration-100` |
| Sidebar collapse/expand | 200ms | `ease-out` | CSS | Use `transition-[width] duration-200 ease-out` on desktop; prefer off-canvas `translateX` on mobile overlay |
| Modal open | 200ms | `ease-out` | CSS | Fade in + scale from 0.95 to 1.0 |
| Modal close | 150ms | `ease-in` | CSS | Fade out + scale from 1.0 to 0.95 |
| Modal backdrop | 200ms | `ease-out` | CSS | Opacity 0 → 0.5 |
| Toast entrance | 300ms | `cubic-bezier(0.21, 1.02, 0.73, 1)` | JS (Sonner) | Slide up + fade in |
| Toast exit | 200ms | `ease-in` | JS (Sonner) | Slide right + fade out |
| Dropdown/Popover open | 150ms | `ease-out` | CSS | Fade in + translateY(-4px → 0) |
| Dropdown/Popover close | 100ms | `ease-in` | CSS | Fade out + translateY(0 → -4px) |
| Command palette open | 200ms | `ease-out` | CSS | Fade + scale from 0.95 |
| Command palette close | 150ms | `ease-in` | CSS | Fade + scale to 0.95 |
| Skeleton pulse | 2000ms | `ease-in-out` | CSS | `animate-pulse` (Tailwind built-in) |
| Loading spinner | 750ms | `linear` | CSS | `animate-spin` (Tailwind built-in) |
| Status badge change | 200ms | `ease` | CSS | `transition-colors duration-200` |
| Focus ring | 0ms (instant) | — | CSS | No transition on focus rings — immediate |
| Page route change | 0ms | — | — | No page transition animation. Instant swap. |

### Animations to AVOID

| Animation | Why Not |
|---|---|
| Page transitions (slide/fade between routes) | Adds perceived latency. Property management is a task-driven workflow. Users navigate frequently — transitions slow them down. |
| Staggered list animations (items appearing one by one) | Delays content visibility. When a user loads the tenants list, they want to see all tenants immediately. |
| Parallax scrolling | Decorative, not functional. Doesn't serve any UX clarity purpose. |
| Bouncy/spring physics | Too playful for financial software. Undermines trust. |
| Auto-playing number count-up on dashboard metrics | Delays comprehension. Show the number immediately. |
| Skeleton-to-content morph | Complex to implement, marginal UX benefit. Simple skeleton → instant content swap is fine. |
| Table row reorder animations | TanStack Table pagination swaps content; animating each row adds complexity and jank. |

### Reduced Motion

Respect `prefers-reduced-motion: reduce`:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

When reduced motion is active:
- All transitions become instant
- `animate-pulse` on skeletons still runs (very subtle, non-distracting)
- `animate-spin` on loaders still runs (functional necessity)
- Modals appear/disappear instantly (no scale/fade)
- Toasts appear instantly without slide

### CSS vs. JS Animation Decision Tree

```
Is it a simple state change (hover, focus, background)? → CSS transition
Is it a presence animation (mount/unmount)? → CSS if possible (display + opacity), 
                                               or Sonner/Radix built-in
Does it need physics or spring dynamics? → Don't use it in PropertyVault
Is it scroll-linked? → Don't use it in PropertyVault
```

**Rule:** All animations in V1 should be achievable with CSS transitions and Tailwind's built-in animation utilities. No JS animation library (framer-motion, react-spring) is in the stack and none should be added.

### Motion Tokens

Define reusable duration and easing values in `:root` (these are non-color values, so they live outside `@theme`):

```css
:root {
  --duration-fast: 100ms;
  --duration-base: 150ms;
  --duration-slow: 200ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
}
```

### Motion Guardrails

- **Never use `transition-all`** on containers — it animates layout properties (width, height, padding) and causes jank. Specify exact properties: `transition-colors`, `transition-opacity`, `transition-[width]`.
- Prefer `opacity` and `transform` for animations — these are GPU-composited and skip layout/paint.
- Under `prefers-reduced-motion`, also disable the `active:scale-[0.98]` button press effect.

---

## 8. Responsive Design

### Strategy: Desktop-First

PropertyVault is primarily a desktop application — property management involves tables, forms, and multi-panel views. Design desktop first, then adapt for smaller screens.

Mobile is supported but treated as a consumption/quick-check interface, not a primary workflow surface.

### Breakpoint Behavior Summary

| Breakpoint | Sidebar | Tables | Forms | Dashboard Grid |
|---|---|---|---|---|
| ≥1280px (xl) | Persistent, expanded | Full table | 2-column grid | 4 stat cards per row |
| ≥1024px (lg) | Persistent, collapsible | Full table | 2-column grid | 3 stat cards per row |
| ≥768px (md) | Overlay (hamburger) | Full table with horizontal scroll | 2-column grid | 2 stat cards per row |
| ≥640px (sm) | Hidden (hamburger) | Card view OR horizontal scroll | 1-column stacked | 2 stat cards per row |
| <640px | Hidden (hamburger or bottom nav) | Card view | 1-column stacked | 1 stat card per row |

### Touch Target Sizes

| Element | Minimum Size | Notes |
|---|---|---|
| Buttons | 44px × 44px | Applies to tap area, not visual size |
| Table row action buttons | 44px × 44px | Increase padding on mobile |
| Sidebar nav items | 44px height | Already 40px, increase on touch |
| Checkbox | 44px × 44px tap area | Visual checkbox can be smaller |
| Tab navigation | 44px height | Increase from desktop 40px |

### Sidebar Responsive Behavior

| Viewport | Behavior |
|---|---|
| ≥1024px (lg) | Persistent, can be collapsed to icon-only (64px). State persisted in localStorage. |
| 768px–1023px (md) | Hidden by default. Hamburger icon in top-left. Opens as overlay with backdrop. Closes on navigation or backdrop click. |
| <768px | Same overlay behavior. Consider bottom tab bar for top 5 navigation items. |

### Table Responsiveness

**Option A — Horizontal scroll (default for complex tables):**
- Table maintains its structure
- Container gets `overflow-x-auto`
- First column (name/entity) is sticky: `sticky left-0 bg-surface z-10`
- Indicated by a subtle fade/shadow on the right edge

**Option B — Card view (for simple entity lists on mobile):**
- Each row becomes an Entity Card (see Card patterns above)
- Toggle between Table and Card view with a `LayoutGrid` / `Table2` icon button
- Card view is the default below 640px

**Decision per module:**

| Module | Mobile Default |
|---|---|
| Assets list | Card view |
| Tenants list | Card view |
| Leases list | Card view |
| Payments list | Horizontal scroll table (amounts need columns) |
| Audit log | Card view (timeline style) |
| Documents | Card/grid view |

### Mobile Data Table Specification

#### Column Priority Strategy

For each table, assign columns to three tiers:

1. **Primary identifier** — always visible, sticky in scroll mode (entity name, ID)
2. **Secondary metadata** — visible in card mode, wraps/stacks (status, amount, date)
3. **Optional columns** — hidden on mobile (created by, notes, secondary dates)

#### Mobile Row Card Layout (default below 640px)

```
┌──────────────────────────────────┐
│ Green Villa             [⋮]      │  ← primary identifier + action menu
│ Adyar, Chennai · ACTIVE          │  ← secondary: location + status dot+label
│ ₹25,000 due · 15 Mar 2025        │  ← secondary: amount (mono) + date
└──────────────────────────────────┘
```

- `⋮` menu is always visible (no hover-reveal on touch).
- Status uses dot + label, not full badge.
- Amounts use `font-mono tabular-nums`.
- Entire card is tappable — navigates to detail page.

#### Mobile Filter Sheet

On mobile, filter controls open in a **Sheet** (bottom drawer):

```
┌──────────────────────────────────┐
│ Filters                    [✕]  │
│ ──────────────────────────────── │
│ 🔍 Search...                     │
│ Status: [Active] [Overdue] ...   │  ← multi-select chips
│ Date range: [From] → [To]        │
│ ──────────────────────────────── │
│ [Clear all]          [Apply]     │
└──────────────────────────────────┘
```

Applied filters show as removable chips **above** the card list.

#### Mobile Bulk Actions

If bulk actions are needed on mobile:
1. Add a "Select" toggle button to the table toolbar.
2. When active, each card shows a leading checkbox.
3. A sticky bottom action bar appears with the bulk actions and a count: "3 selected — [Delete] [Export]".

### Form Layout at Breakpoints

| Breakpoint | Layout |
|---|---|
| ≥768px (md) | 2-column grid (`grid-cols-2`), full-width fields span 2 cols |
| <768px | Single column stack |
| Form actions | Sticky at bottom on mobile, inline at bottom on desktop |

---

## 9. Accessibility Standards

### WCAG 2.1 AA Compliance Targets

- **Color contrast:** 4.5:1 for normal text, 3:1 for large text and UI components
- **Focus visible:** All interactive elements have visible focus indicators
- **Keyboard operable:** All functionality accessible via keyboard
- **Screen reader:** All content conveys meaning without visual presentation
- **Motion:** Respect `prefers-reduced-motion`
- **Reflow:** Content usable at 320px width without horizontal scroll (on non-table pages)

### Skip Link

Add a skip link as the first focusable element in the app shell:

```tsx
<a href="#main"
  className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2
             z-50 rounded-md border border-border bg-surface p-2 text-sm font-medium">
  Skip to content
</a>
```

The `#main` target should be on the `<main>` element wrapping the page content area.

### Focus Ring Styling

```css
/* Global focus ring — visible on keyboard focus only */
:focus-visible {
  outline: 2px solid var(--color-ring);          /* --primary (#C2705B) */
  outline-offset: 2px;
  border-radius: inherit;
}

/* Remove outline on mouse focus */
:focus:not(:focus-visible) {
  outline: none;
}
```

Tailwind utility: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`

**Focus ring color on dark backgrounds:** Use white (`text-primary-foreground`) ring for elements on primary-colored backgrounds (e.g., inside a filled button).

### Keyboard Navigation Patterns

| Component | Keys | Behavior |
|---|---|---|
| Sidebar nav | `Tab` / `↑↓` | Tab into sidebar, arrow keys between items |
| Tabs | `←→` | Switch between tabs, `Tab` into tab content |
| Data table | `Tab` → row, `Enter` → action | Focus moves through actionable cells |
| Dropdown menu | `↑↓` to navigate, `Enter` to select, `Esc` to close | Standard listbox pattern |
| Modal/Dialog | `Tab` trapped within, `Esc` to close | Focus trap, return focus on close |
| Command palette | `↑↓` to navigate, `Enter` to select, `Esc` to close | Type to filter, arrow to move |
| Toasts | `Tab` to focus, `Enter`/`Delete` to dismiss | Auto-dismiss pauses on hover/focus |
| Form fields | `Tab` between fields, `Enter` to submit | Standard form navigation |

### Screen Reader Considerations

**Tables:**
- Use semantic `<table>`, `<thead>`, `<tbody>`, `<th scope="col">` elements
- Sort-active column: `aria-sort="ascending"` / `"descending"`
- Selection state: `aria-selected="true"` on selected rows
- Pagination: `aria-label="Pagination"`, `aria-current="page"` on current page

**Forms:**
- Every input has an associated `<label>` with `htmlFor`
- Error messages linked via `aria-describedby`
- Required fields: `aria-required="true"` and `required` attribute
- Error state: `aria-invalid="true"` when validation fails
- Form groups: `<fieldset>` + `<legend>` for related fields

**Notifications:**
- Notification bell: `aria-label="Notifications, 3 unread"` (dynamic count)
- Toast notifications: `role="status"` for success/info, `role="alert"` for errors
- Notification dropdown: `role="dialog"`, `aria-label="Notifications"`

**Modals:**
- `role="dialog"`, `aria-modal="true"`
- `aria-labelledby` pointing to dialog title
- `aria-describedby` pointing to dialog description
- Focus trap active while open
- Return focus to trigger element on close
- Confirmation dialogs: focus the primary action button (or cancel for destructive actions)

**Toasts / Live Regions:**
- Success and info toasts: `role="status"`, `aria-live="polite"`
- Error and warning toasts: `role="alert"`, `aria-live="assertive"`
- All toasts must be dismissible via keyboard (`Tab` to focus, `Enter`/`Delete` to dismiss)
- Auto-dismiss timer pauses on hover and keyboard focus

**Menus and Comboboxes (Radix-based):**
- Arrow key navigation between items
- `Enter` to select, `Esc` to close
- Active option must have a visible focus style (not just background color)
- Empty-state item ("No results") when search/filter returns nothing — must be non-selectable

**Charts (Recharts):**
- Provide a visually-hidden data table as a fallback for screen readers on critical charts
- Legends must be keyboard-reachable
- Tooltip values must be available as accessible text (not canvas-only)

**Status badges:**
- Include icon + text, not color alone
- `aria-label` on icon-only status indicators: `aria-label="Status: Active"`

### Color-Blind Safe Design

**Rule:** Color is NEVER the only indicator of status.

Every status uses: **color + icon + text label**

| Status | Color | Icon | Label |
|---|---|---|---|
| Active | Green dot | `CheckCircle2` | "Active" |
| Overdue | Yellow dot | `AlertTriangle` | "Overdue" |
| Terminated | Red dot | `XCircle` | "Terminated" |
| Draft | Peach dot | `FileEdit` | "Draft" |

Chart accessibility:
- Recharts tooltips show exact values (not just color-coded)
- Pie chart slices have distinct patterns (optional V2) or rely on labeled legends
- Legends always accompany charts — never rely on color alone to identify series

---

## 10. Page-Level Design Patterns

### Auth Pages (Login, Signup, Forgot Password)

**Layout:**
```
┌──────────────────────────────────────────────┐
│          Background: bg-background             │
│                                              │
│          ┌──────────────────────┐            │
│          │ Card: max-w-md       │            │
│          │ p-8 to p-12          │            │
│          │ centered vertically  │            │
│          │                      │            │
│          │ [Logo + App Name]    │            │
│          │ h2: Sign in          │            │
│          │ body: description    │            │
│          │                      │            │
│          │ [Email input]        │            │
│          │ [Password input]     │            │
│          │ [Forgot password?]   │            │
│          │                      │            │
│          │ [Sign In] primary    │            │
│          │                      │            │
│          │ Don't have account?  │            │
│          │ [Sign up] link       │            │
│          └──────────────────────┘            │
│                                              │
└──────────────────────────────────────────────┘
```

| Element | Spec |
|---|---|
| Card max-width | 448px (`max-w-md`) |
| Card padding | 48px (`p-12`) on desktop, 24px (`p-6`) on mobile |
| Card background | `bg-surface` |
| Card border | 1px `border-border`, `rounded-xl` |
| Card shadow | `shadow-lg` with warm tint |
| Logo size | 40px icon + text |
| Vertical centering | `min-h-screen flex items-center justify-center` |

**Validation patterns:**
- Inline validation: show errors below each field on blur
- Form-level error: toast for server errors, inline message for field errors
- Password strength: not shown in V1 (basic min-length check)

### Dashboard

**Layout:**

```
┌────────────────────────────────────────────────┐
│ h1: Dashboard                                   │
│ body-sm: Overview of your property portfolio    │
├────────────────────────────────────────────────┤
│                                                  │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │  ← Stat cards (4-col grid)
│ │Total │ │Rent  │ │Vacant│ │Overdue│            │
│ │Assets│ │Coll. │ │Units │ │Amts  │            │
│ └──────┘ └──────┘ └──────┘ └──────┘            │
│                                                  │
│ ┌────────────────────┐ ┌────────────────────┐   │  ← 2-col charts
│ │ Rent Collection    │ │ Portfolio          │   │
│ │ (Bar chart)        │ │ Breakdown          │   │
│ │ Monthly trend      │ │ (Donut chart)      │   │
│ └────────────────────┘ └────────────────────┘   │
│                                                  │
│ ┌────────────────────┐ ┌────────────────────┐   │  ← 2-col lists
│ │ Recent Activity    │ │ Upcoming           │   │
│ │ (audit entries)    │ │ (expiring leases,  │   │
│ │                    │ │  overdue rent)      │   │
│ └────────────────────┘ └────────────────────┘   │
│                                                  │
└────────────────────────────────────────────────┘
```

**Grid:** `grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6` for stat cards. `grid grid-cols-1 lg:grid-cols-2 gap-6` for charts and lists.

### List Pages (Assets, Tenants, Leases, etc.)

**Structure:**

```
Page Header (h1 + description + [+ Create] button)
↓
Table Toolbar (search + filters + bulk actions)
↓
Data Table (TanStack Table)
↓
Pagination
```

**Filters (nuqs URL state):**
- Each filter maps to a URL parameter: `?status=active&type=land&q=chennai`
- Active filters shown as removable chips below the toolbar
- "Clear all filters" link when any filters are active

### Detail Pages

**Structure:**

```
Breadcrumb
↓
Page Header (title + description + status badge + action buttons)
↓
Tab Bar
↓
Tab Content (varies per tab)
```

**Overview tab typical sections:**
1. Summary card (key details in 2-column key-value grid)
2. Related entities (e.g., current owner list for an asset)
3. Recent activity (last 5 audit entries for this entity)

### Form Pages (Create / Edit)

**Structure:**

```
Breadcrumb (Assets / New Asset)
↓
Page Header (h1: "Add New Asset" or "Edit: Green Villa")
↓
Form (section-based)
  Section 1: Basic Details (name, type, status)
  Section 2: Location (address fields)
  Section 3: Financial (purchase price, estimated value)
  Section 4: Land Details (conditional, if type=LAND)
↓
Action Bar ([Cancel] [Save])
```

**Edit vs. Create:**
- Create: title says "Add New {Entity}"
- Edit: title says "Edit: {Entity Name}"
- Fields are identical; edit pre-fills values
- Cancel navigates back (with unsaved changes warning if dirty)

### Settings Pages

**Layout:** Sidebar-within-content navigation (vertical tabs on left, content on right).

```
┌──────────────────────────────────────────────┐
│ h1: Settings                                  │
│ ┌──────────┬─────────────────────────────┐   │
│ │ Profile  │  Profile content             │   │
│ │ Members  │  (form fields)               │   │
│ │ Export   │                              │   │
│ └──────────┴─────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

On mobile: settings nav becomes a stacked list, each item navigates to a sub-page.

### Error Pages (403, 404, 500)

**Layout:** Same centered card pattern as auth pages (`max-w-md`, centered vertically).

| Error | Icon | Heading | Message | Actions |
|---|---|---|---|---|
| 403 | `ShieldAlert` | Not Permitted | You don't have access to this resource. | [Go to Dashboard] |
| 404 | `FileQuestion` | Not Found | We couldn't find that {entity type}. It may have been deleted. | [Go to {Entity List}] |
| 500 | `ServerCrash` | Something Went Wrong | An unexpected error occurred. Our team has been notified. | [Retry] [Go to Dashboard] |

All error pages show a muted icon (48px), heading (`h2`), description (`body`, `text-muted-foreground`), and action buttons.

### Audit Log

**Layout:** Filterable timeline.

```
┌──────────────────────────────────────────────┐
│ h1: Audit Log                                 │
│ [Filter by entity ▾] [Filter by action ▾]    │
│ [Filter by user ▾] [Date range picker]       │
├──────────────────────────────────────────────┤
│ ● 10:35 AM · Admin User                      │
│   Created asset "Green Villa"                 │
│   Asset · Today                               │
│                                               │
│ ● 10:20 AM · Admin User                      │
│   Updated tenant "Rajesh Kumar"               │
│   Tenant · Today                              │
│                                               │
│ ● Yesterday                                   │
│ ● 3:15 PM · Admin User                       │
│   Recorded payment ₹25,000                    │
│   Payment · Yesterday                         │
└──────────────────────────────────────────────┘
```

Each entry:
- Timestamp (relative for recent, absolute for older)
- User name
- Action summary
- Entity type badge
- Grouped by day

---

## 11. Icon & Imagery Guidelines

### Lucide Icon Usage Rules

| Property | Value |
|---|---|
| Default size | 20px (`h-5 w-5`) |
| Stroke width | 1.75 |
| Inline text icon size | 16px (`h-4 w-4`) — used next to labels, in badges |
| Large decorative icon | 24px (`h-6 w-6`) — empty states, stat cards |
| Color | Inherits from parent `text-*` class |

**Consistency rules:**
- One icon per concept across the entire app. Don't use `Home` for dashboard in one place and `LayoutDashboard` in another.
- Prefer outlined (default) Lucide style. Never mix filled and outlined in the same context.
- Icons always accompany text labels except in: icon-only buttons (with tooltip + aria-label), table row action buttons (with tooltip), and collapsed sidebar.

### Entity Type Icon Mapping

| Entity | Icon | Color Context |
|---|---|---|
| Asset (general) | `Building2` | `text-foreground` |
| Asset (land) | `MapPin` | `text-foreground` |
| Asset (rental) | `Building` | `text-foreground` |
| Person | `User` | `text-foreground` |
| Group | `FolderTree` | `text-foreground` |
| Unit | `DoorOpen` | `text-foreground` |
| Tenant | `UserCheck` | `text-foreground` |
| Lease | `FileText` | `text-foreground` |
| Payment | `IndianRupee` | `text-foreground` |
| Document | `Files` | `text-foreground` |
| Notification | `Bell` | `text-foreground` |
| Audit entry | `ScrollText` | `text-foreground` |

### Action Icon Mapping

| Action | Icon |
|---|---|
| Create / Add | `Plus` |
| Edit | `Pencil` |
| Delete | `Trash2` |
| View / Details | `Eye` |
| Download | `Download` |
| Upload | `Upload` |
| Search | `Search` |
| Filter | `Filter` |
| Sort | `ArrowUpDown` |
| More actions | `MoreHorizontal` |
| Settings | `Settings` |
| Close | `X` |
| Back | `ArrowLeft` |
| External link | `ExternalLink` |
| Copy | `Copy` |
| Check / Confirm | `Check` |
| Refresh | `RefreshCw` |
| Export | `FileDown` |

### Empty State Illustrations

For V1, use large Lucide icons (48px, `--text-muted`) as empty state visuals. No custom illustrations.

Post-V1, consider simple warm-toned line illustrations in the terracotta palette — similar to the style of Notion's empty states or Linear's onboarding illustrations. No stock photos, no 3D renders, no complex scenes.

### File Type Icons in Document Vault

Use colored Lucide `FileText` / `Image` / `FileSpreadsheet` variants:

```tsx
const fileIcon = (mimeType: string) => {
  if (mimeType === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
  if (mimeType.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('csv'))
    return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
  if (mimeType.includes('word') || mimeType.includes('document'))
    return <FileText className="h-5 w-5 text-blue-600" />;
  return <File className="h-5 w-5 text-muted-foreground" />;
};
```

---

## 12. Data Display Patterns

### Currency Display (INR)

**Rules:**
- Always use Indian number system (lakhs/crores): `₹12,45,000` not `₹1,245,000`
- Always use `font-mono tabular-nums` for alignment in tables
- Symbol `₹` precedes the number with no space
- No decimal places for whole rupee amounts
- 2 decimal places only when paise are relevant (rare)
- Right-align currency columns in tables

```tsx
// Utility function
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Compact format for large numbers
export function formatINRCompact(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  return formatINR(amount);
}
// ₹1.5Cr, ₹12.4L, ₹45,000
```

**Usage in components:**

```tsx
// Table cell
<td className="text-right font-mono text-sm tabular-nums">
  {formatINR(payment.amount)}
</td>

// Dashboard stat card
<span className="font-mono text-2xl font-semibold tabular-nums">
  {formatINRCompact(totalPortfolioValue)}
</span>
```

### Date & Time Formatting

| Context | Format | Example | Library |
|---|---|---|---|
| Full date | `dd MMM yyyy` | `15 Mar 2025` | `date-fns` format |
| Date with time | `dd MMM yyyy, hh:mm a` | `15 Mar 2025, 02:30 PM` | `date-fns` format |
| Month-year (charges) | `MMM yyyy` | `Mar 2025` | `date-fns` format |
| Relative (recent) | `formatDistanceToNow` | `2 hours ago`, `Yesterday` | `date-fns` |
| Input date picker | `dd/MM/yyyy` | `15/03/2025` | Native or date picker |

**Rules:**
- Use relative dates for items within the last 7 days in activity feeds and notifications
- Use absolute dates everywhere else
- Audit log: absolute timestamp with time
- Table columns: absolute date, no time (unless the column is specifically "Date & Time")
- All dates stored and transmitted in UTC; displayed in the account's configured timezone

### Address Formatting (Indian Conventions)

```
Street / Door Number
Area / Locality
City, District
State - Pincode
```

Example:
```
12, Anna Nagar 2nd Street
Adyar
Chennai, Chennai District
Tamil Nadu - 600020
```

**In tables:** Show only `City, State` (truncated if needed)
**In detail pages:** Full address in the format above
**In cards:** 1–2 line summary: `Adyar, Chennai - 600020`

### Percentage Display

- Ownership stakes: `font-mono tabular-nums`, 2 decimal places: `33.33%`
- Escalation rates: 1 decimal place: `5.0%`
- Right-align percentage columns in tables

### Status Display Patterns

**Pattern A — Badge (prominent):**
Used in page headers, detail pages, key table columns.
```tsx
<Badge variant="success">
  <CheckCircle2 className="h-3 w-3 mr-1" />
  Active
</Badge>
```

**Pattern B — Dot + Label (compact):**
Used in table cells where badges are too heavy.
```tsx
<div className="flex items-center gap-2">
  <div className="h-2 w-2 rounded-full bg-success shrink-0" />
  <span className="text-sm">Active</span>
</div>
```

**Pattern C — Icon only (minimal):**
Used in dense contexts, always with a tooltip.
```tsx
<Tooltip content="Paid">
  <CheckCircle2 className="h-4 w-4 text-success" />
</Tooltip>
```

### Null / Empty Field Display

| Context | Display | Notes |
|---|---|---|
| Table cell | `—` (em-dash) | `text-muted-foreground` |
| Detail page key-value | `Not set` | `text-muted-foreground italic` |
| Optional form field | Empty (no placeholder content) | Placeholder text in input only |
| Address field missing | Omit the line entirely | Don't show "—" for address parts |
| Currency value zero | `₹0` | Show explicitly, don't hide |
| Date not set | `—` | Don't show "N/A" or "null" |

### Indian Data Formats & Privacy Patterns

#### PAN (Permanent Account Number)

- **Input:** 10 characters, uppercase `ABCDE1234F` — use `inputMode="text"`, auto-uppercase.
- **Validation:** `^[A-Z]{5}[0-9]{4}[A-Z]$`
- **Display in tables/lists:** Masked: `ABCD•1234F` (hide 5th character to reduce shoulder-surfing).
- **Copy behavior:** Allow copy only via explicit "Copy PAN" button, not text selection.

```ts
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const maskPAN = (pan: string): string =>
  pan.length === 10 ? `${pan.slice(0, 4)}•${pan.slice(5)}` : pan;
```

#### Aadhaar Number

Aadhaar is **highly sensitive**. Never display the full number after initial capture.

- **Input:** 12 digits, grouped `XXXX XXXX XXXX`. Accept paste of contiguous digits.
- **Default display:** `XXXX XXXX 1234` (last 4 only).
- **Access control:** Admin role sees last 4 digits. Viewer role sees "On file".
- **Storage:** Store only the last 4 digits client-side. Full Aadhaar should be server-side only.

```ts
export const maskAadhaar = (last4?: string): string =>
  last4 ? `XXXX XXXX ${last4}` : 'On file';
```

#### Indian Phone Numbers

- **Display:** `+91 98765 43210` (grouped `XXXXX XXXXX` after country code).
- **Input:** `inputMode="tel"`, accept 10-digit numbers with optional leading `0`.
- **Normalization:** Strip leading `0` and `+91` prefix before storage.

#### Pincode

- **Exactly 6 digits.** `inputMode="numeric"`, `maxLength={6}`.
- **Validation message:** "Enter a valid 6-digit PIN code."
- **Auto-fill:** Consider populating city/state from a pincode lookup API.

#### IFSC Code (if bank payout exists)

- **Pattern:** `^[A-Z]{4}0[A-Z0-9]{6}$`
- **Display:** Mask optional: `HDFC0••••••`

#### Negative Currency (Refunds)

- **Format:** `-₹12,500` (minus sign before the rupee symbol).
- **Visual treatment:** `text-destructive` color + "Refund" badge label on the row.
- **Never rely on the minus sign alone** to communicate a refund — always pair with a label or badge.

---

## 13. Tailwind v4 + shadcn Configuration

### CSS Custom Property Setup

In the global CSS file (`apps/web/app/globals.css`):

```css
@import "tailwindcss";

@theme {
  /* Colors — see Section 2 for full list */
  --color-background: #FFFAF5;
  --color-foreground: #3D2C2E;
  --color-surface: #FFF3E8;
  --color-surface-hover: #FFEBD8;
  --color-surface-active: #FFE0C8;

  --color-border: #E8D5C4;
  --color-border-strong: #D4B8A0;
  --color-input: #E8D5C4;
  --color-ring: #C2705B;

  --color-primary: #C2705B;
  --color-primary-hover: #A85A47;
  --color-primary-active: #934E3D;
  --color-primary-foreground: #FFFFFF;
  --color-primary-muted: #F0D5CB;

  --color-secondary: #8B6F5E;
  --color-secondary-hover: #755C4D;
  --color-secondary-foreground: #FFFFFF;

  --color-muted: #F5EDE5;
  --color-muted-foreground: #7A6B63;

  --color-accent: #E8A87C;
  --color-accent-foreground: #3D2C2E;
  --color-accent-muted: #FDF0E6;

  --color-destructive: #B54040;
  --color-destructive-hover: #9A3535;
  --color-destructive-foreground: #FFFFFF;
  --color-destructive-muted: #FCEAEA;

  --color-success: #3D6E38;
  --color-success-foreground: #FFFFFF;
  --color-success-muted: #E8F0E6;

  --color-warning: #846810;
  --color-warning-foreground: #FFFFFF;
  --color-warning-muted: #FBF3DB;

  --color-info: #336D90;
  --color-info-foreground: #FFFFFF;
  --color-info-muted: #E7F1F8;

  --color-text: #3D2C2E;
  --color-text-muted: #7A6B63;
  --color-text-faint: #A89A91;

  /* Sidebar tokens */
  --color-sidebar: #FAF0E6;
  --color-sidebar-foreground: #3D2C2E;
  --color-sidebar-border: #E8D5C4;
  --color-sidebar-accent: #C2705B;
  --color-sidebar-accent-foreground: #C2705B;
  --color-sidebar-muted: #7A6B63;

  /* Chart tokens */
  --color-chart-1: #C2705B;
  --color-chart-2: #7BA075;
  --color-chart-3: #E8A87C;
  --color-chart-4: #8B6F5E;
  --color-chart-5: #D4A017;
  --color-chart-6: #6B9BC3;

  /* Typography */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-heading: 'DM Sans', 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Radii */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;
}
```

### shadcn/ui Theme Mapping

shadcn components reference CSS variables by bare names (`var(--background)`, `var(--primary)`, etc.). The alias block below bridges shadcn's expected tokens to PropertyVault's `--color-*` tokens. Place this in `globals.css` immediately after the `@theme` block.

**Critical:** shadcn's `--secondary` maps to a **neutral surface** (our `--color-muted`), NOT the brand secondary ink (`--color-secondary`). This is intentional — shadcn uses "secondary" for subdued backgrounds, not brand accent colors.

```css
:root {
  /* === shadcn base tokens === */
  --background: var(--color-background);
  --foreground: var(--color-foreground);

  --card: var(--color-surface);
  --card-foreground: var(--color-text);

  --popover: var(--color-surface);
  --popover-foreground: var(--color-text);

  --primary: var(--color-primary);
  --primary-foreground: var(--color-primary-foreground);

  --secondary: var(--color-muted);
  --secondary-foreground: var(--color-text);

  --muted: var(--color-muted);
  --muted-foreground: var(--color-muted-foreground);

  --accent: var(--color-surface-hover);
  --accent-foreground: var(--color-text);

  --destructive: var(--color-destructive);
  --destructive-foreground: var(--color-destructive-foreground);

  --border: var(--color-border);
  --input: var(--color-input);
  --ring: var(--color-ring);
}
```

The Tailwind `@theme` tokens remain the single source of truth. The `:root` block is a compatibility shim — never define colors directly in `:root`.

### Utility Class Conventions

**Naming principles:**
- Use Tailwind utilities directly wherever possible. Don't create wrapper classes for simple styles.
- For repeated component patterns, create React components, not CSS classes.
- Use `cn()` (from `lib/utils`) for conditional class merging with `clsx` + `tailwind-merge`.

**Common utility patterns:**

```tsx
// Card
className="rounded-lg border border-border bg-surface p-6 shadow-sm"

// Table header
className="bg-muted text-xs font-medium uppercase tracking-wider text-muted-foreground"

// Page section
className="space-y-6"

// Stat value (monospace)
className="font-mono text-2xl font-semibold tabular-nums"

// Status badge (success)
className="inline-flex items-center gap-1 rounded-full bg-success-muted px-2 py-0.5 text-xs font-medium text-success"

// Truncated text
className="truncate max-w-[200px]"
```

### Custom Component Class Patterns

For components that need consistent styling beyond Tailwind utilities, define them as React components with variant props (using `cva` from `class-variance-authority` — already part of shadcn):

```tsx
// Example: StatusBadge with cva
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        success: 'bg-success-muted text-success',
        warning: 'bg-warning-muted text-warning',
        info: 'bg-info-muted text-info',
        destructive: 'bg-destructive-muted text-destructive',
        default: 'bg-accent-muted text-accent-foreground',
        muted: 'bg-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
```

### File Organization for Design System Code

```
apps/web/
├── app/
│   └── globals.css                    # @theme tokens, base styles
├── components/
│   ├── ui/                            # shadcn components (auto-generated)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   └── ...
│   ├── shared/                        # App-wide shared components
│   │   ├── page-header.tsx            # Breadcrumb + title + actions
│   │   ├── status-badge.tsx           # Entity status badges
│   │   ├── currency-display.tsx       # INR formatting component
│   │   ├── date-display.tsx           # Date formatting component
│   │   ├── empty-state.tsx            # Reusable empty state
│   │   ├── data-table.tsx             # TanStack Table wrapper
│   │   ├── data-table-toolbar.tsx     # Search + filters + actions
│   │   ├── data-table-pagination.tsx  # Pagination component
│   │   ├── confirm-dialog.tsx         # Reusable confirmation dialog
│   │   ├── file-upload.tsx            # Dropzone wrapper
│   │   └── notification-bell.tsx      # Bell + dropdown
│   └── layout/                        # App shell components
│       ├── sidebar.tsx
│       ├── sidebar-nav-item.tsx
│       ├── app-shell.tsx
│       └── mobile-nav.tsx
├── lib/
│   ├── utils.ts                       # cn(), formatINR(), formatDate()
│   └── constants.ts                   # Status mappings, icon mappings
```

---

## Appendix: Quick Reference — Status Color Cheat Sheet

| Entity | Status | Badge Variant | Icon |
|---|---|---|---|
| Asset | ACTIVE | `success` | `CheckCircle2` |
| Asset | SOLD | `muted` | `MinusCircle` |
| Asset | DISPUTED | `warning` | `AlertTriangle` |
| Lease | DRAFT | `default` | `FileEdit` |
| Lease | ACTIVE | `success` | `CheckCircle2` |
| Lease | EXPIRED | `muted` | `Clock` |
| Lease | TERMINATED | `destructive` | `XCircle` |
| Monthly Charge | PENDING | `default` | `Clock` |
| Monthly Charge | PARTIAL | `warning` | `AlertCircle` |
| Monthly Charge | PAID | `success` | `CheckCircle2` |
| Monthly Charge | OVERDUE | `destructive` | `AlertTriangle` |
| Tenant | ACTIVE | `success` | `UserCheck` |
| Tenant | PAST | `muted` | `UserMinus` |
| Tenant | BLACKLISTED | `destructive` | `UserX` |
| Deposit | RECEIVED | `success` | `CheckCircle2` |
| Deposit | PENDING | `warning` | `Clock` |
| Deposit | PARTIALLY_REFUNDED | `default` | `ArrowDownCircle` |
| Deposit | FULLY_REFUNDED | `muted` | `ArrowDownCircle` |
| Deposit | FORFEITED | `destructive` | `XCircle` |

