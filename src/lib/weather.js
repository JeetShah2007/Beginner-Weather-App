// Open-Meteo: free, no API key, so nothing can "expire".
const GEO = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST = "https://api.open-meteo.com/v1/forecast";
const AIR = "https://air-quality-api.open-meteo.com/v1/air-quality";
const REVERSE = "https://api.bigdatacloud.net/data/reverse-geocode-client";

// tiny fetch wrapper so every call fails the same way
const getJSON = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json();
};

// city autocomplete, max 5 matches
export const searchCities = async (q) => {
  if (q.trim().length < 2) return [];
  const d = await getJSON(`${GEO}?name=${encodeURIComponent(q.trim())}&count=5&language=en`);
  return (d.results || []).map((r) => ({
    name: r.name, country: r.country || "", admin: r.admin1 || "",
    latitude: r.latitude, longitude: r.longitude,
  }));
};

// gps coords -> city name (only used by the location button)
export const reverseName = async (latitude, longitude) => {
  try {
    const d = await getJSON(`${REVERSE}?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
    return { name: d.city || d.locality || "My location", country: d.countryName || "", admin: d.principalSubdivision || "" };
  } catch {
    return { name: "My location", country: "", admin: "" };
  }
};

// main call: forecast + air quality merged into one clean object for the UI
export const fetchWeather = async ({ latitude, longitude }) => {
  const f = getJSON(
    `${FORECAST}?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m` +
    `&hourly=temperature_2m,precipitation_probability,weather_code,is_day` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max` +
    `&timezone=auto&forecast_days=7`
  );
  // Air quality is a bonus: never let it break the main view.
  const a = getJSON(`${AIR}?latitude=${latitude}&longitude=${longitude}&current=us_aqi,pm2_5`).catch(() => null);
  const [w, aq] = await Promise.all([f, a]);

  // hourly arrays start at midnight, so find where 'now' sits and take 24h from there
  const now = w.current.time.slice(0, 13);
  const start = Math.max(0, w.hourly.time.findIndex((t) => t.slice(0, 13) >= now));
  const hourly = w.hourly.time.slice(start, start + 24).map((t, i) => ({
    time: t,
    temp: w.hourly.temperature_2m[start + i],
    rain: w.hourly.precipitation_probability[start + i] ?? 0,
    code: w.hourly.weather_code[start + i],
    day: w.hourly.is_day[start + i] === 1,
  }));
  // one object per day for the 7-day list
  const daily = w.daily.time.map((t, i) => ({
    date: t,
    code: w.daily.weather_code[i],
    max: w.daily.temperature_2m_max[i],
    min: w.daily.temperature_2m_min[i],
    rain: w.daily.precipitation_probability_max[i] ?? 0,
    uv: w.daily.uv_index_max[i],
    sunrise: w.daily.sunrise[i],
    sunset: w.daily.sunset[i],
  }));
  // final shape that every component reads
  const c = w.current;
  return {
    now: {
      temp: c.temperature_2m, feels: c.apparent_temperature, humidity: c.relative_humidity_2m,
      wind: c.wind_speed_10m, windDir: c.wind_direction_10m, cloud: c.cloud_cover,
      pressure: c.surface_pressure, code: c.weather_code, day: c.is_day === 1, time: c.time,
    },
    hourly, daily,
    aqi: aq?.current?.us_aqi ?? null,
    pm25: aq?.current?.pm2_5 ?? null,
  };
};

// ---------- helpers ----------
// API always sends °C and km/h, we only convert when displaying
export const toUnit = (c, unit) => Math.round(unit === "F" ? (c * 9) / 5 + 32 : c);
export const toWind = (kmh, unit) => (unit === "F" ? `${Math.round(kmh * 0.621)} mph` : `${Math.round(kmh)} km/h`);
export const compass = (d) => ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(d / 45) % 8];
export const hourLabel = (t) => new Date(t).toLocaleTimeString([], { hour: "numeric" }).toLowerCase();
export const clock = (t) => new Date(t).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

