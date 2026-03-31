import apiClient, { handleApiError } from './config';
import type {
  Transaction,
  GetFlaggedTransactionsParams,
  GetFlaggedTransactionsResponse,
  ReviewTransactionRequest,
  TransactionStats,
  ApiResponse,
} from '../types/api';

/**
 * Transactions API Service
 */
class TransactionsAPI {
  /**
   * Get Flagged/Blocked Transactions
   * GET /api/transactions/admin/flagged
   */
  async getFlaggedTransactions(
    params?: GetFlaggedTransactionsParams
  ): Promise<GetFlaggedTransactionsResponse> {
    try {
      const response = await apiClient.get<ApiResponse<GetFlaggedTransactionsResponse>>(
        '/api/transactions/admin/flagged',
        { params }
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Review Transaction (Approve/Reject)
   * PUT /api/transactions/admin/:transactionId/review
   * 
   * IMPORTANT: Use TRANSACTION ID (like TXN_20251008_1234), NOT Application ID
   */
  async reviewTransaction(
    transactionId: string,
    data: ReviewTransactionRequest
  ): Promise<Transaction> {
    try {
      const response = await apiClient.put<ApiResponse<Transaction>>(
        `/api/transactions/admin/${transactionId}/review`,
        data
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get Transaction Statistics
   * GET /api/transactions/admin/stats
   */
  async getTransactionStats(): Promise<TransactionStats> {
    try {
      const response = await apiClient.get<ApiResponse<TransactionStats>>(
        '/api/transactions/admin/stats'
      );
      return response.data.data!;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }
}

// Export singleton instance
export default new TransactionsAPI();
