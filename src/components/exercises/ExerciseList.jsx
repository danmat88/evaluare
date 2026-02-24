import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Equal,
  FilterX,
  Hash,
  Layers,
  Maximize2,
  Minimize2,
  Percent,
  Play,
  Search,
  Shuffle,
  Sigma,
  Star,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import ExerciseCard from './ExerciseCard';
import useExerciseStore from '../../store/exerciseStore';
import { STORAGE_KEYS, safeReadJSON, safeWriteJSON, todayStamp } from '../../utils/storage';
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
  { id: 'cerc', label: 'Cerc', icon: <CircleDot size={14} /> },
  { id: 'corpuri', label: 'Corpuri', icon: <Box size={14} /> },
  { id: 'trigonometrie', label: 'Trigo', icon: <Zap size={14} /> },
];

const DIFFICULTIES = [
  { id: 0, label: 'Toate' },
  { id: 1, label: 'Usor' },
  { id: 2, label: 'Mediu' },
  { id: 3, label: 'Greu' },
];

const VIEW_MODES = [
  { id: 'all', label: 'Toate' },
  { id: 'favorites', label: 'Favorite' },
  { id: 'pending', label: 'Nerezolvate' },
  { id: 'solved', label: 'Rezolvate' },
];

const normalize = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const toSet = (value) => new Set(Array.isArray(value) ? value : []);

