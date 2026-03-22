import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, GraduationCap, Rocket, Star, Target, Trophy, Zap } from 'lucide-react';
import { useAuth } from '../../contexts';
import useExerciseStore from '../../store/exerciseStore';
import {
  ACHIEVEMENTS,
  getNewAchievements,
  readAchievementState,
  writeAchievementState,
} from '../../utils/achievements';
import { STORAGE_CHANGE_EVENT, getStorageScope } from '../../utils/storage';
import styles from './AchievementToast.module.css';

const ICONS = {
  Flame,
  GraduationCap,
  Rocket,
  Star,
  Target,
  Trophy,
  Zap,
};

const AchievementToast = () => {
  const { user } = useAuth();
  const storageScope = getStorageScope(user?.uid);
  const totalCorrect = useExerciseStore((state) => state.totalCorrect);
  const streak = useExerciseStore((state) => state.streak);
  const xp = useExerciseStore((state) => state.xp);

  const [queue, setQueue] = useState([]);
  const [unlockedIds, setUnlockedIds] = useState(() => readAchievementState(storageScope).unlockedIds);
  const unlockedIdsRef = useRef(new Set(unlockedIds));
  const initialSyncRef = useRef(true);

  const stats = useMemo(() => ({ totalCorrect, streak, xp }), [totalCorrect, streak, xp]);

  useEffect(() => {
    unlockedIdsRef.current = new Set(unlockedIds);
  }, [unlockedIds]);

  useEffect(() => {
    const storedIds = readAchievementState(storageScope).unlockedIds;
    unlockedIdsRef.current = new Set(storedIds);
    setUnlockedIds(storedIds);
    setQueue([]);
    initialSyncRef.current = true;
  }, [storageScope]);

  useEffect(() => {
    const syncAchievements = () => {
      const storedIds = readAchievementState(storageScope).unlockedIds;
      unlockedIdsRef.current = new Set(storedIds);
      setUnlockedIds(storedIds);
    };

    window.addEventListener('storage', syncAchievements);
    window.addEventListener(STORAGE_CHANGE_EVENT, syncAchievements);

    return () => {
      window.removeEventListener('storage', syncAchievements);
      window.removeEventListener(STORAGE_CHANGE_EVENT, syncAchievements);
    };
  }, [storageScope]);

  useEffect(() => {
    const newAchievements = getNewAchievements(stats, unlockedIdsRef.current);
    if (!newAchievements.length) {
      initialSyncRef.current = false;
      return;
    }

    const nextUnlockedIds = [
      ...unlockedIdsRef.current,
      ...newAchievements.map((achievement) => achievement.id),
    ];
    const uniqueUnlockedIds = Array.from(new Set(nextUnlockedIds));

    unlockedIdsRef.current = new Set(uniqueUnlockedIds);
    setUnlockedIds(uniqueUnlockedIds);
    writeAchievementState(storageScope, { unlockedIds: uniqueUnlockedIds });

    if (initialSyncRef.current) {
      initialSyncRef.current = false;
      return;
    }

    setQueue((currentQueue) => [...currentQueue, ...newAchievements]);
  }, [stats, storageScope]);

  useEffect(() => {
    if (!queue.length) return undefined;
    const timeoutId = setTimeout(() => setQueue((currentQueue) => currentQueue.slice(1)), 3500);
    return () => clearTimeout(timeoutId);
  }, [queue]);

  const current = queue[0] || null;
  const achievement = current ? ACHIEVEMENTS.find((item) => item.id === current.id) || current : null;
  const Icon = achievement ? ICONS[achievement.icon] : null;

  return (
    <div className={styles.wrapper}>
      <AnimatePresence>
        {achievement && (
          <motion.div
            key={achievement.id}
            className={styles.toast}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          >
            <motion.span
              className={styles.icon}
              initial={{ rotate: -20, scale: 0.5 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 400 }}
            >
              {Icon && <Icon size={22} strokeWidth={2.2} />}
            </motion.span>

            <div className={styles.text}>
              <span className={styles.title}>Realizare deblocata!</span>
              <span className={styles.name}>{achievement.title}</span>
              <span className={styles.desc}>{achievement.desc}</span>
            </div>

            <div className={styles.shimmer} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementToast;
