import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckSquare, LayoutDashboard, MoonStar, PlayCircle, Search, Sparkles, Sun, User } from 'lucide-react';
import { STORAGE_KEYS, safeReadJSON, safeWriteJSON } from '../../utils/storage';
import styles from './CommandPalette.module.css';

const filterCommands = (commands, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return commands;
  return commands.filter((command) => {
    const text = `${command.label} ${command.hint || ''} ${command.tags || ''}`.toLowerCase();
    return text.includes(q);
  });
};

const CommandPalette = ({ isOpen, onClose, onNavigate, onToggleTheme, isDark }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);

  const lastExercise = useMemo(
    () => (isOpen ? safeReadJSON(STORAGE_KEYS.lastExercise, null) : null),
    [isOpen],
  );
  const focusMode = useMemo(
    () => (isOpen ? Boolean(safeReadJSON(STORAGE_KEYS.focusMode, false)) : false),
    [isOpen],
  );

  const commands = useMemo(() => {
    const base = [
      {
        id: 'dash',
        icon: <LayoutDashboard size={14} />,
        label: 'Deschide Dashboard',
        hint: 'Overview si progres',
        tags: 'home start',
        run: () => onNavigate('/dashboard'),
      },
      {
        id: 'ex',
        icon: <BookOpen size={14} />,
        label: 'Deschide Exercitii',
        hint: 'Rezolva pe capitole',
        tags: 'practice chapter',
        run: () => onNavigate('/exercitii'),
      },
      {
        id: 'tests',
        icon: <CheckSquare size={14} />,
        label: 'Deschide Teste',
        hint: 'Simulare examen',
        tags: 'simulator',
        run: () => onNavigate('/teste'),
      },
      {
        id: 'profile',
        icon: <User size={14} />,
        label: 'Deschide Profil',
        hint: 'Rezultate si statistici',
        tags: 'account stats',
        run: () => onNavigate('/profil'),
      },
      {
        id: 'theme',
        icon: isDark ? <Sun size={14} /> : <MoonStar size={14} />,
        label: isDark ? 'Comuta pe tema light' : 'Comuta pe tema dark',
        hint: 'Aspect interfata',
        tags: 'appearance color',
        run: () => onToggleTheme(),
      },
      {
        id: 'focus',
        icon: <Sparkles size={14} />,
        label: focusMode ? 'Dezactiveaza focus mode' : 'Activeaza focus mode',
        hint: 'Aplicat in pagina Exercitii',
        tags: 'focus mode',
        run: () => safeWriteJSON(STORAGE_KEYS.focusMode, !focusMode),
      },
    ];

    if (lastExercise?.id) {
      const to = lastExercise.chapter
        ? `/exercitii?capitol=${lastExercise.chapter}`
        : '/exercitii';
      base.unshift({
        id: 'resume',
        icon: <PlayCircle size={14} />,
        label: 'Continua ultimul exercitiu',
        hint: lastExercise.chapter ? `Capitol: ${lastExercise.chapter}` : 'Sesiunea anterioara',
        tags: 'resume continue',
        run: () => onNavigate(to),
      });
    }

    return base;
  }, [focusMode, isDark, lastExercise, onNavigate, onToggleTheme]);

  const visible = useMemo(() => filterCommands(commands, query), [commands, query]);

  useEffect(() => {
    if (!isOpen) return;
    setQuery('');
    setActiveIndex(0);
    const id = setTimeout(() => inputRef.current?.focus(), 10);
    return () => clearTimeout(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setActiveIndex((curr) => Math.min(curr, Math.max(visible.length - 1, 0)));
  }, [visible.length, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActiveIndex((idx) => (visible.length ? (idx + 1) % visible.length : 0));
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActiveIndex((idx) => (visible.length ? (idx - 1 + visible.length) % visible.length : 0));
        return;
      }
      if (event.key === 'Enter') {
        event.preventDefault();
        if (!visible.length) return;
        visible[activeIndex]?.run?.();
        onClose();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeIndex, isOpen, onClose, visible]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlay} onClick={onClose}>
          <motion.div
            className={styles.panel}
            onClick={(event) => event.stopPropagation()}
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.2, 0, 0.2, 1] }}
          >
            <div className={styles.searchRow}>
              <Search size={14} />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Scrie o comanda..."
              />
              <span className={styles.keyHint}>ESC</span>
            </div>

            <div className={styles.list}>
              {!visible.length && (
                <div className={styles.empty}>Nu exista comenzi pentru cautarea curenta.</div>
              )}

              {visible.map((command, index) => (
                <button
                  key={command.id}
                  type="button"
                  className={`${styles.item} ${index === activeIndex ? styles.itemActive : ''}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    command.run?.();
                    onClose();
                  }}
                >
                  <span className={styles.itemIcon}>{command.icon}</span>
                  <span className={styles.itemBody}>
                    <span className={styles.itemTitle}>{command.label}</span>
                    {command.hint && <span className={styles.itemHint}>{command.hint}</span>}
                  </span>
                  <span className={styles.itemKey}>ENTER</span>
                </button>
              ))}
            </div>

            <div className={styles.footer}>
              <span>Ctrl/Cmd + K pentru deschidere rapida</span>
              <span>↑ ↓ navigare</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
