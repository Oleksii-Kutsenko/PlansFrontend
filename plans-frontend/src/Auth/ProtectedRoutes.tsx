import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getToken } from './TokenSlice';

const ProtectedRoutes = (): JSX.Element => {
  const token = useSelector(getToken);

  return token !== null && token !== undefined ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoutes;
