import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoonStar, Sun } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { useTheme } from '../contexts';
import styles from './Home.module.css';

const FEATURES = [
  { icon: '📐', title: 'Toate capitolele', sub: 'Algebră + Geometrie EN', color: 'cyan' },
  { icon: '⏱',  title: 'Teste simulate',  sub: '2 ore · 100 puncte',    color: 'violet' },
  { icon: '🪄',  title: 'Soluții animate', sub: 'Pas cu pas pe tablă',   color: 'yellow' },
  { icon: '🏆',  title: 'Sistem XP',       sub: 'Niveluri + realizări',  color: 'mint' },
];

const STATS = [
  { num: '500+', label: 'Exerciții' },
  { num: '20+',  label: 'Teste' },
  { num: '10',   label: 'Capitole' },
];

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const up = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.21, 1.11, 0.81, 0.99] } },
};

const Home = () => {
  const [tab, setTab] = useState('login');
  const { isDark, toggle } = useTheme();

  return (
    <div className={styles.page}>
      <button
        className={styles.themeToggle}
        onClick={toggle}
        aria-label={isDark ? 'Activeaza tema luminoasa' : 'Activeaza tema intunecata'}
        title={isDark ? 'Tema luminoasa' : 'Tema intunecata'}
      >
        {isDark ? <Sun size={15} /> : <MoonStar size={15} />}
        <span>{isDark ? 'Light' : 'Dark'}</span>
      </button>
      {/* ── Left — branding ── */}
      <div className={styles.left}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.gridBg} />

        <motion.div className={styles.leftContent} variants={stagger} initial="initial" animate="animate">

          {/* ① Brand row: sigma mark + badge pill */}
          <motion.div className={styles.brandRow} variants={up}>
            <span className={styles.sigma}>∑</span>
            <div className={styles.badge}>
              <span className={styles.badgeDot} />
              Evaluarea Națională 2025 · Matematică
            </div>
          </motion.div>

          {/* ② Hero headline — main focal point */}
          <motion.h1 className={styles.headline} variants={up}>
            <span className={styles.headlineGradient}>EN Matematică</span>
            <span className={styles.headlineSub}>Clasa a VIII-a · Interactiv</span>
          </motion.h1>

          {/* ③ Tagline */}
          <motion.p className={styles.tagline} variants={up}>
            Exersează exerciții interactive, descoperă rezolvări animate pas cu pas
            și testează-te cu simulări complete de examen în condiții reale.
          </motion.p>

          {/* ④ Stat chips — social proof */}
          <motion.div className={styles.statRow} variants={up}>
            {STATS.map((s) => (
              <span key={s.label} className={styles.statChip}>
                <span className={styles.statNum}>{s.num}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </span>
            ))}
          </motion.div>

          {/* ⑤ Feature cards */}
          <motion.div className={styles.features} variants={stagger}>
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                className={`${styles.feat} ${styles[`feat_${f.color}`]}`}
                variants={up}
              >
                <span className={`${styles.featIcon} ${styles[`featIcon_${f.color}`]}`}>{f.icon}</span>
                <div className={styles.featText}>
                  <span className={styles.featTitle}>{f.title}</span>
                  <span className={styles.featSub}>{f.sub}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </motion.div>
      </div>

      {/* ── Right — auth panel ── */}
      <div className={styles.right}>
        <motion.div
          className={styles.authCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className={styles.cardGlow} />

          <div className={styles.authBrand}>
            <span className={styles.authSigma}>∑</span>
            <span className={styles.authBrandName}>EN·Math</span>
          </div>

          <div className={styles.tabBar} role="tablist">
            <button
              role="tab"
              aria-selected={tab === 'login'}
              className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
              onClick={() => setTab('login')}
            >
              Autentificare
            </button>
            <button
              role="tab"
              aria-selected={tab === 'register'}
              className={`${styles.tab} ${tab === 'register' ? styles.tabActive : ''}`}
              onClick={() => setTab('register')}
            >
              Înregistrare
            </button>
          </div>

          <div className={styles.formWrap}>
            <AnimatePresence mode="wait">
              {tab === 'login'
                ? <LoginForm key="login" onSwitch={() => setTab('register')} />
                : <RegisterForm key="register" onSwitch={() => setTab('login')} />}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;


