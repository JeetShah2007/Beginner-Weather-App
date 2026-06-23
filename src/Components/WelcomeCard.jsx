const WelcomeCard = () => {
  return (
    <div className="flex justify-center">
      <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-4xl">
        <img
          src="https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?q=80&w=1200"
          alt=""
          className="w-full h-80 object-cover rounded-2xl"
        />

        <div className="text-center mt-6">
          <h2 className="text-3xl font-bold">
            Welcome
          </h2>

          <p className="text-slate-600 mt-3">
            Enter a city name to see weather information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCard;