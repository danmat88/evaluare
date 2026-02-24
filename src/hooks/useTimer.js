import { useEffect, useRef } from 'react';
import useTestStore from '../store/testStore';

const useTimer = (active) => {
  const tickTimer = useTestStore((s) => s.tickTimer);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (active) {
      intervalRef.current = setInterval(tickTimer, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [active, tickTimer]);
};

export default useTimer;
