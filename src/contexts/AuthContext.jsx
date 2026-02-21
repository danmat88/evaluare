import { createContext, useContext, useEffect, useState } from 'react';
import {
  subscribeToAuth,
  loginUser,
  logoutUser,
  registerUser,
  getUserProfile,
} from '../firebase/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToAuth(async (firebaseUser) => {
      if (firebaseUser) {
        const prof = await getUserProfile(firebaseUser.uid);
        setUser(firebaseUser);
        setProfile(prof);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  /* Login — auth listener handles state update */
  const login = (data) => loginUser(data);

  /* Register — registerUser awaits Firestore write, then fetch profile */
  const register = async (data) => {
    const firebaseUser = await registerUser(data);
    const prof = await getUserProfile(firebaseUser.uid);
    setUser(firebaseUser);
    setProfile(prof);
  };

  const logout = () => logoutUser();

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
