# Nilam Web Agent Notes

- **Next.js 16 App Router** with **Turbopack**: verify behavior against local Next docs (`node_modules/next/dist/docs/`) before changing framework code.
- In Next.js 16, middleware is called **proxy** — the file is `src/proxy.ts`.
- Use **Better Auth** flows. The web app has no direct DB access — all data goes through the standalone API.
- Call the standalone API with `NEXT_PUBLIC_API_URL`. Server Components use `serverFetch()` for cookie forwarding.
- Wrap `getServerSession()` with React `cache()` to deduplicate per-request.
- Prefer shared tokens and components from `@nilam/ui`.
- Import error types and validation schemas from `@nilam/validators`, not local redefinitions.
- `(auth)` contains public auth screens; `(app)` contains the authenticated shell.
- For data screens: prefetch in Server Components → hydrate with `<HydrationBoundary>` → consume with `useQuery` in client components.
- Chain Hono route definitions for RPC type safety when working on the API.
