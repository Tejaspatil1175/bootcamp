import apiClient, { handleApiError } from './config';
import type {
  User,
  GetUsersResponse,
  PaginationParams,
  ApiResponse,
} from '../types/api';

/**
 * Users API Service
 */
class UsersAPI {
  /**
   * Get All Users
   * GET /admin/users
   */
  async getUsers(params?: PaginationParams): Promise<GetUsersResponse> {
    try {
      const response = await apiClient.get<ApiResponse<GetUsersResponse>>('/admin/users', {
        params,
      });
      
      console.log('Users API response:', response.data);
      
      // Handle different response structures
      if (response.data.data) {
        return response.data.data;
      }
      
      // Fallback: check if response.data itself has users array
      if (response.data && 'users' in response.data) {
        return response.data as unknown as GetUsersResponse;
      }
      
      // Return empty structure if no valid data
      console.warn('Unexpected users response structure:', response.data);
      return {
        users: [],
        pagination: {
          current: 1,
          pages: 1,
          total: 0
        }
      };
    } catch (error) {
      console.error('Users API error:', error);
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get User Details by ID
   * GET /admin/users/:userId
   */
  async getUserById(userId: string): Promise<User> {
    try {
      const response = await apiClient.get<ApiResponse<User>>(`/admin/users/${userId}`);
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Update User Account Status
   * PUT /admin/users/:userId/status
   */
  async updateUserStatus(
    userId: string,
    status: 'active' | 'frozen' | 'suspended',
    reason: string
  ): Promise<User> {
    try {
      const response = await apiClient.put<ApiResponse<User>>(
        `/admin/users/${userId}/status`,
        { status, reason }
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export singleton instance
export default new UsersAPI();
