import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

function readStoredUser() {
  try {
    const saved = localStorage.getItem('krishiUser');
    if (!saved) return null;
    return JSON.parse(saved);
  } catch {
    try {
      localStorage.removeItem('krishiUser');
    } catch {
      /* ignore */
    }
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => readStoredUser());

  const [token, setToken] = useState(() => localStorage.getItem('krishiToken') || null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('krishiUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('krishiUser');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('krishiToken', token);
    } else {
      localStorage.removeItem('krishiToken');
    }
  }, [token]);

  const login = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken ?? null);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
