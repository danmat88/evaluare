/**
 * Calculează nota EN pe baza scorului.
 * La EN, nota minimă de promovare e 5, maximul 10.
 * Oficiu = 10 puncte, totalul e 100p.
 */
export const calculateGrade = (score, totalPoints = 100) => {
  const raw = (score / totalPoints) * 90 + 10; // 10 puncte oficiu
  const grade = Math.min(10, Math.max(1, raw / 10));
  return Math.round(grade * 100) / 100;
};

export const gradeLabel = (grade) => {
  if (grade >= 9.5) return 'Excelent';
  if (grade >= 8)   return 'Foarte bine';
  if (grade >= 7)   return 'Bine';
  if (grade >= 5)   return 'Suficient';
  return 'Insuficient';
};

export const gradeColor = (grade) => {
  if (grade >= 8) return 'green';
  if (grade >= 5) return 'yellow';
  return 'red';
};
