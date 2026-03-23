import { getReviewExerciseIds, getSolvedExerciseIds, summarizeStudyInsights } from './studyInsights';
import { STORAGE_KEYS, readScopedJSON, writeScopedJSON } from './storage';

export const DEFAULT_DAILY_GOAL = 12;
export const DEFAULT_SMART_SESSION_SIZE = 5;

const clampInt = (value, min, max, fallback) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

const normalizeTimestamp = (value, fallback = 0) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.round(parsed));
};

export const normalizeStudentPreferences = (value) => ({
  dailyGoal: clampInt(value?.dailyGoal, 3, 40, DEFAULT_DAILY_GOAL),
  smartSessionSize: clampInt(value?.smartSessionSize, 3, 12, DEFAULT_SMART_SESSION_SIZE),
  updatedAt: normalizeTimestamp(value?.updatedAt, 0),
});

export const studentPreferencesEqual = (left, right) => {
  const normalizedLeft = normalizeStudentPreferences(left);
  const normalizedRight = normalizeStudentPreferences(right);

  return normalizedLeft.dailyGoal === normalizedRight.dailyGoal
    && normalizedLeft.smartSessionSize === normalizedRight.smartSessionSize
    && normalizedLeft.updatedAt === normalizedRight.updatedAt;
};

export const mergeStudentPreferences = (localValue, remoteValue) => {
  const localPreferences = normalizeStudentPreferences(localValue);
  const remotePreferences = normalizeStudentPreferences(remoteValue);

  if (remotePreferences.updatedAt > localPreferences.updatedAt) {
    return remotePreferences;
  }

  return localPreferences;
};

export const readStudentPreferences = (scope = null) =>
  normalizeStudentPreferences(readScopedJSON(STORAGE_KEYS.studentPreferences, scope, {}));

export const writeStudentPreferences = (scope = null, value = {}, options = {}) => {
  const normalized = normalizeStudentPreferences({
    ...value,
    updatedAt: options.touchUpdatedAt === false
      ? value?.updatedAt
      : Date.now(),
  });

  writeScopedJSON(STORAGE_KEYS.studentPreferences, scope, normalized);
  return normalized;
};

const normalizeNoteRecord = (exerciseId, value) => {
  const text = String(value?.text || '').trim();
  const updatedAt = normalizeTimestamp(value?.updatedAt, 0);
  const deletedAt = value?.deletedAt === null || value?.deletedAt === undefined
    ? null
    : normalizeTimestamp(value.deletedAt, updatedAt || Date.now());

  if (!text && !deletedAt) {
    return null;
  }

  return {
    exerciseId: String(exerciseId),
    text,
    chapter: typeof value?.chapter === 'string' && value.chapter ? value.chapter : null,
    updatedAt,
    deletedAt,
  };
};

export const normalizeExerciseNotes = (value) => {
  if (!value || typeof value !== 'object') return {};

  return Object.entries(value).reduce((notes, [exerciseId, note]) => {
    const normalized = normalizeNoteRecord(exerciseId, note);
    if (!normalized) return notes;

    return {
      ...notes,
      [normalized.exerciseId]: normalized,
    };
  }, {});
};

const isDeletedNote = (note) => Boolean(note?.deletedAt);
const isActiveNote = (note) => Boolean(note && !isDeletedNote(note) && String(note.text || '').trim());

const noteRecordEqual = (left, right) => {
  if (!left && !right) return true;
  if (!left || !right) return false;

  return String(left.exerciseId) === String(right.exerciseId)
    && String(left.text || '') === String(right.text || '')
    && (left.chapter || null) === (right.chapter || null)
    && normalizeTimestamp(left.updatedAt, 0) === normalizeTimestamp(right.updatedAt, 0)
    && ((left.deletedAt === null || left.deletedAt === undefined) ? null : normalizeTimestamp(left.deletedAt, 0))
      === ((right.deletedAt === null || right.deletedAt === undefined) ? null : normalizeTimestamp(right.deletedAt, 0));
};

export const exerciseNotesEqual = (leftValue, rightValue) => {
  const leftNotes = normalizeExerciseNotes(leftValue);
  const rightNotes = normalizeExerciseNotes(rightValue);
  const noteIds = new Set([...Object.keys(leftNotes), ...Object.keys(rightNotes)]);

  for (const noteId of noteIds) {
    if (!noteRecordEqual(leftNotes[noteId], rightNotes[noteId])) {
      return false;
    }
  }

  return true;
};

export const mergeExerciseNotes = (localValue, remoteValue) => {
  const localNotes = normalizeExerciseNotes(localValue);
  const remoteNotes = normalizeExerciseNotes(remoteValue);
  const noteIds = new Set([...Object.keys(localNotes), ...Object.keys(remoteNotes)]);

  return Array.from(noteIds).reduce((merged, noteId) => {
    const localNote = localNotes[noteId] || null;
    const remoteNote = remoteNotes[noteId] || null;

    if (!localNote && !remoteNote) {
      return merged;
    }

    const winningNote = !remoteNote
      ? localNote
      : !localNote
        ? remoteNote
        : normalizeTimestamp(remoteNote.updatedAt, 0) > normalizeTimestamp(localNote.updatedAt, 0)
          ? remoteNote
          : localNote;

    if (!winningNote) {
      return merged;
    }

    return {
      ...merged,
      [noteId]: winningNote,
    };
  }, {});
};

