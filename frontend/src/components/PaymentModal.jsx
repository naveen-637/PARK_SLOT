function PaymentModal({ booking, open, loading, onPay, onClose }) {
  if (!open || !booking) return null;

  const bookingData = booking.data || booking;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-xl p-6 space-y-4">
        <h3 className="text-xl font-semibold">Complete Payment</h3>
        <p className="text-sm text-gray-600">Booking ID: {bookingData._id || 'Pending'}</p>
        <p className="text-sm text-gray-600">Amount: INR {bookingData.totalAmount || 0}</p>
        <div className="flex gap-2">
          <button className="btn-outline w-full" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-primary w-full" onClick={onPay} disabled={loading}>
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
