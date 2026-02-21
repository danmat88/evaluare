import RegisterForm from '../components/auth/RegisterForm';
import styles from './Auth.module.css';

const BULLETS = [
  'Exerciții interactive pe toate capitolele EN',
  'Teste simulate · 2 ore · 100 puncte',
  'Sistem XP, niveluri și realizări',
];

const Register = () => (
  <div className={styles.page}>
    {/* Left branding panel */}
    <div className={styles.left}>
      <div className={styles.leftOrb1} />
      <div className={styles.leftOrb2} />
      <div className={styles.leftOrb3} />
      <div className={styles.leftGrid} />
      <div className={styles.leftContent}>
        <div className={styles.brand}>
          <span className={styles.sigma}>∑</span>
          <span className={styles.brandName}>EN·Math</span>
        </div>
        <p className={styles.tagline}>Pregătire completă pentru Evaluarea Națională</p>
        <div className={styles.bullets}>
          {BULLETS.map((b) => (
            <div key={b} className={styles.bullet}>
              <span className={styles.bulletDot} />
              <span>{b}</span>
            </div>
          ))}
        </div>
        <span className={styles.leftFooter}>CLASA A VIII-A · MATEMATICĂ</span>
      </div>
    </div>

    {/* Right form panel */}
    <div className={styles.right}>
      <div className={styles.grid} />
      <div className={styles.formWrap}>
        <RegisterForm />
      </div>
    </div>
  </div>
);

export default Register;
