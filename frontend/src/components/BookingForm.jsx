import { useState } from 'react';

const formatDateTimeLocal = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const addOneHour = (dateTimeValue) => {
  const date = new Date(dateTimeValue);
  if (Number.isNaN(date.getTime())) {
    const fallback = new Date();
    fallback.setHours(fallback.getHours() + 1);
    return formatDateTimeLocal(fallback);
  }

  date.setHours(date.getHours() + 1);
  return formatDateTimeLocal(date);
};

function BookingForm({ onSubmit, isSubmitting, maxSlot }) {
  const now = new Date();
  const defaultCheckInDate = new Date(now.getTime() + 60 * 60 * 1000);
  const defaultCheckOutDate = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const minDateTime = formatDateTimeLocal(now);

  const [slotNumber, setSlotNumber] = useState(1);
  const [checkInTime, setCheckInTime] = useState(formatDateTimeLocal(defaultCheckInDate));
  const [checkOutTime, setCheckOutTime] = useState(formatDateTimeLocal(defaultCheckOutDate));
  const [validationError, setValidationError] = useState('');

  const submit = (event) => {
    event.preventDefault();

    const checkInDate = new Date(checkInTime);
    const checkOutDate = new Date(checkOutTime);

    if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
      setValidationError('Please select valid check-in and check-out date/time values.');
      return;
    }

    if (checkOutDate <= checkInDate) {
      setValidationError('Check-out time must be after check-in time.');
      return;
    }

    if (maxSlot && Number(slotNumber) > Number(maxSlot)) {
      setValidationError(`Slot number must be between 1 and ${maxSlot}.`);
      return;
    }

    setValidationError('');

    onSubmit({
      slotNumber: Number(slotNumber),
      checkInTime: checkInDate.toISOString(),
      checkOutTime: checkOutDate.toISOString()
    });
  };

  const onCheckInChange = (value) => {
    setCheckInTime(value);

    const checkInDate = new Date(value);
    const checkOutDate = new Date(checkOutTime);

    if (!Number.isNaN(checkInDate.getTime()) && !Number.isNaN(checkOutDate.getTime()) && checkOutDate <= checkInDate) {
      setCheckOutTime(addOneHour(value));
    }
  };

  return (
    <form onSubmit={submit} className="card space-y-4">
      <h3 className="text-lg font-semibold">Reserve This Slot</h3>
      <div>
        <label className="label">Slot Number</label>
        <input
          type="number"
          min="1"
          max={maxSlot || undefined}
          className="input-field"
          value={slotNumber}
          onChange={(event) => setSlotNumber(event.target.value)}
          required
        />
        {maxSlot ? <p className="text-xs text-gray-500 mt-1">Available slot range: 1 to {maxSlot}</p> : null}
      </div>
      <div>
        <label className="label">Check In</label>
        <input
          type="datetime-local"
          className="input-field"
          value={checkInTime}
          min={minDateTime}
          step="60"
          onChange={(event) => onCheckInChange(event.target.value)}
          required
        />
      </div>
      <div>
        <label className="label">Check Out</label>
        <input
          type="datetime-local"
          className="input-field"
          value={checkOutTime}
          min={checkInTime || minDateTime}
          step="60"
          onChange={(event) => setCheckOutTime(event.target.value)}
          required
        />
      </div>
      {validationError && <p className="text-sm text-red-600">{validationError}</p>}
      <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating Booking...' : 'Book Now'}
      </button>
    </form>
  );
}

export default BookingForm;
