import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import ExerciseCard from './ExerciseCard';
import ChalkText from '../blackboard/ChalkText';
import useExerciseStore from '../../store/exerciseStore';
import styles from './ExerciseList.module.css';

const CHAPTERS = [
  { id: null,            emoji: '⭐', label: 'Toate' },
  { id: 'multimi',       emoji: '∅',  label: 'Mulțimi' },
  { id: 'numere',        emoji: '∞',  label: 'Numere' },
  { id: 'ecuatii',       emoji: '=',  label: 'Ecuații' },
  { id: 'functii',       emoji: 'f',  label: 'Funcții' },
  { id: 'progresii',     emoji: '…',  label: 'Progresii' },
  { id: 'probabilitati', emoji: '%',  label: 'Prob.' },
  { id: 'triunghiuri',   emoji: '△',  label: 'Triunghiuri' },
  { id: 'patrulatere',   emoji: '□',  label: 'Patrulatere' },
  { id: 'cerc',          emoji: '○',  label: 'Cerc' },
  { id: 'corpuri',       emoji: '▲',  label: 'Corpuri' },
  { id: 'trigonometrie', emoji: '~',  label: 'Trigo' },
];

const ExerciseList = ({ exercises = [], loading }) => {
  const [chapter, setChapter]   = useState(null);
  const [idx, setIdx]           = useState(0);
  const { totalCorrect, streak } = useExerciseStore();

  const filtered = chapter ? exercises.filter((e) => e.chapter === chapter) : exercises;
  const current  = filtered[idx] ?? null;

  const changeChapter = (id) => { setChapter(id); setIdx(0); };
  const next = useCallback(() => setIdx((i) => Math.min(i + 1, filtered.length - 1)), [filtered.length]);
  const prev = useCallback(() => setIdx((i) => Math.max(i - 1, 0)), []);

  // Keyboard shortcuts
  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'ArrowRight' && !e.target.matches('input,textarea')) next();
      if (e.key === 'ArrowLeft'  && !e.target.matches('input,textarea')) prev();
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [next, prev]);

  return (
    <div className={styles.layout}>
      {/* ── Chapter sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <ChalkText size="xs" color="muted">CAPITOLE</ChalkText>
        </div>
        <div className={styles.chapterList}>
          {CHAPTERS.map((ch) => {
            const count = ch.id ? exercises.filter((e) => e.chapter === ch.id).length : exercises.length;
            return (
              <button
                key={String(ch.id)}
                className={`${styles.chBtn} ${chapter === ch.id ? styles.chBtnActive : ''}`}
                onClick={() => changeChapter(ch.id)}
              >
                <span className={styles.chEmoji}>{ch.emoji}</span>
                <span className={styles.chLabel}>{ch.label}</span>
                {count > 0 && (
                  <span className={styles.chCount}>{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Mini stats */}
        <div className={styles.miniStats}>
          <div className={styles.miniStat}>
            <ChalkText size="lg" color="mint">{totalCorrect}</ChalkText>
            <ChalkText size="xs" color="muted">corecte</ChalkText>
          </div>
          <div className={styles.miniStat}>
            <ChalkText size="lg" color="yellow">{streak}</ChalkText>
            <ChalkText size="xs" color="muted">serie</ChalkText>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className={styles.main}>
        {/* Header with nav */}
        <div className={styles.header}>
          <div className={styles.breadcrumb}>
            <ChalkText size="xs" color="muted">
              {chapter ? CHAPTERS.find((c) => c.id === chapter)?.label : 'Toate capitolele'}
            </ChalkText>
            {chapter && <ChevronRight size={12} className={styles.chevron} />}
          </div>
          <div className={styles.navRow}>
            <button className={styles.navBtn} onClick={prev} disabled={idx === 0}>←</button>
            <div className={styles.counter}>
              <ChalkText size="sm" color={filtered.length > 0 ? 'white' : 'muted'}>
                {filtered.length > 0 ? `${idx + 1}` : '0'}
              </ChalkText>
              <ChalkText size="xs" color="muted">/ {filtered.length}</ChalkText>
            </div>
            <button className={styles.navBtn} onClick={next} disabled={idx >= filtered.length - 1}>→</button>
          </div>
          <div className={styles.shortcuts}>
            <ChalkText size="xs" color="muted">← → pentru navigare</ChalkText>
          </div>
        </div>

        {/* Exercise area */}
        <div className={styles.exerciseArea}>
          {loading && (
            <div className={styles.state}>
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <ChalkText size="lg" color="yellow">Se încarcă...</ChalkText>
              </motion.div>
            </div>
          )}
          {!loading && !current && (
            <div className={styles.state}>
              <ChalkText size="md" color="muted">Niciun exercițiu găsit.</ChalkText>
            </div>
          )}
          {!loading && current && (
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                className={styles.cardWrap}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.18 }}
              >
                <ExerciseCard exercise={current} onNext={idx < filtered.length - 1 ? next : null} />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseList;
