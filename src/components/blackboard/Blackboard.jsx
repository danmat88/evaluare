import clsx from 'clsx';
import styles from './Blackboard.module.css';

const Blackboard = ({ children, className, variant = 'default', flash }) => (
  <div className={clsx(styles.frame, styles[variant], flash === 'correct' && styles.flashCorrect, flash === 'wrong' && styles.flashWrong, className)}>
    <div className={styles.surface}>{children}</div>
  </div>
);

export default Blackboard;
