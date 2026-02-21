import { create } from 'zustand';
import { getExercisesByChapter, getAllExercises } from '../firebase/exercises';

const XP_CORRECT   = 10;
const XP_STREAK_3  = 5;   // bonus at 3 streak
const XP_STREAK_5  = 10;  // bonus at 5 streak

const useExerciseStore = create((set, get) => ({
  exercises: [],
  currentExercise: null,
  currentChapter: null,
  showSolution: false,
  userAnswer: '',
  answered: false,
  correct: null,
  loading: false,

  // Gamification
  xp: 0,
  streak: 0,
  bestStreak: 0,
  totalCorrect: 0,
  totalAnswered: 0,
  lastXpGain: 0,

  loadChapter: async (chapter) => {
    set({ loading: true, currentChapter: chapter, currentExercise: null, answered: false });
    const exercises = await getExercisesByChapter(chapter);
    set({ exercises, loading: false });
  },

  loadAll: async () => {
    set({ loading: true });
    const exercises = await getAllExercises();
    set({ exercises, loading: false });
  },

  setCurrentExercise: (exercise) =>
    set({ currentExercise: exercise, showSolution: false, userAnswer: '', answered: false, correct: null }),

  setUserAnswer: (answer) => set({ userAnswer: answer }),

  submitAnswer: () => {
    const { currentExercise, userAnswer, streak, bestStreak, xp, totalCorrect, totalAnswered } = get();
    if (!currentExercise) return;

    const correct = userAnswer.trim() === String(currentExercise.answer).trim();
    let xpGain = 0;
    let newStreak = correct ? streak + 1 : 0;

    if (correct) {
      xpGain += XP_CORRECT;
      if (newStreak === 3) xpGain += XP_STREAK_3;
      if (newStreak === 5) xpGain += XP_STREAK_5;
      if (newStreak > 0 && newStreak % 5 === 0 && newStreak > 5) xpGain += XP_STREAK_5;
    }

    set({
      answered: true,
      correct,
      streak: newStreak,
      bestStreak: Math.max(bestStreak, newStreak),
      xp: xp + xpGain,
      lastXpGain: xpGain,
      totalCorrect: correct ? totalCorrect + 1 : totalCorrect,
      totalAnswered: totalAnswered + 1,
    });
  },

  revealSolution: () => set({ showSolution: true }),
  hideSolution:   () => set({ showSolution: false }),

  reset: () => set({ userAnswer: '', answered: false, correct: null, showSolution: false }),
}));

export default useExerciseStore;