const ExerciseList = ({ exercises = [], loading }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  const [chapter, setChapter] = useState(null);
  const [difficulty, setDifficulty] = useState(0);
  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState('all');
  const [idx, setIdx] = useState(0);
  const [pendingResumeId, setPendingResumeId] = useState(null);

  const [favoriteIds, setFavoriteIds] = useState(() => toSet(safeReadJSON(STORAGE_KEYS.favorites, [])));
  const [solvedIds, setSolvedIds] = useState(() => toSet(safeReadJSON(STORAGE_KEYS.solved, [])));
  const [lastExercise, setLastExercise] = useState(() => safeReadJSON(STORAGE_KEYS.lastExercise, null));
  const [focusMode, setFocusMode] = useState(() => Boolean(safeReadJSON(STORAGE_KEYS.focusMode, false)));
  const [draftAnswers, setDraftAnswers] = useState(() => safeReadJSON(STORAGE_KEYS.drafts, {}));

  const { totalCorrect, streak } = useExerciseStore();

  const filtered = useMemo(() => {
    const q = normalize(query.trim());

    return exercises.filter((exercise) => {
      if (chapter && exercise.chapter !== chapter) return false;
      if (difficulty && (exercise.difficulty || 1) !== difficulty) return false;

      if (viewMode === 'favorites' && !favoriteIds.has(exercise.id)) return false;
      if (viewMode === 'solved' && !solvedIds.has(exercise.id)) return false;
      if (viewMode === 'pending' && solvedIds.has(exercise.id)) return false;

      if (!q) return true;

      const haystack = normalize(`${exercise.text} ${exercise.chapter} ${exercise.answer}`);
      return haystack.includes(q);
    });
  }, [chapter, difficulty, exercises, favoriteIds, query, solvedIds, viewMode]);

  const current = filtered[idx] ?? null;
  const isFavorite = current ? favoriteIds.has(current.id) : false;
  const draftsCount = useMemo(() => Object.keys(draftAnswers || {}).length, [draftAnswers]);

  useEffect(() => {
    safeWriteJSON(STORAGE_KEYS.favorites, Array.from(favoriteIds));
  }, [favoriteIds]);

  useEffect(() => {
    safeWriteJSON(STORAGE_KEYS.solved, Array.from(solvedIds));
  }, [solvedIds]);

  useEffect(() => {
    safeWriteJSON(STORAGE_KEYS.focusMode, focusMode);
  }, [focusMode]);

  useEffect(() => {
    safeWriteJSON(STORAGE_KEYS.drafts, draftAnswers);
  }, [draftAnswers]);

  useEffect(() => {
    if (!current) return;
    const snapshot = {
      id: current.id,
      chapter: current.chapter || null,
      difficulty: current.difficulty || 1,
      savedAt: Date.now(),
    };
    setLastExercise(snapshot);
    safeWriteJSON(STORAGE_KEYS.lastExercise, snapshot);
  }, [current]);

  const setDraftAnswer = useCallback((exerciseId, value) => {
    setDraftAnswers((prev) => {
      const next = { ...(prev || {}) };
      const normalized = String(value || '').trim();
      if (!normalized) delete next[exerciseId];
      else next[exerciseId] = String(value);
      return next;
    });
  }, []);

  const changeChapter = (id) => {
    setChapter(id);
    setIdx(0);
  };

  const clearFilters = () => {
    setChapter(null);
    setDifficulty(0);
    setQuery('');
    setViewMode('all');
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

  const toggleFavoriteCurrent = useCallback(() => {
    if (!current) return;
    setFavoriteIds((prevSet) => {
      const nextSet = new Set(prevSet);
      if (nextSet.has(current.id)) nextSet.delete(current.id);
      else nextSet.add(current.id);
      return nextSet;
    });
  }, [current]);

  const resumeLastExercise = useCallback(() => {
    if (!lastExercise?.id) return;
    setQuery('');
    setDifficulty(0);
    setViewMode('all');
    setChapter(lastExercise.chapter && CHAPTERS.some((ch) => ch.id === lastExercise.chapter) ? lastExercise.chapter : null);
    setPendingResumeId(lastExercise.id);
    setIdx(0);
  }, [lastExercise]);

  const onExerciseResult = useCallback((payload) => {
    const { exerciseId, correct } = payload;

    if (correct) {
      setSolvedIds((prevSet) => {
        if (prevSet.has(exerciseId)) return prevSet;
        const nextSet = new Set(prevSet);
        nextSet.add(exerciseId);
        return nextSet;
      });
      setDraftAnswer(exerciseId, '');
    }

    const today = todayStamp();
    const stored = safeReadJSON(STORAGE_KEYS.dailyActivity, { date: today, attempted: [], correct: [] });
    const base = stored?.date === today ? stored : { date: today, attempted: [], correct: [] };

    const attemptedSet = new Set(Array.isArray(base.attempted) ? base.attempted : []);
    attemptedSet.add(exerciseId);

    const correctSet = new Set(Array.isArray(base.correct) ? base.correct : []);
    if (correct) correctSet.add(exerciseId);

    safeWriteJSON(STORAGE_KEYS.dailyActivity, {
      date: today,
      attempted: Array.from(attemptedSet),
      correct: Array.from(correctSet),
    });
  }, [setDraftAnswer]);

  useEffect(() => {
    setIdx((currentIdx) => Math.min(currentIdx, Math.max(filtered.length - 1, 0)));
  }, [filtered.length]);

  useEffect(() => {
    if (!pendingResumeId) return;
    if (!filtered.length) return;

    const resumeIndex = filtered.findIndex((exercise) => exercise.id === pendingResumeId);
    if (resumeIndex >= 0) {
      setIdx(resumeIndex);
    }
    setPendingResumeId(null);
  }, [filtered, pendingResumeId]);

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
    const isTypingTarget = (target) => {
      if (!target || typeof target.matches !== 'function') return false;
      return target.matches('input, textarea, [contenteditable=true]');
    };

    const fn = (event) => {
      if (event.key === 'ArrowRight' && !isTypingTarget(event.target)) next();
      if (event.key === 'ArrowLeft' && !isTypingTarget(event.target)) prev();

      if (event.key === '/' && !isTypingTarget(event.target)) {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key.toLowerCase() === 'f' && !isTypingTarget(event.target)) {
        event.preventDefault();
        toggleFavoriteCurrent();
      }

      if (event.key.toLowerCase() === 'r' && !isTypingTarget(event.target)) {
        event.preventDefault();
        jumpRandom();
      }

      if (event.key.toLowerCase() === 'm' && !isTypingTarget(event.target)) {
        event.preventDefault();
        setFocusMode((v) => !v);
      }
    };

    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [jumpRandom, next, prev, toggleFavoriteCurrent]);

  return (
    <div className={`${styles.layout} ${focusMode ? styles.layoutFocus : ''}`}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarTitle}>Capitole</span>
          <div className={styles.sidebarMeta}>
            <span className={styles.sidebarMetaChip}>{favoriteIds.size} fav</span>
            <span className={styles.sidebarMetaChip}>{solvedIds.size} ok</span>
            <span className={styles.sidebarMetaChip}>{draftsCount} draft</span>
          </div>
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
              <button className={styles.navBtn} onClick={prev} disabled={idx === 0} title="Anterior (LEFT)">
                <ChevronLeft size={14} />
              </button>

              <div className={styles.counter}>
                <span className={styles.counterCurrent}>{filtered.length > 0 ? idx + 1 : '0'}</span>
                <span className={styles.counterTotal}>/ {filtered.length}</span>
              </div>

              <button className={styles.navBtn} onClick={next} disabled={idx >= filtered.length - 1} title="Urmator (RIGHT)">
                <ChevronRight size={14} />
              </button>

              <button
                className={`${styles.navBtn} ${isFavorite ? styles.navBtnActive : ''}`}
                onClick={toggleFavoriteCurrent}
                disabled={!current}
                title="Favorite (F)"
              >
                <Star size={13} fill={isFavorite ? 'currentColor' : 'none'} />
              </button>

              <button
                className={styles.navBtn}
                onClick={resumeLastExercise}
                disabled={!lastExercise?.id}
                title="Continua ultimul exercitiu"
              >
                <Play size={13} />
              </button>

              <button
                className={`${styles.navBtn} ${focusMode ? styles.navBtnActive : ''}`}
                onClick={() => setFocusMode((v) => !v)}
                title="Mod focus (M)"
              >
                {focusMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              </button>
            </div>
          </div>

          <div className={styles.filterRow}>
            <label className={styles.searchBox}>
              <Search size={14} />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cauta exercitii, raspunsuri sau capitole"
              />
            </label>

            <div className={styles.viewPills}>
              {VIEW_MODES.map((mode) => (
                <button
                  key={mode.id}
                  className={`${styles.viewBtn} ${viewMode === mode.id ? styles.viewBtnActive : ''}`}
                  onClick={() => {
                    setViewMode(mode.id);
                    setIdx(0);
                  }}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <div className={styles.diffPills}>
              {DIFFICULTIES.map((lvl) => (
                <button
                  key={lvl.id}
                  className={`${styles.diffBtn} ${difficulty === lvl.id ? styles.diffBtnActive : ''}`}
                  onClick={() => {
                    setDifficulty(lvl.id);
                    setIdx(0);
                  }}
                >
                  {lvl.label}
                </button>
              ))}
            </div>

            <div className={styles.filterActions}>
              <button className={styles.iconBtn} onClick={jumpRandom} disabled={filtered.length < 2} title="Exercitiu aleatoriu (R)">
                <Shuffle size={13} />
              </button>
              <button
                className={styles.iconBtn}
                onClick={clearFilters}
                disabled={!chapter && !difficulty && !query && viewMode === 'all'}
                title="Reseteaza filtrele"
              >
                <FilterX size={13} />
              </button>
            </div>

            <div className={styles.shortcuts}>
              <span className={styles.shortcutHint}>Shortcuts: LEFT/RIGHT, /, F, R, M</span>
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
                <ExerciseCard
                  exercise={current}
                  initialAnswer={draftAnswers?.[current.id] || ''}
                  onAnswerChange={setDraftAnswer}
                  onResult={onExerciseResult}
                  onNext={idx < filtered.length - 1 ? next : null}
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExerciseList;
