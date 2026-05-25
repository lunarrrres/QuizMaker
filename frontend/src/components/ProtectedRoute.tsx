import { Navigate, Outlet } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { isAuthenticatedAtom } from '@/atoms/auth.atoms';
import { useEffect } from 'react';

export function ProtectedRoute() {
  const isAuthenticated = useAtomValue(isAuthenticatedAtom);

  useEffect(() => {
    console.log('ProtectedRoute check:', { isAuthenticated });
  }, [isAuthenticated]);

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
