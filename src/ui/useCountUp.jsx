import { useEffect, useRef, useState } from "react";

// number that rolls from its old value to the new one (used for the big temperature)
export const useCountUp = (target, ms = 900) => {
  const [v, setV] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf;
    const tick = (t) => {
      const p = Math.min((t - start) / ms, 1);
      const val = a + (target - a) * (1 - Math.pow(1 - p, 3)); // ease-out
      from.current = val;
      setV(Math.round(val));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);

  return v;
};