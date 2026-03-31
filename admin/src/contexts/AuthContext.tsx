import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '@/api';
import { toast } from 'sonner';

interface User {
id: string;
email: string;
role: string;
name: string;
}

interface AuthContextType {
user: User | null;
login: (email: string, password: string) => Promise<void>;
logout: () => void;
isAuthenticated: boolean;
isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
const [user, setUser] = useState<User | null>(null);
const [isLoading, setIsLoading] = useState(true);
const navigate = useNavigate();

useEffect(() => {
// Check if admin is already logged in
const storedAdmin = authAPI.getStoredAdmin();
const isAuth = authAPI.isAuthenticated();
    
if (isAuth && storedAdmin) {
setUser({
id: storedAdmin.adminId,
email: storedAdmin.email,
role: storedAdmin.role,
name: storedAdmin.name,
});
}
setIsLoading(false);
}, []);

const login = async (email: string, password: string) => {
try {
const response = await authAPI.login({ email, password });
      
setUser({
id: response.admin.adminId,
email: response.admin.email,
role: response.admin.role,
name: response.admin.name,
});
      
toast.success('Login successful!');
navigate('/dashboard');
} catch (error) {
const errorMessage = error instanceof Error ? error.message : 'Login failed';
toast.error(errorMessage);
throw error;
}
};

const logout = () => {
authAPI.logout();
setUser(null);
toast.success('Logged out successfully');
navigate('/login');
};

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
