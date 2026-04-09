import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useBooking } from '../hooks/useBooking.js';
import { paymentService } from '../services/paymentService.js';

function UserDashboard() {
  const { items, loading, loadMyBookings } = useBooking();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    loadMyBookings();
    paymentService.getHistory().then((res) => setPayments(res.data || []));
  }, [loadMyBookings]);

  const totalSpent = items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
  const paidCount = payments.filter((item) => item.status === 'success').length;

  return (
    <section className="container py-10 space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">User Dashboard</h1>
        <Link to="/history" className="btn-outline">View Full History</Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Total Bookings</p>
          <p className="text-3xl font-bold">{items.length}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Money Spent</p>
          <p className="text-3xl font-bold">INR {totalSpent}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Successful Payments</p>
          <p className="text-3xl font-bold">{paidCount}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-2">Summary</h2>
        {loading ? (
          <p>Loading dashboard data...</p>
        ) : (
          <p className="text-gray-600">
            You have {items.length} bookings with total spend of INR {totalSpent}. Use History page for full booking timeline, hours and payment details.
          </p>
        )}
      </div>
    </section>
  );
}

export default UserDashboard;
