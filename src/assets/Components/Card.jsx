import React from 'react'

const Card = (props) => {
  return (
    <div className="flex justify-center items-center gap-10">
          <img
            src="https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1200"
            alt=""
            className="w-175 h-105 object-cover rounded-3xl shadow-2xl"
          />

          <div className="bg-white rounded-3xl shadow-2xl p-8 w-87.5">
            <h2 className="text-3xl font-bold">{props.weather.city}</h2>

            <p className="text-gray-500 text-lg">
              {props.weather.country}
            </p>

            <h1 className="text-5xl font-bold mt-6">
              {props.weather.temp}°C
            </h1>

            <p className="mt-4 text-lg">
              Humidity: {props.weather.humidity}%
            </p>
          </div>
        </div>
  )
}

export default Card
