import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md rounded-[32px] border border-border bg-surface px-8 py-10 shadow-[0_24px_80px_rgba(61,44,46,0.08)]">
        <div className="mb-8 space-y-3 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">
            N
          </div>
          <div className="space-y-1">
            <p className="font-heading text-2xl font-semibold text-foreground">Nilam</p>
            <p className="text-sm leading-6 text-muted-foreground">
              Property operations, grounded in one calm workspace.
            </p>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
