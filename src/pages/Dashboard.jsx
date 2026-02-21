import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, FlaskConical, ArrowRight, Zap, Target, TrendingUp } from 'lucide-react';
import ChalkText from '../components/blackboard/ChalkText';
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

        {/* ① Greeting — col 1-3, row 1 */}
        <motion.div className={styles.greeting} variants={up}>
          <div className={styles.greetingText}>
            <ChalkText size="xs" color="muted">{greeting.toUpperCase()},</ChalkText>
            <ChalkText size="2xl" color="yellow" glow>{name}!</ChalkText>
          </div>
          <span className={styles.datePill}>
            {new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </motion.div>

        {/* ② Progress panel — col 4, rows 1-4 */}
        <motion.div
          className={styles.progressPanel}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          <div className={styles.progressHeader}>
            <TrendingUp size={13} />
            <ChalkText size="xs" color="muted">PROGRES CAPITOLE</ChalkText>
          </div>
          <ProgressDashboard profile={profile} xp={xp} />
        </motion.div>

        {/* ③ Stat cells — each is a direct grid child */}
        {STATS.map((s, i) => (
          <motion.div key={s.label} className={`${styles.statCard} ${styles[`statCell${i}`]}`} variants={up}>
            <span className={`${styles.statIcon} ${styles[`iconBg_${s.color}`]}`}>{s.icon}</span>
            <AnimatedCounter value={values[s.key]} className={`${styles.statNum} ${styles[`c_${s.color}`]}`} />
            <ChalkText size="xs" color="muted">{s.label}</ChalkText>
          </motion.div>
        ))}

        {/* ④ Exercises nav — col 1-2, row 3 */}
        <motion.div className={styles.navExercises} variants={up}>
          <Link to="/exercitii" className={`${styles.navCard} ${styles.navCard_cyan}`}>
            <div className={`${styles.navIcon} ${styles.navIconCyan}`}><BookOpen size={22} /></div>
            <div className={styles.navBody}>
              <ChalkText size="md" color="white">Exerciții</ChalkText>
              <ChalkText size="xs" color="muted">Pe capitole · soluții animate</ChalkText>
            </div>
            <ArrowRight size={16} className={styles.arrow} />
          </Link>
        </motion.div>

        {/* ⑤ Tests nav — col 3, row 3 */}
        <motion.div className={styles.navTests} variants={up}>
          <Link to="/teste" className={`${styles.navCard} ${styles.navCard_yellow}`}>
            <div className={`${styles.navIcon} ${styles.navIconYellow}`}><FlaskConical size={22} /></div>
            <div className={styles.navBody}>
              <ChalkText size="md" color="white">Test simulat</ChalkText>
              <ChalkText size="xs" color="muted">Subiect I+II+III · 2 ore</ChalkText>
            </div>
            <ArrowRight size={16} className={styles.arrow} />
          </Link>
        </motion.div>

        {/* ⑥ Daily tip — col 1-3, row 4 */}
        <motion.div className={styles.tipCard} variants={up}>
          <div className={styles.tipHeader}>
            <span className={styles.tipIcon}>💡</span>
            <ChalkText size="xs" color="yellow">SFAT AL ZILEI</ChalkText>
          </div>
          <ChalkText size="sm" color="muted">{dailyTip}</ChalkText>
        </motion.div>

      </motion.div>
    </Layout>
  );
};

export default Dashboard;
