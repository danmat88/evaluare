import LoginForm from '../components/auth/LoginForm';
import styles from './Auth.module.css';
const Login = () => (
  <div className={styles.page}><div className={styles.glow}/><div className={styles.grid}/><div className={styles.card}><LoginForm /></div></div>
);
export default Login;
