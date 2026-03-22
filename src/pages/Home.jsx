import { useId, useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  MoonStar, Sun, BookOpen, Target, ClipboardCheck,
  TrendingUp, Users, Award, Zap,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import LoginForm    from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import ZeceLogo     from '../components/ui/ZeceLogo';
import { useTheme } from '../contexts';
import styles from './Home.module.css';

/* ─── Count-up ──────────────────────────────────────────────── */
const useCountUp = (target, ms = 1100, delayMs = 0) => {
  const [v, setV] = useState(0);
  const noMotion  = useReducedMotion();
  useEffect(() => {
    if (noMotion) { setV(target); return; }
    let raf;
    const timer = setTimeout(() => {
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / ms, 1);
        setV(Math.round((1 - (1 - p) ** 4) * target));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, delayMs);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [target, ms, delayMs, noMotion]);
  return v;
};

const StatCard = ({ icon, raw, label, delay }) => {
  const n    = parseInt(raw.replace(/\D/g, ''), 10) || 0;
  const val  = useCountUp(n, 1100, delay * 1000);
  const disp = raw.includes('%') ? `${val}%`
             : raw.includes('+') ? `${val.toLocaleString('ro-RO')}+`
             : String(val);
  return (
    <motion.div className={styles.statCard}
      initial={{ opacity: 0, y: 12, scale: 0.9 }}
      animate={{ opacity: 1, y: 0,  scale: 1   }}
      transition={{ delay, duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
    >
      <span className={styles.statIcon}>{icon}</span>
      <span className={styles.statValue}>{disp}</span>
      <span className={styles.statLabel}>{label}</span>
    </motion.div>
  );
};

const STATS = [
  { icon: <BookOpen size={12} />, raw: '2400+', label: 'exerciții',       delay: 0.60 },
  { icon: <Users    size={12} />, raw: '98%',   label: 'promovabilitate', delay: 0.74 },
  { icon: <Award    size={12} />, raw: '12',    label: 'capitole',        delay: 0.88 },
];

/* ─── Avantaje ──────────────────────────────────────────────── */
const AVANTAJE = [
  {
    icon: <BookOpen size={13} />,
    titlu: 'Materie bine organizată',
    descriere: 'Parcurgi totul în ordinea potrivită pentru clasa a VIII-a.',
    accent: 'var(--neon-cyan)',
    accentBg: 'color-mix(in srgb, var(--neon-cyan) 10%, transparent)',
  },
  {
    icon: <Target size={13} />,
    titlu: 'Recapitulare eficientă',
    descriere: 'Revii rapid la exercițiile care îți scad nota.',
    accent: '#f59e0b',
    accentBg: 'color-mix(in srgb, #f59e0b 10%, transparent)',
  },
  {
    icon: <ClipboardCheck size={13} />,
    titlu: 'Simulare de examen',
    descriere: 'Test cronometrat cu rezultate și progres salvat.',
    accent: '#34d399',
    accentBg: 'color-mix(in srgb, #34d399 10%, transparent)',
  },
];

/* ─── Bandă derulantă ───────────────────────────────────────── */
const SUBIECTE = [
  'Ecuații', 'Inegalități', 'Funcții', 'Geometrie',
  'Trigonometrie', 'Probabilități', 'Mulțimi', 'Algebră',
  'Vectori', 'Cercul', 'Triunghiuri', 'Sisteme',
];
const BandaDerulanta = () => {
  const items = [...SUBIECTE, ...SUBIECTE];
  return (
    <div className={styles.marqueeWrap} aria-hidden="true">
      <div className={styles.marqueeTrack}>
        {items.map((s, i) => (
          <span key={i} className={styles.marqueeItem}><Zap size={7} />{s}</span>
        ))}
      </div>
    </div>
  );
};

/* ─── Animație cuvânt cu cuvânt ─────────────────────────────── */
const CW = ({ children, delay, accent }) => (
  <motion.span
    className={accent ? styles.headlineGrad : undefined}
    style={{ display: 'inline-block', marginRight: '0.16em' }}
    initial={{ opacity: 0, y: 20, rotateX: -15 }}
    animate={{ opacity: 1, y: 0,   rotateX: 0  }}
    transition={{ delay, duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.span>
);

/* ─── Simboluri matematice ──────────────────────────────────── */
const SIMBOLURI = [
  { s: '∑', r: '11deg',  x: '6%',  y: '29%', sc: '1',    d: '0s'   },
  { s: '∫', r: '-7deg',  x: '72%', y: '17%', sc: '0.72', d: '1.1s' },
  { s: 'π', r: '4deg',   x: '56%', y: '59%', sc: '0.88', d: '0.6s' },
  { s: '√', r: '-13deg', x: '14%', y: '69%', sc: '0.6',  d: '1.8s' },
  { s: '△', r: '18deg',  x: '81%', y: '45%', sc: '0.52', d: '0.3s' },
  { s: '∞', r: '-5deg',  x: '39%', y: '10%', sc: '0.65', d: '1.4s' },
];

/* ─── Conținut per tab ──────────────────────────────────────── */
const CONTINUT = {
  login: {
    eticheta: 'Autentificare',
    titlu:    'Bine ai revenit',
    intro:    'Continui de unde ai rămas — capitole, teste și exerciții te așteaptă.',
    nota:     'Progresul tău rămâne salvat pe același cont.',
  },
  register: {
    eticheta: 'Cont nou',
    titlu:    'Începe pregătirea',
    intro:    'Îți pregătim un spațiu personal cu exerciții, teste și progres salvat automat.',
    nota:     'Intri direct în platformă imediat după înregistrare.',
  },
};

const TABURI = [
  { cheie: 'login',    eticheta: 'Autentificare' },
  { cheie: 'register', eticheta: 'Înregistrare'  },
];

const getTab = (pathname) => (pathname === '/register' ? 'register' : 'login');

/* ═══════════════════════════════════════════════════════════
   COMPONENTA PRINCIPALĂ
   ═══════════════════════════════════════════════════════════ */
export default function Home() {
  const { isDark, toggle } = useTheme();
  const { pathname }       = useLocation();
  const navigate           = useNavigate();
  const uid                = useId();
  const tab                = getTab(pathname);
  const continut           = CONTINUT[tab];

  const loginTabId      = `${uid}-lt`;
  const registerTabId   = `${uid}-rt`;
  const loginPanelId    = `${uid}-lp`;
  const registerPanelId = `${uid}-rp`;
  const activeTabId     = tab === 'login' ? loginTabId    : registerTabId;
  const activePanelId   = tab === 'login' ? loginPanelId  : registerPanelId;

  const schimbaTab = (urmator) => navigate(urmator === 'register' ? '/register' : '/login');

  return (
    <div className={styles.page}>
      <div className={styles.noise} aria-hidden="true" />

      {/* Buton temă */}
      <button className={styles.themeToggle} onClick={toggle}
        aria-label={isDark ? 'Temă luminoasă' : 'Temă întunecată'}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={isDark ? 'soare' : 'luna'}
            initial={{ rotate: -40, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0,   opacity: 1, scale: 1   }}
            exit={{    rotate:  40, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.18 }}
            style={{ display: 'inline-flex' }}>
            {isDark ? <Sun size={14} /> : <MoonStar size={14} />}
          </motion.span>
        </AnimatePresence>
      </button>

      {/* ══════════════ PANOUL STÂNG ══════════════ */}
      <div className={styles.brandStage}>
        <div className={styles.aurora1}   aria-hidden="true" />
        <div className={styles.aurora2}   aria-hidden="true" />
        <div className={styles.aurora3}   aria-hidden="true" />
        <div className={styles.stageGrid} aria-hidden="true" />
        {/* Filigran "10" — Zece = nota maximă */}
        <div className={styles.ghostMono} aria-hidden="true">10</div>
        <div className={styles.mathDeco}  aria-hidden="true">
          {SIMBOLURI.map(({ s, r, x, y, sc, d }) => (
            <span key={s} className={styles.mathSym}
              style={{ '--r': r, '--x': x, '--y': y, '--s': sc, '--d': d }}>
              {s}
            </span>
          ))}
        </div>

        {/* ZONA 1 — Logo */}
        <motion.div className={styles.brandTop}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.42, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}>
          <ZeceLogo size="md" />
        </motion.div>

        {/* ZONA 2 — Mesaj principal */}
        <div className={styles.brandHero}>
          <motion.span className={styles.headlineKicker}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0  }}
            transition={{ duration: 0.34, delay: 0.22 }}>
            <TrendingUp size={9} />
            Evaluarea Națională · Clasa a VIII-a
          </motion.span>

          <h1 className={styles.headlineTitle} style={{ perspective: '600px' }}>
            <CW delay={0.28}>Înveți</CW>
            <CW delay={0.36}>mai</CW><br />
            <CW delay={0.44} accent>clar.</CW><br />
            <CW delay={0.52}>Intri</CW>
            <CW delay={0.60}>mai</CW><br />
            <CW delay={0.68} accent>sigur.</CW>
          </h1>

          <motion.p className={styles.headlineSub}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.42, delay: 0.78 }}>
            Un spațiu organizat pentru tot ce ai nevoie la examen —
            teorie, exerciții și simulări.
          </motion.p>
        </div>

        {/* ZONA 3 — Avantaje + statistici + bandă */}
        <div className={styles.brandBottom}>
          <div className={styles.featureList}>
            {AVANTAJE.map((a, i) => (
              <motion.div key={a.titlu} className={styles.featureItem}
                style={{ '--accent': a.accent, '--accent-bg': a.accentBg }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0  }}
                transition={{ delay: 0.86 + i * 0.09, duration: 0.34, ease: [0.22, 1, 0.36, 1] }}>
                <span className={styles.featureIcon}>{a.icon}</span>
                <div className={styles.featureCopy}>
                  <span className={styles.featureTitle}>{a.titlu}</span>
                  <span className={styles.featureSub}>{a.descriere}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className={styles.statRow}>
            {STATS.map((s) => <StatCard key={s.label} {...s} />)}
          </div>

          <BandaDerulanta />
        </div>
      </div>

      {/* ══════════════ PANOUL DREPT ══════════════ */}
      <motion.div className={styles.authStage}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.12 }}>
        <div className={styles.authAtmos} aria-hidden="true" />

        <motion.div className={styles.authCardWrap}
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0,  scale: 1    }}
          transition={{ duration: 0.46, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}>

          <div className={styles.cardGlowBorder} aria-hidden="true" />

          <div className={styles.authCard}>

            {/* Antet */}
            <div className={styles.authCardTop}>
              <AnimatePresence mode="wait">
                <motion.span key={tab + '-e'} className={styles.modeBadge}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1   }}
                  exit={{    opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.14 }}>
                  {continut.eticheta}
                </motion.span>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.h2 key={tab + '-t'} className={styles.authTitle}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0   }}
                  exit={{    opacity: 0, y: 10  }}
                  transition={{ duration: 0.2 }}>
                  {continut.titlu}
                </motion.h2>
              </AnimatePresence>

              <AnimatePresence mode="wait">
                <motion.p key={tab + '-i'} className={styles.authIntro}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{    opacity: 0 }}
                  transition={{ duration: 0.18, delay: 0.05 }}>
                  {continut.intro}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Corp */}
            <div className={styles.authCardBody}>

              {/* Taburi */}
              <div className={styles.tabShell}>
                <div className={styles.tabBar}
                  role="tablist"
                  aria-label="Selectează formularul">
                  {TABURI.map(({ cheie, eticheta }, idx) => {
                    const tId   = idx === 0 ? loginTabId    : registerTabId;
                    const pId   = idx === 0 ? loginPanelId  : registerPanelId;
                    const activ = tab === cheie;
                    return (
                      <button key={cheie} id={tId} type="button" role="tab"
                        aria-selected={activ} aria-controls={pId}
                        tabIndex={activ ? 0 : -1}
                        className={`${styles.tab} ${activ ? styles.tabActive : ''}`}
                        onClick={() => schimbaTab(cheie)}>
                        {activ && (
                          <motion.span layoutId="tabPill" className={styles.tabPill}
                            transition={{ type: 'spring', stiffness: 460, damping: 38 }} />
                        )}
                        <span className={styles.tabLabel}>{eticheta}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Formularul — înălțime fixă */}
              <div className={styles.formPanel}
                role="tabpanel" id={activePanelId} aria-labelledby={activeTabId}>
                <AnimatePresence mode="wait" initial={false}>
                  {tab === 'login'
                    ? <LoginForm    key="login"    onSwitch={() => schimbaTab('register')} />
                    : <RegisterForm key="register" onSwitch={() => schimbaTab('login')} />}
                </AnimatePresence>
              </div>

              {/* Notă */}
              <AnimatePresence mode="wait">
                <motion.p key={tab + '-n'} className={styles.authNote}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{    opacity: 0 }}
                  transition={{ duration: 0.16 }}>
                  {continut.nota}
                </motion.p>
              </AnimatePresence>

            </div>
          </div>
        </motion.div>
      </motion.div>

    </div>
  );
}