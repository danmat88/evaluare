import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, CircleGauge, ClipboardCheck, Clock3, Home, RotateCcw, Target, Trophy } from 'lucide-react';
import Blackboard from '../blackboard/Blackboard';
import ChalkText from '../blackboard/ChalkText';
import Button from '../ui/Button';
import Particles from '../ui/Particles';
import useTestStore from '../../store/testStore';
import styles from './TestResults.module.css';

const grade = (pct) => {
  if (pct >= 90) return { g: '10', color: 'mint' };
  if (pct >= 80) return { g: '9', color: 'mint' };
  if (pct >= 70) return { g: '8', color: 'cyan' };
  if (pct >= 60) return { g: '7', color: 'yellow' };
  if (pct >= 50) return { g: '6', color: 'yellow' };
  return { g: '< 5', color: 'coral' };
};

const badge = (pct) => {
  if (pct >= 80) return { Icon: Trophy, cls: styles.medalTop };
  if (pct >= 60) return { Icon: Award, cls: styles.medalMid };
  if (pct >= 40) return { Icon: Target, cls: styles.medalLow };
  return { Icon: ClipboardCheck, cls: styles.medalBase };
};

const formatDuration = (seconds) => {
  const totalSeconds = Math.max(0, Number(seconds) || 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
  return `${minutes} min`;
};

const buildNextStep = ({ percentage, unansweredCount, autoSubmitted }) => {
  if (autoSubmitted && unansweredCount > 0) {
    return 'Reia un test si lasa ultimele 10 minute doar pentru verificarea intrebarilor ramase.';
  }
  if (percentage >= 80) {
    return 'Poti urca nivelul: continua cu o varianta noua sau revino la capitolul cel mai slab pentru finetisare.';
  }
  if (percentage >= 60) {
    return 'Baza este buna. Revino pe exercitii pentru capitolele in care pierzi timp sau puncte.';
  }
  return 'Consolideaza materia pe capitole, apoi incearca din nou un test complet cu ritm mai calm.';
};

const STAT = ({ label, value, color, delay, icon }) => (
  <motion.div
    className={styles.stat}
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.35 }}
  >
    <div className={styles.statHead}>
      <span className={styles.statIcon}>{icon}</span>
      <ChalkText size="3xl" color={color} glow>{value}</ChalkText>
    </div>
    <ChalkText size="xs" color="muted">{label}</ChalkText>
  </motion.div>
);

const TestResults = () => {
  const results = useTestStore((state) => state.results);
  const resetTest = useTestStore((state) => state.resetTest);
  const navigate = useNavigate();

  if (!results) return null;

  const {
    score,
    totalPoints,
    percentage,
    answeredCount,
    totalQuestions,
    unansweredCount,
    timeSpent,
    autoSubmitted,
    subjectSummary = [],
  } = results;

  const { g, color } = grade(percentage);
  const badgeInfo = badge(percentage);
  const BadgeIcon = badgeInfo.Icon;
  const great = percentage >= 70;
  const nextStep = buildNextStep(results);

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
            className={`${styles.medal} ${badgeInfo.cls}`}
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 220 }}
          >
            <BadgeIcon size={34} strokeWidth={2.2} />
          </motion.div>

          <div className={styles.heading}>
            <ChalkText color="yellow" size="2xl" glow animated>
              {great ? 'Rezultat excelent!' : 'Test finalizat!'}
            </ChalkText>
            <span className={styles.subhead}>
              {autoSubmitted ? 'Timpul s-a incheiat, iar testul a fost predat automat.' : 'Rezultatul a fost salvat in profilul tau.'}
            </span>
          </div>

          <div className={styles.stats}>
            <STAT
              label="Punctaj"
              value={`${score}/${totalPoints}`}
              color="white"
              delay={0.3}
              icon={<ClipboardCheck size={14} />}
            />
            <STAT
              label="Nota estimata"
              value={g}
              color={color}
              delay={0.4}
              icon={<Award size={14} />}
            />
            <STAT
              label="Corectitudine"
              value={`${percentage}%`}
              color="cyan"
              delay={0.5}
              icon={<CircleGauge size={14} />}
            />
          </div>

          <div className={styles.track}>
            <motion.div
              className={styles.fill}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ delay: 0.55, duration: 1.2, ease: 'easeOut' }}
            />
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaChip}><Clock3 size={13} /> {formatDuration(timeSpent)}</span>
            <span className={styles.metaChip}><ClipboardCheck size={13} /> {answeredCount}/{totalQuestions} raspunsuri completate</span>
            <span className={styles.metaChip}><Target size={13} /> {unansweredCount} ramase goale</span>
          </div>

          {subjectSummary.length > 0 && (
            <div className={styles.subjectList}>
              {subjectSummary.map((subject) => (
                <div key={subject.id} className={styles.subjectRow}>
                  <span className={styles.subjectLabel}>{subject.label}</span>
                  <span className={styles.subjectMeta}>
                    {subject.answered}/{subject.total} raspunsuri
                  </span>
                  <span className={styles.subjectScore}>
                    {subject.score}/{subject.totalPoints}p
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className={styles.coachNote}>
            <span className={styles.coachTitle}>Urmatorul pas recomandat</span>
            <span className={styles.coachText}>{nextStep}</span>
          </div>

          <div className={styles.actions}>
            <Button variant="ghost" size="sm" icon={<RotateCcw size={13} />} onClick={() => { resetTest(); navigate('/teste'); }}>
              Alt test
            </Button>
            <Button variant="outline" size="sm" icon={<Target size={13} />} onClick={() => { resetTest(); navigate('/exercitii'); }}>
              Revino la exercitii
            </Button>
            <Button variant="primary" size="md" icon={<Home size={14} />} onClick={() => { resetTest(); navigate('/dashboard'); }}>
              Inapoi la dashboard
            </Button>
          </div>
        </motion.div>
      </Blackboard>
    </div>
  );
};

export default TestResults;
