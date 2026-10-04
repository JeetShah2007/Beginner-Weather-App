import { useState } from "react";
import { FiStar, FiWind, FiDroplet, FiSun, FiSunrise, FiSunset, FiCloud, FiActivity } from "react-icons/fi";
import { LuShirt, LuUmbrella, LuSun, LuSunMedium, LuShieldAlert, LuFootprints, LuWashingMachine } from "react-icons/lu";
import WeatherIcon from "./WeatherIcon";
import { Tilt } from "./fx";
import { useCountUp } from "./useCountUp";
import { toUnit, toWind, compass, hourLabel, clock, describe, aqiInfo } from "../lib/weather";

// insight icon names (set in lib/weather.js) -> icon components
const TIP_ICONS = { shirt: LuShirt, umbrella: LuUmbrella, sun: LuSun, uv: LuSunMedium, air: LuShieldAlert, walk: LuFootprints, laundry: LuWashingMachine };

// big top card: city, temp, condition, star to save. tilts with the mouse
export const Hero = ({ place, w, unit, saved, onSave }) => {
  // temperature rolls up to its value instead of just appearing
  const temp = useCountUp(toUnit(w.now.temp, unit));
  return (
    <Tilt>
      <section className="glass rounded-[2rem] p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <h2 className="text-2xl font-bold">{place.name}</h2>
            <button onClick={onSave} aria-label="Save city" className="p-1.5 rounded-full hover:bg-white/20">
              <FiStar className={`transition-all duration-500 ${saved ? "fill-yellow-300 text-yellow-300 scale-125 rotate-[72deg]" : ""}`} />
            </button>
          </div>
          <p className="opacity-70 text-sm">{[place.admin, place.country].filter(Boolean).join(", ")}</p>
          <p className="text-8xl font-extralight tracking-tighter mt-3">{temp}°</p>
          <p className="text-lg font-medium">{describe(w.now.code)}</p>
          <p className="opacity-70 text-sm">
            Feels like {toUnit(w.now.feels, unit)}° · H {toUnit(w.daily[0].max, unit)}° L {toUnit(w.daily[0].min, unit)}°
          </p>
        </div>
        <WeatherIcon code={w.now.code} day={w.now.day} size={180} className="float drop-shadow-2xl" />
      </section>
    </Tilt>
  );
};

