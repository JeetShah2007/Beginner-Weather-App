# Skye

A fast, good-looking weather app with hourly and 7-day forecasts, air quality, and plain-English tips for your day. Built with React, Vite and Tailwind CSS. No API key needed.

**Live demo:** https://skye-weather.vercel.app *(replace with your actual Vercel URL)*

## Features

- **City search with autocomplete**, plus a "use my location" button
- **Live background:** rain, snow, twinkling stars or floating dust, depending on the weather and time of day. The particles move away from your cursor.
- **Hourly forecast:** next 24 hours with a temperature curve. Tap any hour for details.
- **7-day forecast:** tap a day to expand sunrise, sunset, UV and rain chance
- **Sun position card:** a glowing sun that moves along an arc between sunrise and sunset
- **Air quality (AQI), UV index, wind, humidity, pressure, cloud cover**
- **"Today, in plain English" tips:** what to wear, whether you need an umbrella or sunscreen, the best outdoor window, and whether it's a good laundry day
- **°C / °F toggle**, saved between visits
- **Starred cities** for quick access, also saved between visits
- Scroll-reveal animations, hover and press effects, and a tilting hero card

## Tech stack

| Part | Tool |
|---|---|
| UI | React 19 |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| Icons | react-icons |
| Weather data | [Open-Meteo](https://open-meteo.com) (forecast, geocoding, air quality) |
| City name from GPS | BigDataCloud reverse geocoding |
| Hosting | Vercel |

## Getting started

You need Node.js 20.19 or newer.

```bash
git clone https://github.com/JeetShah2007/Beginner-Weather-App.git
cd Beginner-Weather-App
npm install
npm run dev
```

Then open the local URL that Vite prints (usually http://localhost:5173).

### Other scripts

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
npm run lint      # run ESLint
```

## Project structure

```
src/
├── App.jsx              # state, data loading, page layout
├── main.jsx             # React entry point
├── index.css            # Tailwind import, glass look, animations
├── lib/
│   └── weather.js       # API calls, unit helpers, weather codes, daily tips
└── ui/
    ├── SearchBar.jsx    # search box, suggestions, location button
    ├── Panels.jsx       # hero, hourly, 7-day, sun arc, stat tiles, tips
    ├── WeatherIcon.jsx  # weather code -> icon
    ├── Particles.jsx    # rain / snow / stars / dust canvas
    ├── fx.jsx           # scroll-reveal and tilt components
    └── useCountUp.jsx   # animated number hook
```

## How it works

1. You search for a city (or use your location). The app gets its coordinates from the Open-Meteo geocoding API.
2. It fetches the forecast and air quality in parallel. If air quality fails, the rest of the app still works.
3. `lib/weather.js` turns the raw response into one clean object: current conditions, the next 24 hours and 7 days.
4. The background colours, particles and tips are all picked from the current weather code and whether it's day or night.
5. Your last city, unit and starred cities are kept in `localStorage`.

## Deploy

The project deploys to Vercel with no configuration. Import the repo, keep the Vite defaults (`npm run build`, output `dist`), and deploy. Every push to `main` redeploys automatically.

## Credits

Weather data by [Open-Meteo.com](https://open-meteo.com) (CC BY 4.0).

## Author

Made by [Jeet Shah](https://github.com/JeetShah2007).
