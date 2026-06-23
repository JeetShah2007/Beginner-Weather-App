const SearchBar = ({ city, setCity, getData }) => {
  return (
    <div className="flex justify-center gap-4 mb-10">
      <input
        type="text"
        placeholder="Enter City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        className="w-72 px-4 py-3 rounded-xl border bg-white shadow-md outline-none"
      />

      <button
        onClick={getData}
        className="px-6 py-3 bg-blue-500 text-white rounded-xl"
      >
        Search
      </button>
    </div>
  );
};

export default SearchBar;