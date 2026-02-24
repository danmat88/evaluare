import { useState, useEffect } from 'react';
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
  'La ecuații de gradul II, verifică întotdeauna discriminantul Δ = b² - 4ac.',
  'Teorema lui Pitagora: în orice triunghi dreptunghic, a² + b² = c².',
  'Suma unghiurilor unui triunghi este întotdeauna 180°.',
  'Pentru progresii aritmetice: aₙ = a₁ + (n-1)·r',
  'Aria cercului: A = π·r² | Lungimea cercului: L = 2·π·r',
];

const dailyTip = TIPS[new Date().getDay() % TIPS.length];

const STATS = [
  { icon: <Zap size={16} />,    label: 'XP Total', key: 'xp',          color: 'yellow' },
  { icon: '🔥',                  label: 'Serie',    key: 'streak',       color: 'coral'  },
  { icon: <Target size={16} />, label: 'Corecte',  key: 'totalCorrect', color: 'mint'   },
];

/* ── Live clock ── */
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

/* ── Dashboard ── */
const Dashboard = () => {
  const { profile } = useAuth();
  const { xp, streak, totalCorrect } = useExerciseStore();
  const values = { xp, streak, totalCorrect };
  const name = profile?.name?.split(' ')[0] || 'elev';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bună dimineața' : hour < 18 ? 'Bună ziua' : 'Bună seara';

  return (
    <Layout>
      <motion.div className={styles.page} variants={stagger} initial="initial" animate="animate">

        {/* ① Greeting — col 1-2, row 1 */}
        <motion.div className={styles.greeting} variants={up}>
          <div className={styles.greetingText}>
            <span className={styles.greetingLabel}>{greeting},</span>
            <span className={styles.greetingName}>{name}!</span>
          </div>
          <p className={styles.greetingSub}>
            Continuă să exersezi și vei fi pregătit pentru examen.
          </p>
        </motion.div>

        {/* ② Clock widget — col 3, row 1 */}
        <motion.div className={styles.clockCard} variants={up}>
          <div className={styles.clockGlow} />
          <LiveClock />
        </motion.div>

        {/* ③ Progress panel — col 4, rows 1-4 */}
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

        {/* ④ Stat cells — direct grid children */}
        {STATS.map((s, i) => (
          <motion.div key={s.label} className={`${styles.statCard} ${styles[`statCell${i}`]}`} variants={up}>
            <span className={`${styles.statIcon} ${styles[`iconBg_${s.color}`]}`}>{s.icon}</span>
            <AnimatedCounter value={values[s.key]} className={`${styles.statNum} ${styles[`c_${s.color}`]}`} />
            <span className={styles.statLabel}>{s.label}</span>
          </motion.div>
        ))}

        {/* ⑤ Exercises nav — col 1-2, row 3 */}
        <motion.div className={styles.navExercises} variants={up}>
          <Link to="/exercitii" className={`${styles.navCard} ${styles.navCard_cyan}`}>
            <div className={`${styles.navIcon} ${styles.navIconCyan}`}><BookOpen size={22} /></div>
            <div className={styles.navBody}>
              <span className={styles.navTitle}>Exerciții</span>
              <span className={styles.navDesc}>Pe capitole · soluții animate</span>
            </div>
            <ArrowRight size={16} className={styles.arrow} />
          </Link>
        </motion.div>

        {/* ⑥ Tests nav — col 3, row 3 */}
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

        {/* ⑦ Daily tip — col 1-3, row 4 */}
        <motion.div className={styles.tipCard} variants={up}>
          <div className={styles.tipHeader}>
            <span className={styles.tipIcon}>💡</span>
            <span className={styles.tipLabel}>SFAT AL ZILEI</span>
          </div>
          <span className={styles.tipText}>{dailyTip}</span>
        </motion.div>

      </motion.div>
    </Layout>
  );
};

export default Dashboard;
