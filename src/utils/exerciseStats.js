import { STORAGE_KEYS, readScopedJSON, writeScopedJSON } from './storage';

const sanitizeCount = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return 0;
  return Math.max(0, Math.round(numericValue));
};

export const emptyExerciseStats = () => ({
  xp: 0,
  streak: 0,
  bestStreak: 0,
  totalCorrect: 0,
  totalAnswered: 0,
  lastXpGain: 0,
  statsUpdatedAt: 0,
});

export const normalizeExerciseStats = (value) => {
  const base = { ...emptyExerciseStats(), ...(value && typeof value === 'object' ? value : {}) };
  const streak = sanitizeCount(base.streak);
  const bestStreak = Math.max(sanitizeCount(base.bestStreak), streak);
  const totalCorrect = sanitizeCount(base.totalCorrect);
  const totalAnswered = Math.max(sanitizeCount(base.totalAnswered), totalCorrect);

  return {
    xp: sanitizeCount(base.xp),
    streak,
    bestStreak,
    totalCorrect,
    totalAnswered,
    lastXpGain: sanitizeCount(base.lastXpGain),
    statsUpdatedAt: sanitizeCount(base.statsUpdatedAt),
  };
};

const toPersistedExerciseStats = (stats) => {
  const normalized = normalizeExerciseStats(stats);
  return {
    xp: normalized.xp,
    streak: normalized.streak,
    bestStreak: normalized.bestStreak,
    totalCorrect: normalized.totalCorrect,
    totalAnswered: normalized.totalAnswered,
    statsUpdatedAt: normalized.statsUpdatedAt,
  };
};

export const pickExerciseStats = (state) =>
  normalizeExerciseStats({
    xp: state?.xp,
    streak: state?.streak,
    bestStreak: state?.bestStreak,
    totalCorrect: state?.totalCorrect,
    totalAnswered: state?.totalAnswered,
    lastXpGain: state?.lastXpGain,
    statsUpdatedAt: state?.statsUpdatedAt,
  });

export const readExerciseStats = (scope = null) =>
  normalizeExerciseStats(readScopedJSON(STORAGE_KEYS.exerciseStats, scope, emptyExerciseStats()));

export const writeExerciseStats = (scope, stats) => {
  const normalized = normalizeExerciseStats(stats);
  writeScopedJSON(STORAGE_KEYS.exerciseStats, scope, toPersistedExerciseStats(normalized));
  return normalized;
};

export const exerciseStatsEqual = (left, right) => {
  const normalizedLeft = normalizeExerciseStats(left);
  const normalizedRight = normalizeExerciseStats(right);

  return normalizedLeft.xp === normalizedRight.xp
    && normalizedLeft.streak === normalizedRight.streak
    && normalizedLeft.bestStreak === normalizedRight.bestStreak
    && normalizedLeft.totalCorrect === normalizedRight.totalCorrect
    && normalizedLeft.totalAnswered === normalizedRight.totalAnswered
    && normalizedLeft.statsUpdatedAt === normalizedRight.statsUpdatedAt;
};

export const resolveExerciseStats = ({ localStats, remoteStats }) => {
  const normalizedLocal = normalizeExerciseStats(localStats);
  const normalizedRemote = normalizeExerciseStats(remoteStats);

  if (normalizedLocal.statsUpdatedAt !== normalizedRemote.statsUpdatedAt) {
    return normalizedLocal.statsUpdatedAt > normalizedRemote.statsUpdatedAt
      ? normalizedLocal
      : normalizedRemote;
  }

  if (normalizedLocal.totalAnswered !== normalizedRemote.totalAnswered) {
    return normalizedLocal.totalAnswered > normalizedRemote.totalAnswered
      ? normalizedLocal
      : normalizedRemote;
  }

  if (normalizedLocal.totalCorrect !== normalizedRemote.totalCorrect) {
    return normalizedLocal.totalCorrect > normalizedRemote.totalCorrect
      ? normalizedLocal
      : normalizedRemote;
  }

  if (normalizedLocal.xp !== normalizedRemote.xp) {
    return normalizedLocal.xp > normalizedRemote.xp ? normalizedLocal : normalizedRemote;
  }

  if (normalizedLocal.bestStreak !== normalizedRemote.bestStreak) {
    return normalizedLocal.bestStreak > normalizedRemote.bestStreak
      ? normalizedLocal
      : normalizedRemote;
  }

  if (normalizedLocal.streak !== normalizedRemote.streak) {
    return normalizedLocal.streak > normalizedRemote.streak ? normalizedLocal : normalizedRemote;
  }

  return normalizedRemote;
};

export const computeExerciseAnswerStats = (currentStats, outcome, now = Date.now()) => {
  const stats = normalizeExerciseStats(currentStats);
  const normalizedOutcome = typeof outcome === 'object' && outcome !== null
    ? outcome
    : { correct: Boolean(outcome), countsTowardStats: true };
  const correct = Boolean(normalizedOutcome.correct);
  const countsTowardStats = normalizedOutcome.countsTowardStats !== false;

  if (!countsTowardStats) {
    return normalizeExerciseStats({
      ...stats,
      lastXpGain: 0,
    });
  }

  const nextStreak = correct ? stats.streak + 1 : 0;

  let xpGain = 0;
  if (correct) {
    xpGain += 10;
    if (nextStreak === 3) xpGain += 5;
    if (nextStreak === 5) xpGain += 10;
    if (nextStreak > 5 && nextStreak % 5 === 0) xpGain += 10;
  }

  return normalizeExerciseStats({
    ...stats,
    streak: nextStreak,
    bestStreak: Math.max(stats.bestStreak, nextStreak),
    xp: stats.xp + xpGain,
    lastXpGain: xpGain,
    totalCorrect: correct ? stats.totalCorrect + 1 : stats.totalCorrect,
    totalAnswered: stats.totalAnswered + 1,
    statsUpdatedAt: now,
  });
};
