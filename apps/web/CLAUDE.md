<!-- BEGIN:nextjs-agent-rules -->
# Nilam Web Assistant Notes

- This app uses Next.js 16 App Router. Check `node_modules/next/dist/docs/` before assuming older Next.js APIs or file conventions.
- Authentication is powered by Better Auth.
- The web app talks to the standalone API over `NEXT_PUBLIC_API_URL`.
- Shared design tokens and primitives come from `@nilam/ui`.
- Route groups are split into `(auth)` for public auth pages and `(app)` for the authenticated shell.
<!-- END:nextjs-agent-rules -->
