import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { paymentService } from '../services/paymentService.js';

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking;
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const onPay = async () => {
    if (!booking?._id) return;
    setLoading(true);
    try {
      const orderRes = await paymentService.createOrder(booking._id);
      const verifyRes = await paymentService.verify({
        bookingId: booking._id,
        orderId: orderRes.data.order.id,
        success: true
      });
      setResult(verifyRes.data);
    } catch (error) {
      setResult({ error: error.response?.data?.message || 'Payment failed' });
    } finally {
      setLoading(false);
    }
  };

  if (!booking) {
    return (
      <section className="container py-10">
        <p className="text-gray-700">No booking found for checkout.</p>
      </section>
    );
  }

  return (
    <section className="container py-10 max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <div className="card space-y-2">
        <p><strong>Booking:</strong> {booking._id}</p>
        <p><strong>Total:</strong> INR {booking.totalAmount}</p>
      </div>
      <div className="flex gap-3">
        <button onClick={() => navigate(-1)} className="btn-outline">Back</button>
        <button onClick={onPay} className="btn-primary" disabled={loading}>
          {loading ? 'Processing...' : 'Pay and Confirm'}
        </button>
      </div>
      {result && (
        <pre className="card overflow-x-auto text-sm">{JSON.stringify(result, null, 2)}</pre>
      )}
    </section>
  );
}

export default Checkout;
