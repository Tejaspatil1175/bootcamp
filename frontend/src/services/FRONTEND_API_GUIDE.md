# Frontend API Integration Guide

## 📚 Overview
All backend APIs are now integrated into the frontend with TypeScript support and proper error handling.

---

## 🔧 Setup

### Installation
Axios is already installed. Import services as needed:

```typescript
// Import specific services
import { register, login } from '@/services/authService';
import { getKYCStatus } from '@/services/kycService';
import { initiatePayment } from '@/services/transactionService';

// Or import everything
import * as services from '@/services';
```

### Environment Configuration
`.env` file in frontend root:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📋 Available Services

### 1. **Authentication Service** (`authService.ts`)

#### Register with Nokia KYC
```typescript
import { register } from '@/services/authService';

const response = await register({
  name: 'John Doe',
  email: 'john@example.com',
  phone: '9876543210',
});
```

#### Login, Logout, Profile
```typescript
import { login, logout, getProfile } from '@/services/authService';

await login({ email: 'john@example.com', password: 'password123' });
const profile = await getProfile();
await logout();
```

---

### 2. **KYC Service** (`kycService.ts`)
```typescript
import { getKYCStatus, getUserKYC, retryKYCVerification } from '@/services/kycService';

const status = await getKYCStatus(kycId);
const records = await getUserKYC();
await retryKYCVerification(kycId);
```

---

### 3. **Transaction Service** (`transactionService.ts`)
```typescript
import { 
  initiatePayment, 
  getTransactionHistory,
  cancelTransaction 
} from '@/services/transactionService';

const result = await initiatePayment({
  recipientUpiId: 'merchant@upi',
  amount: 1000,
  description: 'Purchase'
});
```

---

### 4. **Application Service** (`applicationService.ts`)
```typescript
import { submitLoanApplication, getUserApplications } from '@/services/applicationService';

const result = await submitLoanApplication({
  loanAmount: 50000,
  loanPurpose: 'Personal',
  employmentType: 'Salaried',
  monthlyIncome: 30000,
  address: '123 Main St',
  city: 'Mumbai',
  state: 'Maharashtra',
  pincode: '400001'
});
```

---

### 5. **Admin Service** (`adminService.ts`)
```typescript
import { adminLogin, getDashboardStats, getAllUsers } from '@/services/adminService';

await adminLogin({ email: 'admin@example.com', password: 'admin123' });
const stats = await getDashboardStats();
const users = await getAllUsers({ page: 1, limit: 50 });
```

---

### 6. **Security Service** (`securityService.ts`)
```typescript
import { 
  getMySecurityAlerts, 
  acknowledgeSecurityAlert,
  getAllSecurityAlerts,
  unfreezeAccount 
} from '@/services/securityService';

const alerts = await getMySecurityAlerts();
await acknowledgeSecurityAlert(alertId);
```

---

## 🔄 Complete Examples

### Payment Flow with Error Handling
```typescript
import { useState } from 'react';
import { initiatePayment } from '@/services/transactionService';
import { useToast } from '@/hooks/use-toast';

const PaymentComponent = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      const result = await initiatePayment({
        recipientUpiId: 'merchant@upi',
        amount: 1000,
        description: 'Product purchase',
        pin: '1234'
      });

      if (result.success) {
        const fraudResult = result.fraudCheckResult;
        
        if (fraudResult.riskLevel === 'HIGH' || fraudResult.riskLevel === 'CRITICAL') {
          toast({
            title: 'Payment Flagged',
            description: 'Your payment requires manual review',
            variant: 'destructive'
          });
        } else {
          toast({
            title: 'Payment Successful',
            description: `Transaction ID: ${result.transaction.transactionId}`
          });
        }
      }
      
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.message || 'Please try again',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePayment} disabled={loading}>
      {loading ? 'Processing...' : 'Pay Now'}
    </button>
  );
};
```

---

### Real-time KYC Status Polling
```typescript
import { useState, useEffect } from 'react';
import { getKYCStatus } from '@/services/kycService';

const KYCStatusComponent = ({ kycId }: { kycId: string }) => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        const response = await getKYCStatus(kycId);
        setStatus(response);

        if (response.status === 'COMPLETED' || 
            response.status === 'FAILED' || 
            response.status === 'FLAGGED') {
          clearInterval(interval);
          setLoading(false);
        }
      } catch (error) {
        console.error('KYC status error:', error);
      }
    };

    pollStatus();
    interval = setInterval(pollStatus, 2000);

    return () => clearInterval(interval);
  }, [kycId]);

  if (loading) return <div>Verifying...</div>;

  return (
    <div>
      <h3>KYC Status: {status?.status}</h3>
      {status?.nokiaVerification && (
        <>
          <p>Risk Score: {status.nokiaVerification.riskScore}/100</p>
          <p>Risk Level: {status.nokiaVerification.riskLevel}</p>
        </>
      )}
    </div>
  );
};
```

---

## 📝 All API Endpoints

### Authentication
- `POST /api/auth/register-with-kyc` - Register with Nokia KYC
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get profile
- `PUT /api/auth/profile` - Update profile

### KYC
- `GET /api/kyc/status/:kycId` - Get KYC status
- `GET /api/kyc/my-kyc` - Get my KYC records
- `POST /api/kyc/retry/:kycId` - Retry verification

### Transactions
- `POST /api/transactions/initiate` - Initiate payment
- `GET /api/transactions/history` - Transaction history
- `GET /api/transactions/:id` - Transaction details
- `POST /api/transactions/:id/cancel` - Cancel transaction

### Applications
- `POST /api/applications/submit` - Submit application
- `GET /api/applications/my-applications` - My applications
- `GET /api/applications/nokia-status/:id` - Nokia status

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard/stats` - Dashboard stats
- `GET /api/admin/users` - All users
- `GET /api/applications/admin/all` - All applications
- `GET /api/transactions/admin/flagged` - Flagged transactions

### Security
- `GET /api/auth/security-alerts` - My alerts
- `GET /api/admin/security/security-alerts` - All alerts
- `GET /api/admin/security/frozen-accounts` - Frozen accounts
- `POST /api/admin/security/unfreeze-account/:id` - Unfreeze

---

## 🎯 Quick Integration Checklist

- [x] ✅ All services created
- [x] ✅ TypeScript types defined
- [x] ✅ Error handling configured
- [x] ✅ Environment variables set
- [x] ✅ KYC integration complete
- [x] ✅ Nokia APIs integrated

---

## 💡 Best Practices

1. **Always use try-catch** for API calls
2. **Show loading states** during API operations
3. **Display user-friendly error messages** with toast
4. **Use TypeScript types** from `services/types.ts`
5. **Poll KYC status** instead of waiting synchronously
6. **Check fraud results** before finalizing transactions

---

## 📞 Support

All APIs are integrated and ready to use!

Import from `@/services` and follow the examples above.
