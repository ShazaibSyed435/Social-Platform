import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, setAccessToken, setUnauthorizedHandler } from '../lib/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [profile, setProfile] = useState(() => {
    const stored = localStorage.getItem('profile');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('accessToken')));

  const clearSession = () => {
    setAccessToken('');
    setProfile(null);
    localStorage.removeItem('profile');
  };

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    const bootstrap = async () => {
      if (!localStorage.getItem('accessToken')) {
        setLoading(false);
        return;
      }

      try {
        const data = await api.me();
        setProfile(data);
        localStorage.setItem('profile', JSON.stringify(data));
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const signIn = async (credentials, mode = 'login') => {
    const data = mode === 'register'
      ? await api.register(credentials)
      : await api.login(credentials);

    setAccessToken(data.accessToken);
    setProfile(data.profile);
    localStorage.setItem('profile', JSON.stringify(data.profile));
    return data.profile;
  };

  const signOut = async () => {
    try {
      await api.logout();
    } finally {
      clearSession();
    }
  };

  const refreshProfile = async () => {
    const data = await api.me();
    setProfile(data);
    localStorage.setItem('profile', JSON.stringify(data));
    return data;
  };

  const value = useMemo(() => ({
    profile,
    loading,
    isAuthenticated: Boolean(profile),
    signIn,
    signOut,
    setProfile,
    refreshProfile,
  }), [profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
