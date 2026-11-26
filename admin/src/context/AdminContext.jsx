import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { clearAdminSession, readAdminProfile, saveAdminSession, TOKEN_KEY } from '../api';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_KEY));
  const [admin, setAdmin] = useState(readAdminProfile);

  const signIn = useCallback((nextToken, profile) => {
    saveAdminSession(nextToken, profile);
    setAdmin(profile);
    setToken(nextToken);
  }, []);

  const signOut = useCallback(() => {
    clearAdminSession();
    setAdmin(null);
    setToken(null);
  }, []);

  const value = useMemo(() => ({ token, admin, signIn, signOut }), [token, admin, signIn, signOut]);
  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used inside AdminProvider');
  }
  return context;
}
