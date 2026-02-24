import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import styles from './MathKeyboard.module.css';

const TABS = [
  {
    id: 'num',
    label: '123',
    color: '#00e5ff',
    rows: [
      ['7', '8', '9', '+'],
      ['4', '5', '6', '−'],
      ['1', '2', '3', '×'],
      ['0', '.', ',', '÷'],
    ],
  },
  {
    id: 'ops',
    label: '= ≠',
    color: '#a855f7',
    rows: [
      ['=', '≠', '<', '>'],
      ['≤', '≥', '±', '%'],
      ['(', ')', '{', '}'],
      ['[', ']', '|', '/'],
    ],
  },
  {
    id: 'alg',
    label: 'xⁿ',
    color: '#fbbf24',
    rows: [
      ['x²', 'x³', 'xⁿ', '√'],
      ['∛', 'lg', 'log', 'ln'],
      ['sin', 'cos', 'tg', 'ctg'],
      ['x', 'y', 'n', 'a'],
    ],
  },
  {
    id: 'geo',
    label: '△',
    color: '#34d399',
    rows: [
      ['°', 'π', '∠', '△'],
      ['∥', '⊥', '≅', '~'],
      ['r', 'h', 'd', 'l'],
      ['A', 'V', '²', '³'],
    ],
  },
  {
    id: 'sets',
    label: '∈',
    color: '#f43f5e',
    rows: [
      ['∈', '∉', '⊂', '⊃'],
      ['∪', '∩', '∅', '\\'],
      ['ℝ', 'ℤ', 'ℕ', 'ℚ'],
      ['Δ', '∑', '∞', '→'],
    ],
  },
];

const IS_DIGIT = /^[0-9]$/;

const Key = ({ label, onPress, variant = 'normal', wide, isNum }) => {
  const [pressing, setPressing] = useState(false);

  const handleClick = useCallback(() => {
    setPressing(true);
    setTimeout(() => setPressing(false), 140);
    onPress?.(label === '−' ? '-' : label);
  }, [label, onPress]);

  return (
    <button
      className={clsx(
        styles.key,
        styles[`key_${variant}`],
        isNum && styles.keyNum,
        wide && styles.wide,
        pressing && styles.pressing,
      )}
      onClick={handleClick}
      type="button"
      aria-label={label}
    >
      <span className={styles.keyFace}>{label}</span>
    </button>
  );
};

const MathKeyboard = ({ onKey, onBackspace, onClear, className }) => {
  const [activeTab, setActiveTab] = useState('num');
  const tab = TABS.find((t) => t.id === activeTab);

  return (
    <div className={clsx(styles.keyboard, className)} style={{ '--kbd-accent': tab.color }}>
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={clsx(styles.tab, activeTab === t.id && styles.tabActive)}
            style={{ '--tab-color': t.color }}
            onClick={() => setActiveTab(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className={styles.grid}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.1 }}
        >
          {tab.rows.map((row, ri) => (
            <div key={ri} className={styles.row}>
              {row.map((k) => (
                <Key key={k} label={k} onPress={onKey} isNum={IS_DIGIT.test(k)} />
              ))}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className={styles.controls}>
        <Key label="⌫" onPress={onBackspace} variant="back" />
        <Key label="SPATIU" onPress={() => onKey?.(' ')} variant="space" wide />
        <Key label="C" onPress={onClear} variant="clear" />
      </div>
    </div>
  );
};

export default MathKeyboard;
