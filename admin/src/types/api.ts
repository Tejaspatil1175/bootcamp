// ==================== COMMON TYPES ====================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationInfo {
  current: number;
  pages: number;
  total: number;
}

// ==================== AUTH TYPES ====================

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  token: string;
  admin: Admin;
}

export interface Admin {
  adminId: string;
  name: string;
  email: string;
  role: 'super_admin' | 'loan_officer' | 'risk_analyst' | 'support_admin';
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

export interface RegisterSuperAdminRequest {
  name: string;
  email: string;
  password: string;
}

// ==================== DASHBOARD TYPES ====================

export interface DashboardStats {
  users: {
    total: number;
    active: number;
    frozen: number;
    newThisMonth: number;
  };
  applications: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  transactions: {
    total: number;
    totalVolume: number;
    flagged: number;
    blocked: number;
  };
  security: {
    activeAlerts: number;
    criticalAlerts: number;
    frozenAccounts: number;
  };
}

// ==================== USER TYPES ====================

export interface User {
  userId: string;
  name: string;
  email: string;
  phoneNumber?: string;
  upiId?: string;
  accountStatus: 'active' | 'frozen' | 'suspended';
  accountFrozenAt?: string;
  accountFrozenReason?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface GetUsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

// ==================== APPLICATION TYPES ====================

export interface Application {
  applicationId: string;
  userId: {
    userId: string;
    name: string;
    email: string;
  };
  loanAmount: number;
  loanType: string;
  purpose: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review';
  decision?: {
    decision: 'approved' | 'rejected';
    reason?: string;
    approvedAmount?: number;
    decidedBy?: string;
    decidedAt?: string;
  };
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  monthlyIncome: number;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
  };
  nokiaVerification?: NokiaVerification;
  createdAt: string;
  updatedAt: string;
}

export interface NokiaVerification {
  verified: boolean;
  verifiedAt?: string;
  riskScore?: number;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details?: {
    simSwap?: any;
    deviceLocation?: any;
    networkAnomaly?: any;
  };
}

export interface GetApplicationsParams extends PaginationParams {
  status?: string;
  search?: string;
}

export interface GetApplicationsResponse {
  applications: Application[];
  pagination: PaginationInfo;
}

export interface UpdateApplicationStatusRequest {
  decision: 'approved' | 'rejected';
  reason?: string;
  approvedAmount?: number;
}

export interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  underReview: number;
  totalApprovedAmount: number;
  averageProcessingTime: number;
}

// ==================== TRANSACTION TYPES ====================

export interface Transaction {
  transactionId: string;
  userId: {
    userId: string;
    name: string;
    email: string;
  };
  amount: number;
  receiverUPI: string;
  receiverName: string;
  description?: string;
  status: 'completed' | 'pending' | 'blocked' | 'failed' | 'cancelled';
  fraudCheck?: {
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    isBlocked: boolean;
    flags: string[];
    verifications?: any;
  };
  adminReview?: {
    reviewedBy: string;
    reviewedAt: string;
    decision: 'approved' | 'rejected';
    comments?: string;
  };
  createdAt: string;
  completedAt?: string;
}

export interface GetFlaggedTransactionsParams extends PaginationParams {
  severity?: 'HIGH' | 'CRITICAL';
}

export interface GetFlaggedTransactionsResponse {
  transactions: Transaction[];
  pagination: PaginationInfo;
}

export interface ReviewTransactionRequest {
  decision: 'approved' | 'rejected';
  comments?: string;
}

export interface TransactionStats {
  total: number;
  totalVolume: number;
  completed: number;
  pending: number;
  blocked: number;
  flagged: number;
  averageAmount: number;
}

// ==================== SECURITY TYPES ====================

export interface SecurityAlert {
  alertId: string;
  userId: {
    userId: string;
    name: string;
    email: string;
  };
  type: 'ACCOUNT_FROZEN' | 'SUSPICIOUS_TRANSACTION' | 'SIM_SWAP_DETECTED' | 'LOCATION_ANOMALY' | 'HIGH_RISK_TRANSACTION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'RESOLVED' | 'ACKNOWLEDGED';
  message: string;
  metadata?: any;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
}

export interface GetSecurityAlertsParams {
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status?: 'OPEN' | 'RESOLVED' | 'ACKNOWLEDGED';
}

export interface GetSecurityAlertsResponse {
  alerts: SecurityAlert[];
  total: number;
}

export interface GetFrozenAccountsParams extends PaginationParams {}

export interface GetFrozenAccountsResponse {
  users: User[];
  pagination: PaginationInfo;
}

export interface UnfreezeAccountRequest {
  notes: string;
}

export interface ResolveAlertRequest {
  notes: string;
}
