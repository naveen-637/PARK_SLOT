import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import SearchBar from '../components/SearchBar.jsx';
import ParkingCard from '../components/ParkingCard.jsx';
import { useParking } from '../hooks/useParking.js';

const apiBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

const defaultFilters = {
  city: '',
  maxPrice: '',
  lat: '',
  lng: '',
  distance: '5',
  available: 'true'
};

function Search() {
  const { items, loading, error, loadParkings } = useParking();
  const [filters, setFilters] = useState(defaultFilters);
  const [askedLocation, setAskedLocation] = useState(false);
  const [locating, setLocating] = useState(false);

  const enableLocationSearch = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported in this browser');
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextFilters = {
          ...filters,
          lat: Number(position.coords.latitude).toFixed(6),
          lng: Number(position.coords.longitude).toFixed(6),
          available: 'true'
        };

        setFilters(nextFilters);
        setAskedLocation(true);
        setLocating(false);
        loadParkings(nextFilters);
      },
      () => {
        setLocating(false);
        toast.error('Unable to access your location. You can enter coordinates manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    const socket = io(apiBase);
    socket.on('slot-updated', () => {
      if (askedLocation) {
        loadParkings(filters);
      }
    });

    return () => socket.disconnect();
  }, [askedLocation, filters, loadParkings]);

  const onSearch = (newFilters) => {
    setFilters(newFilters);
    setAskedLocation(true);
    loadParkings(newFilters);
  };

  const suggestedParkings = items?.filter((parking) => parking.isSuggested);
  const otherParkings = items?.filter((parking) => !parking.isSuggested);

  return (
    <section className="container py-10 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Nearby Parking Slots</h1>
        <p className="text-gray-600">Enable location and filter by city, rate, and km distance.</p>
      </div>

      {!askedLocation && (
        <div className="card flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <p className="font-semibold">Enable Location</p>
            <p className="text-sm text-gray-600">We use your location to show nearest available parking slots.</p>
          </div>
          <button type="button" onClick={enableLocationSearch} className="btn-primary" disabled={locating}>
            {locating ? 'Locating...' : 'Enable Location'}
          </button>
        </div>
      )}

      <SearchBar onSearch={onSearch} initialFilters={filters} />

      {loading && <p className="text-gray-600">Loading parking listings...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {Boolean(suggestedParkings?.length) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Suggested Near You</h2>
            <p className="text-sm text-gray-600">Closest matches by distance and rate</p>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {suggestedParkings.map((parking) => (
              <ParkingCard key={parking._id} parking={parking} />
            ))}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {otherParkings?.map((parking) => (
          <ParkingCard key={parking._id} parking={parking} />
        ))}
      </div>
    </section>
  );
}

export default Search;
