import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaApple, FaFacebookF, FaGoogle, FaLinkedinIn } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth.js';

function Login() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [keepLoggedIn, setKeepLoggedIn] = useState(true);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await login(form);
      toast.success('Login successful');

      if (response.user?.role === 'owner') {
        navigate('/owner/dashboard');
      } else if (response.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/search');
      }
    } catch (loginError) {
      toast.error(loginError.message || 'Unable to login');
    }
  };

  const onForgotPassword = () => {
    toast('Forgot password flow will be added soon.', { icon: 'i' });
  };

  return (
    <section className="container py-8">
      <div className="auth-shell">
        <aside className="auth-left">
          <div className="auth-left-plate">
            <span className="text-6xl sm:text-7xl font-black tracking-tight text-[#163346]">P</span>
          </div>
          <h1 className="text-4xl sm:text-5xl leading-tight font-extrabold text-[#193147]">Park smarter every day.</h1>
          <p className="text-[#496176] mt-4 text-lg max-w-lg">
            Join drivers and parking owners using Park Slot to discover nearby spaces, compare rates, and book faster.
          </p>
          <p className="text-sm text-[#496176] mt-6">
            Need help signing in? <button type="button" className="font-semibold underline" onClick={onForgotPassword}>Get support</button>
          </p>
        </aside>

        <div className="auth-right">
          <div className="auth-card">
            <div className="auth-tabs">
              <Link to="/register" className="auth-tab">Sign Up</Link>
              <span className="auth-tab auth-tab-active">Log In</span>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-6">
              <button type="button" className="auth-social-btn" aria-label="Login with Facebook"><FaFacebookF /></button>
              <button type="button" className="auth-social-btn" aria-label="Login with Apple"><FaApple /></button>
              <button type="button" className="auth-social-btn" aria-label="Login with Google"><FaGoogle /></button>
              <button type="button" className="auth-social-btn" aria-label="Login with LinkedIn"><FaLinkedinIn /></button>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#8392a1] mb-6">
              <span className="h-px bg-[#d9e1e7] flex-1" />
              <span>OR</span>
              <span className="h-px bg-[#d9e1e7] flex-1" />
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
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
                <label className="label">Password</label>
                <input
                  name="password"
                  type="password"
                  className="input-field"
                  value={form.password}
                  onChange={onChange}
                  placeholder="Password"
                  required
                />
              </div>

              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="inline-flex items-center gap-2 text-[#4f6477]">
                  <input
                    type="checkbox"
                    checked={keepLoggedIn}
                    onChange={(event) => setKeepLoggedIn(event.target.checked)}
                  />
                  Keep me logged in
                </label>
                <button type="button" className="text-[#008f47] font-semibold" onClick={onForgotPassword}>Forgot Password?</button>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'LOG IN'}
              </button>

              <div className="pt-4 border-t border-[#dbe3e9] text-sm text-[#4f6477] text-center space-y-2">
                <p>
                  Don&apos;t have an account? <Link to="/register" className="font-semibold text-[#008f47]">Sign Up</Link>
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

export default Login;
