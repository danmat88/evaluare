import { useEffect, useState } from 'react';
import styles from './Particles.module.css';

const COLORS = ['#00e5ff', '#ffe500', '#00ff9d', '#ff4d6d', '#b388ff', '#ff8c00'];
const COUNT  = 18;

const rand = (min, max) => Math.random() * (max - min) + min;

const Particles = ({ active, originX = '50%', originY = '50%' }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!active) { setParticles([]); return; }

    const ps = Array.from({ length: COUNT }, (_, i) => ({
      id: i,
      color: COLORS[i % COLORS.length],
      size:  rand(5, 10),
      tx:    `${rand(-120, 120)}px`,
      ty:    `${rand(-130, -20)}px`,
      duration: rand(0.5, 0.9),
      delay: rand(0, 0.12),
      shape: i % 3 === 0 ? 'star' : i % 3 === 1 ? 'circle' : 'rect',
    }));

    setParticles(ps);
    const t = setTimeout(() => setParticles([]), 1200);
    return () => clearTimeout(t);
  }, [active]);

  if (!particles.length) return null;

  return (
    <div className={styles.container} style={{ left: originX, top: originY }}>
      {particles.map((p) => (
        <span
          key={p.id}
          className={`${styles.particle} ${styles[p.shape]}`}
          style={{
            '--tx': p.tx,
            '--ty': p.ty,
            '--color': p.color,
            width:  p.size,
            height: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay:    `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default Particles;
