import { z } from 'zod';

const serverSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.string().url(),
  DATABASE_URL: z.string().min(1),
});

const clientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
});

type ServerEnv = z.infer<typeof serverSchema>;
type ClientEnv = z.infer<typeof clientSchema>;

let _serverEnv: ServerEnv | undefined;
let _clientEnv: ClientEnv | undefined;

export function getServerEnv(): ServerEnv {
  if (!_serverEnv) {
    _serverEnv = serverSchema.parse({
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
      DATABASE_URL: process.env.DATABASE_URL,
    });
  }
  return _serverEnv;
}

export function getClientEnv(): ClientEnv {
  if (!_clientEnv) {
    _clientEnv = clientSchema.parse({
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    });
  }
  return _clientEnv;
}
