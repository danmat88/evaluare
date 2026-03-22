import { useId, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoonStar,
  Sun,
  BookOpen,
  Target,
  Sigma,
  Layers,
  ClipboardCheck,
  Grid2x2,
} from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { useTheme } from '../contexts';
import styles from './Home.module.css';

const SUPPORT_STEPS = [
  {
    icon: <BookOpen size={18} />,
    title: 'Exersezi pe capitole',
    sub: 'Algebra, geometrie si cerinte tip Evaluarea Nationala.',
  },
  {
    icon: <Target size={18} />,
    title: 'Intelegi fiecare pas',
    sub: 'Rezolvari clare, fara salturi in logica sau explicatii lipsa.',
  },
  {
    icon: <ClipboardCheck size={18} />,
    title: 'Simulezi examenul complet',
    sub: '120 de minute, 100 de puncte si rezultate salvate in cont.',
  },
];

const STATS = [
  { num: '500+', label: 'Exercitii', icon: <Grid2x2 size={13} /> },
  { num: '20+', label: 'Teste', icon: <ClipboardCheck size={13} /> },
  { num: '10', label: 'Capitole', icon: <Layers size={13} /> },
];

const AUTH_FACTS = ['Cont gratuit', 'Progres salvat automat', 'Acces instant'];

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const up = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.21, 1.11, 0.81, 0.99] } },
};

const Home = () => {
  const [tab, setTab] = useState('login');
  const { isDark, toggle } = useTheme();
  const tabBaseId = useId();

  const loginTabId = `${tabBaseId}-login-tab`;
  const registerTabId = `${tabBaseId}-register-tab`;
  const loginPanelId = `${tabBaseId}-login-panel`;
  const registerPanelId = `${tabBaseId}-register-panel`;
  const activeTabId = tab === 'login' ? loginTabId : registerTabId;
  const activePanelId = tab === 'login' ? loginPanelId : registerPanelId;

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

      <div className={styles.left}>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.gridBg} />

        <motion.div className={styles.leftContent} variants={stagger} initial="initial" animate="animate">
          <motion.div className={styles.brandRow} variants={up}>
            <span className={styles.sigma}><Sigma size={32} /></span>
            <div className={styles.badge}>
              <span className={styles.badgeDot} />
              Evaluarea Nationala 2026 - Matematica
            </div>
          </motion.div>

          <motion.h1 className={styles.headline} variants={up}>
            <span className={styles.headlineGradient}>EN Matematica</span>
            <span className={styles.headlineSub}>Clasa a VIII-a - Interactiv</span>
          </motion.h1>

          <motion.p className={styles.tagline} variants={up}>
            Exerseaza pe capitole, urmareste rezolvari pas cu pas si intra in simulare
            cu un ritm de lucru apropiat de examenul real.
          </motion.p>

          <motion.div className={styles.statRow} variants={up}>
            {STATS.map((s) => (
              <span key={s.label} className={styles.statChip}>
                <span className={styles.statIcon}>{s.icon}</span>
                <span className={styles.statNum}>{s.num}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </span>
            ))}
          </motion.div>

          <motion.div className={styles.supportList} variants={stagger}>
            {SUPPORT_STEPS.map((step, index) => (
              <motion.div key={step.title} className={styles.supportItem} variants={up}>
                <span className={styles.supportIndex}>0{index + 1}</span>
                <span className={styles.supportIcon}>{step.icon}</span>
                <div className={styles.supportText}>
                  <span className={styles.supportTitle}>{step.title}</span>
                  <span className={styles.supportSub}>{step.sub}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <div className={styles.right}>
        <motion.div
          className={styles.authCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className={styles.cardGlow} />

          <div className={styles.authBrand}>
            <span className={styles.authSigma}><Sigma size={24} /></span>
            <span className={styles.authBrandName}>EN.Math</span>
          </div>

          <div className={styles.authHeading}>
            <span className={styles.authEyebrow}>Intri in mai putin de un minut</span>
            <p className={styles.authIntro}>
              Autentificarea iti pastreaza progresul, rezultatele si obiectivele zilnice
              la fiecare sesiune de studiu.
            </p>
          </div>

          <div className={styles.authFacts} aria-label="Avantaje">
            {AUTH_FACTS.map((fact) => (
              <span key={fact} className={styles.authFact}>{fact}</span>
            ))}
          </div>

          <div className={styles.tabBar} role="tablist" aria-label="Alege formularul de autentificare">
            <button
              id={loginTabId}
              type="button"
              role="tab"
              aria-selected={tab === 'login'}
              aria-controls={loginPanelId}
              tabIndex={tab === 'login' ? 0 : -1}
              className={`${styles.tab} ${tab === 'login' ? styles.tabActive : ''}`}
              onClick={() => setTab('login')}
            >
              Autentificare
            </button>
            <button
              id={registerTabId}
              type="button"
              role="tab"
              aria-selected={tab === 'register'}
              aria-controls={registerPanelId}
              tabIndex={tab === 'register' ? 0 : -1}
              className={`${styles.tab} ${tab === 'register' ? styles.tabActive : ''}`}
              onClick={() => setTab('register')}
            >
              Inregistrare
            </button>
          </div>

          <div className={styles.formWrap} role="tabpanel" id={activePanelId} aria-labelledby={activeTabId}>
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
