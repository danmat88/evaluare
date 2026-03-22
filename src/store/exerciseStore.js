import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { getAllExercises, getExercisesByChapter } from '../firebase/exercises';
import { matchAnswer } from '../utils/answerMatcher';
import { isExerciseSolved } from '../utils/studyInsights';
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

const buildExerciseSubmission = ({ exercise, answer, state }) => {
  const correct = matchAnswer(exercise.answer, answer);
  const alreadySolved = isExerciseSolved({
    exerciseId: exercise.id,
    scope: state.storageScope,
  });
  const nextStats = computeExerciseAnswerStats(state, {
    correct,
    countsTowardStats: !alreadySolved,
  });

  return {
    correct,
    alreadySolved,
    countedTowardStats: !alreadySolved,
    nextStats,
  };
};

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

    const result = buildExerciseSubmission({
      exercise: currentExercise,
      answer: userAnswer,
      state: get(),
    });

    set({
      answered: true,
      correct: result.correct,
      ...result.nextStats,
    });

    persistStats(storageScope, result.nextStats);

    return {
      correct: result.correct,
      alreadySolved: result.alreadySolved,
      countedTowardStats: result.countedTowardStats,
      xpGain: result.nextStats.lastXpGain,
      xp: result.nextStats.xp,
      streak: result.nextStats.streak,
      bestStreak: result.nextStats.bestStreak,
      totalCorrect: result.nextStats.totalCorrect,
      totalAnswered: result.nextStats.totalAnswered,
      statsUpdatedAt: result.nextStats.statsUpdatedAt,
    };
  },

  submitExerciseAnswer: ({ exercise, answer }) => {
    if (!exercise) return null;

    const result = buildExerciseSubmission({
      exercise,
      answer,
      state: get(),
    });
    const storageScope = get().storageScope;

    set({
      answered: true,
      correct: result.correct,
      ...result.nextStats,
    });

    persistStats(storageScope, result.nextStats);

    return {
      correct: result.correct,
      alreadySolved: result.alreadySolved,
      countedTowardStats: result.countedTowardStats,
      xpGain: result.nextStats.lastXpGain,
      xp: result.nextStats.xp,
      streak: result.nextStats.streak,
      bestStreak: result.nextStats.bestStreak,
      totalCorrect: result.nextStats.totalCorrect,
      totalAnswered: result.nextStats.totalAnswered,
      statsUpdatedAt: result.nextStats.statsUpdatedAt,
    };
  },

  revealSolution: () => set({ showSolution: true }),
  hideSolution: () => set({ showSolution: false }),

  reset: () => set({ userAnswer: '', answered: false, correct: null, showSolution: false }),
})));

export default useExerciseStore;
