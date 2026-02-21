import { useEffect, useRef, useState } from 'react';

const AnimatedCounter = ({ value = 0, duration = 900, className }) => {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const rafRef   = useRef(null);
  const fromRef  = useRef(0);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = null;

    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const pct = Math.min((ts - startRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - pct, 3);
      setDisplay(Math.round(fromRef.current + (value - fromRef.current) * ease));
      if (pct < 1) rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span className={className}>{display}</span>;
};

export default AnimatedCounter;
