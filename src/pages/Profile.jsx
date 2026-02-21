import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Zap } from 'lucide-react';
import ChalkText from '../components/blackboard/ChalkText';
import Button from '../components/ui/Button';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts';
import useExerciseStore from '../store/exerciseStore';
import { getUserTestResults } from '../firebase/results';
import { getLevel, getLevelProgress } from '../components/ui/XPBar';
import styles from './Profile.module.css';

const LEVEL_NAMES = ['Debutant','Elev','Sârguincios','Priceput','Avansat','Expert','Maestru','Profesor','Geniu','Olimpic'];

const Profile = () => {
  const { user, profile, logout } = useAuth();
  const { xp, streak, bestStreak, totalCorrect, totalAnswered } = useExerciseStore();
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (user?.uid) getUserTestResults(user.uid).then(setResults);
  }, [user]);

  const level = getLevel(xp);
  const pct   = getLevelProgress(xp);
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  return (
    <Layout>
      <div className={styles.page}>
        {/* Profile card */}
        <motion.div className={styles.profileCard} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.avatar}>
            <ChalkText size="2xl" color="cyan">{profile?.name?.[0]?.toUpperCase()}</ChalkText>
          </div>
          <div className={styles.info}>
            <ChalkText size="xl" color="yellow">{profile?.name}</ChalkText>
            <ChalkText size="xs" color="muted">{user?.email}</ChalkText>
            <div className={styles.levelBadge}>
              <span className={styles.levelNum}>Niv. {level}</span>
              <span className={styles.levelName}>{LEVEL_NAMES[level]}</span>
            </div>
          </div>
          <div className={styles.xpBlock}>
            <div className={styles.xpBar}>
              <motion.div
                className={styles.xpFill}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <ChalkText size="xs" color="muted"><AnimatedCounter value={xp} /> XP</ChalkText>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className={styles.statsGrid}>
          {[
            { icon: <Zap size={18}/>,   label: 'XP Total',      value: xp,           color: 'yellow' },
            { icon: <Flame size={18}/>, label: 'Cel mai bun streak', value: bestStreak, color: 'coral' },
            { icon: <Trophy size={18}/>,label: 'Teste completate', value: profile?.testsCompleted || 0, color: 'cyan' },
            { icon: '🎯',               label: 'Acuratețe',      value: `${accuracy}%`, color: 'mint', raw: true },
          ].map((s, i) => (
            <motion.div key={s.label} className={styles.statCard}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <span className={`${styles.statIcon} ${styles[`c_${s.color}`]}`}>{s.icon}</span>
              <span className={`${styles.statVal} ${styles[`c_${s.color}`]}`}>
                {s.raw ? s.value : <AnimatedCounter value={s.value} />}
              </span>
              <ChalkText size="xs" color="muted">{s.label}</ChalkText>
            </motion.div>
          ))}
        </div>

        {/* Test history */}
        {results.length > 0 && (
          <div className={styles.history}>
            <ChalkText size="xs" color="muted">ISTORIC TESTE</ChalkText>
            <div className={styles.histList}>
              {results.slice(0, 8).map((r, i) => (
                <motion.div key={r.id} className={styles.histItem}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <ChalkText size="xs" color="muted">{new Date(r.createdAt?.toDate()).toLocaleDateString('ro-RO')}</ChalkText>
                  <ChalkText size="base" color="white">{r.score} / {r.totalPoints}p</ChalkText>
                  <ChalkText size="base" color={r.percentage >= 60 ? 'mint' : 'coral'}>{r.percentage}%</ChalkText>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <Button variant="danger" size="sm" onClick={logout} className={styles.logout}>
          Deconectare
        </Button>
      </div>
    </Layout>
  );
};

export default Profile;
