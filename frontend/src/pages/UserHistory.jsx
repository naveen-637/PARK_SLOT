import { useEffect, useMemo, useState } from 'react';
import { useBooking } from '../hooks/useBooking.js';
import { paymentService } from '../services/paymentService.js';

const toHours = (booking) => {
  if (booking.totalHours) {
    return Number(booking.totalHours);
  }

  if (!booking.checkInTime || !booking.checkOutTime) {
    return 0;
  }

  const start = new Date(booking.checkInTime).getTime();
  const end = new Date(booking.checkOutTime).getTime();
  const diff = end - start;

  if (Number.isNaN(diff) || diff <= 0) {
    return 0;
  }

  return Number((diff / (1000 * 60 * 60)).toFixed(2));
};

const formatDateTime = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleString();
};

function UserHistory() {
  const { items, loading, loadMyBookings } = useBooking();
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);

  useEffect(() => {
    loadMyBookings();
    setPaymentsLoading(true);
    paymentService
      .getHistory()
      .then((res) => setPayments(res.data || []))
      .finally(() => setPaymentsLoading(false));
  }, [loadMyBookings]);

  const totals = useMemo(() => {
    const bookingCount = items.length;
    const totalHours = items.reduce((sum, booking) => sum + toHours(booking), 0);
    const totalAmount = items.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

    return {
      bookingCount,
      totalHours: Number(totalHours.toFixed(2)),
      totalAmount
    };
  }, [items]);

  return (
    <section className="container py-10 space-y-6">
      <h1 className="text-3xl font-bold">Booking & Payment History</h1>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">Bookings</p>
          <p className="text-3xl font-bold">{totals.bookingCount}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Hours</p>
          <p className="text-3xl font-bold">{totals.totalHours}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">Total Amount</p>
          <p className="text-3xl font-bold">INR {totals.totalAmount}</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-3">Booking History</h2>
        {loading && <p>Loading bookings...</p>}
        {!loading && !items.length && <p className="text-gray-600">No bookings yet.</p>}

        <div className="space-y-3">
          {items.map((item) => (
            <article key={item._id} className="border border-gray-200 rounded-lg p-3">
              <p className="font-semibold">{item.parkingId?.title || 'Parking'}</p>
              <p className="text-sm text-gray-600">Slot: {item.slotNumber} | Amount: INR {item.totalAmount}</p>
              <p className="text-sm text-gray-600">Hours: {toHours(item)} | Status: {item.bookingStatus} | Payment: {item.paymentStatus}</p>
              <p className="text-sm text-gray-600">From: {formatDateTime(item.checkInTime)}</p>
              <p className="text-sm text-gray-600">To: {formatDateTime(item.checkOutTime)}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-3">Payment History</h2>
        {paymentsLoading && <p>Loading payments...</p>}
        {!paymentsLoading && !payments.length && <p className="text-gray-600">No payments yet.</p>}

        <div className="space-y-3">
          {payments.map((item) => (
            <article key={item._id} className="border border-gray-200 rounded-lg p-3">
              <p className="font-semibold">Transaction: {item.transactionId || item.orderId || 'Pending'}</p>
              <p className="text-sm text-gray-600">Amount: INR {item.amount} | Status: {item.status}</p>
              <p className="text-sm text-gray-600">Time: {formatDateTime(item.createdAt)}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default UserHistory;