// 24h strip. tap an hour to see its details. the line is plain SVG, no chart library
export const Hourly = ({ hours, unit }) => {
  const [sel, setSel] = useState(0); // which hour is selected
  const h0 = hours[sel];
  const temps = hours.map((h) => h.temp);
  const min = Math.min(...temps), max = Math.max(...temps);
  // each hour is a 64px column. x = column centre, y = temp scaled to the svg height
  const W = hours.length * 64, H = 70;
  const pts = hours.map((h, i) => [i * 64 + 32, H - ((h.temp - min) / Math.max(max - min, 1)) * (H - 16) - 8]);
  const line = pts.map((p) => p.join(",")).join(" ");
  return (
    <section className="glass rounded-3xl p-5">
      <div className="flex items-center justify-between mb-3 gap-3">
        <h3 className="text-xs uppercase tracking-widest opacity-70">Next 24 hours</h3>
        {/* key restarts the pop animation every time the selection changes */}
        <p key={sel} className="pop text-sm font-semibold text-right">
          {sel === 0 ? "Now" : hourLabel(h0.time)} · {describe(h0.code)} · {toUnit(h0.temp, unit)}° · {h0.rain}% rain
        </p>
      </div>
      <div className="overflow-x-auto no-scrollbar">
        <div style={{ width: W }}>
          <div className="flex">
            {hours.map((h, i) => (
              <button key={h.time} onClick={() => setSel(i)}
                className={`w-16 flex flex-col items-center gap-1 text-sm rounded-2xl py-2 hover:bg-white/10 ${sel === i ? "bg-white/20 -translate-y-1" : ""}`}>
                <span className="opacity-70">{i === 0 ? "Now" : hourLabel(h.time)}</span>
                <WeatherIcon code={h.code} day={h.day} size={30} />
                <span className="text-xs text-sky-200 h-4">{h.rain >= 20 ? `${h.rain}%` : ""}</span>
              </button>
            ))}
          </div>
          <svg width={W} height={H} className="my-1">
            <polyline className="draw" pathLength="1" points={line} fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity=".85" />
            {pts.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={sel === i ? 6 : 3.5} fill={sel === i ? "#fde68a" : "white"} style={{ transition: "r .25s" }} />
            ))}
          </svg>
          <div className="flex">
            {hours.map((h, i) => (
              <span key={h.time} className={`w-16 text-center font-semibold ${sel === i ? "text-amber-200" : ""}`}>{toUnit(h.temp, unit)}°</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// 7-day list. click a day to expand it. bars show each day's range against the week's min/max
export const Daily = ({ days, unit }) => {
  const [open, setOpen] = useState(null); // index of the expanded day
  const lo = Math.min(...days.map((d) => d.min)), hi = Math.max(...days.map((d) => d.max));
  return (
    <section className="glass rounded-3xl p-5">
      <h3 className="text-xs uppercase tracking-widest opacity-70 mb-2">7-day forecast</h3>
      {days.map((d, i) => {
        // bar offset and width as % of the weekly range
        const left = ((d.min - lo) / (hi - lo || 1)) * 100;
        const width = ((d.max - d.min) / (hi - lo || 1)) * 100;
        return (
          <div key={d.date} className="border-t border-white/10 first:border-0">
            <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center gap-3 py-2 rounded-xl hover:bg-white/10 px-1">
              <span className="w-12 font-semibold text-left">{i === 0 ? "Today" : new Date(d.date + "T00:00").toLocaleDateString([], { weekday: "short" })}</span>
              <WeatherIcon code={d.code} size={30} />
              <span className="w-9 text-xs text-sky-200">{d.rain >= 20 ? `${d.rain}%` : ""}</span>
              <span className="w-8 text-right opacity-70">{toUnit(d.min, unit)}°</span>
              <div className="flex-1 h-1.5 rounded-full bg-white/15 relative">
                <div className="grow absolute h-full rounded-full bg-gradient-to-r from-sky-300 to-amber-300" style={{ left: `${left}%`, width: `${Math.max(width, 6)}%`, animationDelay: `${i * 80}ms` }} />
              </div>
              <span className="w-8 font-semibold">{toUnit(d.max, unit)}°</span>
            </button>
            {/* expands smoothly: grid row goes 0fr -> 1fr */}
            <div className={`grid transition-all duration-300 ${open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
              <div className="overflow-hidden">
                <div className="flex justify-between text-xs opacity-80 pb-2 px-2">
                  <span className="flex items-center gap-1"><FiSunrise /> {clock(d.sunrise)}</span>
                  <span className="flex items-center gap-1"><FiSunset /> {clock(d.sunset)}</span>
                  <span className="flex items-center gap-1"><FiSun /> UV {Math.round(d.uv)}</span>
                  <span className="flex items-center gap-1"><FiDroplet /> {d.rain}%</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
};

// sun moving along an arc from sunrise to sunset
export const SunArc = ({ w }) => {
  const d = w.daily[0];
  const t = (s) => new Date(s).getTime();
  // 0 = sunrise, 1 = sunset, clamped so it parks at the ends at night
  const p = Math.min(Math.max((t(w.now.time) - t(d.sunrise)) / (t(d.sunset) - t(d.sunrise)), 0), 1);
  const a = Math.PI * (1 - p);
  const x = 150 + 120 * Math.cos(a), y = 140 - 120 * Math.sin(a);
  return (
    <section className="glass rounded-3xl p-5">
      <h3 className="text-xs uppercase tracking-widest opacity-70 mb-2">Sun position</h3>
      <svg viewBox="0 0 300 160" className="w-full">
        <path d="M30 140 A120 120 0 0 1 270 140" fill="none" stroke="white" strokeOpacity=".25" strokeWidth="2" strokeDasharray="4 6" />
        <path d="M30 140 A120 120 0 0 1 270 140" pathLength="1" fill="none" stroke="#fde68a" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${p} 1`} />
        <circle className="sun-glow" cx={x} cy={y} r="10" fill="#fde68a" />
      </svg>
      <div className="flex justify-between text-sm opacity-80">
        <span className="flex items-center gap-1"><FiSunrise /> {clock(d.sunrise)}</span>
        <span>{p > 0 && p < 1 ? "Sun is up" : "Sun is down"}</span>
        <span className="flex items-center gap-1"><FiSunset /> {clock(d.sunset)}</span>
      </div>
    </section>
  );
};

// one small tile, reused for every stat below
const Stat = ({ icon: Icon, label, value, sub, color }) => (
  <div className="glass card rounded-3xl p-5">
    <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-70"><Icon /> {label}</div>
    <p className="text-2xl font-semibold mt-2" style={color ? { color } : undefined}>{value}</p>
    {sub && <p className="text-sm opacity-70">{sub}</p>}
  </div>
);

// grid of tiles. AQI tile just disappears if that API failed
export const Stats = ({ w, unit }) => {
  const aq = aqiInfo(w.aqi), d = w.daily[0];
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {aq && <Stat icon={FiActivity} label="Air quality" value={w.aqi} sub={aq.label} color={aq.color} />}
      <Stat icon={FiSun} label="UV index" value={Math.round(d.uv)} sub={d.uv >= 8 ? "Very high" : d.uv >= 6 ? "High" : d.uv >= 3 ? "Moderate" : "Low"} />
      <Stat icon={FiWind} label="Wind" value={toWind(w.now.wind, unit)} sub={`From ${compass(w.now.windDir)}`} />
      <Stat icon={FiDroplet} label="Humidity" value={`${w.now.humidity}%`} />
      <Stat icon={FiCloud} label="Cloud cover" value={`${w.now.cloud}%`} />
      <Stat icon={FiActivity} label="Pressure" value={`${Math.round(w.now.pressure)} hPa`} />
      <Stat icon={FiSunrise} label="Sunrise" value={clock(d.sunrise)} />
      <Stat icon={FiSunset} label="Sunset" value={clock(d.sunset)} />
    </div>
  );
};

// tips come from buildInsights() in lib/weather.js
export const Insights = ({ items }) => (
  <section className="glass rounded-3xl p-5">
    <h3 className="text-xs uppercase tracking-widest opacity-70 mb-3">Today, in plain English</h3>
    <div className="grid sm:grid-cols-2 gap-3">
      {items.map((it) => {
        const Icon = TIP_ICONS[it.icon] || LuSun;
        return (
          <div key={it.title} className="card flex gap-3 items-start rounded-2xl bg-white/10 p-4">
            <span className="grid place-items-center w-10 h-10 shrink-0 rounded-xl bg-white/15"><Icon size={20} /></span>
            <div><p className="font-semibold text-sm">{it.title}</p><p className="text-sm opacity-80">{it.text}</p></div>
          </div>
        );
      })}
    </div>
  </section>
);