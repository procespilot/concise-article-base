
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut, User, Settings, Bell } from 'lucide-react';

const Header = () => {
  const { user, profile, isManager, isAdmin, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
  };

  if (!user) return null;

  const getDisplayName = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile?.first_name) {
      return profile.first_name;
    }
    return user.email;
  };

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
          {getDisplayName()}
          {(isManager || isAdmin) && (
            <span className="ml-1 text-blue-600 font-medium">
              {getRoleDisplay()}
            </span>
          )}
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/notifications">
            <Bell className="w-4 h-4" />
          </Link>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            // Use a custom event to communicate with the main app
            window.dispatchEvent(new CustomEvent('navigate-to-settings'));
          }}
        >
          <Settings className="w-4 h-4" />
        </Button>
        
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Uitloggen
        </Button>
      </div>
    </div>
  );
};

export default Header;
