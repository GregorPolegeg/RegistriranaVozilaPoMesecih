import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  login: (id: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const savedToken = await AsyncStorage.getItem('token');
        if (savedToken) {
          setToken(savedToken);
        }
      } catch (error) {
        console.error('Failed to load token from storage', error);
      }
    };

    loadUserId();
  }, []);

  const login = async (id: string) => {
    setToken(id);
    try {
      await AsyncStorage.setItem('token', id);
    } catch (error) {
      console.error('Failed to save userId to storage', error);
    }
  };

  const logout = async () => {
    setToken(null);
    try {
      await AsyncStorage.removeItem('token');
    } catch (error) {
      console.error('Failed to remove userId from storage', error);
    }
  };
  const isLoggedIn = token !== null;


  return (
    <AuthContext.Provider value={{ isLoggedIn, token , login, logout }}>
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
