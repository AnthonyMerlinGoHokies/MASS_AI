import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [forceRender, setForceRender] = useState(false);

  // Safety timeout - if loading takes more than 6 seconds, force render or redirect
  useEffect(() => {
    if (loading) {
      console.log('ProtectedRoute: Waiting for auth...');
      const timeoutId = setTimeout(() => {
        console.warn('ProtectedRoute: Loading timeout exceeded, forcing render decision');
        setForceRender(true);
      }, 6000);

      return () => clearTimeout(timeoutId);
    }
  }, [loading]);

  // Show loading state while checking authentication (with timeout)
  if (loading && !forceRender) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0A0E12' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-t-2" style={{ borderColor: '#00C8FF' }}></div>
          <p className="mt-4 text-white font-inter">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to auth page if not authenticated
  if (!user) {
    // Save the location they were trying to access
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // User is authenticated, render the protected content
  return <>{children}</>;
}
