import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaApple, FaFacebookF, FaGoogle, FaLinkedinIn } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth.js';

function Register() {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'customer'
  });

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim()
    };

    try {
      const response = await register(payload);
      toast.success('Registration successful');

      if (response.user?.role === 'owner') {
        navigate('/owner/dashboard');
      } else if (response.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/search');
      }
    } catch (submitError) {
      toast.error(submitError.message || 'Unable to register');
    }
  };

  return (
    <section className="container py-8">
      <div className="auth-shell">
        <aside className="auth-left">
          <div className="auth-left-plate">
            <span className="text-6xl sm:text-7xl font-black tracking-tight text-[#163346]">P</span>
          </div>
          <h1 className="text-4xl sm:text-5xl leading-tight font-extrabold text-[#193147]">Start your parking journey.</h1>
          <p className="text-[#496176] mt-4 text-lg max-w-lg">
            Create an account to book nearby slots as a customer or manage your listings as an owner.
          </p>
          <p className="text-sm text-[#496176] mt-6">Your account unlocks real-time slot updates, bookings, and payment history.</p>
        </aside>

        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-tabs">
              <span className="auth-tab auth-tab-active">Sign Up</span>
              <Link to="/login" className="auth-tab">Log In</Link>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-6">
              <button type="button" className="auth-social-btn" aria-label="Sign up with Facebook"><FaFacebookF /></button>
              <button type="button" className="auth-social-btn" aria-label="Sign up with Apple"><FaApple /></button>
              <button type="button" className="auth-social-btn" aria-label="Sign up with Google"><FaGoogle /></button>
              <button type="button" className="auth-social-btn" aria-label="Sign up with LinkedIn"><FaLinkedinIn /></button>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#8392a1] mb-6">
              <span className="h-px bg-[#d9e1e7] flex-1" />
              <span>OR</span>
              <span className="h-px bg-[#d9e1e7] flex-1" />
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input
                  name="name"
                  className="input-field"
                  value={form.name}
                  onChange={onChange}
                  minLength={3}
                  placeholder="Full name"
                  required
                />
              </div>
              <div>
                <label className="label">Email</label>
                <input
                  name="email"
                  type="email"
                  className="input-field"
                  value={form.email}
                  onChange={onChange}
                  placeholder="Email"
                  required
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  name="phone"
                  className="input-field"
                  value={form.phone}
                  onChange={onChange}
                  minLength={10}
                  placeholder="Phone number"
                  required
                />
              </div>
              <div>
                <label className="label">Role</label>
                <select name="role" className="input-field" value={form.role} onChange={onChange}>
                  <option value="customer">Customer</option>
                  <option value="owner">Parking Owner</option>
                </select>
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  name="password"
                  type="password"
                  className="input-field"
                  value={form.password}
                  onChange={onChange}
                  minLength={6}
                  placeholder="Password"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'CREATE ACCOUNT'}
              </button>

              <div className="pt-4 border-t border-[#dbe3e9] text-sm text-[#4f6477] text-center space-y-2">
                <p>
                  Already have an account? <Link to="/login" className="font-semibold text-[#008f47]">Log In</Link>
                </p>
                <Link to="/" className="font-semibold underline">Go back to Home</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Register;
