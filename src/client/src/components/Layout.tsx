import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useOktaAuth } from '@okta/okta-react';

export default function Layout() {
  const { oktaAuth, authState } = useOktaAuth();
  const navigate = useNavigate();

  const logout = async () => {
    await oktaAuth.signOut();
    navigate('/');
  };

  return (
    <div className="app-shell">
      <header className="navbar">
        <Link to="/" className="brand">BookStore</Link>
        <nav className="nav-links">
          <Link to="/">Books</Link>
          <Link to="/profile">Profile</Link>
        </nav>
        <div className="nav-user">
          {authState?.idToken && (
            <span className="user-name">
              {authState.idToken.claims.name ?? authState.idToken.claims.email as string}
            </span>
          )}
          <button onClick={logout} className="btn-logout">Sign out</button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
