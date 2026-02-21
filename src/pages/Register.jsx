import RegisterForm from '../components/auth/RegisterForm';
import styles from './Auth.module.css';
const Register = () => (
  <div className={styles.page}><div className={styles.glow}/><div className={styles.grid}/><div className={styles.card}><RegisterForm /></div></div>
);
export default Register;
