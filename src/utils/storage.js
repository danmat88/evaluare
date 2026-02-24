export const STORAGE_KEYS = {
  favorites: 'enmath:favorites:v1',
  solved: 'enmath:solved:v1',
  lastExercise: 'enmath:last-exercise:v1',
  dailyActivity: 'enmath:daily-activity:v1',
  focusMode: 'enmath:focus-mode:v1',
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
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota/serialization errors; UX features should fail gracefully.
  }
};

export const todayStamp = () => new Date().toISOString().slice(0, 10);
