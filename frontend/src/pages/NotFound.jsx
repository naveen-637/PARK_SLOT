import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <section className="container py-16 text-center">
      <h2 className="text-3xl font-bold mb-3">404</h2>
      <p className="text-gray-600 mb-6">The page you are looking for does not exist.</p>
      <Link to="/" className="btn-primary">Go Home</Link>
    </section>
  );
}

export default NotFound;
