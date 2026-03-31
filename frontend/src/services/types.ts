// Common API Response Types

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  upiId?: string;
  status: 'ACTIVE' | 'FROZEN' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
}

// KYC Types
export interface KYCRecord {
  kycId: string;
  userId: string;
  phoneNumber: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'FLAGGED';
  nokiaVerification?: NokiaVerification;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NokiaVerification {
  riskScore: number;
  riskLevel: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskFactors: string[];
  recommendation: 'APPROVE' | 'PROCEED_WITH_CAUTION' | 'ADDITIONAL_VERIFICATION' | 'MANUAL_REVIEW' | 'REJECT';
  nokiaResults: {
    numberVerification: any;
    simSwapDetection: any;
    deviceSwapDetection: any;
    locationVerification: any;
  };
  confidence: number;
  timestamp: string;
}

// Transaction Types
export interface Transaction {
  transactionId: string;
  userId: string;
  recipientUpiId: string;
  amount: number;
  description: string;
  status: 'PENDING' | 'PROCESSING' | 'APPROVED' | 'REJECTED' | 'FAILED' | 'CANCELLED';
  fraudCheckResult?: FraudCheckResult;
  nokiaVerification?: NokiaVerification;
  createdAt: string;
  updatedAt: string;
}

export interface FraudCheckResult {
  riskScore: number;
  riskLevel: string;
  riskFactors: string[];
  recommendation: string;
  autoAction?: string;
}

// Application Types
export interface LoanApplication {
  applicationId: string;
  userId: string;
  loanAmount: number;
  loanPurpose: string;
  employmentType: string;
  monthlyIncome: number;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  fraudCheckResult?: FraudCheckResult;
  nokiaVerification?: NokiaVerification;
  createdAt: string;
  updatedAt: string;
}

// Security Types
export interface SecurityAlert {
  alertId: string;
  userId: string;
  transactionId?: string;
  type: 'FRAUD_DETECTED' | 'ACCOUNT_FROZEN' | 'SUSPICIOUS_ACTIVITY' | 'HIGH_RISK_TRANSACTION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED';
  description: string;
  metadata: any;
  createdAt: string;
  resolvedAt?: string;
}

export interface FrozenAccount {
  freezeId: string;
  userId: string;
  reason: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'UNFROZEN';
  frozenAt: string;
  unfrozenAt?: string;
  unfrozenBy?: string;
}

// Statistics Types
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

export interface TransactionStats {
  totalTransactions: number;
  totalAmount: number;
  flaggedCount: number;
  approvedCount: number;
  rejectedCount: number;
  averageAmount: number;
}

export interface ApplicationStats {
  totalApplications: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  totalLoanAmount: number;
  averageLoanAmount: number;
  approvalRate: number;
}
