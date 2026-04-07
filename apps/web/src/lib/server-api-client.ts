import { headers } from 'next/headers';
import { getApiBaseUrl } from './api-client';

export async function getServerApiHeaders() {
  const requestHeaders = await headers();
  const cookie = requestHeaders.get('cookie');

  return cookie ? ({ cookie } satisfies HeadersInit) : undefined;
}

export async function serverFetch(path: string, init?: RequestInit) {
  const apiHeaders = await getServerApiHeaders();
  const requestHeaders = new Headers(init?.headers);

  if (apiHeaders) {
    const forwardedHeaders = new Headers(apiHeaders);
    forwardedHeaders.forEach((value, key) => {
      if (!requestHeaders.has(key)) {
        requestHeaders.set(key, value);
      }
    });
  }

  return fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: requestHeaders,
  });
}
