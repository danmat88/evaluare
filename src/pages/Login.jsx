import { Sigma } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import styles from './Auth.module.css';

const BULLETS = [
  'Exercitii interactive pe toate capitolele EN',
  'Teste simulate - 2 ore - 100 puncte',
  'Sistem XP, niveluri si realizari',
];

const Login = () => (
  <div className={styles.page}>
    <div className={styles.left}>
      <div className={styles.leftOrb1} />
      <div className={styles.leftOrb2} />
      <div className={styles.leftOrb3} />
      <div className={styles.leftGrid} />
      <div className={styles.leftContent}>
        <div className={styles.brand}>
          <span className={styles.sigma}><Sigma size={40} /></span>
          <span className={styles.brandName}>EN.Math</span>
        </div>
        <p className={styles.tagline}>Pregatire completa pentru Evaluarea Nationala</p>
        <div className={styles.bullets}>
          {BULLETS.map((bullet) => (
            <div key={bullet} className={styles.bullet}>
              <span className={styles.bulletDot} />
              <span>{bullet}</span>
            </div>
          ))}
        </div>
        <span className={styles.leftFooter}>CLASA A VIII-A - MATEMATICA</span>
      </div>
    </div>

    <div className={styles.right}>
      <div className={styles.grid} />
      <div className={styles.formWrap}>
        <LoginForm />
      </div>
    </div>
  </div>
);

export default Login;
