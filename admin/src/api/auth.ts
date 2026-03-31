import apiClient, { handleApiError } from './config';
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  RegisterSuperAdminRequest,
  Admin,
  ApiResponse,
} from '../types/api';

/**
 * Admin Authentication API Service
 */
class AuthAPI {
  /**
   * Admin Login
   * POST /api/admin/login
   */
  async login(credentials: AdminLoginRequest): Promise<AdminLoginResponse> {
    try {
      const response = await apiClient.post<AdminLoginResponse>('/api/admin/login', credentials);
      
      // Store token and admin info in localStorage
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('admin', JSON.stringify(response.data.admin));
      }
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get Admin Profile
   * GET /api/admin/profile
   */
  async getProfile(): Promise<Admin> {
    try {
      const response = await apiClient.get<ApiResponse<Admin>>('/api/admin/profile');
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Register Super Admin (Initial Setup)
   * POST /api/admin/register-super-admin
   */
  async registerSuperAdmin(data: RegisterSuperAdminRequest): Promise<AdminLoginResponse> {
    try {
      const response = await apiClient.post<AdminLoginResponse>('/api/admin/register-super-admin', data);
      
      // Store token and admin info in localStorage
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        localStorage.setItem('admin', JSON.stringify(response.data.admin));
      }
      
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Logout - clear local storage
   */
  logout(): void {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
  }

  /**
   * Check if admin is logged in
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('adminToken');
  }

  /**
   * Get stored admin info
   */
  getStoredAdmin(): Admin | null {
    const adminStr = localStorage.getItem('admin');
    if (adminStr) {
      try {
        return JSON.parse(adminStr);
      } catch {
        return null;
      }
    }
    return null;
  }
}

// Export singleton instance
export default new AuthAPI();
