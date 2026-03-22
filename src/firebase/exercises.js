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

const CHAPTER_ORDER = [
  'multimi',
  'numere',
  'ecuatii',
  'functii',
  'progresii',
  'probabilitati',
  'triunghiuri',
  'patrulatere',
  'cerc',
  'corpuri',
  'trigonometrie',
];

const chapterIndex = (chapter) => {
  const index = CHAPTER_ORDER.indexOf(chapter);
  return index === -1 ? CHAPTER_ORDER.length : index;
};

const sortExercises = (items = []) =>
  [...items].sort((left, right) =>
    chapterIndex(left.chapter) - chapterIndex(right.chapter)
    || (left.difficulty || 0) - (right.difficulty || 0)
    || String(left.title || left.text || left.id).localeCompare(String(right.title || right.text || right.id), 'ro')
  );

const sortTests = (items = []) =>
  [...items].sort((left, right) => {
    const leftStamp = left.createdAt?.seconds || 0;
    const rightStamp = right.createdAt?.seconds || 0;
    return rightStamp - leftStamp || String(left.title || left.id).localeCompare(String(right.title || right.id), 'ro');
  });

export const getExercisesByChapter = async (chapter) => {
  try {
    const q = query(
      collection(db, 'exercises'),
      where('chapter', '==', chapter),
      orderBy('difficulty')
    );
    const snap = await getDocs(q);
    return sortExercises(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch {
    const fallback = await getDocs(query(collection(db, 'exercises'), where('chapter', '==', chapter)));
    return sortExercises(fallback.docs.map((d) => ({ id: d.id, ...d.data() })));
  }
};

export const getAllExercises = async () => {
  const snap = await getDocs(collection(db, 'exercises'));
  return sortExercises(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
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
  try {
    const snap = await getDocs(
      query(collection(db, 'tests'), orderBy('createdAt', 'desc'))
    );
    if (snap.docs.length > 0) {
      return sortTests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    // Fall back to unordered fetch; documents may lack createdAt.
    const fallback = await getDocs(collection(db, 'tests'));
    return sortTests(fallback.docs.map((d) => ({ id: d.id, ...d.data() })));
  } catch {
    const fallback = await getDocs(collection(db, 'tests'));
    return sortTests(fallback.docs.map((d) => ({ id: d.id, ...d.data() })));
  }
};
