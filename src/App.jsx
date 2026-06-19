import React, { useState } from "react";
import axios from "axios";
import Card from "./Components/Card";

const App = () => {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);

  const getData = async () => {
    try {
      // Get coordinates from city name
      const geoResponse = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1`
      );

      const place = geoResponse.data.results[0];

      const lat = place.latitude;
      const lon = place.longitude;

      // Get weather using coordinates
      const weatherResponse = await axios.get(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m`
      );

      setWeather({
        city: place.name,
        country: place.country,
        temp: weatherResponse.data.current.temperature_2m,
        humidity: weatherResponse.data.current.relative_humidity_2m,
      });
    } catch (error) {
      console.log(error);
      alert("City not found");
    }
  };

  return (
    <div className="min-h-screen bg-[#d9e7ee] p-8">
      <h1 className="text-center text-5xl font-bold text-slate-700 mb-10">
        Weather App
      </h1>

      <div className="flex justify-center gap-4 mb-10">
        <input
          type="text"
          placeholder="Enter City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-72 px-4 py-3 border rounded-xl outline-none"
        />

        <button
          onClick={getData}
          className="px-6 py-3 bg-blue-500 text-white rounded-xl"
        >
          Get Weather
        </button>
      </div>

      {weather && (
        <Card weather={weather}/>
      )}
    </div>
  );
};

export default App;