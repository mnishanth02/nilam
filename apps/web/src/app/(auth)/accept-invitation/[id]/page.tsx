import Link from 'next/link';
import { getServerSession } from '@/lib/auth';
import { AcceptInvitationClient } from './accept-invitation-client';

type AcceptInvitationPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AcceptInvitationPage({ params }: AcceptInvitationPageProps) {
  const { id } = await params;
  const session = await getServerSession();
  const redirectPath = `/accept-invitation/${encodeURIComponent(id)}`;

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Accepting invitation</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        We&apos;re connecting your Nilam account to the invited organization now.
      </p>

      {!session ? (
        <div className="mt-6 space-y-4 rounded-2xl border border-border bg-background px-4 py-4">
          <p className="text-sm text-muted-foreground">
            Sign in or create an account with the invited email address to accept this invitation.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-[var(--color-primary-hover)]"
            >
              Sign in to accept
            </Link>
            <Link
              href={`/signup?redirect=${encodeURIComponent(redirectPath)}`}
              className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface-hover"
            >
              Create account
            </Link>
          </div>
        </div>
      ) : (
        <AcceptInvitationClient invitationId={id} />
      )}
    </div>
  );
}
