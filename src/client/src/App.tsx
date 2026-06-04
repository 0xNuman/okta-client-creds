import { Outlet, Route, Routes } from 'react-router-dom';
import { LoginCallback, useOktaAuth } from '@okta/okta-react';
import Layout from './components/Layout';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

function RequireAuth() {
  const { authState, oktaAuth } = useOktaAuth();

  if (!authState) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Checking authentication…</p>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    oktaAuth.signInWithRedirect({ originalUri: window.location.href });
    return null;
  }

  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login/callback" element={<LoginCallback />} />
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          <Route path="/" element={<BooksPage />} />
          <Route path="/books/:id" element={<BookDetailPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
}
