const DEFAULT_API_BASE_URL = 'http://localhost:4000';

export function getApiBaseUrl() {
  return (process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, '');
}
