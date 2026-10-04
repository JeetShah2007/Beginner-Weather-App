import { FiRefreshCw } from "react-icons/fi";
import { useCallback, useEffect, useMemo, useState } from "react";
import SearchBar from "./ui/SearchBar";
import Particles from "./ui/Particles";
import { Reveal } from "./ui/fx";
import { Hero, Hourly, Daily, SunArc, Stats, Insights } from "./ui/Panels";
import { fetchWeather, reverseName, sceneFor, buildInsights } from "./lib/weather";

// safe localStorage read, falls back if empty or broken
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
// what you see on the very first visit
const DEFAULT = { name: "Ahmedabad", country: "India", admin: "Gujarat", latitude: 23.0225, longitude: 72.5714 };

const App = () => {
  // state: current city, weather data, °C/°F, starred cities, request status
  const [place, setPlace] = useState(() => load("skye:last", DEFAULT));
  const [w, setW] = useState(null);
  const [unit, setUnit] = useState(() => load("skye:unit", "C"));
  const [saved, setSaved] = useState(() => load("skye:saved", []));
  const [status, setStatus] = useState("loading"); // loading | ok | error
  const [locating, setLocating] = useState(false);

  // save unit + starred cities whenever they change
  useEffect(() => localStorage.setItem("skye:unit", JSON.stringify(unit)), [unit]);
  useEffect(() => localStorage.setItem("skye:saved", JSON.stringify(saved)), [saved]);

  // reload weather whenever the city changes. `live` stops an old slow response from overwriting a newer one
  useEffect(() => {
    let live = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- flag the refetch so the UI can dim
    setStatus("loading");
    fetchWeather(place)
      .then((d) => { if (live) { setW(d); setStatus("ok"); localStorage.setItem("skye:last", JSON.stringify(place)); } })
      .catch(() => live && setStatus("error"));
    return () => { live = false; };
  }, [place]);

  // browser gps -> city name -> load weather
  const locate = useCallback(() => {
    if (!navigator.geolocation) return alert("Geolocation isn't supported on this browser.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const info = await reverseName(coords.latitude, coords.longitude);
        setPlace({ ...info, latitude: coords.latitude, longitude: coords.longitude });
        setLocating(false);
      },
      () => { setLocating(false); alert("Couldn't get your location. Check browser permission."); }
    );
  }, []);

  // star / unstar the current city (keeps the last 6)
  const isSaved = saved.some((s) => s.latitude === place.latitude && s.longitude === place.longitude);
  const toggleSave = () =>
    setSaved((s) => isSaved ? s.filter((x) => !(x.latitude === place.latitude && x.longitude === place.longitude)) : [...s, place].slice(-6));

  // background colours depend on the current weather
  const [c1, c2, c3] = w ? sceneFor(w.now.code, w.now.day) : sceneFor(0, true);
  const insights = useMemo(() => (w ? buildInsights(w) : []), [w]);

  // layout: header, search, saved chips, error/loading, then the weather panels
  return (
    <div className="scene min-h-screen text-white relative overflow-hidden" style={{ background: `linear-gradient(160deg, ${c1}, ${c2} 55%, ${c3})` }}>
      {/* blurred colour blobs behind everything */}
      <div className="blob w-96 h-96 -top-24 -left-24" style={{ background: c3 }} />
      <div className="blob w-80 h-80 bottom-0 right-0" style={{ background: c2, animationDelay: "-6s" }} />

      {/* rain / snow / stars / dust, depends on the weather */}
      <Particles code={w ? w.now.code : 0} day={w ? w.now.day : true} />

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 space-y-4">
        {/* top bar: logo + °C/°F toggle */}
        <header className="flex items-center justify-between">
          <h1 className="text-xl font-extrabold tracking-tight">Skye<span className="opacity-60">.</span></h1>
          <div className="flex items-center gap-2">
            {/* refetch the current city, icon spins while loading */}
            <button onClick={() => setPlace({ ...place })} aria-label="Refresh" className="glass rounded-full p-2.5">
              <FiRefreshCw className={status === "loading" ? "animate-spin" : ""} />
            </button>
            {/* °C/°F toggle: the white pill slides between the two */}
            <div className="glass relative rounded-full p-1 flex text-sm font-semibold">
              <span className={`absolute top-1 bottom-1 left-1 w-12 rounded-full bg-white transition-transform duration-300 ${unit === "F" ? "translate-x-full" : ""}`} />
              {["C", "F"].map((u) => (
                <button key={u} onClick={() => setUnit(u)} className={`relative w-12 py-1 rounded-full transition-colors ${unit === u ? "text-slate-900" : "opacity-80"}`}>°{u}</button>
              ))}
            </div>
          </div>
        </header>

        {/* search + location button */}
        <SearchBar onPick={setPlace} onLocate={locate} locating={locating} />

        {/* starred cities, click to jump */}
        {saved.length > 0 && (
          <div className="flex gap-2 justify-center flex-wrap">
            {saved.map((s) => (
              <button key={`${s.latitude}${s.longitude}`} onClick={() => setPlace(s)} className="glass rounded-full px-4 py-1.5 text-sm hover:bg-white/20 transition">{s.name}</button>
            ))}
          </div>
        )}

        {/* shown when the fetch fails */}
        {status === "error" && (
          <div className="glass rounded-3xl p-8 text-center">
            <p className="text-lg font-semibold">Couldn't load weather</p>
            <p className="opacity-70 text-sm mb-4">Check your connection and try again.</p>
            <button onClick={() => setPlace({ ...place })} className="bg-white text-slate-900 font-semibold rounded-full px-5 py-2">Retry</button>
          </div>
        )}

        {/* skeleton card for the first load */}
        {status === "loading" && !w && <div className="glass rounded-3xl h-72 animate-pulse" />}

        {/* all the weather panels. dims a bit while a new city loads */}
        {w && (
          <div className={`space-y-4 transition-opacity ${status === "loading" ? "opacity-50" : ""}`}>
            <Hero place={place} w={w} unit={unit} saved={isSaved} onSave={toggleSave} />
            {/* Reveal = fade/slide in when scrolled into view */}
            <Reveal><Insights items={insights} /></Reveal>
            <Reveal><Hourly hours={w.hourly} unit={unit} /></Reveal>
            <div className="grid md:grid-cols-2 gap-4 items-start">
              <Reveal><Daily days={w.daily} unit={unit} /></Reveal>
              <Reveal delay={120}><SunArc w={w} /></Reveal>
            </div>
            <Reveal><Stats w={w} unit={unit} /></Reveal>
          </div>
        )}

        {/* credit, Open-Meteo asks for it */}
        <footer className="text-center text-xs opacity-50 pt-4">Weather data by Open-Meteo.com</footer>
      </main>
    </div>
  );
};

export default App;