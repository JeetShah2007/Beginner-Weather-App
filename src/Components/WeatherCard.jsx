const WeatherCard = ({ weather }) => {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 w-80">
      <div className="text-center">
        <h2 className="text-5xl font-bold text-slate-700">
          {weather.temp}°C
        </h2>

        <p className="text-slate-500 mt-2">
          {weather.city}, {weather.country}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="bg-slate-100 p-4 rounded-xl text-center">
          <p>Humidity</p>
          <p>{weather.humidity}%</p>
        </div>

        <div className="bg-slate-100 p-4 rounded-xl text-center">
          <p>Wind</p>
          <p>{weather.wind} km/h</p>
        </div>

        <div className="bg-slate-100 p-4 rounded-xl text-center">
          <p>Feels Like</p>
          <p>{weather.feelsLike}°C</p>
        </div>

        <div className="bg-slate-100 p-4 rounded-xl text-center">
          <p>Cloud</p>
          <p>{weather.cloud}%</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherCard;