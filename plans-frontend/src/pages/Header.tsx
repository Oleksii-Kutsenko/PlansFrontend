import type { FC } from 'react';
import { Nav, Navbar } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import type { RootState } from '../store';
import { logout } from '../store';

const Header: FC = () => {
  const dispatch = useDispatch();

  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated) || false;

  const handleLogout = (): void => {
    dispatch(logout());
    window.location.replace('/login');
  };

  return (
    <Navbar>
      {isAuthenticated ? (
        <>
          <Nav className="me-auto">
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
              <NavLink to="/portfolios" className="nav-link">
                Portfolios
              </NavLink>
            </Nav.Item>
            <Nav.Item>
              <NavLink to="/wealth-management" className="nav-link">
                Wealth Management
              </NavLink>
            </Nav.Item>
          </Nav>
          <Nav>
            <Nav.Item>
              <NavLink to="/profile" className="nav-link">
                Profile
              </NavLink>
            </Nav.Item>
            <Nav.Item>
              <NavLink to="/login" className="nav-link" onClick={handleLogout}>
                Logout
              </NavLink>
            </Nav.Item>
          </Nav>
        </>
      ) : (
        <Nav>
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
        </Nav>
      )}
    </Navbar>
  );
};

export default Header;
