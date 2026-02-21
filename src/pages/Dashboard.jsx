import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, FlaskConical, ArrowRight, Zap, Target } from 'lucide-react';
import ChalkText from '../components/blackboard/ChalkText';
import ProgressDashboard from '../components/progress/ProgressDashboard';
import AnimatedCounter from '../components/ui/AnimatedCounter';
import Layout from '../components/layout/Layout';
import useAuthStore from '../store/authStore';
import useExerciseStore from '../store/exerciseStore';
import styles from './Dashboard.module.css';

const stagger = { animate: { transition: { staggerChildren: 0.06 } } };
const up = { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const TIPS = [
  'La ecuații de gradul II, verifică întotdeauna discriminantul Δ = b² - 4ac.',
  'Teorema lui Pitagora: în orice triunghi dreptunghic, a² + b² = c².',
  'Suma unghiurilor unui triunghi este întotdeauna 180°.',
  'Pentru progresii aritmetice: aₙ = a₁ + (n-1)·r',
  'Aria cercului: A = π·r² | Lungimea cercului: L = 2·π·r',
];

const dailyTip = TIPS[new Date().getDay() % TIPS.length];

const Dashboard = () => {
  const { profile } = useAuthStore();
  const { xp, streak, totalCorrect } = useExerciseStore();
  const name = profile?.name?.split(' ')[0] || 'elev';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bună dimineața' : hour < 18 ? 'Bună ziua' : 'Bună seara';

  return (
    <Layout>
      <div className={styles.page}>
        {/* Left column */}
        <motion.div className={styles.left} variants={stagger} initial="initial" animate="animate">

          <motion.div className={styles.greeting} variants={up}>
            <ChalkText size="xs" color="muted">{greeting.toUpperCase()},</ChalkText>
            <ChalkText size="2xl" color="yellow" glow>{name}!</ChalkText>
          </motion.div>

          {/* Stats row */}
          <motion.div className={styles.statsRow} variants={stagger}>
            {[
              { icon: <Zap size={16}/>, label: 'XP Total',   value: xp,          color: 'yellow' },
              { icon: '🔥',            label: 'Serie',        value: streak,       color: 'coral' },
              { icon: <Target size={16}/>,label:'Corecte',   value: totalCorrect, color: 'mint' },
            ].map((s, i) => (
              <motion.div key={s.label} className={styles.statCard} variants={up}>
                <span className={styles.statIcon}>{s.icon}</span>
                <AnimatedCounter value={s.value} className={`${styles.statNum} ${styles[`c_${s.color}`]}`} />
                <ChalkText size="xs" color="muted">{s.label}</ChalkText>
              </motion.div>
            ))}
          </motion.div>

          {/* Navigation cards */}
          <motion.div className={styles.navCards} variants={stagger}>
            <motion.div variants={up}>
              <Link to="/exercitii" className={styles.navCard}>
                <div className={`${styles.navIcon} ${styles.navIconCyan}`}><BookOpen size={22} /></div>
                <div className={styles.navBody}>
                  <ChalkText size="md" color="white">Exerciții</ChalkText>
                  <ChalkText size="xs" color="muted">Pe capitole · soluții animate</ChalkText>
                </div>
                <ArrowRight size={16} className={styles.arrow} />
              </Link>
            </motion.div>

            <motion.div variants={up}>
              <Link to="/teste" className={styles.navCard}>
                <div className={`${styles.navIcon} ${styles.navIconYellow}`}><FlaskConical size={22} /></div>
                <div className={styles.navBody}>
                  <ChalkText size="md" color="white">Test simulat</ChalkText>
                  <ChalkText size="xs" color="muted">Subiect I+II+III · 2 ore</ChalkText>
                </div>
                <ArrowRight size={16} className={styles.arrow} />
              </Link>
            </motion.div>
          </motion.div>

          {/* Daily tip */}
          <motion.div className={styles.tip} variants={up}>
            <div className={styles.tipHeader}>
              <span className={styles.tipIcon}>💡</span>
              <ChalkText size="xs" color="yellow">SFAT AL ZILEI</ChalkText>
            </div>
            <ChalkText size="sm" color="muted">{dailyTip}</ChalkText>
          </motion.div>
        </motion.div>

        {/* Right column - progress */}
        <motion.div
          className={styles.right}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
        >
          <div className={styles.progressHeader}>
            <ChalkText size="xs" color="muted">PROGRES PE CAPITOLE</ChalkText>
          </div>
          <ProgressDashboard profile={profile} xp={xp} />
        </motion.div>
      </div>
    </Layout>
  );
};

export default Dashboard;
