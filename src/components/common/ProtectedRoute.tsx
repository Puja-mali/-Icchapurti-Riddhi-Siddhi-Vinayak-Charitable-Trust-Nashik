/**
 * Siddhivinayak Charitable Trust - Protected Route Guard
 *
 * Enforces:
 * 1. Authentication check (redirects unauthenticated users to /login)
 * 2. Role-Based Access Control (RBAC) (validates user.role against allowedRoles)
 * 3. Loading state preservation while session is being verified
 */

import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Heart } from 'lucide-react';
import { useAuth } from '@/src/context/AuthContext';
import { UserRole } from '@/src/services/authService';
import { useLanguage } from '@/src/context/LanguageContext';
import { Button } from './Button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const { t } = useLanguage();

  // Show dignified loading state while checking session
  if (isLoading) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full border-3 border-emerald-200 border-t-[#14532d] animate-spin mb-4" />
        <div className="flex items-center gap-2 text-sm font-serif font-bold text-stone-900">
          <Heart className="w-4 h-4 text-[#14532d] fill-[#14532d]" />
          <span>{t.common?.loading || 'Verifying credentials...'}</span>
        </div>
        <p className="text-xs text-stone-500 mt-1 max-w-xs">
          Checking your authenticated session with the Siddhivinayak Trust database...
        </p>
      </div>
    );
  }

  // If not authenticated, redirect to Login preserving redirect path
  if (!isAuthenticated || !user) {
    const loginTarget = location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
    return <Navigate to={loginTarget} state={{ from: location }} replace />;
  }

  // Check Role authorization if specific roles are required
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    const defaultRoute =
      user.role === 'ADMIN' || user.role === 'STAFF'
        ? '/admin'
        : user.role === 'VOLUNTEER'
        ? '/volunteer-portal'
        : '/dashboard';

    return (
      <div className="min-h-[65vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-md p-6 sm:p-8 border border-stone-200 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-serif font-bold text-stone-900">
              Access Restricted
            </h2>
            <p className="text-xs sm:text-sm text-stone-600">
              Your registered role (<span className="font-semibold uppercase text-[#14532d]">{user.role}</span>) does not have authorization to view this area.
            </p>
          </div>

          <div className="p-3 bg-stone-50 rounded-md border border-stone-200 text-left text-xs space-y-1 text-stone-600">
            <div className="flex justify-between">
              <span className="font-medium">Required Role(s):</span>
              <span className="font-mono font-semibold text-stone-800">
                {allowedRoles.join(' / ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Active Account:</span>
              <span className="font-mono text-stone-800">{user.email}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
            <Link to={defaultRoute} className="w-full sm:w-auto">
              <Button variant="primary" size="sm" className="w-full text-xs">
                Go to My Dashboard
              </Button>
            </Link>
            <Link to="/" className="w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              >
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
