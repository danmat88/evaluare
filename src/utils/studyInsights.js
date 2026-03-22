import { STORAGE_KEYS, readScopedJSON, writeScopedJSON } from './storage';

const emptyInsights = () => ({
  exercises: {},
  updatedAt: null,
});

const normalizeInsights = (value) => {
  if (!value || typeof value !== 'object') return emptyInsights();
  return {
    exercises: value.exercises && typeof value.exercises === 'object' ? value.exercises : {},
    updatedAt: value.updatedAt || null,
  };
};

export const readStudyInsights = (scope = null) =>
  normalizeInsights(readScopedJSON(STORAGE_KEYS.studyInsights, scope, emptyInsights()));

const writeStudyInsights = (insights, scope = null) => {
  const normalized = normalizeInsights(insights);
  writeScopedJSON(STORAGE_KEYS.studyInsights, scope, normalized);
  return normalized;
};

export const exerciseNeedsReview = (record) =>
  Boolean(record && (
    record.lastCorrect === false
    || (!record.solved && record.attempts > 0)
    || record.wrongAttempts >= 2
  ));

export const getReviewExerciseIds = (insights) =>
  Object.values(normalizeInsights(insights).exercises)
    .filter(exerciseNeedsReview)
    .map((record) => record.exerciseId);

export const recordExerciseAttempt = ({ exerciseId, chapter, correct, timeSpent }, scope = null) => {
  const insights = readStudyInsights(scope);
  const previous = insights.exercises[exerciseId] || {
    exerciseId,
    chapter: chapter || null,
    attempts: 0,
    correctAttempts: 0,
    wrongAttempts: 0,
    solved: false,
    lastCorrect: null,
    lastAttemptAt: null,
    totalTimeSpent: 0,
    averageTimeSpent: 0,
  };

  const attempts = previous.attempts + 1;
  const safeTimeSpent = Number.isFinite(timeSpent) ? Math.max(timeSpent, 0) : 0;

  const next = {
    ...previous,
    chapter: chapter || previous.chapter || null,
    attempts,
    correctAttempts: previous.correctAttempts + (correct ? 1 : 0),
    wrongAttempts: previous.wrongAttempts + (correct ? 0 : 1),
    solved: previous.solved || Boolean(correct),
    lastCorrect: Boolean(correct),
    lastAttemptAt: Date.now(),
    totalTimeSpent: previous.totalTimeSpent + safeTimeSpent,
    averageTimeSpent: Math.round((previous.totalTimeSpent + safeTimeSpent) / attempts),
  };

  return writeStudyInsights({
    exercises: {
      ...insights.exercises,
      [exerciseId]: next,
    },
    updatedAt: Date.now(),
  }, scope);
};

export const summarizeStudyInsights = (insights, chapters = []) => {
  const normalized = normalizeInsights(insights);
  const records = Object.values(normalized.exercises);
  const reviewRecords = records.filter(exerciseNeedsReview);
  const solvedCount = records.filter((record) => record.solved).length;
  const totalAttempts = records.reduce((sum, record) => sum + (record.attempts || 0), 0);
  const totalCorrectAttempts = records.reduce((sum, record) => sum + (record.correctAttempts || 0), 0);
  const totalTimeSpent = records.reduce((sum, record) => sum + (record.totalTimeSpent || 0), 0);
  const averageTimeSpent = totalAttempts > 0 ? Math.round(totalTimeSpent / totalAttempts) : 0;

  const chapterStats = chapters.map((chapter) => {
    const chapterRecords = records.filter((record) => record.chapter === chapter.id);
    const attempts = chapterRecords.reduce((sum, record) => sum + (record.attempts || 0), 0);
    const correctAttempts = chapterRecords.reduce((sum, record) => sum + (record.correctAttempts || 0), 0);
    const solvedExercises = chapterRecords.filter((record) => record.solved).length;
    const reviewCount = chapterRecords.filter(exerciseNeedsReview).length;

    return {
      ...chapter,
      attempts,
      correctAttempts,
      solvedExercises,
      reviewCount,
      accuracy: attempts > 0 ? Math.round((correctAttempts / attempts) * 100) : null,
    };
  });

  const chapterWithAttempts = chapterStats.filter((chapter) => chapter.attempts > 0);
  const weakestAccuracyChapter = chapterWithAttempts.length
    ? [...chapterWithAttempts].sort((left, right) => left.accuracy - right.accuracy || right.reviewCount - left.reviewCount)[0]
    : null;
  const strongestAccuracyChapter = chapterWithAttempts.length
    ? [...chapterWithAttempts].sort((left, right) => right.accuracy - left.accuracy || right.correctAttempts - left.correctAttempts)[0]
    : null;
  const reviewChampion = reviewRecords.length
    ? [...reviewRecords].sort((left, right) => right.wrongAttempts - left.wrongAttempts || right.lastAttemptAt - left.lastAttemptAt)[0]
    : null;

  return {
    totalTrackedExercises: records.length,
    totalAttempts,
    totalCorrectAttempts,
    solvedCount,
    reviewCount: reviewRecords.length,
    overallAccuracy: totalAttempts > 0 ? Math.round((totalCorrectAttempts / totalAttempts) * 100) : 0,
    averageTimeSpent,
    chapterStats,
    weakestAccuracyChapter,
    strongestAccuracyChapter,
    reviewChampion,
  };
};
