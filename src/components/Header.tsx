
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

const Header = () => {
  const { user, isManager, isAdmin, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  if (!user) return null;

  const getRoleDisplay = () => {
    if (isAdmin) return "(Admin)";
    if (isManager) return "(Manager)";
    return "";
  };

  return (
    <div className="flex items-center justify-end space-x-4">
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <User className="w-4 h-4" />
        <span>
          {user.email}
          {(isManager || isAdmin) && (
            <span className="ml-1 text-blue-600 font-medium">
              {getRoleDisplay()}
            </span>
          )}
        </span>
      </div>
      <Button variant="outline" size="sm" onClick={handleLogout}>
        <LogOut className="w-4 h-4 mr-2" />
        Uitloggen
      </Button>
    </div>
  );
};

export default Header;
