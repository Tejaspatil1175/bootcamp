import apiClient, { handleApiError } from './config';
import type { DashboardStats, ApiResponse } from '../types/api';

/**
 * Dashboard API Service
 */
class DashboardAPI {
  /**
   * Get Dashboard Statistics
   * GET /api/admin/dashboard/stats
   */
  async getStats(): Promise<DashboardStats> {
    try {
      const response = await apiClient.get<ApiResponse<DashboardStats>>('/api/admin/dashboard/stats');
      console.log('Dashboard stats response:', response.data);
      
      // Check if response has data
      if (!response.data || !response.data.data) {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid response from server');
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Dashboard stats error:', error);
      throw new Error(handleApiError(error));
    }
  }
}

// Export singleton instance
export default new DashboardAPI();
