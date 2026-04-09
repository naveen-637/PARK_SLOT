import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { parkingService } from '../services/parkingService.js';

const defaultForm = {
  title: '',
  description: '',
  address: '',
  city: '',
  pricePerHour: '',
  totalSlots: '',
  lat: '',
  lng: '',
  amenities: '',
  vehicleTypes: {
    Car: false,
    Bike: false,
    EV: false,
    Truck: false
  }
};

function OwnerAddSlot() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [locating, setLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onVehicleTypeChange = (event) => {
    const { name, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      vehicleTypes: {
        ...prev.vehicleTypes,
        [name]: checked
      }
    }));
  };

  const onUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Geolocation is not supported in this browser.');
      return;
    }

    setLocating(true);
    setLocationMessage('Fetching your current location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6)
        }));
        setLocating(false);
        setLocationMessage('Owner location added. You can still adjust coordinates manually.');
      },
      () => {
        setLocating(false);
        setLocationMessage('Could not access location. Enter latitude and longitude manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const onCreateParking = async (event) => {
    event.preventDefault();

    const selectedVehicleTypes = Object.keys(form.vehicleTypes).filter((item) => form.vehicleTypes[item]);
    const amenities = form.amenities
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      pricePerHour: Number(form.pricePerHour),
      totalSlots: Number(form.totalSlots),
      amenities,
      vehicleTypes: selectedVehicleTypes,
      location: {
        lat: Number(form.lat),
        lng: Number(form.lng)
      }
    };

    setSubmitting(true);

    try {
      await parkingService.createParking(payload);
      toast.success('Parking listing created successfully');
      setForm(defaultForm);
      navigate('/owner/dashboard');
    } catch (error) {
      const message = error.response?.data?.errors?.[0] || error.response?.data?.message || 'Unable to create parking listing';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container py-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Add Parking Slot</h1>
        <Link to="/owner/dashboard" className="btn-outline">Back to Dashboard</Link>
      </div>

      <div className="card space-y-4">
        <p className="text-gray-600 text-sm">
          Add slot count, price per hour, location, and basic details for your parking listing.
        </p>

        <form onSubmit={onCreateParking} className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              name="title"
              className="input-field"
              value={form.title}
              onChange={onChange}
              placeholder="Parking title"
              required
            />
            <input
              name="city"
              className="input-field"
              value={form.city}
              onChange={onChange}
              placeholder="City"
              required
            />
            <input
              name="address"
              className="input-field md:col-span-2"
              value={form.address}
              onChange={onChange}
              placeholder="Address"
              required
            />
            <textarea
              name="description"
              className="input-field md:col-span-2 min-h-24"
              value={form.description}
              onChange={onChange}
              placeholder="Description"
            />
            <input
              name="pricePerHour"
              type="number"
              min="0"
              className="input-field"
              value={form.pricePerHour}
              onChange={onChange}
              placeholder="Price per hour"
              required
            />
            <input
              name="totalSlots"
              type="number"
              min="1"
              className="input-field"
              value={form.totalSlots}
              onChange={onChange}
              placeholder="Total slots"
              required
            />
            <input
              name="lat"
              type="number"
              step="any"
              className="input-field"
              value={form.lat}
              onChange={onChange}
              placeholder="Latitude"
              required
            />
            <input
              name="lng"
              type="number"
              step="any"
              className="input-field"
              value={form.lng}
              onChange={onChange}
              placeholder="Longitude"
              required
            />
            <div className="md:col-span-2 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onUseCurrentLocation}
                className="btn-secondary"
                disabled={locating}
              >
                {locating ? 'Locating...' : 'Use Owner Current Location'}
              </button>
              {locationMessage && <p className="text-sm text-gray-600">{locationMessage}</p>}
            </div>
            <input
              name="amenities"
              className="input-field md:col-span-2"
              value={form.amenities}
              onChange={onChange}
              placeholder="Amenities separated by comma (CCTV, EV Charging, Covered)"
            />
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-700 mb-2">Vehicle Types</p>
              <div className="flex flex-wrap gap-4">
                {Object.keys(form.vehicleTypes).map((vehicleType) => (
                  <label key={vehicleType} className="text-sm text-gray-700 flex items-center gap-2">
                    <input
                      type="checkbox"
                      name={vehicleType}
                      checked={form.vehicleTypes[vehicleType]}
                      onChange={onVehicleTypeChange}
                    />
                    {vehicleType}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Parking Listing'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default OwnerAddSlot;
