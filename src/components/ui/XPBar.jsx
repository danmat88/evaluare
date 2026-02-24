import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap } from 'lucide-react';
import useExerciseStore from '../../store/exerciseStore';
import { getLevel, getLevelProgress } from '../../utils/xp';
import styles from './XPBar.module.css';

const LEVEL_NAMES = ['Debutant','Elev','Sârguincios','Priceput','Avansat','Expert','Maestru','Profesor','Geniu','Olimpic'];

const XPBar = () => {
  const { xp, streak, lastXpGain } = useExerciseStore();
  const [showFloat, setShowFloat] = useState(false);
  const prevXpRef = useRef(xp);
  const level = getLevel(xp);
  const progress = getLevelProgress(xp);

  useEffect(() => {
    if (xp > prevXpRef.current && lastXpGain > 0) {
      setShowFloat(true);
      setTimeout(() => setShowFloat(false), 1200);
    }
    prevXpRef.current = xp;
  }, [xp, lastXpGain]);

  return (
    <div className={styles.bar}>
      {/* Level badge */}
      <div className={styles.level}>
        <span className={styles.levelNum}>{level}</span>
        <span className={styles.levelName}>{LEVEL_NAMES[level]}</span>
      </div>

      {/* XP progress */}
      <div className={styles.xpSection}>
        <div className={styles.xpTrack}>
          <motion.div
            className={styles.xpFill}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <div className={styles.xpLabel}>
          <Zap size={10} />
          <span>{xp} XP</span>
        </div>
      </div>

      {/* Streak */}
      {streak > 0 && (
        <motion.div
          className={`${styles.streak} ${streak >= 5 ? styles.streakHot : ''}`}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          key={streak}
        >
          <Flame size={13} className={styles.streakFlame} />
          <span>{streak}</span>
        </motion.div>
      )}

      {/* Floating XP gain */}
      <AnimatePresence>
        {showFloat && lastXpGain > 0 && (
          <motion.div
            className={styles.floatXp}
            initial={{ opacity: 1, y: 0, scale: 1 }}
            animate={{ opacity: 0, y: -32, scale: 1.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            +{lastXpGain} XP
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default XPBar;
