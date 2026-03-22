import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { getAllExercises, getExercisesByChapter } from '../firebase/exercises';
import { matchAnswer } from '../utils/answerMatcher';
import { getStorageScope } from '../utils/storage';
import {
  computeExerciseAnswerStats,
  emptyExerciseStats,
  normalizeExerciseStats,
  readExerciseStats,
  writeExerciseStats,
} from '../utils/exerciseStats';

const initialState = {
  exercises: [],
  currentExercise: null,
  currentChapter: null,
  showSolution: false,
  userAnswer: '',
  answered: false,
  correct: null,
  loading: false,
  storageScope: 'guest',
  ...emptyExerciseStats(),
};

const persistStats = (storageScope, stats) =>
  writeExerciseStats(getStorageScope(storageScope), stats);

const useExerciseStore = create(subscribeWithSelector((set, get) => ({
  ...initialState,

  loadChapter: async (chapter) => {
    set({ loading: true, currentChapter: chapter, currentExercise: null, answered: false });

    try {
      const exercises = await getExercisesByChapter(chapter);
      set({ exercises, loading: false });
    } catch {
      set({ exercises: [], loading: false });
    }
  },

  loadAll: async () => {
    set({ loading: true });

    try {
      const exercises = await getAllExercises();
      set({ exercises, loading: false });
    } catch {
      set({ exercises: [], loading: false });
    }
  },

  setStorageScope: (scope, options = {}) => {
    const storageScope = getStorageScope(scope);
    const nextStats = options.hydrate === false
      ? normalizeExerciseStats(get())
      : readExerciseStats(storageScope);

    set({
      storageScope,
      ...nextStats,
      lastXpGain: options.resetXpGain === false ? nextStats.lastXpGain : 0,
    });

    if (options.persist) {
      persistStats(storageScope, nextStats);
    }

    return nextStats;
  },

  hydrateStats: (stats, options = {}) => {
    const storageScope = getStorageScope(options.scope ?? get().storageScope);
    const nextStats = normalizeExerciseStats(stats);

    set({
      storageScope,
      ...nextStats,
      lastXpGain: options.resetXpGain === false ? nextStats.lastXpGain : 0,
    });

    if (options.persist !== false) {
      persistStats(storageScope, nextStats);
    }

    return nextStats;
  },

  resetStats: (options = {}) => {
    const storageScope = getStorageScope(options.scope ?? get().storageScope);
    const nextStats = emptyExerciseStats();

    set({
      storageScope,
      ...nextStats,
    });

    if (options.persist) {
      persistStats(storageScope, nextStats);
    }

    return nextStats;
  },

  setCurrentExercise: (exercise) =>
    set({ currentExercise: exercise, showSolution: false, userAnswer: '', answered: false, correct: null }),

  setUserAnswer: (answer) => set({ userAnswer: answer }),

  submitAnswer: () => {
    const { currentExercise, userAnswer, storageScope } = get();
    if (!currentExercise) return null;

    const correct = matchAnswer(currentExercise.answer, userAnswer);
    const nextStats = computeExerciseAnswerStats(get(), correct);

    set({
      answered: true,
      correct,
      ...nextStats,
    });

    persistStats(storageScope, nextStats);

    return {
      correct,
      xpGain: nextStats.lastXpGain,
      xp: nextStats.xp,
      streak: nextStats.streak,
      bestStreak: nextStats.bestStreak,
      totalCorrect: nextStats.totalCorrect,
      totalAnswered: nextStats.totalAnswered,
      statsUpdatedAt: nextStats.statsUpdatedAt,
    };
  },

  submitExerciseAnswer: ({ exercise, answer }) => {
    if (!exercise) return null;

    const correct = matchAnswer(exercise.answer, answer);
    const nextStats = computeExerciseAnswerStats(get(), correct);
    const storageScope = get().storageScope;

    set({
      answered: true,
      correct,
      ...nextStats,
    });

    persistStats(storageScope, nextStats);

    return {
      correct,
      xpGain: nextStats.lastXpGain,
      xp: nextStats.xp,
      streak: nextStats.streak,
      bestStreak: nextStats.bestStreak,
      totalCorrect: nextStats.totalCorrect,
      totalAnswered: nextStats.totalAnswered,
      statsUpdatedAt: nextStats.statsUpdatedAt,
    };
  },

  revealSolution: () => set({ showSolution: true }),
  hideSolution: () => set({ showSolution: false }),

  reset: () => set({ userAnswer: '', answered: false, correct: null, showSolution: false }),
})));

export default useExerciseStore;
