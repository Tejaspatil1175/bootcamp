import apiClient from './api';

export interface SecurityAlert {
  alertId: string;
  userId: string;
  transactionId?: string;
  type: string;
  severity: string;
  status: string;
  description: string;
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface FrozenAccount {
  freezeId: string;
  userId: string;
  reason: string;
  severity: string;
  status: string;
  frozenAt: string;
  unfrozenAt?: string;
}

/**
 * User: Get my security alerts
 */
export const getMySecurityAlerts = async (params?: {
  limit?: number;
  status?: string;
}) => {
  try {
    const response = await apiClient.get('/auth/security-alerts', { params });
    return response.data;
  } catch (error: any) {
    console.error('❌ Get security alerts error:', error);
    throw error;
  }
};

/**
 * User: Acknowledge security alert
 */
export const acknowledgeSecurityAlert = async (alertId: string) => {
  try {
    const response = await apiClient.put(`/auth/security-alerts/${alertId}/acknowledge`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Acknowledge security alert error:', error);
    throw error;
  }
};

/**
 * Admin: Get all security alerts
 */
export const getAllSecurityAlerts = async (params?: {
  page?: number;
  limit?: number;
  severity?: string;
  status?: string;
  userId?: string;
}) => {
  try {
    const response = await apiClient.get('/admin/security/security-alerts', { params });
    return response.data;
  } catch (error: any) {
    console.error('❌ Get all security alerts error:', error);
    throw error;
  }
};

/**
 * Admin: Resolve security alert
 */
export const resolveSecurityAlert = async (
  alertId: string,
  data: {
    resolution: string;
    notes?: string;
  }
) => {
  try {
    const response = await apiClient.put(`/admin/security/security-alerts/${alertId}/resolve`, data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Resolve security alert error:', error);
    throw error;
  }
};

/**
 * Admin: Get frozen accounts
 */
export const getFrozenAccounts = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  try {
    const response = await apiClient.get('/admin/security/frozen-accounts', { params });
    return response.data;
  } catch (error: any) {
    console.error('❌ Get frozen accounts error:', error);
    throw error;
  }
};

/**
 * Admin: Unfreeze account
 */
export const unfreezeAccount = async (
  userId: string,
  data: {
    reason: string;
    notes?: string;
  }
) => {
  try {
    const response = await apiClient.post(`/admin/security/unfreeze-account/${userId}`, data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Unfreeze account error:', error);
    throw error;
  }
};

/**
 * Admin: Manual fraud check for user
 */
export const manualFraudCheck = async (userId: string) => {
  try {
    const response = await apiClient.post(`/admin/security/manual-fraud-check/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Manual fraud check error:', error);
    throw error;
  }
};
