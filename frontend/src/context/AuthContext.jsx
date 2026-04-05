import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const login = async (email, password) => {
    const response = await axios.post(`${apiUrl}/api/auth/login`, {
      email,
      password
    });
    const userData = response.data;
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const register = async (name, phone, email, password, role) => {
    const response = await axios.post(`${apiUrl}/api/auth/register`, {
      name,
      phone,
      email,
      password,
      role
    });
    const userData = response.data;
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (newUserData) => {
    const localUser = JSON.parse(localStorage.getItem('user')) || {};
    const updated = { ...localUser, ...newUserData };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
