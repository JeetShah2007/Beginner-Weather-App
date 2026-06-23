const WeatherImage = ({ weatherCode }) => {
  let image =
    "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=1200";

  if (weatherCode === 0) {
    image =
      "https://images.unsplash.com/photo-1501973801540-537f08ccae7b?q=80&w=1200";
  } else if ([1, 2, 3].includes(weatherCode)) {
    image =
      "https://images.unsplash.com/photo-1534088568595-a066f410bcda?q=80&w=1200";
  } else if ([51, 53, 55, 61, 63, 65].includes(weatherCode)) {
    image =
      "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1200";
  }

  return (
    <img
      src={image}
      alt=""
      className="w-96 h-80 object-cover rounded-3xl shadow-2xl"
    />
  );
};

export default WeatherImage;