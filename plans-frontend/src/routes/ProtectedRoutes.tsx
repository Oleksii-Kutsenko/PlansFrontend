import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { JSX } from 'react';

const ProtectedRoutes = (): JSX.Element => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated) ?? {
    isAuthenticated: false
  };

  return isAuthenticated ? <Outlet /> : <Navigate to='/login' />;
};

export default ProtectedRoutes;
