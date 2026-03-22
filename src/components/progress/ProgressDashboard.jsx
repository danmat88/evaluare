import { motion } from 'framer-motion';
import ChalkText from '../blackboard/ChalkText';
import AnimatedCounter from '../ui/AnimatedCounter';
import { getLevel } from '../../utils/xp';
import styles from './ProgressDashboard.module.css';

const CHAPTERS = [
  { id: 'multimi', label: 'Multimi', total: 10, color: 'cyan' },
  { id: 'numere', label: 'Numere', total: 15, color: 'yellow' },
  { id: 'ecuatii', label: 'Ecuatii', total: 20, color: 'mint' },
  { id: 'functii', label: 'Functii', total: 15, color: 'cyan' },
  { id: 'progresii', label: 'Progresii', total: 10, color: 'lavender' },
  { id: 'probabilitati', label: 'Probabilitati', total: 8, color: 'orange' },
  { id: 'triunghiuri', label: 'Triunghiuri', total: 18, color: 'mint' },
  { id: 'patrulatere', label: 'Patrulatere', total: 12, color: 'yellow' },
  { id: 'cerc', label: 'Cerc', total: 10, color: 'cyan' },
  { id: 'corpuri', label: 'Corpuri', total: 10, color: 'coral' },
  { id: 'trigonometrie', label: 'Trigonometrie', total: 8, color: 'lavender' },
];

const colorMap = {
  cyan: 'var(--neon-cyan)',
  yellow: 'var(--neon-yellow)',
  mint: 'var(--neon-mint)',
  coral: 'var(--neon-coral)',
  lavender: 'var(--neon-lavender)',
  orange: 'var(--neon-orange)',
};

const ChapterBar = ({ label, solved, total, color, delay }) => {
  const pct = total > 0 ? Math.min(Math.round((solved / total) * 100), 100) : 0;
  const accent = colorMap[color] || colorMap.cyan;

  return (
    <div className={styles.barRow}>
      <span className={styles.barLabel}>{label}</span>
      <div className={styles.barTrack}>
        <motion.div
          className={styles.barFill}
          style={{ background: accent, boxShadow: `0 0 8px ${accent}55` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, delay, ease: 'easeOut' }}
        />
      </div>
      <span className={styles.barPct} style={{ color: accent }}>{pct}%</span>
    </div>
  );
};

const ProgressDashboard = ({ progress = {}, xp = 0 }) => {
  const totalSolved = Object.values(progress).reduce((sum, value) => sum + Number(value || 0), 0);
  const totalAll = CHAPTERS.reduce((sum, chapter) => sum + chapter.total, 0);
  const overall = totalAll > 0 ? Math.round((totalSolved / totalAll) * 100) : 0;
  const level = getLevel(xp);
  const radius = 30;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={styles.container}>
      <div className={styles.overview}>
        <div className={styles.ring}>
          <svg width="76" height="76" viewBox="0 0 76 76" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="38" cy="38" r={radius} fill="none" stroke="rgba(245,240,232,0.05)" strokeWidth="5" />
            <motion.circle
              cx="38"
              cy="38"
              r={radius}
              fill="none"
              stroke="var(--neon-cyan)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - overall / 100) }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ filter: 'drop-shadow(0 0 6px rgba(0,229,255,0.5))' }}
            />
          </svg>
          <div className={styles.ringLabel}>
            <ChalkText size="sm" color="cyan">{overall}%</ChalkText>
          </div>
        </div>

        <div className={styles.overviewText}>
          <div className={styles.overviewNum}>
            <AnimatedCounter value={totalSolved} className={styles.bigNum} />
            <ChalkText size="xs" color="muted">/ {totalAll} ex.</ChalkText>
          </div>
          <ChalkText size="xs" color="muted">exercitii rezolvate</ChalkText>
          <div className={styles.levelRow}>
            <span className={styles.levelDot} />
            <ChalkText size="xs" color="yellow">Nivel {level}</ChalkText>
          </div>
        </div>
      </div>

      <div className={styles.bars}>
        {CHAPTERS.map((chapter, index) => (
          <ChapterBar
            key={chapter.id}
            label={chapter.label}
            solved={progress[chapter.id] || 0}
            total={chapter.total}
            color={chapter.color}
            delay={index * 0.04}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgressDashboard;
