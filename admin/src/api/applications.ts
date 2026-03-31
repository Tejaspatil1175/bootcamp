import apiClient, { handleApiError } from './config';
import type {
  Application,
  GetApplicationsParams,
  GetApplicationsResponse,
  UpdateApplicationStatusRequest,
  ApplicationStats,
  NokiaVerification,
  ApiResponse,
} from '../types/api';

/**
 * Applications API Service
 */
class ApplicationsAPI {
  /**
   * Get All Applications
   * GET /api/applications/admin/all
   */
  async getAllApplications(params?: GetApplicationsParams): Promise<GetApplicationsResponse> {
    try {
      const response = await apiClient.get<ApiResponse<GetApplicationsResponse>>(
        '/api/applications/admin/all',
        { params }
      );
      
      console.log('Applications API response:', response.data);
      
      // Handle different response structures
      if (response.data.data) {
        return response.data.data;
      }
      
      // Fallback: check if response.data itself has applications array
      if (response.data && 'applications' in response.data) {
        return response.data as unknown as GetApplicationsResponse;
      }
      
      // Return empty structure if no valid data
      console.warn('Unexpected applications response structure:', response.data);
      return {
        applications: [],
        pagination: {
          current: 1,
          pages: 1,
          total: 0
        }
      };
    } catch (error) {
      console.error('Applications API error:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get Applications (alias for getAllApplications)
   * For backward compatibility
   */
  async getApplications(params?: GetApplicationsParams): Promise<GetApplicationsResponse> {
    return this.getAllApplications(params);
  }

  /**
   * Get Application Details
   * GET /api/applications/admin/details/:applicationId
   */
  async getApplicationDetails(applicationId: string): Promise<Application> {
    try {
      const response = await apiClient.get<ApiResponse<Application>>(
        `/api/applications/admin/details/${applicationId}`
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update Application Status
   * PUT /api/applications/admin/update-status/:applicationId
   */
  async updateApplicationStatus(
    applicationId: string,
    data: UpdateApplicationStatusRequest
  ): Promise<Application> {
    try {
      const response = await apiClient.put<ApiResponse<Application>>(
        `/api/applications/admin/update-status/${applicationId}`,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get Application Statistics
   * GET /api/applications/admin/stats
   */
  async getApplicationStats(): Promise<ApplicationStats> {
    try {
      const response = await apiClient.get<ApiResponse<ApplicationStats>>(
        '/api/applications/admin/stats'
      );
      
      console.log('Application stats response:', response.data);
      
      // Handle different response structures
      if (response.data.data) {
        return response.data.data;
      }
      
      // Fallback: check if response.data itself has the stats
      if (response.data && 'total' in response.data) {
        return response.data as unknown as ApplicationStats;
      }
      
      // Return default stats if no valid data
      console.warn('Unexpected stats response structure:', response.data);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        underReview: 0,
        totalApprovedAmount: 0,
        averageProcessingTime: 0
      };
    } catch (error) {
      console.error('Application stats error:', error);
      // Return default stats on error instead of throwing
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        underReview: 0,
        totalApprovedAmount: 0,
        averageProcessingTime: 0
      };
    }
  }

  /**
   * Trigger Nokia Verification Manually
   * POST /api/applications/admin/verify-nokia/:applicationId
   */
  async triggerNokiaVerification(applicationId: string): Promise<NokiaVerification> {
    try {
      const response = await apiClient.post<ApiResponse<NokiaVerification>>(
        `/api/applications/admin/verify-nokia/${applicationId}`
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get Nokia Verification Status
   * GET /api/applications/admin/nokia-status/:applicationId
   */
  async getNokiaVerificationStatus(applicationId: string): Promise<NokiaVerification> {
    try {
      const response = await apiClient.get<ApiResponse<NokiaVerification>>(
        `/api/applications/admin/nokia-status/${applicationId}`
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Approve Application (convenience method)
   */
  async approveApplication(applicationId: string, reason?: string): Promise<Application> {
    return this.updateApplicationStatus(applicationId, {
      decision: 'approved',
      reason: reason || 'Application approved'
    });
  }

  /**
   * Reject Application (convenience method)
   */
  async rejectApplication(applicationId: string, reason: string): Promise<Application> {
    return this.updateApplicationStatus(applicationId, {
      decision: 'rejected',
      reason
    });
  }
}

// Export singleton instance
export default new ApplicationsAPI();
