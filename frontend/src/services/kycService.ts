import apiClient from './api';

export interface KYCStatus {
  success: boolean;
  kycId: string;
  userId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'FLAGGED';
  nokiaVerification?: {
    riskScore: number;
    riskLevel: string;
    riskFactors: string[];
    recommendation: string;
    nokiaResults: {
      numberVerification: any;
      simSwapDetection: any;
      deviceSwapDetection: any;
      locationVerification: any;
    };
    confidence: number;
    timestamp: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Get KYC status by ID
 */
export const getKYCStatus = async (kycId: string): Promise<KYCStatus> => {
  try {
    const response = await apiClient.get<KYCStatus>(`/kyc/status/${kycId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Get KYC status error:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to get KYC status',
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Get user's KYC records
 */
export const getUserKYC = async () => {
  try {
    const response = await apiClient.get('/kyc/my-kyc');
    return response.data;
  } catch (error: any) {
    console.error('❌ Get user KYC error:', error);
    throw error;
  }
};

/**
 * Retry Nokia verification for a KYC record
 */
export const retryKYCVerification = async (kycId: string) => {
  try {
    const response = await apiClient.post(`/kyc/retry/${kycId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Retry KYC verification error:', error);
    throw error;
  }
};
