import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  runTransaction,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from './config';
import { createClientId } from '../utils/ids';
import {
  computeExerciseAnswerStats,
  emptyExerciseStats,
  normalizeExerciseStats,
} from '../utils/exerciseStats';

const compactData = (value) =>
  Object.fromEntries(Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined));

const getResultTimestamp = (value) => {
  if (!value) return null;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (value instanceof Date) return value.getTime();

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const buildCanonicalExerciseStats = (results) => {
  const solvedExerciseIds = new Set();
  const orderedResults = [...results].sort((left, right) => {
    const timestampDiff = (getResultTimestamp(left.createdAt) || 0) - (getResultTimestamp(right.createdAt) || 0);
    if (timestampDiff !== 0) return timestampDiff;
    return String(left.id || left.attemptId || '').localeCompare(String(right.id || right.attemptId || ''));
  });

  return orderedResults.reduce((stats, result) => {
    const exerciseId = result?.exerciseId === null || result?.exerciseId === undefined
      ? ''
      : String(result.exerciseId);

    if (!exerciseId || solvedExerciseIds.has(exerciseId)) {
      return stats;
    }

    const nextStats = computeExerciseAnswerStats(stats, {
      correct: Boolean(result.correct),
      countsTowardStats: true,
    }, getResultTimestamp(result.createdAt) ?? stats.statsUpdatedAt);

    if (result.correct) {
      solvedExerciseIds.add(exerciseId);
    }

    return nextStats;
  }, emptyExerciseStats());
};

export const saveExerciseResult = async (
  uid,
  {
    attemptId = createClientId('exercise-attempt'),
    exerciseId,
    chapter,
    correct,
    timeSpent,
  },
) => {
  const resultRef = doc(db, 'results', attemptId);
  const completionRef = doc(db, 'users', uid, 'exerciseCompletions', String(exerciseId));
  const shouldTrackCompletion = Boolean(correct && chapter && exerciseId);

  await runTransaction(db, async (transaction) => {
    const existingResult = await transaction.get(resultRef);
    if (existingResult.exists()) {
      return;
    }

    let existingCompletion = null;
    if (shouldTrackCompletion) {
      existingCompletion = await transaction.get(completionRef);
    }

    transaction.set(resultRef, compactData({
      attemptId: resultRef.id,
      uid,
      exerciseId,
      chapter: chapter || undefined,
      correct: Boolean(correct),
      timeSpent,
      createdAt: serverTimestamp(),
    }));

    if (!shouldTrackCompletion || existingCompletion?.exists()) {
      return;
    }

    transaction.set(completionRef, {
      exerciseId,
      chapter,
      createdAt: serverTimestamp(),
    });
    transaction.update(doc(db, 'users', uid), {
      [`progress.${chapter}`]: increment(1),
    });
  });

  return resultRef.id;
};

export const saveTestResult = async (
  uid,
  {
    attemptId = createClientId('test-attempt'),
    testId,
    title,
    score,
    totalPoints,
    answers,
    timeSpent,
  },
) => {
  const resultRef = doc(db, 'testResults', attemptId);
  const safeScore = Number.isFinite(score) ? Math.max(0, score) : 0;
  const safeTotalPoints = Number.isFinite(totalPoints) ? Math.max(0, totalPoints) : 0;
  const percentage = safeTotalPoints > 0 ? Math.round((safeScore / safeTotalPoints) * 100) : 0;

  await runTransaction(db, async (transaction) => {
    const existingResult = await transaction.get(resultRef);
    if (existingResult.exists()) {
      return;
    }

    transaction.set(resultRef, {
      attemptId: resultRef.id,
      uid,
      testId,
      title: title || 'Test simulat',
      score: safeScore,
      totalPoints: safeTotalPoints,
      percentage,
      answers: answers && typeof answers === 'object' ? answers : {},
      timeSpent,
      createdAt: serverTimestamp(),
    });
    transaction.update(doc(db, 'users', uid), {
      testsCompleted: increment(1),
      totalScore: increment(safeScore),
    });
  });

  return resultRef.id;
};

export const subscribeToExerciseCompletions = (uid, callback) =>
  onSnapshot(collection(db, 'users', uid, 'exerciseCompletions'), (snap) => {
    callback(snap.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
  });

export const getCanonicalExerciseStats = async (uid) => {
  const q = query(
    collection(db, 'results'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc'),
  );
  const snap = await getDocs(q);
  const canonicalStats = normalizeExerciseStats(buildCanonicalExerciseStats(
    snap.docs.map((entry) => ({ id: entry.id, ...entry.data() })),
  ));
  return canonicalStats;
};

export const getUserResults = async (uid) => {
  const q = query(
    collection(db, 'results'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getUserTestResults = async (uid) => {
  const q = query(
    collection(db, 'testResults'),
    where('uid', '==', uid),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
