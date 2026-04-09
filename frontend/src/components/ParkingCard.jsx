import { Link } from 'react-router-dom';

function ParkingCard({ parking }) {
  const image = parking.images?.[0] || 'https://dummyimage.com/600x400/e5e7eb/111827.jpg&text=Parking';

  return (
    <article className="card overflow-hidden p-0">
      <img src={image} alt={parking.title} className="h-44 w-full object-cover" />
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold">{parking.title}</h3>
          <div className="flex flex-col items-end gap-1">
            {parking.isSuggested && (
              <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                Suggested for you
              </span>
            )}
            <span className="text-sm px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
              {parking.availableSlots} slots
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600">{parking.address}, {parking.city}</p>
        {typeof parking.distanceKm === 'number' && (
          <p className="text-sm text-emerald-700 font-medium">{parking.distanceKm} km away</p>
        )}
        <p className="text-sm text-gray-600">Rating: {Number(parking.ratings || 0).toFixed(1)}</p>
        <div className="flex items-center justify-between">
          <p className="font-bold text-primary">INR {parking.pricePerHour}/hour</p>
          <Link to={`/parking/${parking._id}`} className="btn-primary">View</Link>
        </div>
      </div>
    </article>
  );
}

export default ParkingCard;
