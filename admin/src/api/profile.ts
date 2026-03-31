import apiClient, { handleApiError } from './config';
import type { ApiResponse } from '../types/api';

class ProfileAPI {
  async getProfile(): Promise<any> {
    try {
      const res = await apiClient.get<ApiResponse>('/api/admin/profile');
      // Prefer .data property from ApiResponse
      if (res.data && res.data.data) return res.data.data;
      // Fallback to the whole response data if shape differs
      if (res.data) return res.data;
      return null;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

export default new ProfileAPI();
