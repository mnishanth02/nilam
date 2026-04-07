import { createClient } from '@nilam/auth/client';
import { getApiBaseUrl } from './api-client';

export const authClient = createClient(getApiBaseUrl());
