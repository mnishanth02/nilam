import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: [
    '@nilam/validators',
    '@nilam/db',
    '@nilam/auth',
    '@nilam/api',
    '@nilam/shared',
    '@nilam/ui',
  ],
};

// TODO(nilam): Wrap with withSentryConfig when web-side Sentry wiring is enabled.
export default nextConfig;
