import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, GraduationCap, Rocket, Star, Target, Trophy, Zap } from 'lucide-react';
import useExerciseStore from '../../store/exerciseStore';
import styles from './AchievementToast.module.css';

const ACHIEVEMENTS = [
  { id: 'first', condition: (s) => s.totalCorrect === 1, icon: Star, title: 'Primul pas!', desc: 'Primul raspuns corect' },
  { id: 'streak3', condition: (s) => s.streak === 3, icon: Flame, title: 'Trio de foc!', desc: '3 raspunsuri corecte la rand' },
  { id: 'streak5', condition: (s) => s.streak === 5, icon: Zap, title: 'Super serie!', desc: '5 raspunsuri corecte la rand' },
  { id: 'streak10', condition: (s) => s.streak === 10, icon: Rocket, title: 'Imbatabil!', desc: '10 la rand - esti fantastic!' },
  { id: 'ten', condition: (s) => s.totalCorrect === 10, icon: Target, title: '10 rezolvate!', desc: 'Zece exercitii corecte' },
  { id: 'fifty', condition: (s) => s.totalCorrect === 50, icon: Trophy, title: 'Campion!', desc: 'Cincizeci de exercitii corecte' },
  { id: 'level2', condition: (s) => s.xp >= 50, icon: GraduationCap, title: 'Nivel 2!', desc: 'Ai urcat la nivelul Elev' },
];

let shownIds = new Set();

const AchievementToast = () => {
  const totalCorrect = useExerciseStore((s) => s.totalCorrect);
  const streak = useExerciseStore((s) => s.streak);
  const xp = useExerciseStore((s) => s.xp);
  const [queue, setQueue] = useState([]);

  useEffect(() => {
    const state = { totalCorrect, streak, xp };
    const newOnes = ACHIEVEMENTS.filter((a) => !shownIds.has(a.id) && a.condition(state));
    if (newOnes.length) {
      newOnes.forEach((a) => shownIds.add(a.id));
      setQueue((q) => [...q, ...newOnes]);
    }
  }, [totalCorrect, streak, xp]);

  useEffect(() => {
    if (!queue.length) return;
    const t = setTimeout(() => setQueue((q) => q.slice(1)), 3500);
    return () => clearTimeout(t);
  }, [queue]);

  const current = queue[0];
  const Icon = current?.icon;

  return (
    <div className={styles.wrapper}>
      <AnimatePresence>
        {current && (
          <motion.div
            key={current.id}
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
              <span className={styles.name}>{current.title}</span>
              <span className={styles.desc}>{current.desc}</span>
            </div>

            <div className={styles.shimmer} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AchievementToast;
