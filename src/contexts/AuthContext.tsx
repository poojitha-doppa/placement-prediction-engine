import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/api';

interface User {
  id: string;
  email: string;
  name: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on mount
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend
      authApi.getCurrentUser()
        .then(response => {
          setUser({
            id: response.user.id,
            email: response.user.email,
            name: response.user.name || '',
            token
          });
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      
      if (!response.token) {
        throw new Error('No token received from server');
      }
      
      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name || '',
        token: response.token
      };
      
      // Store token first, then user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('placement_user', JSON.stringify(userData));
      setUser(userData);
      
      console.log('✅ Login successful:', userData.email);
    } catch (error: any) {
      console.error('❌ Login error:', error);
      const errorMessage = error.response?.data?.error || 'Login failed. Please check your credentials.';
      throw new Error(errorMessage);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authApi.signup(email, password, name);
      
      if (!response.token) {
        throw new Error('No token received from server');
      }
      
      const userData: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name || name,
        token: response.token
      };
      
      // Store token first, then user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('placement_user', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('placement_user');
    localStorage.removeItem('studentProfile');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
