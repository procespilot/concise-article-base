
import React from 'react';
import DevTools from '@/components/DevTools';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const DevPage = () => {
  const { user, userRole } = useAuth();

  // Alleen managers en admins hebben toegang tot dev tools
  if (!user || (userRole !== 'manager' && userRole !== 'admin')) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <DevTools />
    </div>
  );
};

export default DevPage;
