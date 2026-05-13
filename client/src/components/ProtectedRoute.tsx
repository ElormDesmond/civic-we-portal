import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-red-50 border border-red-200 rounded-2xl text-center">
        <span className="text-5xl mb-4 block">🚫</span>
        <h2 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h2>
        <p className="text-red-700">You do not have the required permissions to view this page.</p>
        <Navigate to="/" replace />
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
