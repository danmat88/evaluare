import { STORAGE_KEYS, readScopedJSON, writeScopedJSON } from './storage';

export const ACHIEVEMENTS = [
  { id: 'first', icon: 'Star', title: 'Primul pas!', desc: 'Primul raspuns corect', condition: (stats) => stats.totalCorrect >= 1 },
  { id: 'streak3', icon: 'Flame', title: 'Trio de foc!', desc: '3 raspunsuri corecte la rand', condition: (stats) => stats.streak >= 3 },
  { id: 'streak5', icon: 'Zap', title: 'Super serie!', desc: '5 raspunsuri corecte la rand', condition: (stats) => stats.streak >= 5 },
  { id: 'streak10', icon: 'Rocket', title: 'Imbatabil!', desc: '10 la rand - esti fantastic!', condition: (stats) => stats.streak >= 10 },
  { id: 'ten', icon: 'Target', title: '10 rezolvate!', desc: 'Zece exercitii corecte', condition: (stats) => stats.totalCorrect >= 10 },
  { id: 'fifty', icon: 'Trophy', title: 'Campion!', desc: 'Cincizeci de exercitii corecte', condition: (stats) => stats.totalCorrect >= 50 },
  { id: 'level2', icon: 'GraduationCap', title: 'Nivel 2!', desc: 'Ai urcat la nivelul Elev', condition: (stats) => stats.xp >= 50 },
];

const normalizeAchievementState = (value) => {
  if (!value || typeof value !== 'object') {
    return { unlockedIds: [] };
  }

  const unlockedIds = Array.isArray(value.unlockedIds)
    ? value.unlockedIds.filter((id, index, array) => typeof id === 'string' && array.indexOf(id) === index)
    : [];

  return { unlockedIds };
};

export const readAchievementState = (scope = null) =>
  normalizeAchievementState(readScopedJSON(STORAGE_KEYS.achievements, scope, { unlockedIds: [] }));

export const writeAchievementState = (scope, state) => {
  const normalizedState = normalizeAchievementState(state);
  writeScopedJSON(STORAGE_KEYS.achievements, scope, normalizedState);
  return normalizedState;
};

export const getUnlockedAchievements = (stats) =>
  ACHIEVEMENTS.filter((achievement) => achievement.condition(stats));

export const getNewAchievements = (stats, unlockedIds) => {
  const unlockedSet = unlockedIds instanceof Set ? unlockedIds : new Set(unlockedIds || []);
  return getUnlockedAchievements(stats).filter((achievement) => !unlockedSet.has(achievement.id));
};
