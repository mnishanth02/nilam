<!-- BEGIN:nextjs-agent-rules -->
# Nilam Web Assistant Notes

- This app uses **Next.js 16 App Router** with **Turbopack**. Check `node_modules/next/dist/docs/` before assuming older Next.js APIs or file conventions.
- In Next.js 16, middleware is called **proxy** — the file is `src/proxy.ts`, not `middleware.ts`.
- Authentication is powered by **Better Auth**. The web app does not have direct DB access — all data flows through the standalone API.
- The web app talks to the standalone API over `NEXT_PUBLIC_API_URL`. Server Components forward cookies via `serverFetch()`.
- Wrap `getServerSession()` with React `cache()` to avoid duplicate HTTP round-trips when called from both layout and page.
- Shared design tokens and primitives come from `@nilam/ui`.
- Route groups: `(auth)` for public auth pages, `(app)` for the authenticated shell.
- For data-heavy screens, prefetch in Server Components with `queryClient.prefetchQuery()` and wrap client components with `<HydrationBoundary>`.
- Do not import `@nilam/db` or `@nilam/auth/server` in client bundles.
<!-- END:nextjs-agent-rules -->
