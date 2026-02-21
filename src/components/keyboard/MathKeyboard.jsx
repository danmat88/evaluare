import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import styles from './MathKeyboard.module.css';

const TABS = [
  { id: 'num',  label: '0–9', rows: [['7','8','9'],['4','5','6'],['1','2','3'],['0','.', ',']] },
  { id: 'ops',  label: '±',   rows: [['+','−','×','÷'],['=','≠','≤','≥'],['(',')','/','|'],['<','>','±','%']] },
  { id: 'alg',  label: 'xⁿ',  rows: [['x²','x³','xⁿ','√'],['∛','lg','log','f(x)'],['x','y','n','a'],['sin','cos','tg','ctg']] },
  { id: 'geo',  label: '△',   rows: [['°','π','∠','△'],['∥','⊥','≅','~'],['r','h','d','l'],['²','³','A','V']] },
  { id: 'sets', label: '∈',   rows: [['∈','∉','⊂','⊃'],['∪','∩','∅','\\'],['ℝ','ℤ','ℕ','ℚ'],['{','}','[',']']] },
];

const Key = ({ label, onPress, variant = 'normal', wide }) => {
  const [pressing, setPressing] = useState(false);

  const handleClick = useCallback(() => {
    setPressing(true);
    setTimeout(() => setPressing(false), 150);
    onPress?.(label === '−' ? '-' : label);
  }, [label, onPress]);

  return (
    <button
      className={clsx(styles.key, styles[`key_${variant}`], wide && styles.wide, pressing && styles.pressing)}
      onClick={handleClick}
      type="button"
    >
      <span className={styles.keyFace}>{label}</span>
    </button>
  );
};

const MathKeyboard = ({ onKey, onBackspace, onClear, className }) => {
  const [activeTab, setActiveTab] = useState('num');
  const tab = TABS.find((t) => t.id === activeTab);

  return (
    <div className={clsx(styles.keyboard, className)}>
      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={clsx(styles.tab, activeTab === t.id && styles.tabActive)}
            onClick={() => setActiveTab(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          className={styles.grid}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.12 }}
        >
          {tab.rows.map((row, ri) => (
            <div key={ri} className={styles.row}>
              {row.map((k) => (
                <Key key={k} label={k} onPress={onKey} />
              ))}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className={styles.controls}>
        <Key label="⌫" onPress={onBackspace} variant="back" />
        <Key label="␣" onPress={() => onKey?.(' ')} variant="space" wide />
        <Key label="C" onPress={onClear} variant="clear" />
      </div>
    </div>
  );
};

export default MathKeyboard;
