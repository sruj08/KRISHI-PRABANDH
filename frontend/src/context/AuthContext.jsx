import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('krishiUser');
    return saved ? JSON.parse(saved) : null;
  });

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
    if (accessToken) setToken(accessToken);
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
