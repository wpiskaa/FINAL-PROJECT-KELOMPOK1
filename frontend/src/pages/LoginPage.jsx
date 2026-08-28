import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { Coffee, Eye, EyeOff, Sparkles, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Email dan password wajib diisi!');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      const { token, user } = res.data.data;
      login(token, user);
      toast.success(`Selamat datang, ${user.name}! ☕`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login gagal. Periksa email & password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fadeIn">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-xl shadow-amber-500/20 mb-4">
            <Coffee size={28} className="text-gray-900" />
          </div>
          <h1 className="text-3xl font-bold font-['Outfit'] gradient-text">BrewMate POS</h1>
          <p className="text-gray-400 mt-1 text-sm">Sistem Kasir Coffee Shop</p>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <Sparkles size={12} className="text-amber-400" />
            <span className="text-xs text-amber-400/80">Powered by Gemini AI</span>
          </div>
        </div>

        {/* Form card */}
        <div className="card glow-amber">
          <h2 className="text-xl font-semibold text-gray-100 mb-6">Masuk ke Sistem</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="login-email">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="login-email"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="admin@coffeeshop.com"
                  className="input-field pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="login-password">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="input-field pl-10 pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <Coffee size={16} />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <p className="text-xs text-gray-400 font-medium mb-2">Demo Credentials:</p>
            <div className="space-y-1.5 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Admin:</span>
                <span className="font-mono text-gray-400">admin@coffeeshop.com / admin123</span>
              </div>
              <div className="flex justify-between">
                <span>Kasir:</span>
                <span className="font-mono text-gray-400">kasir@coffeeshop.com / kasir123</span>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-6">
          © 2024 BrewMate POS — Kelompok 1 PAW
        </p>
      </div>
    </div>
  );
}
