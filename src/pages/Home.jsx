import { useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoonStar,
  Sun,
  BookOpen,
  Target,
  Layers,
  ClipboardCheck,
  Grid2x2,
  Clock3,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { useTheme } from '../contexts';
import styles from './Home.module.css';

const SUPPORT_STEPS = [
  {
    icon: <BookOpen size={18} />,
    title: 'Capitole clare',
    sub: 'Algebra, geometrie si exercitii construite pentru formatul Evaluarii Nationale.',
  },
  {
    icon: <Target size={18} />,
    title: 'Logica fara goluri',
    sub: 'Vezi pasii importanti, nu doar raspunsul final, ca sa intelegi metoda.',
  },
  {
    icon: <ClipboardCheck size={18} />,
    title: 'Simulare reala',
    sub: 'Teste cronometrate, rezultate salvate si reluare rapida unde ai ramas.',
  },
];

const STATS = [
  { num: '500+', label: 'Exercitii', icon: <Grid2x2 size={13} /> },
  { num: '20+', label: 'Simulari', icon: <Clock3 size={13} /> },
  { num: '10+', label: 'Capitole', icon: <Layers size={13} /> },
];

const EXAM_PANELS = [
  {
    label: 'Subiect I',
    title: 'Ritm bun de inceput',
    sub: 'Intri rapid in calcul, atentie si raspunsuri scurte.',
  },
  {
    label: 'Subiect II',
    title: 'Metoda pas cu pas',
    sub: 'Construiesti rezolvari curate pentru cerintele de lucru.',
  },
  {
    label: 'Subiect III',
    title: 'Simulare completa',
    sub: 'Antrenezi examenul cu timp, punctaj si feedback clar.',
  },
];

const AUTH_FACTS = ['Progres salvat', 'Review automat', 'Teste cronometrate'];

const MODE_CONTENT = {
  login: {
    badge: 'Autentificare',
    title: 'Reia exact de unde ai ramas',
    intro: 'Intri direct in dashboard cu progresul, testele si exercitiile pe care le ai de revizuit.',
    support: 'Foloseste acelasi email la fiecare sesiune ca sa-ti pastrezi istoricul complet de invatare.',
  },
  register: {
    badge: 'Cont nou',
    title: 'Creeaza-ti spatiul de studiu',
    intro: 'Iti facem contul in cateva secunde, apoi poti exersa pe capitole si intra in simularea completa.',
    support: 'Dupa inregistrare, rezultatele si progresul se salveaza automat dupa fiecare sesiune.',
  },
};

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const up = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.21, 1.11, 0.81, 0.99] } },
};

const getTabFromPath = (pathname) => (pathname === '/register' ? 'register' : 'login');

const Home = () => {
  const { isDark, toggle } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const tabBaseId = useId();
  const tab = getTabFromPath(pathname);
  const modeContent = MODE_CONTENT[tab];

  const loginTabId = `${tabBaseId}-login-tab`;
  const registerTabId = `${tabBaseId}-register-tab`;
  const loginPanelId = `${tabBaseId}-login-panel`;
  const registerPanelId = `${tabBaseId}-register-panel`;
  const activeTabId = tab === 'login' ? loginTabId : registerTabId;
  const activePanelId = tab === 'login' ? loginPanelId : registerPanelId;

  const switchTab = (nextTab) => navigate(nextTab === 'register' ? '/register' : '/login');

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

      <section className={styles.hero}>
        <div className={styles.heroGlowA} />
        <div className={styles.heroGlowB} />
        <div className={styles.heroMesh} />

        <motion.div className={styles.heroContent} variants={stagger} initial="initial" animate="animate">
          <div className={styles.heroTop}>
            <motion.div className={styles.brandLockup} variants={up}>
              <div className={styles.logoMark} aria-hidden="true">
                <span className={styles.logoPrimary}>EN</span>
                <span className={styles.logoSecondary}>VIII</span>
              </div>

              <div className={styles.brandCopy}>
                <span className={styles.brandKicker}>Platforma pentru elevii de clasa a VIII-a</span>
                <h1 className={styles.brandTitle}>Evaluare Nationala</h1>
                <p className={styles.brandSubtitle}>
                  Matematica, organizata clar pentru pregatire zilnica, revizuire si simulare reala.
                </p>
              </div>
            </motion.div>

            <motion.div className={styles.heroLead} variants={up}>
              <span className={styles.heroBadge}>Pregatire clara pentru examenul real</span>
              <p className={styles.heroText}>
                Inveti capitol cu capitol, vezi unde gresesti si revii exact in punctele
                care conteaza inainte de simulare.
              </p>
            </motion.div>
          </div>

          <motion.div className={styles.examGrid} variants={up}>
            {EXAM_PANELS.map((panel) => (
              <div key={panel.label} className={styles.examCard}>
                <span className={styles.examLabel}>{panel.label}</span>
                <span className={styles.examTitle}>{panel.title}</span>
                <span className={styles.examSub}>{panel.sub}</span>
              </div>
            ))}
          </motion.div>

          <motion.div className={styles.supportGrid} variants={stagger}>
            {SUPPORT_STEPS.map((step) => (
              <motion.div key={step.title} className={styles.supportItem} variants={up}>
                <span className={styles.supportIcon}>{step.icon}</span>
                <div className={styles.supportText}>
                  <span className={styles.supportTitle}>{step.title}</span>
                  <span className={styles.supportSub}>{step.sub}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div className={styles.statRow} variants={up}>
            {STATS.map((stat) => (
              <span key={stat.label} className={styles.statChip}>
                <span className={styles.statIcon}>{stat.icon}</span>
                <span className={styles.statNum}>{stat.num}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <section className={styles.authSide}>
        <motion.div
          className={styles.authCard}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          <div className={styles.authTop}>
            <div className={styles.authBrand}>
              <span className={styles.authLogo}>EN</span>
              <div className={styles.authBrandCopy}>
                <span className={styles.authBrandName}>Evaluare Nationala</span>
                <span className={styles.authBrandSub}>Contul tau de studiu</span>
              </div>
            </div>
            <span className={styles.modeBadge}>{modeContent.badge}</span>
          </div>

          <div className={styles.authHeading}>
            <h2 className={styles.authTitle}>{modeContent.title}</h2>
            <p className={styles.authIntro}>{modeContent.intro}</p>
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
              onClick={() => switchTab('login')}
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
              onClick={() => switchTab('register')}
            >
              Inregistrare
            </button>
          </div>

          <div className={styles.formWrap} role="tabpanel" id={activePanelId} aria-labelledby={activeTabId}>
            <AnimatePresence mode="wait" initial={false}>
              {tab === 'login'
                ? <LoginForm key="login" onSwitch={() => switchTab('register')} />
                : <RegisterForm key="register" onSwitch={() => switchTab('login')} />}
            </AnimatePresence>
          </div>

          <p className={styles.authNote}>{modeContent.support}</p>
        </motion.div>
      </section>
    </div>
  );
};

export default Home;
