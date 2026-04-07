'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, type FormEvent, useMemo, useState } from 'react';
import { authClient } from '@/lib/auth-client';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token'), [searchParams]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError('This reset link is invalid or has expired.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsPending(true);

    try {
      const { error: resetError } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (resetError) {
        setError(resetError.message ?? 'Unable to reset your password.');
        return;
      }

      setIsSuccess(true);
      router.push('/login');
      router.refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Unable to reset your password.');
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-foreground">Set a new password</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Choose a new password for your Nilam account and get back to work.
      </p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block text-sm font-medium text-foreground">
          New password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 outline-none transition focus:border-ring"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        <label className="block text-sm font-medium text-foreground">
          Confirm password
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="mt-1 w-full rounded-2xl border border-input bg-background px-4 py-3 outline-none transition focus:border-ring"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </label>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        {isSuccess ? (
          <p className="rounded-2xl border border-[var(--color-success)]/20 bg-[var(--color-success-muted)] px-4 py-3 text-sm text-[var(--color-success)]">
            Password updated. Redirecting you to login…
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-[var(--color-primary-hover)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? 'Updating password…' : 'Reset password'}
        </button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        Need a fresh link?{' '}
        <Link
          href="/forgot-password"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Request another reset email
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
