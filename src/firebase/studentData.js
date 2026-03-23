import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import {
  exerciseNotesEqual,
  normalizeExerciseNotes,
  normalizeStudentPreferences,
} from '../utils/studentToolkit';

const compactData = (value) =>
  Object.fromEntries(Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined));

const getStudentPreferencesRef = (uid) =>
  doc(db, 'users', uid, 'preferences', 'study');

const getExerciseNotesCollectionRef = (uid) =>
  collection(db, 'users', uid, 'exerciseNotes');

const getExerciseNoteRef = (uid, exerciseId) =>
  doc(db, 'users', uid, 'exerciseNotes', String(exerciseId));

export const subscribeToStudentPreferences = (uid, callback) =>
  onSnapshot(getStudentPreferencesRef(uid), (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });

export const saveStudentPreferences = async (uid, preferences) => {
  const normalized = normalizeStudentPreferences(preferences);

  await setDoc(getStudentPreferencesRef(uid), {
    dailyGoal: normalized.dailyGoal,
    smartSessionSize: normalized.smartSessionSize,
    updatedAt: normalized.updatedAt,
  });

  return normalized;
};

export const subscribeToExerciseNotes = (uid, callback) =>
  onSnapshot(getExerciseNotesCollectionRef(uid), (snap) => {
    const noteMap = snap.docs.reduce((notes, entry) => ({
      ...notes,
      [entry.id]: {
        exerciseId: entry.id,
        ...entry.data(),
      },
    }), {});

    callback(normalizeExerciseNotes(noteMap));
  });

export const syncExerciseNotes = async (uid, localValue, remoteValue = {}) => {
  const localNotes = normalizeExerciseNotes(localValue);
  const remoteNotes = normalizeExerciseNotes(remoteValue);
  const noteIds = new Set([...Object.keys(localNotes), ...Object.keys(remoteNotes)]);
  const batch = writeBatch(db);
  let hasWrites = false;

  noteIds.forEach((noteId) => {
    const localNote = localNotes[noteId] || null;
    const remoteNote = remoteNotes[noteId] || null;

    if (!localNote) {
      return;
    }

    if (exerciseNotesEqual({ [noteId]: localNote }, { [noteId]: remoteNote })) {
      return;
    }

    hasWrites = true;
    batch.set(getExerciseNoteRef(uid, noteId), compactData({
      exerciseId: noteId,
      chapter: localNote.chapter || undefined,
      text: localNote.text || '',
      updatedAt: localNote.updatedAt,
      deletedAt: localNote.deletedAt ?? undefined,
    }));
  });

  if (!hasWrites) {
    return normalizeExerciseNotes(remoteNotes);
  }

  await batch.commit();
  return normalizeExerciseNotes(localNotes);
};
