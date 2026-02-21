import clsx from 'clsx';
import styles from './Button.module.css';

const Button = ({ children, variant = 'primary', size = 'md', fullWidth = false, loading = false, disabled = false, icon, className, ...props }) => (
  <button
    className={clsx(styles.btn, styles[variant], styles[`sz_${size}`], fullWidth && styles.fullWidth, loading && styles.loading, className)}
    disabled={disabled || loading}
    {...props}
  >
    {loading ? <span className={styles.spinner} /> : <>{icon && <span className={styles.icon}>{icon}</span>}{children}</>}
  </button>
);

export default Button;
