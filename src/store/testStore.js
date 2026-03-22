import { create } from 'zustand';
import { getTestById, getAllTests } from '../firebase/exercises';
import { saveTestResult } from '../firebase/results';
import { matchAnswer } from '../utils/answerMatcher';
import { STORAGE_KEYS, safeReadJSON, safeRemoveJSON, safeWriteJSON } from '../utils/storage';

const TEST_DURATION = 2 * 60 * 60;

const clampIndex = (value, max) => {
  if (!Number.isFinite(value)) return 0;
  if (max <= 0) return 0;
  return Math.min(Math.max(value, 0), max - 1);
};

const countQuestions = (test) =>
  (test?.subjects || []).reduce((sum, subject) => sum + (subject.exercises?.length || 0), 0);

const buildResults = (test, answers, timeLeft, autoSubmitted = false) => {
  let score = 0;
  let answeredCount = 0;

  const subjectSummary = (test.subjects || []).map((subject, subjectIndex) => {
    const exercises = subject.exercises || [];
    let subjectScore = 0;
    let subjectAnswered = 0;

    exercises.forEach((exercise) => {
      const userAnswer = answers[exercise.id];
      if (String(userAnswer ?? '').trim()) {
        subjectAnswered += 1;
        answeredCount += 1;
      }

      if (matchAnswer(exercise.answer, userAnswer)) {
        subjectScore += exercise.points || 0;
      }
    });

    score += subjectScore;

    return {
      id: subject.id || `subject-${subjectIndex + 1}`,
      label: subject.name || `Subiectul ${subjectIndex + 1}`,
      answered: subjectAnswered,
      total: exercises.length,
      score: subjectScore,
      totalPoints: exercises.reduce((sum, exercise) => sum + (exercise.points || 0), 0),
    };
  });

  const totalPoints = test.totalPoints || 100;
  const totalQuestions = countQuestions(test);
  const timeSpent = TEST_DURATION - timeLeft;

  return {
    score,
    totalPoints,
    percentage: Math.round((score / totalPoints) * 100),
    answeredCount,
    totalQuestions,
    unansweredCount: Math.max(totalQuestions - answeredCount, 0),
    timeSpent,
    autoSubmitted,
    subjectSummary,
  };
};

const getStoredSession = () => safeReadJSON(STORAGE_KEYS.testSession, null);

const persistSession = (state) => {
  const hasMeaningfulProgress = state.started || Object.values(state.answers || {}).some((value) => String(value ?? '').trim());

  if (!state.currentTest || state.finished || !hasMeaningfulProgress) {
    safeRemoveJSON(STORAGE_KEYS.testSession);
    return;
  }

  safeWriteJSON(STORAGE_KEYS.testSession, {
    testId: state.currentTest.id,
    answers: state.answers,
    timeLeft: state.timeLeft,
    started: state.started,
    uid: state.uid,
    subjectIdx: state.subjectIdx,
    exerciseIdx: state.exerciseIdx,
    savedAt: Date.now(),
  });
};

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
  subjectIdx: 0,
  exerciseIdx: 0,

  loadTests: async () => {
    set({ loading: true });
    const tests = await getAllTests();
    set({ tests, loading: false });
  },

  loadTest: async (id) => {
    set({ loading: true });
    const test = await getTestById(id);

    const stored = getStoredSession();
    const restored = stored?.testId === id ? stored : null;
    const subjects = test?.subjects || [];
    const subjectIdx = clampIndex(restored?.subjectIdx ?? 0, subjects.length);
    const exercises = subjects[subjectIdx]?.exercises || [];
    const exerciseIdx = clampIndex(restored?.exerciseIdx ?? 0, exercises.length);

    set({
      currentTest: test,
      loading: false,
      answers: restored?.answers && typeof restored.answers === 'object' ? restored.answers : {},
      finished: false,
      results: null,
      started: Boolean(restored?.started && restored?.timeLeft > 0),
      timeLeft: Number.isFinite(restored?.timeLeft) ? Math.max(restored.timeLeft, 0) : TEST_DURATION,
      uid: restored?.uid || null,
      subjectIdx,
      exerciseIdx,
    });

    persistSession(get());
  },

  startTest: (uid) => {
    set((state) => ({
      started: true,
      timeLeft: state.timeLeft > 0 && state.timeLeft < TEST_DURATION ? state.timeLeft : TEST_DURATION,
      uid: uid || state.uid || null,
    }));
    persistSession(get());
  },

  setAnswer: (exerciseId, answer) => {
    set((state) => ({
      answers: { ...state.answers, [exerciseId]: answer },
    }));
    persistSession(get());
  },

  setSubjectIdx: (subjectIdx) => {
    const test = get().currentTest;
    const nextSubjectIdx = clampIndex(subjectIdx, test?.subjects?.length || 0);
    const nextExerciseIdx = clampIndex(0, test?.subjects?.[nextSubjectIdx]?.exercises?.length || 0);
    set({ subjectIdx: nextSubjectIdx, exerciseIdx: nextExerciseIdx });
    persistSession(get());
  },

  setExerciseIdx: (exerciseIdx) => {
    const test = get().currentTest;
    const exercises = test?.subjects?.[get().subjectIdx]?.exercises || [];
    set({ exerciseIdx: clampIndex(exerciseIdx, exercises.length) });
    persistSession(get());
  },

  tickTimer: () => {
    const state = get();
    if (!state.started || state.finished) return;

    if (state.timeLeft <= 1) {
      set({ timeLeft: 0 });
      get().finishTest(get().uid, { autoSubmitted: true });
      return;
    }

    const nextTimeLeft = state.timeLeft - 1;
    set({ timeLeft: nextTimeLeft });

    if (nextTimeLeft % 15 === 0 || (nextTimeLeft <= 300 && nextTimeLeft % 5 === 0)) {
      persistSession(get());
    }
  },

  finishTest: async (uid, options = {}) => {
    const { currentTest, answers, timeLeft, finished } = get();
    if (!currentTest || finished) return;

    const results = buildResults(currentTest, answers, timeLeft, Boolean(options.autoSubmitted));
    set({ finished: true, started: false, results });
    safeRemoveJSON(STORAGE_KEYS.testSession);

    const finalUid = uid || get().uid;
    if (finalUid) {
      await saveTestResult(finalUid, {
        testId: currentTest.id,
        title: currentTest.title || 'Test simulat',
        score: results.score,
        totalPoints: results.totalPoints,
        answers,
        timeSpent: results.timeSpent,
      });
    }
  },

  resetTest: () => {
    safeRemoveJSON(STORAGE_KEYS.testSession);
    set({
      currentTest: null,
      answers: {},
      timeLeft: TEST_DURATION,
      started: false,
      finished: false,
      results: null,
      uid: null,
      subjectIdx: 0,
      exerciseIdx: 0,
    });
  },
}));

export default useTestStore;
