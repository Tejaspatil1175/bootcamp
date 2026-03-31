import apiClient from './api';

// Default location for Nokia simulator
const DEFAULT_LOCATION = {
  latitude: 19.160422047462603,
  longitude: 47.44178899529922,
};

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  latitude?: number;
  longitude?: number;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
  };
  kycStatus?: {
    kycId: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
    nokiaVerification?: any;
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

/**
 * Register new user with Nokia KYC check
 */
export const register = async (data: RegisterData): Promise<RegisterResponse> => {
  try {
    // Add default location to registration data
    const registrationPayload = {
      ...data,
      phoneNumber: `+9${data.phone}`, // Format to E.164
      latitude: data.latitude || DEFAULT_LOCATION.latitude,
      longitude: data.longitude || DEFAULT_LOCATION.longitude,
    };

    console.log('📤 Registration payload:', registrationPayload);

    const response = await apiClient.post<RegisterResponse>(
      '/auth/register-with-kyc',
      registrationPayload
    );

    // Store token if registration successful
    if (response.data.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Registration failed. Please try again.',
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Login user
 */
export const login = async (data: LoginData): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);

    if (response.data.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error: any) {
    console.error('❌ Login error:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Login failed. Please try again.',
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    await apiClient.get('/auth/logout');
  } catch (error) {
    console.error('❌ Logout error:', error);
  } finally {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};

/**
 * Get user profile
 */
export const getProfile = async () => {
  try {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  } catch (error: any) {
    console.error('❌ Get profile error:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (data: {
  name?: string;
  phoneNumber?: string;
  address?: string;
  upiId?: string;
}) => {
  try {
    const response = await apiClient.put('/auth/profile', data);
    
    // Update stored user data if successful
    if (response.data.success && response.data.user) {
      const currentUser = localStorage.getItem('user');
      if (currentUser) {
        const user = JSON.parse(currentUser);
        localStorage.setItem('user', JSON.stringify({ ...user, ...response.data.user }));
      }
    }
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Update profile error:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Profile update failed',
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Update notification preferences
 */
export const updateNotificationPreferences = async (preferences: {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
  securityAlerts?: boolean;
  transactionAlerts?: boolean;
  marketingEmails?: boolean;
}) => {
  try {
    const response = await apiClient.put('/auth/notification-preferences', preferences);
    return response.data;
  } catch (error: any) {
    console.error('❌ Update notification preferences error:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to update notification preferences',
      error: error.response?.data || error.message,
    };
  }
};

