import { useEffect, useRef, useState } from 'react';
import {
  subscribeToAuth,
  subscribeToProfile,
  loginUser,
  logoutUser,
  registerUser,
  resetUserPassword,
  updateUserStats,
} from '../firebase/auth';
import {
  getCanonicalExerciseStats,
  subscribeToExerciseCompletions,
} from '../firebase/results';
import useExerciseStore from '../store/exerciseStore';
import useTestStore from '../store/testStore';
import { AuthContext } from './AuthContextValue';
import {
  emptyExerciseStats,
  exerciseStatsEqual,
  normalizeExerciseStats,
  pickExerciseStats,
  readExerciseStats,
  resolveExerciseStats,
} from '../utils/exerciseStats';
import {
  flushPendingResultWrites,
  hasPendingResultWrites,
  readPendingTestResults,
} from '../utils/pendingResults';
import { mergeSolvedExercises } from '../utils/studyInsights';
import { STORAGE_CHANGE_EVENT, getStorageScope } from '../utils/storage';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const lastRemoteStatsRef = useRef(emptyExerciseStats());

  useEffect(() => {
    let profileUnsub = null;
    let completionsUnsub = null;

    const authUnsub = subscribeToAuth((firebaseUser) => {
      if (profileUnsub) {
        profileUnsub();
        profileUnsub = null;
      }
      if (completionsUnsub) {
        completionsUnsub();
        completionsUnsub = null;
      }

      if (firebaseUser) {
        const storageScope = getStorageScope(firebaseUser.uid);
        useExerciseStore.getState().setStorageScope(storageScope);
        setUser(firebaseUser);
        setLoading(true);

        completionsUnsub = subscribeToExerciseCompletions(firebaseUser.uid, (completions) => {
          mergeSolvedExercises(completions, storageScope);
        });

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
      if (completionsUnsub) completionsUnsub();
    };
  }, []);

  useEffect(() => {
    if (!user?.uid) return undefined;

    const uid = user.uid;
    const storageScope = getStorageScope(uid);
    let cancelled = false;

    const syncCanonicalStats = async () => {
      try {
        const canonicalStats = await getCanonicalExerciseStats(uid);
        if (cancelled) return;

        const currentStats = pickExerciseStats(useExerciseStore.getState());
        const remoteStats = lastRemoteStatsRef.current;
        if (hasPendingResultWrites(storageScope)) {
          return;
        }
        const canonicalHasProgress = canonicalStats.xp > 0 || canonicalStats.totalCorrect > 0 || canonicalStats.totalAnswered > 0;
        const existingHasProgress = currentStats.xp > 0
          || currentStats.totalCorrect > 0
          || currentStats.totalAnswered > 0
          || remoteStats.xp > 0
          || remoteStats.totalCorrect > 0
          || remoteStats.totalAnswered > 0;

        if (!canonicalHasProgress && existingHasProgress) {
          return;
        }

        if (!exerciseStatsEqual(canonicalStats, currentStats)) {
          useExerciseStore.getState().hydrateStats(canonicalStats, { scope: storageScope });
        }

        if (!exerciseStatsEqual(canonicalStats, remoteStats)) {
          await updateUserStats(uid, canonicalStats);
          if (!cancelled) {
            lastRemoteStatsRef.current = canonicalStats;
          }
        }
      } catch {
        // If canonical rebuild fails, keep the current local/remote merge intact.
      }
    };

    void syncCanonicalStats();

    return () => {
      cancelled = true;
    };
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return undefined;

    const uid = user.uid;
    const storageScope = getStorageScope(uid);
    let flushing = false;
    let cancelled = false;

    const flushPendingWrites = async () => {
      if (flushing || cancelled || !hasPendingResultWrites(storageScope)) return;
      flushing = true;

      try {
        await flushPendingResultWrites(uid, storageScope);
        const testState = useTestStore.getState();
        if (testState.saveStatus === 'pending' && testState.attemptId) {
          const stillPending = readPendingTestResults(storageScope)
            .some((entry) => entry.attemptId === testState.attemptId);

          if (!stillPending) {
            useTestStore.setState({ saveStatus: 'saved' });
          }
        }
      } catch {
        // Leave queued writes in storage for the next retry opportunity.
      } finally {
        flushing = false;
      }
    };

    void flushPendingWrites();
    window.addEventListener('focus', flushPendingWrites);
    window.addEventListener('online', flushPendingWrites);
    window.addEventListener(STORAGE_CHANGE_EVENT, flushPendingWrites);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', flushPendingWrites);
      window.removeEventListener('online', flushPendingWrites);
      window.removeEventListener(STORAGE_CHANGE_EVENT, flushPendingWrites);
    };
  }, [user?.uid]);

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
  const resetPassword = (email) => resetUserPassword(email);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, isAuthenticated: !!user, login, register, logout, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};
