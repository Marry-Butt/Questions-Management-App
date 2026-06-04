import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as loginApi, register as registerApi, getProfile } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const profile = await getProfile();
          setUser(profile);
        } catch (err) {
          console.error("Failed to restore profile:", err);
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const loginUser = async (email, password) => {
    setError(null);
    try {
      const data = await loginApi(email, password);
      localStorage.setItem('token', data.access_token);
      const profile = await getProfile();
      setUser(profile);
      return profile;
    } catch (err) {
      const errMsg = err.response?.data?.detail || "Invalid email or password.";
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const registerUser = async (name, email, password, role) => {
    setError(null);
    try {
      const data = await registerApi(name, email, password, role);
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.detail || "Registration failed.";
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    setUser(null);
    setError(null);
  };

  const refreshProfile = async () => {
    try {
      const profile = await getProfile();
      setUser(profile);
      return profile;
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, loginUser, registerUser, logoutUser, refreshProfile }}>
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
