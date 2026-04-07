'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';
import { authClient } from '@/lib/auth-client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSuccess(false);
    setIsPending(true);

    try {
      const { error: requestError } = await authClient.requestPasswordReset({
        email,
        redirectTo: '/reset-password',
      });

      if (requestError) {
        setError(requestError.message ?? 'Unable to send reset instructions.');
        return;
      }

      setIsSuccess(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : 'Unable to send reset instructions.',
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Forgot your password?</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Enter your email and we&apos;ll send you a secure link to reset your Nilam password.
      </p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-foreground">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 outline-none transition focus:border-ring"
            autoComplete="email"
            required
          />
        </label>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {isSuccess ? (
          <p className="rounded-2xl border border-[var(--color-success)]/20 bg-[var(--color-success-muted)] px-4 py-3 text-sm text-[var(--color-success)]">
            If that email exists in Nilam, reset instructions are on the way.
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? 'Sending reset link…' : 'Send reset link'}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        Remembered it?{' '}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Return to login
        </Link>
      </p>
    </div>
  );
}
