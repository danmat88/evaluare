import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
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

  return (
    <div className={styles.page}>
      {/* ── Left — branding ── */}
      <div className={styles.left}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.gridBg} />

        <motion.div className={styles.leftContent} variants={stagger} initial="initial" animate="animate">
          <motion.div className={styles.badge} variants={up}>
            <span className={styles.badgeDot} />
            Evaluarea Națională 2025 · Matematică
          </motion.div>

          <motion.div className={styles.sigma} variants={up}>∑</motion.div>

          <motion.h1 className={styles.headline} variants={up}>
            <span className={styles.headlineGradient}>EN Matematică</span>
            <span className={styles.headlineSub}>Clasa a VIII-a · Interactiv</span>
          </motion.h1>

          <motion.p className={styles.tagline} variants={up}>
            Exersează exerciții interactive, descoperă rezolvări animate pas cu pas
            și testează-te cu simulări complete de examen în condiții reale.
          </motion.p>

          <motion.div className={styles.features} variants={stagger}>
            {FEATURES.map((f) => (
              <motion.div
                key={f.title}
                className={`${styles.feat} ${styles[`feat_${f.color}`]}`}
                variants={up}
              >
                <span className={styles.featIcon}>{f.icon}</span>
                <div className={styles.featText}>
                  <span className={styles.featTitle}>{f.title}</span>
                  <span className={styles.featSub}>{f.sub}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div className={styles.statRow} variants={up}>
            {STATS.map((s, i) => (
              <span key={s.label}>
                <span className={styles.statNum}>{s.num}</span>
                <span className={styles.statLabel}>&nbsp;{s.label}</span>
                {i < STATS.length - 1 && <span className={styles.statSep}>·</span>}
              </span>
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
