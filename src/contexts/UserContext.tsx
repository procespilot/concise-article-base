
import React, { createContext, useContext, useState } from 'react';

type UserRole = 'user' | 'manager';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isManager: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: '1',
    name: 'Jan Doe',
    email: 'jan.doe@example.com',
    role: 'user' // Change this to 'manager' to test manager view
  });

  const isManager = user?.role === 'manager';

  return (
    <UserContext.Provider value={{ user, setUser, isManager }}>
      {children}
    </UserContext.Provider>
  );
};
