import apiClient from './api';

export interface InitiatePaymentData {
  receiverUPI: string;
  receiverName: string;
  amount: number;
  description?: string;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

export interface Transaction {
  transactionId: string;
  userId: string;
  recipientUpiId: string;
  amount: number;
  description: string;
  status: string;
  fraudCheckResult?: any;
  createdAt: string;
  updatedAt: string;
}

export interface TransactionStats {
  totalTransactions: number;
  totalAmount: number;
  flaggedCount: number;
  approvedCount: number;
  rejectedCount: number;
}

/**
 * Initiate a new payment transaction
 */
export const initiatePayment = async (data: InitiatePaymentData) => {
  try {
    const response = await apiClient.post('/transactions/initiate', data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Initiate payment error:', error);
    throw {
      success: false,
      message: error.response?.data?.message || 'Payment initiation failed',
      error: error.response?.data || error.message,
    };
  }
};

/**
 * Get transaction history
 */
export const getTransactionHistory = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  try {
    const response = await apiClient.get('/transactions/history', { params });
    return response.data;
  } catch (error: any) {
    console.error('❌ Get transaction history error:', error);
    throw error;
  }
};

/**
 * Get transaction details by ID
 */
export const getTransactionDetails = async (transactionId: string) => {
  try {
    const response = await apiClient.get(`/transactions/${transactionId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Get transaction details error:', error);
    throw error;
  }
};

/**
 * Get user transaction statistics
 */
export const getUserTransactionStats = async () => {
  try {
    const response = await apiClient.get('/transactions/stats/user');
    return response.data;
  } catch (error: any) {
    console.error('❌ Get transaction stats error:', error);
    throw error;
  }
};

/**
 * Cancel a pending transaction
 */
export const cancelTransaction = async (transactionId: string) => {
  try {
    const response = await apiClient.post(`/transactions/${transactionId}/cancel`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Cancel transaction error:', error);
    throw error;
  }
};

/**
 * Admin: Get flagged transactions
 */
export const getFlaggedTransactions = async (params?: {
  page?: number;
  limit?: number;
  riskLevel?: string;
}) => {
  try {
    const response = await apiClient.get('/transactions/admin/flagged', { params });
    return response.data;
  } catch (error: any) {
    console.error('❌ Get flagged transactions error:', error);
    throw error;
  }
};

/**
 * Admin: Review transaction
 */
export const reviewTransaction = async (
  transactionId: string,
  data: {
    action: 'APPROVE' | 'REJECT';
    notes?: string;
  }
) => {
  try {
    const response = await apiClient.put(`/transactions/admin/${transactionId}/review`, data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Review transaction error:', error);
    throw error;
  }
};

/**
 * Admin: Get transaction statistics
 */
export const getAdminTransactionStats = async () => {
  try {
    const response = await apiClient.get('/transactions/admin/stats');
    return response.data;
  } catch (error: any) {
    console.error('❌ Get admin transaction stats error:', error);
    throw error;
  }
};