// WMO weather code -> readable text
export const describe = (code) => {
  if (code === 0) return "Clear sky";
  if (code <= 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 48) return "Foggy";
  if (code <= 57) return "Drizzle";
  if (code <= 67) return "Rain";
  if (code <= 77) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 86) return "Snow showers";
  return "Thunderstorm";
};
export const isWet = (code) => (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;

// Background palette by weather + day/night
export const sceneFor = (code, day) => {
  if (!day) return code >= 95 || isWet(code) ? ["#0a0f1f", "#1b2a49", "#2b3a67"] : ["#070b1a", "#16204a", "#3b2f6b"];
  if (code >= 95) return ["#1f2540", "#3c4770", "#6b7aa8"];
  if (isWet(code)) return ["#2b3a52", "#4b6584", "#8aa0b8"];
  if (code >= 71 && code <= 86) return ["#6c86a8", "#9db4cf", "#dbe7f3"];
  if (code === 0 || code <= 2) return ["#1565c0", "#2f9bf0", "#7fd3ff"];
  return ["#3d5a80", "#6d8eb3", "#a9c4de"];
};

// US AQI bands -> label + colour
export const aqiInfo = (v) => {
  if (v == null) return null;
  if (v <= 50) return { label: "Good", color: "#4ade80" };
  if (v <= 100) return { label: "Moderate", color: "#facc15" };
  if (v <= 150) return { label: "Unhealthy for some", color: "#fb923c" };
  if (v <= 200) return { label: "Unhealthy", color: "#f87171" };
  return { label: "Very unhealthy", color: "#c084fc" };
};

// Rule-based "what should I actually do today" insights
export const buildInsights = (w) => {
  const out = [];
  const { now, daily, hourly, aqi } = w;
  const today = daily[0];
  const f = now.feels;

  // outfit tip goes by feels-like, not the real temp
  let wear = "T-shirt weather. Keep it light.";
  if (f < 5) wear = "Bundle up: heavy coat, scarf and gloves.";
  else if (f < 14) wear = "Jacket or warm layers recommended.";
  else if (f < 22) wear = "A light layer or hoodie will do.";
  else if (f > 33) wear = "Very hot. Breathable clothes and a hat.";
  out.push({ icon: "shirt", title: "What to wear", text: wear });

  // worst rain chance over today / next 12h
  const maxRain = Math.max(today.rain, ...hourly.slice(0, 12).map((h) => h.rain));
  out.push({
    icon: maxRain >= 50 || isWet(now.code) ? "umbrella" : "sun",
    title: "Rain check",
    text: maxRain >= 50 || isWet(now.code) ? `${maxRain}% chance of rain. Carry an umbrella.` : "No umbrella needed today.",
  });

  if (today.uv >= 3) out.push({ icon: "uv", title: "Sun protection", text: `UV peaks at ${Math.round(today.uv)}. Use SPF ${today.uv >= 6 ? "50" : "30"} outdoors.` });
  if (aqi != null && aqi > 100) out.push({ icon: "air", title: "Air quality", text: "Air is unhealthy. Limit outdoor exercise or wear an N95." });

  // Best outdoor window: daylight hours closest to a comfy 22°C with the least rain
  const cand = hourly.filter((h) => h.day).map((h) => ({ h, s: Math.abs(h.temp - 22) + h.rain * 0.3 }));
  if (cand.length) {
    const best = cand.sort((a, b) => a.s - b.s)[0].h;
    out.push({ icon: "walk", title: "Best outdoor window", text: `Around ${hourLabel(best.time)} (${Math.round(best.temp)}°C, ${best.rain}% rain).` });
  }

  // laundry rule: low humidity and no rain around
  const dry = now.humidity < 60 && !isWet(now.code) && maxRain < 30;
  out.push({ icon: "laundry", title: "Laundry", text: dry ? "Great day to hang clothes outside." : "Dry them indoors today." });
  return out;
};