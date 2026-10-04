import { useEffect, useRef } from "react";
import { isWet } from "../lib/weather";

// which animation to run for the current weather
const modeFor = (code, day) => {
  if (isWet(code)) return "rain";
  if (code >= 71 && code <= 86) return "snow";
  if (!day) return "stars";
  return "dust";
};

// full-screen canvas behind the app: rain, snow, twinkling stars or floating dust
const Particles = ({ code, day }) => {
  const ref = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    const ctx = cv.getContext("2d");
    const mode = modeFor(code, day);
    const mouse = { x: -999, y: -999 };
    let W, H, raf;

    const size = () => { W = cv.width = window.innerWidth; H = cv.height = window.innerHeight; };
    size();

    const count = mode === "rain" ? 140 : mode === "snow" ? 90 : 60;
    const ps = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 2 + 1, v: Math.random() * 0.8 + 0.4, p: Math.random() * 6.28,
    }));

    const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener("resize", size);
    window.addEventListener("mousemove", onMove);

    const draw = (t) => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = ctx.strokeStyle = "#fff";
      for (const p of ps) {
        // particles get nudged away from the cursor
        const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
        if (d > 0 && d < 120) p.x += (dx / d) * (120 - d) * 0.04;

        if (mode === "rain") {
          p.y += p.v * 14; p.x += 1.5;
          ctx.globalAlpha = 0.45; ctx.lineWidth = p.r * 0.5;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - 2, p.y - 16 * p.v); ctx.stroke();
        } else if (mode === "snow") {
          p.y += p.v; p.x += Math.sin(t / 900 + p.p) * 0.6;
          ctx.globalAlpha = 0.8; ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 1, 0, 6.28); ctx.fill();
        } else if (mode === "stars") {
          ctx.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(t / 1000 + p.p));
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.7, 0, 6.28); ctx.fill();
        } else {
          p.y -= p.v * 0.3; p.x += Math.sin(t / 1500 + p.p) * 0.4;
          ctx.globalAlpha = 0.22; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 2.5, 0, 6.28); ctx.fill();
        }

        // wrap around the screen edges
        if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
        if (p.y < -20) p.y = H + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.x < -20) p.x = W + 20;
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("mousemove", onMove);
    };
  }, [code, day]);

  return <canvas ref={ref} className="fixed inset-0 z-0 pointer-events-none" />;
};

export default Particles;