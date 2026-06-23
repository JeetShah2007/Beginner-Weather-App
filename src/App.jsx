import React, { useState } from "react";
import axios from "axios";

import SearchBar from "./components/SearchBar";
import WelcomeCard from "./components/WelcomeCard";
import WeatherCard from "./components/WeatherCard";
import WeatherImage from "./components/WeatherImage";

const App = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);

  const getData = async () => {
    try {
      const geoResponse = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
      );

      const place = geoResponse.data.results[0];

      const weatherResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,apparent_temperature,surface_pressure,cloud_cover`
      );

      setWeather({
        city: place.name,
        country: place.country,
        temp: weatherResponse.data.current.temperature_2m,
        humidity: weatherResponse.data.current.relative_humidity_2m,
        wind: weatherResponse.data.current.wind_speed_10m,
        feelsLike: weatherResponse.data.current.apparent_temperature,
        cloud: weatherResponse.data.current.cloud_cover,
        pressure: weatherResponse.data.current.surface_pressure,
        weatherCode: weatherResponse.data.current.weather_code,
      });
    } catch (error) {
      alert("City not found");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-linear-to-br from-sky-200 via-blue-100 to-cyan-50 p-6">
      <h1 className="text-center text-5xl font-bold text-slate-700 mb-3">
        Weather Dashboard
      </h1>

      <SearchBar
        city={city}
        setCity={setCity}
        getData={getData}
      />

      {!weather ? (
        <WelcomeCard />
      ) : (
        <div className="flex justify-center items-center gap-8 flex-wrap">
          <WeatherImage weatherCode={weather.weatherCode} />
          <WeatherCard weather={weather} />
        </div>
      )}
    </div>
  );
};

export default App;