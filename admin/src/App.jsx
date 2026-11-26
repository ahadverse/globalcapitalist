import { useState } from 'react';
import { BrowserRouter, Link, Navigate, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { apiRequest } from './api';
import { AdminProvider, useAdmin } from './context/AdminContext';
import Icon from './components/Icon';
import DashboardPage from './pages/DashboardPage';
import PostsPage from './pages/PostsPage';
import PostEditorPage from './pages/PostEditorPage';
import ContactMessagesPage from './pages/ContactMessagesPage';

function LoginPage() {
  const { signIn } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      signIn(result.token, result.admin);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-shell">
      <div className="login-card">
        <div className="brand-mark">g.</div>
        <p className="eyebrow">GLOBALCAPITALIST</p>
        <h1>Welcome back.</h1>
        <p className="muted">Sign in to manage your stories and drafts.</p>
        <form className="login-form" onSubmit={submit}>
          <label htmlFor="login-email">Email address</label>
          <input id="login-email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
          <label htmlFor="login-password">Password</label>
          <input id="login-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          {error && <div className="notice error-notice" role="alert">{error}</div>}
          <button className="button primary full-width" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="login-footnote">Authorized editors only</p>
      </div>
    </main>
  );
}

function ProtectedRoute() {
  const { token } = useAdmin();
  return token ? <Outlet /> : <Navigate to="/login" replace />;
}

function AdminLayout() {
  const { admin, signOut } = useAdmin();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pageTitle = location.pathname.startsWith('/posts/new')
    ? 'New post'
    : location.pathname.includes('/edit')
      ? 'Edit post'
      : location.pathname.startsWith('/posts')
        ? 'Posts'
        : location.pathname.startsWith('/messages')
          ? 'Contact messages'
          : 'Overview';

  function closeMenu() {
    setMobileMenuOpen(false);
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        <Link className="brand" to="/dashboard" onClick={closeMenu}>
          <span className="brand-mark small">g.</span>
          <span>globalcapitalist<span className="brand-dot">.</span></span>
        </Link>
        <p className="nav-label">WORKSPACE</p>
        <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/dashboard" onClick={closeMenu}>
          <Icon name="grid" /> Overview
        </NavLink>
        <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/posts" end onClick={closeMenu}>
          <Icon name="file" /> All posts
        </NavLink>
        <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/posts/new" onClick={closeMenu}>
          <Icon name="plus" /> Add new post
        </NavLink>
        <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/messages" onClick={closeMenu}>
          <Icon name="mail" /> Contact messages
        </NavLink>
        <div className="sidebar-bottom">
          <div className="profile">
            <div className="avatar">{(admin?.email || 'A').slice(0, 1).toUpperCase()}</div>
            <div className="profile-copy">
              <strong>Administrator</strong>
              <span>{admin?.email || 'Signed in'}</span>
            </div>
            <button className="icon-button logout-button" type="button" title="Sign out" aria-label="Sign out" onClick={signOut}>
              <Icon name="logout" />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <button className="icon-button mobile-menu-button" type="button" aria-label="Toggle navigation" onClick={() => setMobileMenuOpen((open) => !open)}>
            <Icon name="menu" />
          </button>
          <div className="breadcrumb">Workspace <span>/</span> {pageTitle}</div>
          <a className="site-link" href={import.meta.env.VITE_SITE_URL || 'http://localhost:3000'} target="_blank" rel="noreferrer">
            View site <Icon name="arrow" size={15} />
          </a>
        </header>
        <Outlet />
      </main>
    </div>
  );
}

function RouteContent() {
  const { token } = useAdmin();
  return (
    <Routes>
      <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/posts" element={<PostsPage />} />
          <Route path="/posts/new" element={<PostEditorPage />} />
          <Route path="/posts/:id/edit" element={<PostEditorPage />} />
          <Route path="/messages" element={<ContactMessagesPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to={token ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AdminProvider>
        <RouteContent />
      </AdminProvider>
    </BrowserRouter>
  );
}
