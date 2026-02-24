const LEVEL_THRESHOLDS = [0, 50, 120, 220, 360, 550, 800, 1100, 1500, 2000];

export const getLevel = (xp) => {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i;
  }
  return 0;
};

export const getLevelProgress = (xp) => {
  const lvl = getLevel(xp);
  const next = LEVEL_THRESHOLDS[lvl + 1] ?? LEVEL_THRESHOLDS[lvl] + 500;
  const curr = LEVEL_THRESHOLDS[lvl];
  return Math.min(((xp - curr) / (next - curr)) * 100, 100);
};
