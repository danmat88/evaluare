import { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  subscribeToAuth,
  subscribeToProfile,
  loginUser,
  logoutUser,
  registerUser,
  updateUserStats,
} from '../firebase/auth';
import useExerciseStore from '../store/exerciseStore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Tracks which uid we've already hydrated the store for, so we only
  // pull from Firestore once per login session (not on every snapshot).
  const hydratedUid = useRef(null);

  // ── Effect 1: auth state + real-time profile listener ─────────────────
  // When the user logs in we attach an onSnapshot on their Firestore doc so
  // profile (progress, testsCompleted, xp, etc.) always stays fresh without
  // any manual re-fetching.
  useEffect(() => {
    let profileUnsub = null;

    const authUnsub = subscribeToAuth((firebaseUser) => {
      // Tear down the previous profile listener on every auth change
      if (profileUnsub) { profileUnsub(); profileUnsub = null; }

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
        // Reset gamification state when logged out
        useExerciseStore.setState({
          xp: 0, streak: 0, bestStreak: 0, totalCorrect: 0, totalAnswered: 0,
        });
        setLoading(false);
      }
    });

    return () => {
      authUnsub();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  // ── Effect 2: hydrate exercise store once per login ────────────────────
  // profile is populated asynchronously (after the onSnapshot fires), so we
  // depend on both user?.uid and profile. The ref guard ensures we only
  // hydrate once per session even though profile snapshots keep arriving.
  useEffect(() => {
    if (!user || !profile || hydratedUid.current === user.uid) return;
    hydratedUid.current = user.uid;

    useExerciseStore.setState({
      xp:            profile.xp            ?? 0,
      streak:        profile.streak        ?? 0,
      bestStreak:    profile.bestStreak    ?? 0,
      totalCorrect:  profile.totalCorrect  ?? 0,
      totalAnswered: profile.totalAnswered ?? 0,
    });
  }, [user?.uid, profile]);

  // ── Effect 3: debounce-write store changes back to Firestore ──────────
  // Every time xp / streak / etc. changes in the store we schedule a write.
  // 1.5 s debounce prevents hammering Firestore on rapid answers.
  useEffect(() => {
    if (!user) return;

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
        }).catch(() => {});
      }, 1500);
    });

    return () => { clearTimeout(timer); unsub(); };
  }, [user?.uid]);

  // auth listener handles all state — no manual setUser/setProfile needed
  const login    = (data) => loginUser(data);
  const register = (data) => registerUser(data);
  const logout   = () => logoutUser();

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
