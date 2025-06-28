
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import UserSettings from '@/components/UserSettings';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const UserSettingsPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <UserSettings />;
};

export default UserSettingsPage;
