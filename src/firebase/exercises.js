import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from './config';

export const getExercisesByChapter = async (chapter) => {
  const q = query(
    collection(db, 'exercises'),
    where('chapter', '==', chapter),
    orderBy('difficulty')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getAllExercises = async () => {
  const snap = await getDocs(collection(db, 'exercises'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getExerciseById = async (id) => {
  const snap = await getDoc(doc(db, 'exercises', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getTestById = async (id) => {
  const snap = await getDoc(doc(db, 'tests', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const getAllTests = async () => {
  const snap = await getDocs(
    query(collection(db, 'tests'), orderBy('createdAt', 'desc'))
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
};
