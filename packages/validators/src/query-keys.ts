export const queryKeys = {
  groups: {
    all: ['groups'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.groups.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.groups.all, 'detail', id] as const,
  },
  persons: {
    all: ['persons'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.persons.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.persons.all, 'detail', id] as const,
  },
  assets: {
    all: ['assets'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.assets.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.assets.all, 'detail', id] as const,
  },
  tenants: {
    all: ['tenants'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.tenants.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.tenants.all, 'detail', id] as const,
  },
  leases: {
    all: ['leases'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeys.leases.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.leases.all, 'detail', id] as const,
  },
  payments: {
    all: ['payments'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.payments.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.payments.all, 'detail', id] as const,
  },
  documents: {
    all: ['documents'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.documents.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.documents.all, 'detail', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (params?: Record<string, unknown>) =>
      [...queryKeys.notifications.all, 'list', params] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unread-count'] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
  },
} as const;
