import Link from 'next/link';
import { getServerSession } from '@/lib/auth';

const featureCards = [
  {
    title: 'Assets',
    href: '/assets',
    description: 'Centralize buildings, units, documents, and ownership records in one place.',
  },
  {
    title: 'Tenants',
    href: '/tenants',
    description: 'Track residents, occupancy, renewals, and communication history with confidence.',
  },
  {
    title: 'Leases',
    href: '/leases',
    description: 'Prepare for lease terms, renewals, notices, and shared approval workflows.',
  },
  {
    title: 'Payments',
    href: '/payments',
    description: 'Monitor rent collection, dues, reconciliations, and exceptions as they happen.',
  },
];

export default async function DashboardPage() {
  const session = await getServerSession();
  const greeting = session?.user.name || session?.user.email || 'Welcome back';

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] border border-border bg-surface px-8 py-10 shadow-[0_18px_60px_rgba(61,44,46,0.06)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Welcome back</p>
        <h1 className="mt-3 font-heading text-3xl font-semibold tracking-tight text-foreground">
          {greeting}, Nilam is ready for your next product phase.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
          This dashboard is now aligned to the Nilam route structure. Product modules will plug into
          this shell as assets, tenants, leases, and payments come online.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {featureCards.map((item) => (
          <Link
            className="group rounded-[28px] border border-border bg-background p-6 transition hover:-translate-y-0.5 hover:border-primary hover:bg-surface-hover"
            href={item.href}
            key={item.href}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Coming soon</p>
            <h2 className="mt-4 font-heading text-xl font-semibold text-foreground">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.description}</p>
            <p className="mt-6 text-sm font-medium text-primary transition group-hover:translate-x-1">
              Explore roadmap →
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
