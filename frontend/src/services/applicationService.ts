import apiClient from './api';

export interface LoanApplicationData {
  loanAmount: number;
  loanPurpose: string;
  employmentType: string;
  monthlyIncome: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
}

export interface LoanApplication {
  applicationId: string;
  userId: string;
  loanAmount: number;
  loanPurpose: string;
  employmentType: string;
  monthlyIncome: number;
  address: string;
  status: string;
  fraudCheckResult?: any;
  nokiaVerification?: any;
  createdAt: string;
  updatedAt: string;
}

/**
 * Submit a new loan application
 */
export const submitLoanApplication = async (data: LoanApplicationData) => {
  try {
    // Build payload matching backend expected schema.
    // Keep simulator coordinates as defaults when not provided.
    const applicationData: any = {
      loanAmount: data.loanAmount,
      loanType: (data as any).loanType || 'personal',
      purpose: (data as any).loanPurpose || 'Personal',
      fullName: (data as any).fullName,
      phoneNumber: (data as any).phoneNumber,
      email: (data as any).email,
      dateOfBirth: (data as any).dateOfBirth,
      monthlyIncome: data.monthlyIncome,
      address: {
        street: (data as any).address?.street || '123 Test Street',
        city: (data as any).address?.city || (data as any).city || 'Mumbai',
        state: (data as any).address?.state || (data as any).state || 'Maharashtra',
        pincode: (data as any).address?.pincode || (data as any).pincode || '400001',
        latitude: (data as any).address?.latitude ?? data.latitude ?? 19.160422047462603,
        longitude: (data as any).address?.longitude ?? data.longitude ?? 47.44178899529922,
      }
    };

    const response = await apiClient.post('/applications/submit', applicationData);
    return response.data;
  } catch (error: any) {
    console.error('❌ Submit application error:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Application submission failed',
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Get user's loan applications
 */
export const getUserApplications = async () => {
  try {
    const response = await apiClient.get('/applications/my-applications');
    return response.data;
  } catch (error: any) {
    console.error('❌ Get user applications error:', error);
    throw error;
  }
};

/**
 * Get application details by ID
 */
export const getApplicationById = async (applicationId: string) => {
  try {
    const response = await apiClient.get(`/applications/my-application/${applicationId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Get application details error:', error);
    throw error;
  }
};

/**
 * Admin: Get all loan applications
 */
export const getAllApplications = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  sort?: string;
}) => {
  try {
    const response = await apiClient.get('/applications/admin/all', { params });
    return response.data;
  } catch (error: any) {
    console.error('❌ Get all applications error:', error);
    throw error;
  }
};

/**
 * Admin: Get application details
 */
export const getApplicationDetails = async (applicationId: string) => {
  try {
    const response = await apiClient.get(`/applications/admin/details/${applicationId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Get application details error:', error);
    throw error;
  }
};

/**
 * Admin: Update application status
 */
export const updateApplicationStatus = async (
  applicationId: string,
  data: {
    status: string;
    remarks?: string;
  }
) => {
  try {
    const response = await apiClient.put(`/applications/admin/update-status/${applicationId}`, data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Update application status error:', error);
    throw error;
  }
};

/**
 * Admin: Get application statistics
 */
export const getApplicationStats = async () => {
  try {
    const response = await apiClient.get('/applications/admin/stats');
    return response.data;
  } catch (error: any) {
    console.error('❌ Get application stats error:', error);
    throw error;
  }
};

/**
 * Admin: Trigger Nokia verification for application
 */
export const triggerNokiaVerification = async (applicationId: string) => {
  try {
    const response = await apiClient.post(`/applications/admin/verify-nokia/${applicationId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Trigger Nokia verification error:', error);
    throw error;
  }
};

/**
 * Get Nokia verification status for application
 */
export const getNokiaVerificationStatus = async (applicationId: string) => {
  try {
    const response = await apiClient.get(`/applications/nokia-status/${applicationId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Get Nokia verification status error:', error);
    throw error;
  }
};
