import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { parkingService } from '../services/parkingService.js';
import { bookingService } from '../services/bookingService.js';

const vehicleTypeTemplate = {
  Car: false,
  Bike: false,
  EV: false,
  Truck: false
};

function OwnerDashboard() {
  const [parkings, setParkings] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('spaces');
  const [editingId, setEditingId] = useState('');
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    pricePerHour: '',
    totalSlots: '',
    lat: '',
    lng: '',
    amenities: '',
    vehicleTypes: vehicleTypeTemplate
  });

  const loadOwnerData = async () => {
    setLoading(true);

    try {
      const [parkingsRes, bookingsRes] = await Promise.all([
        parkingService.getMyParkings(),
        bookingService.getOwnerBookings()
      ]);

      setParkings(parkingsRes.data || []);
      setBookings(bookingsRes.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load owner data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOwnerData();
  }, []);

  const openEdit = (item) => {
    const mappedVehicleTypes = {
      ...vehicleTypeTemplate,
      ...(item.vehicleTypes || []).reduce((acc, type) => ({ ...acc, [type]: true }), {})
    };

    setEditForm({
      title: item.title || '',
      description: item.description || '',
      address: item.address || '',
      city: item.city || '',
      pricePerHour: String(item.pricePerHour ?? ''),
      totalSlots: String(item.totalSlots ?? ''),
      lat: String(item.location?.lat ?? ''),
      lng: String(item.location?.lng ?? ''),
      amenities: (item.amenities || []).join(', '),
      vehicleTypes: mappedVehicleTypes
    });

    setEditingId(item._id);
  };

  const closeEdit = () => {
    setEditingId('');
  };

  const onEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const onEditVehicleTypeChange = (event) => {
    const { name, checked } = event.target;
    setEditForm((prev) => ({
      ...prev,
      vehicleTypes: {
        ...prev.vehicleTypes,
        [name]: checked
      }
    }));
  };

  const onUpdateParking = async (event) => {
    event.preventDefault();

    const selectedVehicleTypes = Object.keys(editForm.vehicleTypes).filter((item) => editForm.vehicleTypes[item]);
    const amenities = editForm.amenities
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const payload = {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      address: editForm.address.trim(),
      city: editForm.city.trim(),
      pricePerHour: Number(editForm.pricePerHour),
      totalSlots: Number(editForm.totalSlots),
      amenities,
      vehicleTypes: selectedVehicleTypes,
      location: {
        lat: Number(editForm.lat),
        lng: Number(editForm.lng)
      }
    };

    setSaving(true);
    try {
      await parkingService.updateParking(editingId, payload);
      toast.success('Slot updated successfully');
      setEditingId('');
      await loadOwnerData();
    } catch (error) {
      const message = error.response?.data?.errors?.[0] || error.response?.data?.message || 'Unable to update slot';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const revenue = bookings.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

  const statusBadgeClass = (status) => {
    const normalized = String(status || '').toLowerCase();

    if (normalized === 'active') {
      return 'bg-emerald-100 text-emerald-700';
    }

    if (normalized === 'pending') {
      return 'bg-amber-100 text-amber-700';
    }

    if (normalized === 'cancelled') {
      return 'bg-rose-100 text-rose-700';
    }

    return 'bg-slate-100 text-slate-700';
  };

  return (
    <section className="container py-10 space-y-6">
      <div className="rounded-3xl border border-[#cfded6] bg-gradient-to-r from-[#d9ece3] via-[#eef7f3] to-[#e3f3ea] p-5 sm:p-7 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-[#183147]">Owner Dashboard</h1>
            <p className="text-sm text-[#4f6477] mt-1">Manage your slots and track your latest bookings in one place.</p>
          </div>
          <Link to="/owner/add-slot" className="btn-primary">Add Slot</Link>
        </div>

        <div className="mt-5 inline-flex rounded-xl p-1 bg-white/80 border border-[#cfe1d8]">
          <button
            type="button"
            onClick={() => setActiveTab('spaces')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'spaces'
                ? 'bg-[#00a64f] text-white'
                : 'text-[#4f6477] hover:bg-[#eaf5f0]'
            }`}
          >
            My Parking Spaces
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'bookings'
                ? 'bg-[#00a64f] text-white'
                : 'text-[#4f6477] hover:bg-[#eaf5f0]'
            }`}
          >
            Recent Bookings
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl p-5 border border-[#cde0d7] bg-gradient-to-br from-[#ffffff] to-[#e9f8f0] shadow-sm">
          <p className="text-sm text-[#4f6477]">My Listings</p>
          <p className="text-3xl font-extrabold text-[#143247]">{parkings.length}</p>
        </div>
        <div className="rounded-2xl p-5 border border-[#d8d6ef] bg-gradient-to-br from-[#ffffff] to-[#f2eeff] shadow-sm">
          <p className="text-sm text-[#4f6477]">Total Bookings</p>
          <p className="text-3xl font-extrabold text-[#143247]">{bookings.length}</p>
        </div>
        <div className="rounded-2xl p-5 border border-[#ead5c1] bg-gradient-to-br from-[#ffffff] to-[#fff3e3] shadow-sm">
          <p className="text-sm text-[#4f6477]">Revenue</p>
          <p className="text-3xl font-extrabold text-[#143247]">INR {revenue}</p>
        </div>
      </div>

      {activeTab === 'spaces' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-3 text-[#1b3650]">My Parking Spaces</h2>
          {loading && <p>Loading owner data...</p>}
          {!loading && !parkings.length && <p className="text-[#5a7081]">No parking listings yet.</p>}
          <div className="space-y-3">
            {parkings.map((item) => (
              <article key={item._id} className="border border-[#d6e2db] rounded-xl p-4 bg-gradient-to-r from-white to-[#f2faf6]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#163448]">{item.title}</p>
                    <p className="text-sm text-[#5a7081]">
                      {item.city} | Slots {item.availableSlots}/{item.totalSlots} | INR {item.pricePerHour}/hour
                    </p>
                    <p className="text-sm text-[#5a7081]">Approval: {item.isApproved ? 'Approved' : 'Pending'}</p>
                    <p className={`text-sm font-semibold ${item.availableSlots > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      Status: {item.availableSlots > 0 ? 'Available' : 'Not Available'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => openEdit(item)}
                  >
                    Update Slot
                  </button>
                </div>

                {editingId === item._id && (
                  <form onSubmit={onUpdateParking} className="mt-4 grid gap-3 md:grid-cols-2">
                    <input
                      name="title"
                      className="input-field"
                      value={editForm.title}
                      onChange={onEditChange}
                      placeholder="Parking title"
                      required
                    />
                    <input
                      name="city"
                      className="input-field"
                      value={editForm.city}
                      onChange={onEditChange}
                      placeholder="City"
                      required
                    />
                    <input
                      name="address"
                      className="input-field md:col-span-2"
                      value={editForm.address}
                      onChange={onEditChange}
                      placeholder="Address"
                      required
                    />
                    <textarea
                      name="description"
                      className="input-field md:col-span-2 min-h-24"
                      value={editForm.description}
                      onChange={onEditChange}
                      placeholder="Description"
                    />
                    <input
                      name="pricePerHour"
                      type="number"
                      min="0"
                      className="input-field"
                      value={editForm.pricePerHour}
                      onChange={onEditChange}
                      placeholder="Price per hour"
                      required
                    />
                    <input
                      name="totalSlots"
                      type="number"
                      min="1"
                      className="input-field"
                      value={editForm.totalSlots}
                      onChange={onEditChange}
                      placeholder="Total slots"
                      required
                    />
                    <input
                      name="lat"
                      type="number"
                      step="any"
                      className="input-field"
                      value={editForm.lat}
                      onChange={onEditChange}
                      placeholder="Latitude"
                      required
                    />
                    <input
                      name="lng"
                      type="number"
                      step="any"
                      className="input-field"
                      value={editForm.lng}
                      onChange={onEditChange}
                      placeholder="Longitude"
                      required
                    />
                    <input
                      name="amenities"
                      className="input-field md:col-span-2"
                      value={editForm.amenities}
                      onChange={onEditChange}
                      placeholder="Amenities separated by comma"
                    />
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">Vehicle Types</p>
                      <div className="flex flex-wrap gap-4">
                        {Object.keys(editForm.vehicleTypes).map((vehicleType) => (
                          <label key={vehicleType} className="text-sm text-gray-700 flex items-center gap-2">
                            <input
                              type="checkbox"
                              name={vehicleType}
                              checked={editForm.vehicleTypes[vehicleType]}
                              onChange={onEditVehicleTypeChange}
                            />
                            {vehicleType}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                      <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? 'Updating...' : 'Save Changes'}
                      </button>
                      <button type="button" className="btn-outline" onClick={closeEdit} disabled={saving}>
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </article>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-3 text-[#1b3650]">Recent Bookings</h2>
          {!bookings.length && <p className="text-[#5a7081]">No bookings yet.</p>}
          <div className="space-y-3">
            {bookings.map((item) => (
              <article key={item._id} className="border border-[#d6e2db] rounded-xl p-4 bg-gradient-to-r from-white to-[#edf7ff]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#163448]">{item.parkingId?.title || 'Parking'}</p>
                    <p className="text-sm text-[#5a7081]">Customer: {item.userId?.name || 'User'}</p>
                    <p className="text-sm text-[#5a7081]">Amount: INR {item.totalAmount}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusBadgeClass(item.bookingStatus)}`}>
                    {item.bookingStatus}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default OwnerDashboard;
