import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, FlaskConical, ArrowRight, Zap, Target, TrendingUp } from 'lucide-react';
import ProgressDashboard from '../components/progress/ProgressDashboard';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts';
import useExerciseStore from '../store/exerciseStore';
import styles from './Dashboard.module.css';

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const up = { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const TIPS = [
  'La ecuatii de gradul II, verifica mereu discriminantul ? = b² - 4ac.',
  'Teorema lui Pitagora: in triunghi dreptunghic, a² + b² = c².',
  'Suma unghiurilor unui triunghi este intotdeauna 180°.',
  'Pentru progresii aritmetice: a_n = a_1 + (n-1)·r.',
  'Aria cercului: A = p·r², iar lungimea cercului este 2·p·r.',
];

const dailyTip = TIPS[new Date().getDay() % TIPS.length];

const CHAPTERS = [
  { id: 'multimi', label: 'Multimi', total: 10 },
  { id: 'numere', label: 'Numere', total: 15 },
  { id: 'ecuatii', label: 'Ecuatii', total: 20 },
  { id: 'functii', label: 'Functii', total: 15 },
  { id: 'progresii', label: 'Progresii', total: 10 },
  { id: 'probabilitati', label: 'Probabilitati', total: 8 },
  { id: 'triunghiuri', label: 'Triunghiuri', total: 18 },
  { id: 'patrulatere', label: 'Patrulatere', total: 12 },
  { id: 'cerc', label: 'Cerc', total: 10 },
  { id: 'corpuri', label: 'Corpuri', total: 10 },
  { id: 'trigonometrie', label: 'Trigonometrie', total: 8 },
];

const STATS = [
  { icon: <Zap size={16} />, label: 'XP Total', key: 'xp', color: 'yellow' },
  { icon: '??', label: 'Serie', key: 'streak', color: 'coral' },
  { icon: <Target size={16} />, label: 'Corecte', key: 'totalCorrect', color: 'mint' },
];

const LiveClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = now.getHours().toString().padStart(2, '0');
  const mm = now.getMinutes().toString().padStart(2, '0');
  const ss = now.getSeconds().toString().padStart(2, '0');
  const day = now.toLocaleDateString('ro-RO', { weekday: 'long' });
  const date = now.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' });

  return (
    <div className={styles.clock}>
      <div className={styles.clockFace}>
        <span className={styles.clockHM}>{hh}<span className={styles.clockColon}>:</span>{mm}</span>
        <span className={styles.clockSec}>{ss}</span>
      </div>
      <div className={styles.clockMeta}>
        <span className={styles.clockDay}>{day}</span>
        <span className={styles.clockDate}>{date}</span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { profile } = useAuth();
  const { xp, streak, totalCorrect } = useExerciseStore();
  const values = { xp, streak, totalCorrect };
  const name = profile?.name?.split(' ')[0] || 'elev';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buna dimineata' : hour < 18 ? 'Buna ziua' : 'Buna seara';

  const progress = useMemo(() => profile?.progress || {}, [profile?.progress]);
  const weakest = useMemo(() => {
    let minPct = 101;
    let found = null;
    for (const ch of CHAPTERS) {
      const pct = ch.total > 0 ? ((progress[ch.id] || 0) / ch.total) * 100 : 0;
      if (pct < minPct) {
        minPct = pct;
        found = ch;
      }
    }
    return found;
  }, [progress]);

  return (
    <Layout>
      <motion.div className={styles.page} variants={stagger} initial="initial" animate="animate">
        <motion.div className={styles.greeting} variants={up}>
          <div className={styles.greetingText}>
            <span className={styles.greetingLabel}>{greeting},</span>
            <span className={styles.greetingName}>{name}!</span>
          </div>
          <p className={styles.greetingSub}>Continua sa exersezi si vei fi pregatit pentru examen.</p>
        </motion.div>

        <motion.div className={styles.clockCard} variants={up}>
          <div className={styles.clockGlow} />
          <LiveClock />
        </motion.div>

        <motion.div
          className={styles.progressPanel}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          <div className={styles.progressHeader}>
            <TrendingUp size={13} />
            <span className={styles.sectionLabel}>PROGRES CAPITOLE</span>
          </div>
          <ProgressDashboard profile={profile} xp={xp} />
        </motion.div>

        {STATS.map((s, i) => (
          <motion.div key={s.label} className={`${styles.statCard} ${styles[`statCell${i}`]}`} variants={up}>
            <span className={`${styles.statIcon} ${styles[`iconBg_${s.color}`]}`}>{s.icon}</span>
            <AnimatedCounter value={values[s.key]} className={`${styles.statNum} ${styles[`c_${s.color}`]}`} />
            <span className={styles.statLabel}>{s.label}</span>
          </motion.div>
        ))}

        <motion.div className={styles.navExercises} variants={up}>
          <Link to="/exercitii" className={`${styles.navCard} ${styles.navCard_cyan}`}>
            <div className={`${styles.navIcon} ${styles.navIconCyan}`}><BookOpen size={22} /></div>
            <div className={styles.navBody}>
              <span className={styles.navTitle}>Exercitii</span>
              <span className={styles.navDesc}>Pe capitole · solutii animate</span>
            </div>
            <ArrowRight size={16} className={styles.arrow} />
          </Link>
        </motion.div>

        <motion.div className={styles.navTests} variants={up}>
          <Link to="/teste" className={`${styles.navCard} ${styles.navCard_yellow}`}>
            <div className={`${styles.navIcon} ${styles.navIconYellow}`}><FlaskConical size={22} /></div>
            <div className={styles.navBody}>
              <span className={styles.navTitle}>Test simulat</span>
              <span className={styles.navDesc}>Subiect I+II+III · 2 ore</span>
            </div>
            <ArrowRight size={16} className={styles.arrow} />
          </Link>
        </motion.div>

        <motion.div className={styles.tipCard} variants={up}>
          <div className={styles.tipHeader}>
            <span className={styles.tipIcon}>??</span>
            <span className={styles.tipLabel}>SFAT AL ZILEI</span>
          </div>
          <span className={styles.tipText}>{dailyTip}</span>

          {weakest && (
            <div className={styles.tipHint}>
              <span className={styles.tipHintIcon}>??</span>
              <span className={styles.tipHintText}>
                Exerseaza mai mult la <strong>{weakest.label}</strong>
                {' '}— {progress[weakest.id] || 0}/{weakest.total} exercitii completate.
              </span>
              <Link className={styles.tipAction} to={`/exercitii?capitol=${weakest.id}`}>
                Incepe acum
              </Link>
            </div>
          )}
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default Dashboard;
