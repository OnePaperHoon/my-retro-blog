import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, setAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const verifyToken = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const response = await authAPI.verify();
          if (response.success) {
            setIsAuthenticated(true);
            setAdmin(response.data);
          }
        } catch (error) {
          setAuthToken(null);
        }
      }
      setIsLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (username, password) => {
    const response = await authAPI.login(username, password);
    if (response.success) {
      setAuthToken(response.token);
      setIsAuthenticated(true);
      setAdmin(response.data);
    }
    return response;
  };

  const logout = () => {
    authAPI.logout();
    setIsAuthenticated(false);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        admin,
        login,
        logout,
      }}
    >
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

export default AuthContext;
