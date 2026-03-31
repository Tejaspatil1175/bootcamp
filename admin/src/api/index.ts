/**
 * Central export for all API services
 * 
 * Usage:
 * import { authAPI, dashboardAPI, usersAPI, applicationsAPI, transactionsAPI, securityAPI } from '@/api';
 * 
 * Example:
 * const stats = await dashboardAPI.getStats();
 * const applications = await applicationsAPI.getAllApplications({ page: 1, limit: 10 });
 */

export { default as authAPI } from './auth';
export { default as dashboardAPI } from './dashboard';
export { default as usersAPI } from './users';
export { default as applicationsAPI } from './applications';
export { default as transactionsAPI } from './transactions';
export { default as securityAPI } from './security';
export { default as profileAPI } from './profile';

// Re-export config for advanced usage
export { API_BASE_URL, handleApiError } from './config';
export type { AxiosError, AxiosResponse } from './config';
