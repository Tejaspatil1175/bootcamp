import apiClient from './api';

export interface AdminLoginData {
  email: string;
  password: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalApplications: number;
  totalTransactions: number;
  flaggedAccounts: number;
  pendingReviews: number;
  totalRevenue: number;
  approvalRate: number;
  fraudDetectionRate: number;
}

/**
 * Admin login
 */
export const adminLogin = async (data: AdminLoginData) => {
  try {
    const response = await apiClient.post('/admin/login', data);
    
    if (response.data.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.admin));
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Admin login error:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Login failed',
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  } catch (error: any) {
    console.error('❌ Get dashboard stats error:', error);
    throw error;
  }
};

/**
 * Get all users
 */
export const getAllUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  try {
    const response = await apiClient.get('/admin/users', { params });
    return response.data;
  } catch (error: any) {
    console.error('❌ Get all users error:', error);
    throw error;
  }
};

/**
 * Get user details by ID
 */
export const getUserDetails = async (userId: string) => {
  try {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Get user details error:', error);
    throw error;
  }
};

/**
 * Update user status (freeze/unfreeze account)
 */
export const updateUserStatus = async (
  userId: string,
  data: {
    status: 'ACTIVE' | 'FROZEN' | 'SUSPENDED';
    reason?: string;
  }
) => {
  try {
    const response = await apiClient.put(`/admin/users/${userId}/status`, data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Update user status error:', error);
    throw error;
  }
};

/**
 * Register super admin (initial setup)
 */
export const registerSuperAdmin = async (data: {
  username: string;
  email: string;
  password: string;
  fullName: string;
  employeeId: string;
}) => {
  try {
    const response = await apiClient.post('/admin/register-super-admin', data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Register super admin error:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Super admin registration failed',
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Create new admin (super admin only)
 */
export const createAdmin = async (data: {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: string;
  department: string;
  employeeId: string;
  permissions?: string[];
}) => {
  try {
    const response = await apiClient.post('/admin/create-admin', data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Create admin error:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Admin creation failed',
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Get admin profile
 */
export const getAdminProfile = async () => {
  try {
    const response = await apiClient.get('/admin/profile');
    return response.data;
  } catch (error: any) {
    console.error('❌ Get admin profile error:', error);
    throw error;
  }
};

/**
 * Admin: Verify phone via Nokia NAC
 */
export const verifyPhoneNumberAdmin = async () => {
  try {
    const response = await apiClient.get('/admin/profile/verify-phone');
    return response.data;
  } catch (error: any) {
    console.error('❌ Admin phone verification error:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Phone verification failed',
      error: error.response?.data || error.message,
    };
  }
};
