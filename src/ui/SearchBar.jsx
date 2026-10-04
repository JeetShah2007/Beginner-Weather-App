import { useEffect, useState } from "react";
import { FiSearch, FiNavigation } from "react-icons/fi";
import { searchCities } from "../lib/weather";

// search box + suggestions dropdown + location button
const SearchBar = ({ onPick, onLocate, locating }) => {
  const [q, setQ] = useState("");
  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);

  // Debounced autocomplete
  useEffect(() => {
    if (q.trim().length < 2) return;
    const id = setTimeout(() => searchCities(q).then(setList).catch(() => setList([])), 300);
    return () => clearTimeout(id);
  }, [q]);

  // user chose a city: send it up, then clear the box
  // ignore old results once the box is cleared / too short
  const shown = q.trim().length < 2 ? [] : list;

  const pick = (c) => { onPick(c); setQ(""); setList([]); setOpen(false); };

  return (
    <div className="relative z-20 w-full max-w-xl mx-auto">
      {/* input row */}
      <div className="glass flex items-center gap-3 rounded-full px-5 py-3">
        <FiSearch className="opacity-70 shrink-0" />
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === "Enter" && shown[0] && pick(shown[0])}
          placeholder="Search any city..."
          className="flex-1 bg-transparent outline-none placeholder-white/60 text-base"
        />
        <button onClick={onLocate} title="Use my location" aria-label="Use my location"
          className={`p-2 rounded-full hover:bg-white/20 transition ${locating ? "animate-pulse" : ""}`}>
          <FiNavigation />
        </button>
      </div>

      {/* suggestions dropdown */}
      {open && shown.length > 0 && (
        <ul className="glass absolute mt-2 w-full rounded-3xl overflow-hidden bg-slate-900/60">
          {shown.map((c) => (
            <li key={`${c.latitude}${c.longitude}`}>
              <button onClick={() => pick(c)} className="w-full text-left px-5 py-3 hover:bg-white/15 transition">
                <span className="font-semibold">{c.name}</span>
                <span className="opacity-70 text-sm"> {[c.admin, c.country].filter(Boolean).join(", ")}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
