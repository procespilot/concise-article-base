
import React, { createContext, useContext } from 'react';
import { useAuth as useSupabaseAuth } from '@/hooks/useAuth';

interface AuthContextType {
  user: any;
  profile: any;
  userRole: string;
  loading: boolean;
  signOut: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isManager: boolean;
  isAdmin: boolean;
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
  const authData = useSupabaseAuth();

  return (
    <AuthContext.Provider value={authData}>
      {children}
    </AuthContext.Provider>
  );
};
