const DEFAULT_REDIRECT_PATH = '/dashboard';

export function getSafeRedirectPath(value: string | null | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return DEFAULT_REDIRECT_PATH;
  }

  return value;
}
