
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'manager';
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate login - in real app this would call an API
    if (email === 'manager@example.com' && password === 'password') {
      const managerUser = {
        id: '1',
        name: 'Manager User',
        email: 'manager@example.com',
        role: 'manager' as const
      };
      setUser(managerUser);
      localStorage.setItem('auth_user', JSON.stringify(managerUser));
      return true;
    } else if (email === 'user@example.com' && password === 'password') {
      const regularUser = {
        id: '2',
        name: 'Regular User',
        email: 'user@example.com',
        role: 'user' as const
      };
      setUser(regularUser);
      localStorage.setItem('auth_user', JSON.stringify(regularUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isManager: user?.role === 'manager'
    }}>
      {children}
    </AuthContext.Provider>
  );
};
