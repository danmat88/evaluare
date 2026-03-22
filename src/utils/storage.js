export const STORAGE_KEYS = {
  exerciseStats: 'enmath:exercise-stats:v1',
  favorites: 'enmath:favorites:v1',
  solved: 'enmath:solved:v1',
  lastExercise: 'enmath:last-exercise:v1',
  dailyActivity: 'enmath:daily-activity:v1',
  activityHistory: 'enmath:activity-history:v1',
  focusMode: 'enmath:focus-mode:v1',
  drafts: 'enmath:answer-drafts:v1',
  commandRecent: 'enmath:command-recent:v1',
  reduceMotion: 'enmath:reduce-motion:v1',
  testSession: 'enmath:test-session:v1',
  studyInsights: 'enmath:study-insights:v1',
};

export const STORAGE_CHANGE_EVENT = 'enmath:storage-change';
const GLOBAL_STORAGE_KEYS = new Set([STORAGE_KEYS.reduceMotion]);

const emitStorageChange = (key, value) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT, { detail: { key, value } }));
};

export const safeReadJSON = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

export const safeWriteJSON = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    const nextRaw = JSON.stringify(value);
    const prevRaw = window.localStorage.getItem(key);
    if (prevRaw === nextRaw) return;
    window.localStorage.setItem(key, nextRaw);
    emitStorageChange(key, value);
  } catch {
    // Ignore quota/serialization errors; UX features should fail gracefully.
  }
};

export const safeRemoveJSON = (key) => {
  if (typeof window === 'undefined') return;
  try {
    if (window.localStorage.getItem(key) === null) return;
    window.localStorage.removeItem(key);
    emitStorageChange(key, null);
  } catch {
    // Ignore quota errors; cleanup should fail gracefully.
  }
};

export const getStorageScope = (uid) => uid || 'guest';

export const getScopedStorageKey = (key, scope = null) => {
  if (!scope || GLOBAL_STORAGE_KEYS.has(key)) return key;
  return `${key}:${scope}`;
};

export const readScopedJSON = (key, scope, fallback) => {
  const scopedKey = getScopedStorageKey(key, scope);
  const missing = {};
  const scopedValue = safeReadJSON(scopedKey, missing);

  if (scopedValue !== missing) {
    return scopedValue;
  }

  if (scopedKey !== key) {
    const legacyValue = safeReadJSON(key, missing);
    if (legacyValue !== missing) {
      safeWriteJSON(scopedKey, legacyValue);
      safeRemoveJSON(key);
      return legacyValue;
    }
  }

  return fallback;
};

export const writeScopedJSON = (key, scope, value) =>
  safeWriteJSON(getScopedStorageKey(key, scope), value);

export const removeScopedJSON = (key, scope) =>
  safeRemoveJSON(getScopedStorageKey(key, scope));

export const dateStamp = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const todayStamp = () => dateStamp(new Date());
