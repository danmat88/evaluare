import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  Search,
  Shuffle,
  FilterX,
  Layers,
  Sigma,
  Hash,
  Equal,
  TrendingUp,
  Percent,
  Target,
  Box,
  Circle,
  Zap,
} from 'lucide-react';
import ExerciseCard from './ExerciseCard';
import useExerciseStore from '../../store/exerciseStore';
import styles from './ExerciseList.module.css';

const CHAPTERS = [
  { id: null, label: 'Toate', icon: <Layers size={14} /> },
  { id: 'multimi', label: 'Multimi', icon: <Sigma size={14} /> },
  { id: 'numere', label: 'Numere', icon: <Hash size={14} /> },
  { id: 'ecuatii', label: 'Ecuatii', icon: <Equal size={14} /> },
  { id: 'functii', label: 'Functii', icon: <TrendingUp size={14} /> },
  { id: 'progresii', label: 'Progresii', icon: <ChevronRight size={14} /> },
  { id: 'probabilitati', label: 'Prob.', icon: <Percent size={14} /> },
  { id: 'triunghiuri', label: 'Triunghiuri', icon: <Target size={14} /> },
  { id: 'patrulatere', label: 'Patrulatere', icon: <Box size={14} /> },
  { id: 'cerc', label: 'Cerc', icon: <Circle size={14} /> },
  { id: 'corpuri', label: 'Corpuri', icon: <Box size={14} /> },
  { id: 'trigonometrie', label: 'Trigo', icon: <Zap size={14} /> },
];

const DIFFICULTIES = [
  { id: 0, label: 'Toate' },
  { id: 1, label: 'Usor' },
  { id: 2, label: 'Mediu' },
  { id: 3, label: 'Greu' },
];

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const ExerciseList = ({ exercises = [], loading }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [chapter, setChapter] = useState(null);
  const [difficulty, setDifficulty] = useState(0);
  const [query, setQuery] = useState('');
  const [idx, setIdx] = useState(0);
  const { totalCorrect, streak } = useExerciseStore();

  const filtered = useMemo(() => {
    const q = normalize(query.trim());

    return exercises.filter((exercise) => {
      if (chapter && exercise.chapter !== chapter) return false;
      if (difficulty && (exercise.difficulty || 1) !== difficulty) return false;
      if (!q) return true;

      const haystack = normalize(`${exercise.text} ${exercise.chapter} ${exercise.answer}`);
      return haystack.includes(q);
    });
  }, [exercises, chapter, difficulty, query]);

  const current = filtered[idx] ?? null;

  const changeChapter = (id) => {
    setChapter(id);
    setIdx(0);
  };

  const clearFilters = () => {
    setChapter(null);
    setDifficulty(0);
    setQuery('');
    setIdx(0);
  };

  const next = useCallback(() => {
    setIdx((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
  }, [filtered.length]);

  const prev = useCallback(() => {
    setIdx((i) => Math.max(i - 1, 0));
  }, []);

  const jumpRandom = useCallback(() => {
    if (!filtered.length) return;
    if (filtered.length === 1) {
      setIdx(0);
      return;
    }

    setIdx((currentIdx) => {
      let nextIdx = currentIdx;
      while (nextIdx === currentIdx) {
        nextIdx = Math.floor(Math.random() * filtered.length);
      }
      return nextIdx;
    });
  }, [filtered.length]);

  useEffect(() => {
    setIdx((currentIdx) => Math.min(currentIdx, Math.max(filtered.length - 1, 0)));
  }, [filtered.length]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const chapterParam = params.get('capitol');
    if (chapterParam && CHAPTERS.some((ch) => ch.id === chapterParam)) {
      setChapter(chapterParam);
      setIdx(0);
    }
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (chapter) params.set('capitol', chapter);
    else params.delete('capitol');

    const nextSearch = params.toString();
    const currentSearch = location.search.startsWith('?') ? location.search.slice(1) : location.search;
    if (nextSearch !== currentSearch) {
      navigate({ pathname: location.pathname, search: nextSearch ? `?${nextSearch}` : '' }, { replace: true });
    }
  }, [chapter, navigate, location.pathname, location.search]);

  useEffect(() => {
    const fn = (e) => {
      if (e.key === 'ArrowRight' && !e.target.matches('input,textarea')) next();
      if (e.key === 'ArrowLeft' && !e.target.matches('input,textarea')) prev();
    };

    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [next, prev]);

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>Capitole</span>
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
                <span className={styles.chEmoji}>{ch.icon}</span>
                <span className={styles.chLabel}>{ch.label}</span>
                {count > 0 && <span className={styles.chCount}>{count}</span>}
              </button>
            );
          })}
        </div>

        <div className={styles.miniStats}>
          <div className={styles.miniStat}>
            <span className={`${styles.miniStatNum} ${styles.miniStatNum_mint}`}>{totalCorrect}</span>
            <span className={styles.miniStatLabel}>corecte</span>
          </div>
          <div className={styles.miniStat}>
            <span className={`${styles.miniStatNum} ${styles.miniStatNum_yellow}`}>{streak}</span>
            <span className={styles.miniStatLabel}>serie</span>
          </div>
        </div>
      </aside>

      <div className={styles.main}>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <div className={styles.breadcrumb}>
              <span className={styles.breadcrumbText}>
                {chapter ? CHAPTERS.find((c) => c.id === chapter)?.label : 'Toate capitolele'}
              </span>
              {chapter && <ChevronRight size={12} className={styles.chevron} />}
              <span className={styles.resultsMeta}>{filtered.length} exercitii</span>
            </div>

            <div className={styles.navRow}>
              <button className={styles.navBtn} onClick={prev} disabled={idx === 0}>
                <ChevronLeft size={14} />
              </button>
              <div className={styles.counter}>
                <span className={styles.counterCurrent}>{filtered.length > 0 ? idx + 1 : '0'}</span>
                <span className={styles.counterTotal}>/ {filtered.length}</span>
              </div>
              <button className={styles.navBtn} onClick={next} disabled={idx >= filtered.length - 1}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className={styles.filterRow}>
            <label className={styles.searchBox}>
              <Search size={14} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cauta exercitii, raspunsuri sau capitole"
              />
            </label>

            <div className={styles.diffPills}>
              {DIFFICULTIES.map((lvl) => (
                <button
                  key={lvl.id}
                  className={`${styles.diffBtn} ${difficulty === lvl.id ? styles.diffBtnActive : ''}`}
                  onClick={() => setDifficulty(lvl.id)}
                >
                  {lvl.label}
                </button>
              ))}
            </div>

            <div className={styles.filterActions}>
              <button className={styles.iconBtn} onClick={jumpRandom} disabled={filtered.length < 2} title="Exercitiu aleatoriu">
                <Shuffle size={13} />
              </button>
              <button
                className={styles.iconBtn}
                onClick={clearFilters}
                disabled={!chapter && !difficulty && !query}
                title="Reseteaza filtrele"
              >
                <FilterX size={13} />
              </button>
            </div>

            <div className={styles.shortcuts}>
              <span className={styles.shortcutHint}>Navigare cu tastele stanga/dreapta</span>
            </div>
          </div>
        </div>

        <div className={styles.exerciseArea}>
          {loading && (
            <div className={styles.state}>
              <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <span className={styles.stateText}>Se incarca...</span>
              </motion.div>
            </div>
          )}

          {!loading && !current && (
            <div className={styles.state}>
              <span className={styles.stateText}>Niciun exercitiu gasit pentru filtrele curente.</span>
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
