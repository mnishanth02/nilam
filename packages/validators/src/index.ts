export type { ZodSchema, ZodType } from 'zod';
export { z } from 'zod';
export type { ApiError, FieldError } from './errors';
export { ErrorCode } from './errors';
export { queryKeys } from './query-keys';
export type { PaginatedResponse, PaginationQuery } from './schemas/index';
export { paginationQuery } from './schemas/index';

export const QUERY_DEFAULTS = {
  staleTime: 60 * 1_000,
  gcTime: 5 * 60 * 1_000,
} as const;
