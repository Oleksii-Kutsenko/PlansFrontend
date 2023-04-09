import { Nav } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { clearToken } from '../Auth/TokenSlice';

const Header: React.FC = () => {
  const dispatch = useDispatch();

  const tokenState = useSelector<
    { token: { token: string | null; isAuthenticated: boolean } },
    { token: string | null; isAuthenticated: boolean }
  >((state) => state.token) ?? { token: null, isAuthenticated: false };

  const logout = (): void => {
    dispatch(clearToken());
    window.location.replace('/login');
  };
  return (
    <Nav>
      <Nav.Item>
        <NavLink to="/" className="nav-link">
          Home
        </NavLink>
      </Nav.Item>
      {tokenState.isAuthenticated ? (
        <Nav.Item>
          <NavLink to="/login" className="nav-link" onClick={logout}>
            Logout
          </NavLink>
        </Nav.Item>
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
