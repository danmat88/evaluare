import { create } from 'zustand';
import { getTestById, getAllTests } from '../firebase/exercises';
import { saveTestResult } from '../firebase/results';

const TEST_DURATION = 2 * 60 * 60; // 2 ore în secunde

const useTestStore = create((set, get) => ({
  tests: [],
  currentTest: null,
  answers: {},
  timeLeft: TEST_DURATION,
  started: false,
  finished: false,
  results: null,
  loading: false,
  uid: null,

  loadTests: async () => {
    set({ loading: true });
    const tests = await getAllTests();
    set({ tests, loading: false });
  },

  loadTest: async (id) => {
    set({ loading: true });
    const test = await getTestById(id);
    set({ currentTest: test, loading: false, answers: {}, finished: false, results: null });
  },

  startTest: (uid) => set({ started: true, timeLeft: TEST_DURATION, uid: uid || null }),

  setAnswer: (exerciseId, answer) =>
    set((state) => ({
      answers: { ...state.answers, [exerciseId]: answer },
    })),

  tickTimer: () =>
    set((state) => {
      if (state.timeLeft <= 1) {
        get().finishTest(get().uid);
        return { timeLeft: 0 };
      }
      return { timeLeft: state.timeLeft - 1 };
    }),

  finishTest: async (uid) => {
    const { currentTest, answers, timeLeft } = get();
    if (!currentTest) return;

    let score = 0;
    const totalPoints = currentTest.totalPoints || 100;

    currentTest.subjects?.forEach((subject) => {
      subject.exercises?.forEach((ex) => {
        const userAnswer = answers[ex.id]?.trim();
        if (userAnswer === ex.answer?.trim()) {
          score += ex.points || 0;
        }
      });
    });

    const timeSpent = TEST_DURATION - timeLeft;
    const results = { score, totalPoints, percentage: Math.round((score / totalPoints) * 100) };
    set({ finished: true, results });

    if (uid) {
      await saveTestResult(uid, {
        testId: currentTest.id,
        title: currentTest.title || 'Test simulat',
        score,
        totalPoints,
        answers,
        timeSpent,
      });
    }
  },

  resetTest: () =>
    set({ currentTest: null, answers: {}, timeLeft: TEST_DURATION, started: false, finished: false, results: null, uid: null }),
}));

export default useTestStore;
