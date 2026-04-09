import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import BookingForm from '../components/BookingForm.jsx';
import PaymentModal from '../components/PaymentModal.jsx';
import { useParking } from '../hooks/useParking.js';
import { useBooking } from '../hooks/useBooking.js';
import { paymentService } from '../services/paymentService.js';
import { parkingService } from '../services/parkingService.js';
import { bookingService } from '../services/bookingService.js';
import { useAuth } from '../hooks/useAuth.js';

function ParkingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selected, loading, loadParkingById } = useParking();
  const { createBooking, loading: bookingLoading } = useBooking();
  const { token } = useAuth();
  const [latestBooking, setLatestBooking] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paying, setPaying] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    loadParkingById(id);
  }, [id, loadParkingById]);

  const onCreateBooking = async (payload) => {
    if (!token) {
      toast.error('Please login to create booking');
      navigate('/login');
      return;
    }

    let bookingPayload = { ...payload };

    try {
      const availability = await bookingService.checkAvailability(
        id,
        payload.checkInTime,
        payload.checkOutTime,
        payload.slotNumber
      );

      const takenSlots = availability?.data?.takenSlots || [];
      const isRequestedSlotTaken = takenSlots.includes(Number(payload.slotNumber));

      if (isRequestedSlotTaken) {
        const maxSlots = Number(selected?.totalSlots || 0);
        const suggestedSlot = Array.from({ length: maxSlots }, (_, index) => index + 1)
          .find((slot) => !takenSlots.includes(slot));

        if (suggestedSlot) {
          bookingPayload = { ...payload, slotNumber: suggestedSlot };
          toast(`Slot ${payload.slotNumber} was busy. Using available slot ${suggestedSlot}.`, { icon: 'ℹ️' });
        } else {
          toast.error('No slots are available for the selected time range.');
          return;
        }
      }
    } catch (availabilityError) {
      const availabilityMessage =
        availabilityError.response?.data?.message ||
        availabilityError.response?.data?.error?.message ||
        availabilityError.message ||
        'Unable to validate slot availability';

      toast.error(availabilityMessage);
      return;
    }

    const response = await createBooking({ ...bookingPayload, parkingId: id });

    if (response.meta.requestStatus === 'fulfilled') {
      const booking = response.payload;
      setLatestBooking(booking);
      setShowPayment(true);
      toast.success('Slot booked. Complete payment to confirm booking.');
    } else {
      const message =
        response.payload?.message ||
        response.payload?.error?.message ||
        response.payload ||
        'Could not create booking';

      toast.error(message);
    }
  };

  const onPay = async () => {
    if (!latestBooking?._id) return;

    setPaying(true);
    try {
      const orderRes = await paymentService.createOrder(latestBooking._id);
      await paymentService.verify({
        bookingId: latestBooking._id,
        orderId: orderRes.data.order.id,
        success: true
      });
      toast.success('Booking confirmed successfully');
      setShowPayment(false);
      navigate('/history');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  const submitReview = async (event) => {
    event.preventDefault();
    if (!token) {
      toast.error('Login required to submit review');
      return;
    }

    try {
      await parkingService.addReview(id, review);
      toast.success('Review submitted');
      setReview({ rating: 5, comment: '' });
      loadParkingById(id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not submit review');
    }
  };

  if (loading && !selected) {
    return <section className="container py-10">Loading parking details...</section>;
  }

  if (!selected) {
    return <section className="container py-10">Parking not found.</section>;
  }

  const image = selected.images?.[0] || 'https://dummyimage.com/1000x500/e5e7eb/111827.jpg&text=Parking';

  return (
    <section className="container py-10 space-y-6">
      <img src={image} alt={selected.title} className="w-full h-72 object-cover rounded-xl" />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="card">
            <h1 className="text-3xl font-bold mb-2">{selected.title}</h1>
            <p className="text-gray-600 mb-1">{selected.address}, {selected.city}</p>
            <p className="text-gray-700 mb-2">{selected.description}</p>
            <div className="flex flex-wrap gap-2">
              {selected.amenities?.map((item) => (
                <span key={item} className="px-3 py-1 rounded-full bg-gray-100 text-sm">{item}</span>
              ))}
            </div>
            <div className="mt-4 grid sm:grid-cols-3 gap-3">
              <p><strong>Price:</strong> INR {selected.pricePerHour}/hour</p>
              <p><strong>Slots:</strong> {selected.availableSlots}/{selected.totalSlots}</p>
              <p><strong>Rating:</strong> {Number(selected.ratings || 0).toFixed(1)}</p>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold mb-3">Reviews</h2>
            <form onSubmit={submitReview} className="space-y-3 mb-4">
              <select
                className="input-field"
                value={review.rating}
                onChange={(event) => setReview((prev) => ({ ...prev, rating: Number(event.target.value) }))}
              >
                {[5, 4, 3, 2, 1].map((num) => (
                  <option key={num} value={num}>{num} Star</option>
                ))}
              </select>
              <textarea
                className="input-field"
                rows="3"
                placeholder="Write your review"
                value={review.comment}
                onChange={(event) => setReview((prev) => ({ ...prev, comment: event.target.value }))}
              />
              <button className="btn-primary" type="submit">Submit Review</button>
            </form>

            <div className="space-y-3">
              {selected.reviews?.length ? (
                selected.reviews.map((item) => (
                  <article key={item._id} className="border border-gray-200 rounded-lg p-3">
                    <p className="font-semibold">{item.userId?.name || 'Anonymous'} - {item.rating}/5</p>
                    <p className="text-gray-600 text-sm">{item.comment || 'No comment'}</p>
                  </article>
                ))
              ) : (
                <p className="text-gray-600">No reviews yet.</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <BookingForm onSubmit={onCreateBooking} isSubmitting={bookingLoading} maxSlot={selected.totalSlots} />
        </div>
      </div>

      <PaymentModal
        booking={latestBooking}
        open={showPayment}
        loading={paying}
        onPay={onPay}
        onClose={() => setShowPayment(false)}
      />
    </section>
  );
}

export default ParkingDetail;
