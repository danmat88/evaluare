import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import styles from './Home.module.css';

const FEATURES = [
  { icon: '📐', title: 'Toate capitolele', sub: 'Algebră + Geometrie EN' },
  { icon: '⏱',  title: 'Teste simulate',  sub: '2 ore · 100 puncte' },
  { icon: '🪄',  title: 'Soluții animate', sub: 'Pas cu pas pe tablă' },
  { icon: '🏆',  title: 'Sistem XP',       sub: 'Niveluri + realizări' },
];

const stagger = { animate: { transition: { staggerChildren: 0.07 } } };
const up = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0, transition: { duration: 0.38 } } };

const Home = () => (
  <div className={styles.page}>
    {/* Animated background grid */}
    <div className={styles.grid} />
    <div className={styles.glow1} />
    <div className={styles.glow2} />
    <div className={styles.glow3} />

    <motion.div className={styles.center} variants={stagger} initial="initial" animate="animate">
      <motion.div className={styles.badge} variants={up}>
        <span className={styles.badgeDot} />
        Pregătire completă pentru Evaluarea Națională 2025
      </motion.div>

      <motion.div className={styles.sigma} variants={up}>∑</motion.div>

      <motion.h1 className={styles.headline} variants={up}>
        EN Matematică
        <span className={styles.sub}>Clasa a VIII-a · Interactiv</span>
      </motion.h1>

      <motion.p className={styles.tagline} variants={up}>
        Exersează exerciții interactive, descoperă rezolvări animate pas cu pas
        și testează-te cu simulări complete de examen.
      </motion.p>

      <motion.div className={styles.ctas} variants={up}>
        <Link to="/register"><Button variant="primary" size="lg">Începe gratuit →</Button></Link>
        <Link to="/login"><Button variant="ghost" size="lg">Am deja cont</Button></Link>
      </motion.div>

      <motion.div className={styles.features} variants={stagger}>
        {FEATURES.map((f) => (
          <motion.div key={f.title} className={styles.feat} variants={up}>
            <span className={styles.featIcon}>{f.icon}</span>
            <span className={styles.featTitle}>{f.title}</span>
            <span className={styles.featSub}>{f.sub}</span>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  </div>
);

export default Home;
