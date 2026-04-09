import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '../services/adminService.js';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes] = await Promise.all([
        adminService.getStats(),
        adminService.getPendingParkings()
      ]);

      setStats(statsRes.data);
      setPending(pendingRes.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const approve = async (id) => {
    await adminService.approveParking(id);
    toast.success('Parking approved');
    loadData();
  };

  const reject = async (id) => {
    await adminService.rejectParking(id);
    toast.success('Parking rejected');
    loadData();
  };

  return (
    <section className="container py-10 space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {loading && <p>Loading dashboard...</p>}

      {stats && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card"><p className="text-sm text-gray-500">Users</p><p className="text-3xl font-bold">{stats.totalUsers}</p></div>
          <div className="card"><p className="text-sm text-gray-500">Parkings</p><p className="text-3xl font-bold">{stats.totalParkings}</p></div>
          <div className="card"><p className="text-sm text-gray-500">Bookings</p><p className="text-3xl font-bold">{stats.totalBookings}</p></div>
          <div className="card"><p className="text-sm text-gray-500">Revenue</p><p className="text-3xl font-bold">INR {stats.totalRevenue}</p></div>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-semibold mb-3">Pending Parking Approvals</h2>
        {!pending.length && <p className="text-gray-600">No pending approvals.</p>}
        <div className="space-y-3">
          {pending.map((item) => (
            <article key={item._id} className="border border-gray-200 rounded-lg p-3 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-gray-600">{item.address}, {item.city}</p>
                <p className="text-sm text-gray-600">Owner: {item.ownerId?.name} ({item.ownerId?.email})</p>
              </div>
              <div className="flex gap-2">
                <button className="btn-primary" onClick={() => approve(item._id)}>Approve</button>
                <button className="btn-outline" onClick={() => reject(item._id)}>Reject</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AdminDashboard;
