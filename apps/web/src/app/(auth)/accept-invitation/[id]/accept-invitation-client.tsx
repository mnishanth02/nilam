'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authClient } from '@/lib/auth-client';

type AcceptInvitationClientProps = {
  invitationId: string;
};

export function AcceptInvitationClient({ invitationId }: AcceptInvitationClientProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function acceptInvitation() {
      try {
        const { error: acceptError } = await authClient.organization.acceptInvitation({
          invitationId,
        });

        if (acceptError) {
          if (isMounted) {
            setError(acceptError.message ?? 'Unable to accept invitation.');
          }
          return;
        }

        router.push('/dashboard');
        router.refresh();
      } catch (caughtError) {
        if (isMounted) {
          setError(
            caughtError instanceof Error ? caughtError.message : 'Unable to accept invitation.',
          );
        }
      }
    }

    void acceptInvitation();

    return () => {
      isMounted = false;
    };
  }, [invitationId, router]);

  if (error) {
    return (
      <div className="mt-6 space-y-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-4">
        <p className="text-sm text-destructive">{error}</p>
        <p className="text-sm text-muted-foreground">
          Make sure you are signed in with the invited email address and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-border bg-background px-4 py-4 text-sm text-muted-foreground">
      One moment while we finish setting up your access…
    </div>
  );
}
