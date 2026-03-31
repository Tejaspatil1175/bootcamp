import apiClient, { handleApiError } from './config';
import type {
  SecurityAlert,
  GetSecurityAlertsParams,
  GetSecurityAlertsResponse,
  GetFrozenAccountsParams,
  GetFrozenAccountsResponse,
  UnfreezeAccountRequest,
  ResolveAlertRequest,
  ApiResponse,
} from '../types/api';

/**
 * Security API Service
 */
class SecurityAPI {
  /**
   * Get All Security Alerts
   * GET /admin/security/security-alerts
   */
  async getSecurityAlerts(params?: GetSecurityAlertsParams): Promise<GetSecurityAlertsResponse> {
    try {
      const response = await apiClient.get<ApiResponse<GetSecurityAlertsResponse>>(
        '/admin/security/security-alerts',
        { params }
      );
      console.log('Security alerts response:', response.data);
      
      // Ensure the response has the expected structure
      const data = response.data.data;
      if (!data) {
        console.warn('No data in response, returning empty alerts');
        return { alerts: [], total: 0 };
      }
      
      if (!Array.isArray(data.alerts)) {
        console.warn('Alerts is not an array, returning empty');
        return { alerts: [], total: 0 };
      }
      
      return data;
    } catch (error) {
      console.error('Security alerts fetch error:', error);
      // Return empty structure instead of throwing
      return { alerts: [], total: 0 };
    }
  }

  /**
   * Get Security Statistics
   * Calculates stats from fetched alerts
   */
  async getSecurityStats(): Promise<{
    totalAlerts: number;
    openAlerts: number;
    resolvedAlerts: number;
    criticalAlerts: number;
  }> {
    try {
      // Fetch all alerts (both open and resolved)
      const [openResponse, resolvedResponse] = await Promise.all([
        this.getSecurityAlerts({ status: 'OPEN' }),
        this.getSecurityAlerts({ status: 'RESOLVED' })
      ]);

      const openAlerts = openResponse.alerts || [];
      const resolvedAlerts = resolvedResponse.alerts || [];
      const criticalAlerts = openAlerts.filter(a => a.severity === 'CRITICAL').length;

      return {
        totalAlerts: openAlerts.length + resolvedAlerts.length,
        openAlerts: openAlerts.length,
        resolvedAlerts: resolvedAlerts.length,
        criticalAlerts: criticalAlerts
      };
    } catch (error) {
      console.error('Security stats fetch error:', error);
      return {
        totalAlerts: 0,
        openAlerts: 0,
        resolvedAlerts: 0,
        criticalAlerts: 0
      };
    }
  }

  /**
   * Get Frozen Accounts List
   * GET /admin/security/frozen-accounts
   */
  async getFrozenAccounts(params?: GetFrozenAccountsParams): Promise<GetFrozenAccountsResponse> {
    try {
      const response = await apiClient.get<ApiResponse<GetFrozenAccountsResponse>>(
        '/admin/security/frozen-accounts',
        { params }
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Unfreeze User Account
   * POST /admin/security/unfreeze-account/:userId
   */
  async unfreezeAccount(userId: string, data: UnfreezeAccountRequest): Promise<void> {
    try {
      await apiClient.post(`/admin/security/unfreeze-account/${userId}`, data);
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Resolve Security Alert
   * PUT /admin/security/security-alerts/:alertId/resolve
   */
  async resolveAlert(alertId: string, data: ResolveAlertRequest): Promise<SecurityAlert> {
    try {
      const response = await apiClient.put<ApiResponse<SecurityAlert>>(
        `/admin/security/security-alerts/${alertId}/resolve`,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export singleton instance
export default new SecurityAPI();
