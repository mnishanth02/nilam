import type { ReactNode } from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SessionActions } from '@/components/session-actions';
import { getServerSession } from '@/lib/auth';

const navigation = [{ href: '/dashboard', label: 'Dashboard' }];

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b border-sidebar-border bg-sidebar px-6 py-8 lg:border-b-0 lg:border-r">
          <div className="rounded-[28px] border border-border bg-surface px-5 py-6 shadow-[0_18px_60px_rgba(61,44,46,0.08)]">
            <div className="mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">
                N
              </div>
              <h1 className="mt-4 font-heading text-2xl font-semibold text-foreground">Nilam</h1>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                A calmer operating system for modern property teams.
              </p>
            </div>
            <nav className="space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center rounded-2xl bg-primary-muted px-4 py-3 text-sm font-medium text-foreground transition hover:bg-surface-hover"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        <div className="flex min-h-screen flex-col">
          <header className="border-b border-border bg-background/95 px-6 py-5 backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                  Authenticated workspace
                </p>
                <h2 className="mt-2 font-heading text-2xl font-semibold text-foreground">Nilam dashboard</h2>
              </div>
              <div className="flex items-center gap-4 rounded-full border border-border bg-surface px-4 py-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {session.user.name || session.user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">{session.user.email}</p>
                </div>
                <SessionActions />
              </div>
            </div>
          </header>
          <main className="flex-1 px-6 py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
