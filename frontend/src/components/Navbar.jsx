import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

function Navbar() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const isCustomer = token && user?.role !== 'owner' && user?.role !== 'admin';

  const onLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-sm bg-[#edf4f0]/90 border-b border-[#d3dfd8]">
      <div className="container py-4 flex items-center justify-between gap-4">
        <Link to="/" className="inline-flex items-center gap-2 text-xl font-extrabold text-[#113244] tracking-tight">
          <span className="h-8 w-8 rounded-lg bg-[#00a64f] text-white inline-flex items-center justify-center text-sm">P</span>
          Park Slot
        </Link>

        <nav className="flex items-center gap-2 text-sm font-semibold text-[#496176] flex-wrap justify-end">
          {isCustomer && <Link to="/search" className="px-3 py-2 rounded-xl hover:bg-white">Nearby</Link>}
          {isCustomer && (
            <Link to="/dashboard" className="px-3 py-2 rounded-xl hover:bg-white">Dashboard</Link>
          )}
          {isCustomer && <Link to="/history" className="px-3 py-2 rounded-xl hover:bg-white">History</Link>}
          {token && user?.role === 'owner' && (
            <Link to="/owner/dashboard" className="px-3 py-2 rounded-xl hover:bg-white">Owner Dashboard</Link>
          )}
          {token && user?.role === 'admin' && (
            <Link to="/admin/dashboard" className="px-3 py-2 rounded-xl hover:bg-white">Admin</Link>
          )}

          {token ? (
            <button onClick={onLogout} className="btn-outline">Logout</button>
          ) : (
            <>
              <Link to="/login" className="btn-outline">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
