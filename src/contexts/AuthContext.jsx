import { useEffect, useRef, useState } from 'react';
import {
  subscribeToAuth,
  subscribeToProfile,
  loginUser,
  logoutUser,
  registerUser,
  updateUserStats,
} from '../firebase/auth';
import useExerciseStore from '../store/exerciseStore';
import { AuthContext } from './AuthContextValue';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate the local store once per login session.
  const hydratedUid = useRef(null);

  // Effect 1: auth state + real-time profile listener.
  useEffect(() => {
    let profileUnsub = null;

    const authUnsub = subscribeToAuth((firebaseUser) => {
      if (profileUnsub) {
        profileUnsub();
        profileUnsub = null;
      }

      if (firebaseUser) {
        setUser(firebaseUser);

        profileUnsub = subscribeToProfile(firebaseUser.uid, (prof) => {
          setProfile(prof);
          setLoading(false);
        });
      } else {
        setUser(null);
        setProfile(null);
        hydratedUid.current = null;

        useExerciseStore.setState({
          xp: 0,
          streak: 0,
          bestStreak: 0,
          totalCorrect: 0,
          totalAnswered: 0,
        });

        setLoading(false);
      }
    });

    return () => {
      authUnsub();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  // Effect 2: hydrate exercise stats from profile once.
  useEffect(() => {
    if (!user || !profile || hydratedUid.current === user.uid) return;
    hydratedUid.current = user.uid;

    useExerciseStore.setState({
      xp: profile.xp ?? 0,
      streak: profile.streak ?? 0,
      bestStreak: profile.bestStreak ?? 0,
      totalCorrect: profile.totalCorrect ?? 0,
      totalAnswered: profile.totalAnswered ?? 0,
    });
  }, [user, profile]);

  // Effect 3: debounce-write store changes back to Firestore.
  useEffect(() => {
    if (!user?.uid) return;

    const uid = user.uid;
    let timer;
    const unsub = useExerciseStore.subscribe((state) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        updateUserStats(uid, {
          xp: state.xp,
          streak: state.streak,
          bestStreak: state.bestStreak,
          totalCorrect: state.totalCorrect,
          totalAnswered: state.totalAnswered,
        }).catch(() => {});
      }, 1500);
    });

    return () => {
      clearTimeout(timer);
      unsub();
    };
  }, [user]);

  const login = (data) => loginUser(data);
  const register = (data) => registerUser(data);
  const logout = () => logoutUser();

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
