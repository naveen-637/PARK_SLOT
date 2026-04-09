import { Link } from 'react-router-dom';

function Home() {
  return (
    <>
      <section className="container py-10">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] rounded-3xl overflow-hidden border border-[#d1ddd6]">
          <div className="p-10 sm:p-14 bg-[#d9e5de]">
            <p className="uppercase tracking-[0.28em] text-xs text-[#3d5f53] font-bold mb-5">Smart Parking Network</p>
            <h1 className="text-4xl sm:text-6xl font-extrabold leading-tight max-w-4xl text-[#183147]">
              Reserve slots before you reach the street.
            </h1>
            <p className="text-[#446277] mt-6 max-w-2xl text-lg">
              Live availability, instant booking, and secure payments in one clean platform for customers, owners, and admins.
            </p>
            <div className="mt-8 flex gap-3 flex-wrap">
              <Link to="/search" className="btn-primary">Find Parking</Link>
              <Link to="/register" className="btn-outline">Become an Owner</Link>
            </div>
          </div>

          <div className="p-10 sm:p-14 bg-[#f7fbf9] flex flex-col gap-4 justify-center">
            <article className="card">
              <h2 className="text-xl font-semibold mb-2 text-[#1d3850]">Nearby Slots</h2>
              <p className="text-[#5a7081]">Search by city, max rate, and distance from your location.</p>
            </article>
            <article className="card">
              <h2 className="text-xl font-semibold mb-2 text-[#1d3850]">Owner Control</h2>
              <p className="text-[#5a7081]">Add and update slots, pricing, and live availability in seconds.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="container py-2 grid md:grid-cols-3 gap-4">
        <article className="card">
          <h2 className="text-lg font-semibold mb-2 text-[#1d3850]">Search and Compare</h2>
          <p className="text-[#5a7081]">Filter by city, price, and vehicle type with live slot updates.</p>
        </article>
        <article className="card">
          <h2 className="text-lg font-semibold mb-2 text-[#1d3850]">Book and Pay</h2>
          <p className="text-[#5a7081]">Create bookings quickly and complete payments securely.</p>
        </article>
        <article className="card">
          <h2 className="text-lg font-semibold mb-2 text-[#1d3850]">Manage and Grow</h2>
          <p className="text-[#5a7081]">Owners track performance while admins monitor platform health.</p>
        </article>
      </section>
    </>
  );
}

export default Home;
