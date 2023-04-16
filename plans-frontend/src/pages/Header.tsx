import type { FC } from 'react';
import { Nav } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import type { RootState } from '../store';
import authSlice from '../store/slices/auth';

const Header: FC = () => {
  const dispatch = useDispatch();

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated) || false;

  const handleLogout = (): void => {
    dispatch(authSlice.actions.logout());
    window.location.replace('/login');
  };

  return (
    <Nav>
      {isAuthenticated ? (
        <>
          <Nav.Item>
            <NavLink to="/" className="nav-link">
              Home
            </NavLink>
          </Nav.Item>
          <Nav.Item>
            <NavLink to="/countries" className="nav-link">
              Countries
            </NavLink>
          </Nav.Item>
          <Nav.Item>
            <NavLink to="/login" className="nav-link" onClick={handleLogout}>
              Logout
            </NavLink>
          </Nav.Item>
        </>
      ) : (
        <>
          <Nav.Item>
            <NavLink to="/login" className="nav-link">
              Login
            </NavLink>
          </Nav.Item>
          <Nav.Item>
            <NavLink to="/register" className="nav-link">
              Register
            </NavLink>
          </Nav.Item>
        </>
      )}
    </Nav>
  );
};

export default Header;
