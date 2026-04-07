import { app } from '../app';

export function authenticateAs(_userId: string) {
  // Better Auth test helpers will be added during implementation phases.
}

export function authenticateAsGuest() {
  // Better Auth guest helpers will be added during implementation phases.
}

export async function requestAs(userId: string, path: string, init?: RequestInit) {
  authenticateAs(userId);
  return app.request(path, init);
}

export async function requestAsGuest(path: string, init?: RequestInit) {
  authenticateAsGuest();
  return app.request(path, init);
}
