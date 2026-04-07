import type { AppType } from '@nilam/api';
import { hc } from 'hono/client';
import { getApiBaseUrl } from './api-client';

export const api = hc<AppType>(getApiBaseUrl(), {
  init: {
    credentials: 'include',
  },
});
