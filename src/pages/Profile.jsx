import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Zap, BookOpen, Clock } from 'lucide-react';
import Button from '../components/ui/Button';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts';
import useExerciseStore from '../store/exerciseStore';
import { getUserTestResults } from '../firebase/results';
import { getLevel, getLevelProgress } from '../components/ui/XPBar';
import styles from './Profile.module.css';

const LEVEL_NAMES = ['Debutant','Elev','Sârguincios','Priceput','Avansat','Expert','Maestru','Profesor','Geniu','Olimpic'];

const CHAPTERS = [
  { id: 'multimi',       label: 'Mulțimi',       total: 10 },
  { id: 'numere',        label: 'Numere',         total: 15 },
  { id: 'ecuatii',       label: 'Ecuații',        total: 20 },
  { id: 'functii',       label: 'Funcții',        total: 15 },
  { id: 'progresii',     label: 'Progresii',      total: 10 },
  { id: 'probabilitati', label: 'Probabilități',  total: 8  },
  { id: 'triunghiuri',   label: 'Triunghiuri',    total: 18 },
  { id: 'patrulatere',   label: 'Patrulatere',    total: 12 },
  { id: 'cerc',          label: 'Cerc',           total: 10 },
  { id: 'corpuri',       label: 'Corpuri',        total: 10 },
  { id: 'trigonometrie', label: 'Trigonometrie',  total: 8  },
];

const gradeInfo = (pct) => {
  if (pct >= 90) return { g: '10', cls: styles.gradeTop };
  if (pct >= 80) return { g: '9',  cls: styles.gradeTop };
  if (pct >= 70) return { g: '8',  cls: styles.gradeMid };
  if (pct >= 60) return { g: '7',  cls: styles.gradeMid };
  if (pct >= 50) return { g: '6',  cls: styles.gradeWarn };
  return { g: '<5', cls: styles.gradeLow };
};

const fmtTime = (secs) => {
  if (!secs) return '—';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const Profile = () => {
  const { user, profile, logout } = useAuth();
  const { xp, streak, bestStreak, totalCorrect, totalAnswered } = useExerciseStore();
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (user?.uid) getUserTestResults(user.uid).then(setResults);
  }, [user]);

  const level    = getLevel(xp);
  const pct      = getLevelProgress(xp);
  const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
  const progress = profile?.progress || {};

  const weakest = useMemo(() => {
    let minPct = 101;
    let found  = null;
    for (const ch of CHAPTERS) {
      const solved = progress[ch.id] || 0;
      const chPct  = ch.total > 0 ? (solved / ch.total) * 100 : 0;
      if (chPct < minPct) { minPct = chPct; found = ch; }
    }
    return found;
  }, [progress]);

  return (
    <Layout>
      <div className={styles.page}>

        {/* ── Hero card ── */}
        <motion.div className={styles.profileCard} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.avatar}>
            <span className={styles.avatarLetter}>{profile?.name?.[0]?.toUpperCase()}</span>
          </div>
          <div className={styles.info}>
            <span className={styles.profileName}>{profile?.name}</span>
            <span className={styles.profileEmail}>{user?.email}</span>
            <div className={styles.levelBadge}>
              <span className={styles.levelNum}>Niv. {level}</span>
              <span className={styles.levelName}>{LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length - 1)]}</span>
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
            <span className={styles.xpLabel}><AnimatedCounter value={xp} /> XP</span>
          </div>
        </motion.div>

        {/* ── Stats grid ── */}
        <div className={styles.statsGrid}>
          {[
            { icon: <Zap size={18}/>,    label: 'XP Total',           value: xp,                          color: 'yellow' },
            { icon: <Flame size={18}/>,  label: 'Cel mai bun streak',  value: bestStreak,                  color: 'coral'  },
            { icon: <Trophy size={18}/>, label: 'Teste completate',     value: profile?.testsCompleted || 0, color: 'cyan'   },
            { icon: '🎯',                label: 'Acuratețe',            value: `${accuracy}%`,              color: 'mint', raw: true },
          ].map((s, i) => (
            <motion.div key={s.label} className={`${styles.statCard} ${styles[`c_${s.color}`]}`}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <span className={styles.statIcon}>{s.icon}</span>
              <span className={styles.statVal}>
                {s.raw ? s.value : <AnimatedCounter value={s.value} />}
              </span>
              <span className={styles.statLbl}>{s.label}</span>
            </motion.div>
          ))}
        </div>

        {/* ── Test history ── */}
        <div className={styles.section}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionLabel}>ISTORIC TESTE</span>
            {results.length > 0 && (
              <span className={styles.histCount}>{results.length} test{results.length !== 1 ? 'e' : ''}</span>
            )}
          </div>

          {results.length === 0 ? (
            <div className={styles.histEmpty}>
              <span className={styles.histEmptyIcon}>📝</span>
              <span className={styles.histEmptyTitle}>Niciun test completat încă</span>
              <span className={styles.histEmptyDesc}>Încearcă un test simulat pentru a vedea rezultatele aici.</span>
            </div>
          ) : (
            <div className={styles.histList}>
              {results.slice(0, 10).map((r, i) => {
                const { g, cls } = gradeInfo(r.percentage);
                return (
                  <motion.div key={r.id} className={styles.histItem}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className={styles.histLeft}>
                      <span className={`${styles.histGrade} ${cls}`}>{g}</span>
                      <div className={styles.histInfo}>
                        <span className={styles.histTitle}>{r.title || 'Test simulat'}</span>
                        <span className={styles.histMeta}>
                          <span>{r.score}/{r.totalPoints}p</span>
                          <span className={styles.histDot}>·</span>
                          <Clock size={11} />
                          <span>{fmtTime(r.timeSpent)}</span>
                        </span>
                      </div>
                    </div>
                    <div className={styles.histRight}>
                      <span className={`${styles.histPct} ${r.percentage >= 60 ? styles.histPctGood : styles.histPctBad}`}>
                        {r.percentage}%
                      </span>
                      <span className={styles.histDate}>
                        {r.createdAt
                          ? new Date(r.createdAt.toDate()).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })
                          : '—'}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Weakest chapter hint ── */}
        {weakest && (
          <motion.div className={styles.hintCard}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <BookOpen size={16} className={styles.hintIcon} />
            <div className={styles.hintBody}>
              <span className={styles.hintLabel}>CAPITOL DE ÎMBUNĂTĂȚIT</span>
              <span className={styles.hintChapter}>{weakest.label}</span>
              <span className={styles.hintSub}>
                {progress[weakest.id] || 0}/{weakest.total} exerciții completate · Continuă exersarea!
              </span>
            </div>
          </motion.div>
        )}

        <Button variant="danger" size="sm" onClick={logout} className={styles.logout}>
          Deconectare
        </Button>
      </div>
    </Layout>
  );
};

export default Profile;
