# Research Plan: TanStack Query v5 review

## Main question
Assess this monorepo's TanStack Query v5 integration against the latest TanStack Query guidance, especially Next.js App Router and React Server Components patterns.

## Subtopics
1. Official TanStack Query v5 guidance for QueryClient setup, SSR/App Router, hydration, suspense, streaming, retries, and defaults.
2. Current repo implementation: QueryClient, provider placement, query key factory, defaults, and app-level integration.
3. Actual usage patterns in web features/app code: useQuery/useMutation, invalidation, optimistic updates, suspense, and server prefetching.
4. Current ecosystem guidance from web sources for Next.js App Router / React Server Components and TanStack Query Devtools.

## Expected outputs
- Official recommendations with citations
- Concrete repo findings with file references
- Priority-ranked remediation recommendations with code examples

## Synthesis
Compare documented best practices to the repo's implementation and produce a detailed markdown findings report with gaps, impact, and recommended fixes.
