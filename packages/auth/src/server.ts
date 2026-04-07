import * as dbExports from '@nilam/db';
import { db } from '@nilam/db';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { organization } from 'better-auth/plugins';
import { createAccessControl } from 'better-auth/plugins/access';

const { db: _db, testConnection: _testConnection, ...schema } = dbExports;

const ac = createAccessControl({
  account: ['create', 'read', 'update', 'delete'],
} as const);

const adminRole = ac.newRole({
  account: ['create', 'read', 'update', 'delete'],
});

const viewerRole = ac.newRole({
  account: ['read'],
});

export { ac, adminRole, viewerRole };

export interface EmailCallbacks {
  sendResetPassword: (params: {
    user: { email: string; name: string };
    url: string;
  }) => Promise<void>;
  sendInvitationEmail: (params: {
    email: string;
    inviter: { user: { name: string; email: string } };
    organization: { name: string };
    id: string;
    role: string;
  }) => Promise<void>;
}

let emailCallbacks: EmailCallbacks = {
  sendResetPassword: async () => {
    console.warn('sendResetPassword not configured');
  },
  sendInvitationEmail: async () => {
    console.warn('sendInvitationEmail not configured');
  },
};

export function setEmailCallbacks(callbacks: Partial<EmailCallbacks>) {
  emailCallbacks = { ...emailCallbacks, ...callbacks };
}

function getTrustedOrigins() {
  const values = [process.env.CORS_ORIGIN]
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);

  return Array.from(new Set(values.length > 0 ? values : ['http://localhost:3000']));
}

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET environment variable is required');
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      await emailCallbacks.sendResetPassword({
        user: {
          email: user.email,
          name: user.name ?? user.email,
        },
        url,
      });
    },
  },
  trustedOrigins: getTrustedOrigins(),
  advanced: {
    crossSubDomainCookies: {
      enabled: false,
    },
    defaultCookieAttributes: {
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    },
  },
  plugins: [
    organization({
      ac,
      roles: {
        admin: adminRole,
        viewer: viewerRole,
      },
      async sendInvitationEmail(data) {
        await emailCallbacks.sendInvitationEmail(data);
      },
    }),
  ],
});

export type Auth = typeof auth;
