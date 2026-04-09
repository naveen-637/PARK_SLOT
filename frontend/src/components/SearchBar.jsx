import { useEffect, useState } from 'react';

const defaultFilters = {
  city: '',
  maxPrice: '',
  lat: '',
  lng: '',
  distance: '5'
};

function SearchBar({ initialFilters, onSearch }) {
  const [filters, setFilters] = useState(initialFilters || defaultFilters);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');

  useEffect(() => {
    setFilters((prev) => ({ ...defaultFilters, ...prev, ...(initialFilters || {}) }));
  }, [initialFilters]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    onSearch(filters);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Geolocation is not supported in this browser.');
      return;
    }

    setLocating(true);
    setLocationMessage('Getting your current location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextFilters = {
          ...filters,
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
          distance: filters.distance || '5'
        };

        setFilters(nextFilters);
        setLocating(false);
        setLocationMessage('Showing parkings near your current location.');
        onSearch(nextFilters);
      },
      () => {
        setLocating(false);
        setLocationMessage('Unable to fetch your location. You can enter latitude and longitude manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <form onSubmit={onSubmit} className="card space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Filters</h2>
        <p className="text-xs text-gray-500">Rate + distance are applied for nearby search</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="label mb-1">City</label>
          <input
            name="city"
            value={filters.city}
            onChange={onChange}
            className="input-field"
            placeholder="City"
          />
        </div>
        <div>
          <label className="label mb-1">Rate (max INR/hour)</label>
          <input
            name="maxPrice"
            value={filters.maxPrice}
            onChange={onChange}
            className="input-field"
            type="number"
            min="0"
            placeholder="500"
          />
        </div>
        <div>
          <label className="label mb-1">Distance (km)</label>
          <input
            name="distance"
            value={filters.distance}
            onChange={onChange}
            className="input-field"
            type="number"
            min="1"
            placeholder="5"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
        <button
          type="button"
          onClick={useMyLocation}
          className="btn-secondary"
          disabled={locating}
        >
          {locating ? 'Locating...' : 'Use My Location'}
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          Filter by city, rate, and km distance from your current location.
        </p>
        <button type="submit" className="btn-primary whitespace-nowrap">Search</button>
      </div>

      {locationMessage && <p className="text-sm text-gray-600">{locationMessage}</p>}
    </form>
  );
}

export default SearchBar;
