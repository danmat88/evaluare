import { useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoonStar, Sun, BookOpen, Target, ClipboardCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { useTheme } from '../contexts';
import styles from './Home.module.css';

const AUTH_FACTS = ['Capitole ordonate', 'Review ghidat', 'Simulare reala'];

const STUDY_POINTS = [
  {
    icon: <BookOpen size={16} />,
    title: 'Materie asezata clar',
    sub: 'Lucrezi algebra si geometria in ordinea buna pentru EN.',
  },
  {
    icon: <Target size={16} />,
    title: 'Focus pe punctele slabe',
    sub: 'Revii direct la exercitiile unde pierzi puncte.',
  },
  {
    icon: <ClipboardCheck size={16} />,
    title: 'Teste ca la examen',
    sub: 'Intri in simulare cu timp, rezultat si progres salvat.',
  },
];

const MODE_CONTENT = {
  login: {
    badge: 'Acces elev',
    title: 'Intra in contul tau',
    intro: 'Continui exact din capitolul, testul sau lista de review unde ai ramas.',
    support: 'Istoricul tau de invatare ramane salvat pe acelasi email.',
  },
  register: {
    badge: 'Cont nou',
    title: 'Creeaza-ti contul de pregatire',
    intro: 'Iti deschidem un spatiu personal pentru exercitii, teste si progres salvat automat.',
    support: 'Dupa inregistrare intri direct in platforma si incepi lucrul imediat.',
  },
};

const getTabFromPath = (pathname) => (pathname === '/register' ? 'register' : 'login');

const BrandMark = () => (
  <div className={styles.logoMark} aria-hidden="true">
    <span className={styles.logoBand}>
      <span />
      <span />
      <span />
    </span>
    <span className={styles.logoPrimary}>EN</span>
    <span className={styles.logoSecondary}>MAT VIII</span>
  </div>
);

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

      <motion.section
        className={styles.authCard}
        initial={{ opacity: 0, y: 18, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.26, ease: [0.21, 1.11, 0.81, 0.99] }}
      >
        <div className={styles.brandPanel}>
          <div className={styles.brandTop}>
            <div className={styles.brandLockup}>
              <BrandMark />

              <div className={styles.brandMeta}>
                <span className={styles.brandKicker}>Platforma pentru clasa a VIII-a</span>
                <span className={styles.brandName}>Evaluare Nationala</span>
              </div>
            </div>

            <span className={styles.surfaceBadge}>Matematica EN</span>
          </div>

          <div className={styles.heroBlock}>
            <h1 className={styles.heroTitle}>Invata clar. Intra pregatit.</h1>
            <p className={styles.heroText}>
              Un spatiu de studiu simplu si serios, facut pentru elevii care vor un flow clar de lucru inainte de examen.
            </p>
          </div>

          <div className={styles.pointList}>
            {STUDY_POINTS.map((point) => (
              <article key={point.title} className={styles.pointItem}>
                <span className={styles.pointIcon}>{point.icon}</span>
                <div className={styles.pointCopy}>
                  <span className={styles.pointTitle}>{point.title}</span>
                  <span className={styles.pointSub}>{point.sub}</span>
                </div>
              </article>
            ))}
          </div>

          <div className={styles.factRow} aria-label="Avantaje">
            {AUTH_FACTS.map((fact) => (
              <span key={fact} className={styles.factChip}>{fact}</span>
            ))}
          </div>
        </div>

        <div className={styles.authPanel}>
          <div className={styles.panelHeader}>
            <span className={styles.modeBadge}>{modeContent.badge}</span>
            <h2 className={styles.authTitle}>{modeContent.title}</h2>
            <p className={styles.authIntro}>{modeContent.intro}</p>
          </div>

          <div className={styles.tabShell}>
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
          </div>

          <div className={styles.formWrap} role="tabpanel" id={activePanelId} aria-labelledby={activeTabId}>
            <AnimatePresence mode="wait" initial={false}>
              {tab === 'login'
                ? <LoginForm key="login" onSwitch={() => switchTab('register')} />
                : <RegisterForm key="register" onSwitch={() => switchTab('login')} />}
            </AnimatePresence>
          </div>

          <p className={styles.authNote}>{modeContent.support}</p>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;
