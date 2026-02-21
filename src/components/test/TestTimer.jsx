import useTestStore from '../../store/testStore';
import useTimer from '../../hooks/useTimer';
import styles from './TestTimer.module.css';

const pad = (n) => String(n).padStart(2, '0');

const TestTimer = () => {
  const timeLeft = useTestStore((s) => s.timeLeft);
  const started  = useTestStore((s) => s.started);
  const finished = useTestStore((s) => s.finished);

  useTimer(started && !finished);

  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;

  const urgent  = timeLeft <= 300;
  const warning = timeLeft <= 900;

  return (
    <div className={`${styles.timer} ${urgent ? styles.urgent : warning ? styles.warning : ''}`}>
      <span className={styles.display}>{pad(h)}:{pad(m)}:{pad(s)}</span>
    </div>
  );
};

export default TestTimer;
