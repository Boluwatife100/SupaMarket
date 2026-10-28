import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const TOKEN_KEY = 'shop.token';
const USER_KEY = 'shop.user';

const AuthContext = createContext(null);

function readSession() {
  try {
    return { token: localStorage.getItem(TOKEN_KEY), user: JSON.parse(localStorage.getItem(USER_KEY) || 'null') };
  } catch {
    return { token: null, user: null };
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);

  const login = useCallback(({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setSession({ token, user });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setSession({ token: null, user: null });
  }, []);

  useEffect(() => {
    window.addEventListener('auth:expired', logout);
    return () => window.removeEventListener('auth:expired', logout);
  }, [logout]);

  const value = useMemo(() => ({ ...session, login, logout }), [session, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
