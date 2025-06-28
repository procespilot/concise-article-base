
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import NotificationCenter from '@/components/NotificationCenter';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const NotificationsPage = () => {
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

  return (
    <div className="container mx-auto px-4 py-8">
      <NotificationCenter />
    </div>
  );
};

export default NotificationsPage;
