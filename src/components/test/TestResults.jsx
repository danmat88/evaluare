import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Blackboard from '../blackboard/Blackboard';
import ChalkText from '../blackboard/ChalkText';
import Button from '../ui/Button';
import Particles from '../ui/Particles';
import useTestStore from '../../store/testStore';
import styles from './TestResults.module.css';

const grade = (pct) => {
  if (pct >= 90) return { g: '10', color: 'mint' };
  if (pct >= 80) return { g: '9',  color: 'mint' };
  if (pct >= 70) return { g: '8',  color: 'cyan' };
  if (pct >= 60) return { g: '7',  color: 'yellow' };
  if (pct >= 50) return { g: '6',  color: 'yellow' };
  return { g: '< 5', color: 'coral' };
};

const medal = (pct) => pct >= 80 ? '🥇' : pct >= 60 ? '🥈' : pct >= 40 ? '🥉' : '📝';

const STAT = ({ label, value, color, delay }) => (
  <motion.div
    className={styles.stat}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
  >
    <ChalkText size="3xl" color={color} glow>{value}</ChalkText>
    <ChalkText size="xs" color="muted">{label}</ChalkText>
  </motion.div>
);

const TestResults = () => {
  const results   = useTestStore((s) => s.results);
  const resetTest = useTestStore((s) => s.resetTest);
  const navigate  = useNavigate();

  if (!results) return null;

  const { score, totalPoints, percentage } = results;
  const { g, color } = grade(percentage);
  const m = medal(percentage);
  const great = percentage >= 70;

  return (
    <div className={styles.page}>
      {great && <Particles active originX="50%" originY="30%" />}

      <Blackboard className={styles.board}>
        <motion.div
          className={styles.inner}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <motion.div
            className={styles.medal}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 220 }}
          >
            {m}
          </motion.div>

          <ChalkText color="yellow" size="2xl" glow animated>
            {great ? 'Rezultat excelent!' : 'Test finalizat!'}
          </ChalkText>

          <div className={styles.stats}>
            <STAT label="Punctaj" value={`${score}/${totalPoints}`} color="white" delay={0.3} />
            <div className={styles.divider} />
            <STAT label="Notă estimată" value={g} color={color} delay={0.4} />
            <div className={styles.divider} />
            <STAT label="Corectitudine" value={`${percentage}%`} color="cyan" delay={0.5} />
          </div>

          {/* Progress bar */}
          <div className={styles.track}>
            <motion.div
              className={styles.fill}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ delay: 0.55, duration: 1.2, ease: 'easeOut' }}
            />
          </div>

          <div className={styles.actions}>
            <Button variant="ghost" size="sm" onClick={() => { resetTest(); navigate('/teste'); }}>↺ Alt test</Button>
            <Button variant="primary" size="md" onClick={() => { resetTest(); navigate('/dashboard'); }}>Înapoi acasă →</Button>
          </div>
        </motion.div>
      </Blackboard>
    </div>
  );
};

export default TestResults;
