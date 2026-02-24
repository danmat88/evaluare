import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from './config';

export const saveExerciseResult = async (uid, { exerciseId, chapter, correct, timeSpent }) => {
  await addDoc(collection(db, 'results'), {
    uid,
    exerciseId,
    chapter,
    correct,
    timeSpent,
    createdAt: serverTimestamp(),
  });

  const progressKey = `progress.${chapter}`;
  await updateDoc(doc(db, 'users', uid), {
    [progressKey]: increment(correct ? 1 : 0),
  });
};

export const saveTestResult = async (uid, { testId, title, score, totalPoints, answers, timeSpent }) => {
  await addDoc(collection(db, 'testResults'), {
    uid,
    testId,
    title: title || 'Test simulat',
    score,
    totalPoints,
    percentage: Math.round((score / totalPoints) * 100),
    answers,
    timeSpent,
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db, 'users', uid), {
    testsCompleted: increment(1),
    totalScore: increment(score),
  });
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
