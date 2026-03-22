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
import {
  emptyExerciseStats,
  exerciseStatsEqual,
  normalizeExerciseStats,
  pickExerciseStats,
  readExerciseStats,
  resolveExerciseStats,
} from '../utils/exerciseStats';
import { STORAGE_CHANGE_EVENT, getStorageScope } from '../utils/storage';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastRemoteStatsRef = useRef(emptyExerciseStats());

  useEffect(() => {
    let profileUnsub = null;

    const authUnsub = subscribeToAuth((firebaseUser) => {
      if (profileUnsub) {
        profileUnsub();
        profileUnsub = null;
      }

      if (firebaseUser) {
        const storageScope = getStorageScope(firebaseUser.uid);
        useExerciseStore.getState().setStorageScope(storageScope);
        setUser(firebaseUser);
        setLoading(true);

        profileUnsub = subscribeToProfile(firebaseUser.uid, (prof) => {
          const remoteStats = normalizeExerciseStats(prof);
          const localStats = readExerciseStats(storageScope);
          const resolvedStats = resolveExerciseStats({ localStats, remoteStats });

          lastRemoteStatsRef.current = remoteStats;
          useExerciseStore.getState().hydrateStats(resolvedStats, { scope: storageScope });

          if (!exerciseStatsEqual(resolvedStats, remoteStats)) {
            updateUserStats(firebaseUser.uid, resolvedStats)
              .then(() => {
                lastRemoteStatsRef.current = normalizeExerciseStats(resolvedStats);
              })
              .catch(() => {});
          }

          setProfile(prof);
          setLoading(false);
        });
      } else {
        setUser(null);
        setProfile(null);
        lastRemoteStatsRef.current = emptyExerciseStats();
        useExerciseStore.getState().resetStats({ scope: 'guest' });
        setLoading(false);
      }
    });

    return () => {
      authUnsub();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  useEffect(() => {
    if (!user?.uid) return undefined;

    const storageScope = getStorageScope(user.uid);

    const syncLocalStats = () => {
      const localStats = readExerciseStats(storageScope);
      const currentStats = pickExerciseStats(useExerciseStore.getState());
      const resolvedStats = resolveExerciseStats({ localStats, remoteStats: currentStats });

      if (!exerciseStatsEqual(resolvedStats, currentStats)) {
        useExerciseStore.getState().hydrateStats(resolvedStats, { scope: storageScope });
      }
    };

    window.addEventListener('focus', syncLocalStats);
    window.addEventListener('storage', syncLocalStats);
    window.addEventListener(STORAGE_CHANGE_EVENT, syncLocalStats);

    return () => {
      window.removeEventListener('focus', syncLocalStats);
      window.removeEventListener('storage', syncLocalStats);
      window.removeEventListener(STORAGE_CHANGE_EVENT, syncLocalStats);
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return undefined;

    const uid = user.uid;
    let timer = null;

    const syncStats = async (stats) => {
      const normalizedStats = normalizeExerciseStats(stats);
      if (exerciseStatsEqual(normalizedStats, lastRemoteStatsRef.current)) return;

      try {
        await updateUserStats(uid, normalizedStats);
        lastRemoteStatsRef.current = normalizedStats;
      } catch {
        // Keep local progress intact; the next sync opportunity will retry.
      }
    };

    const flushStats = () => {
      clearTimeout(timer);
      void syncStats(pickExerciseStats(useExerciseStore.getState()));
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        flushStats();
      }
    };

    const unsubscribe = useExerciseStore.subscribe(
      pickExerciseStats,
      (stats, previousStats) => {
        if (exerciseStatsEqual(stats, previousStats) || exerciseStatsEqual(stats, lastRemoteStatsRef.current)) {
          return;
        }

        clearTimeout(timer);
        timer = setTimeout(() => {
          void syncStats(stats);
        }, 700);
      },
      { equalityFn: exerciseStatsEqual },
    );

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', flushStats);

    return () => {
      clearTimeout(timer);
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', flushStats);
    };
  }, [user?.uid]);

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
