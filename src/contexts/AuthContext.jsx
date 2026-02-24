import { createContext, useContext, useEffect, useState } from 'react';
import {
  subscribeToAuth,
  loginUser,
  logoutUser,
  registerUser,
  getUserProfile,
  updateUserStats,
} from '../firebase/auth';
import useExerciseStore from '../store/exerciseStore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate the exercise store from the Firestore profile, so XP/streak
  // survive page refreshes. Then subscribe to store changes and write them
  // back with a short debounce so every answer is persisted automatically.
  useEffect(() => {
    if (!user || !profile) return;

    // Hydrate store from saved profile values
    useExerciseStore.setState({
      xp:           profile.xp           ?? 0,
      streak:       profile.streak       ?? 0,
      bestStreak:   profile.bestStreak   ?? 0,
      totalCorrect: profile.totalCorrect ?? 0,
      totalAnswered:profile.totalAnswered?? 0,
    });

    // Subscribe and debounce-write any changes back to Firestore
    let timer;
    const unsub = useExerciseStore.subscribe((state) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        updateUserStats(user.uid, {
          xp:            state.xp,
          streak:        state.streak,
          bestStreak:    state.bestStreak,
          totalCorrect:  state.totalCorrect,
          totalAnswered: state.totalAnswered,
        }).catch(() => {}); // fire-and-forget — don't block the UI
      }, 1500);
    });

    return () => { clearTimeout(timer); unsub(); };
  }, [user?.uid]); // re-run only when the logged-in user changes

  useEffect(() => {
    const unsub = subscribeToAuth(async (firebaseUser) => {
      if (firebaseUser) {
        const prof = await getUserProfile(firebaseUser.uid);
        setUser(firebaseUser);
        setProfile(prof);
      } else {
        setUser(null);
        setProfile(null);
        // Reset store when user logs out
        useExerciseStore.setState({
          xp: 0, streak: 0, bestStreak: 0, totalCorrect: 0, totalAnswered: 0,
        });
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