export const readExerciseNotes = (scope = null) =>
  normalizeExerciseNotes(readScopedJSON(STORAGE_KEYS.exerciseNotes, scope, {}));

export const writeExerciseNotes = (scope = null, value = {}) => {
  const normalized = normalizeExerciseNotes(value);
  writeScopedJSON(STORAGE_KEYS.exerciseNotes, scope, normalized);
  return normalized;
};

export const saveExerciseNote = ({ exerciseId, text, chapter = null }, scope = null) => {
  if (exerciseId === null || exerciseId === undefined) {
    return readExerciseNotes(scope);
  }

  const noteMap = readExerciseNotes(scope);
  const normalizedExerciseId = String(exerciseId);
  const trimmedText = String(text || '').trim();
  const timestamp = Date.now();

  return writeExerciseNotes(scope, {
    ...noteMap,
    [normalizedExerciseId]: normalizeNoteRecord(normalizedExerciseId, {
      text: trimmedText,
      chapter,
      updatedAt: timestamp,
      deletedAt: trimmedText ? null : timestamp,
    }),
  });
};

export const getExerciseNote = (noteMap, exerciseId) => {
  const note = normalizeExerciseNotes(noteMap)[String(exerciseId)] || null;
  return isActiveNote(note) ? note : null;
};

export const getNotedExerciseIds = (noteMap) =>
  Object.values(normalizeExerciseNotes(noteMap))
    .filter(isActiveNote)
    .map((note) => note.exerciseId);

export const summarizeExerciseNotes = (noteMap, chapters = []) => {
  const activeNotes = Object.values(normalizeExerciseNotes(noteMap)).filter(isActiveNote);
  const chapterLookup = new Map(chapters.map((chapter) => [chapter.id, chapter.label]));
  const chapterCounts = activeNotes.reduce((acc, note) => {
    if (!note.chapter) return acc;
    return {
      ...acc,
      [note.chapter]: (acc[note.chapter] || 0) + 1,
    };
  }, {});

  const topChapter = Object.entries(chapterCounts)
    .sort((left, right) => right[1] - left[1])[0];

  const lastUpdatedNote = activeNotes.length
    ? [...activeNotes].sort((left, right) => right.updatedAt - left.updatedAt)[0]
    : null;

  return {
    totalNotes: activeNotes.length,
    lastUpdatedNote,
    topChapter: topChapter
      ? {
          id: topChapter[0],
          label: chapterLookup.get(topChapter[0]) || topChapter[0],
          count: topChapter[1],
        }
      : null,
  };
};

const buildChapterCatalog = (exercises) =>
  Array.from(new Set((Array.isArray(exercises) ? exercises : []).map((exercise) => exercise.chapter).filter(Boolean)))
    .map((chapterId) => ({ id: chapterId, label: chapterId }));

const scoreExerciseForSmartPractice = ({
  exercise,
  insights,
  noteMap,
  weakestChapterId,
  reviewIds,
  solvedIds,
}) => {
  const exerciseId = String(exercise.id);
  const record = insights?.exercises?.[exerciseId];
  const hasNote = isActiveNote(noteMap[exerciseId]);
  const isSolved = solvedIds.has(exerciseId);
  const needsReview = reviewIds.has(exerciseId);

  let score = 0;

  if (needsReview) score += 100;
  if (!isSolved) score += 55;
  if (hasNote) score += 45;
  if (weakestChapterId && exercise.chapter === weakestChapterId) score += 28;
  if (record?.lastCorrect === false) score += 18;
  if (!record?.solved && (record?.attempts || 0) > 0) score += 16;
  score += Math.min(Number(record?.wrongAttempts || 0), 4) * 6;
  score += Number(exercise.difficulty || 1);

  return score;
};

export const rankExercisesForSmartPractice = (exercises = [], insights, noteMap = {}) => {
  const chapterCatalog = buildChapterCatalog(exercises);
  const weakestChapterId = summarizeStudyInsights(insights, chapterCatalog).weakestAccuracyChapter?.id || null;
  const normalizedNotes = normalizeExerciseNotes(noteMap);
  const reviewIds = new Set(getReviewExerciseIds(insights));
  const solvedIds = new Set(getSolvedExerciseIds(insights));

  return [...exercises].sort((left, right) => {
    const scoreDiff = scoreExerciseForSmartPractice({
      exercise: right,
      insights,
      noteMap: normalizedNotes,
      weakestChapterId,
      reviewIds,
      solvedIds,
    }) - scoreExerciseForSmartPractice({
      exercise: left,
      insights,
      noteMap: normalizedNotes,
      weakestChapterId,
      reviewIds,
      solvedIds,
    });

    if (scoreDiff !== 0) return scoreDiff;

    const leftAttempts = Number(insights?.exercises?.[String(left.id)]?.attempts || 0);
    const rightAttempts = Number(insights?.exercises?.[String(right.id)]?.attempts || 0);
    if (rightAttempts !== leftAttempts) return rightAttempts - leftAttempts;

    return String(left.id).localeCompare(String(right.id));
  });
};

export const buildSmartSession = ({
  exercises = [],
  insights,
  noteMap = {},
  preferences,
}) => {
  const ranked = rankExercisesForSmartPractice(exercises, insights, noteMap);
  const { smartSessionSize } = normalizeStudentPreferences(preferences);
  return ranked.slice(0, smartSessionSize);
};
