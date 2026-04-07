import { createAuthClient } from 'better-auth/client';
import { organizationClient } from 'better-auth/client/plugins';

export function createClient(baseURL: string) {
  return createAuthClient({
    baseURL,
    plugins: [organizationClient()],
  });
}

export type AuthClient = ReturnType<typeof createClient>;

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
};

export type AuthSession = {
  id: string;
  userId: string;
  expiresAt: Date;
};
