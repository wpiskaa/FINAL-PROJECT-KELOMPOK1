import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { Coffee, Eye, EyeOff, Lock, Mail, Sparkles, UserCheck, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [roleTab, setRoleTab] = useState('admin');
  const [form, setForm] = useState({
    email: 'admin@coffeeshop.com',
    password: 'admin123'
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleRoleSwitch(role) {
    setRoleTab(role);
    if (role === 'admin') {
      setForm({ email: 'admin@coffeeshop.com', password: 'admin123' });
    } else {
      setForm({ email: 'kasir@coffeeshop.com', password: 'kasir123' });
    }
  }

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
    <div className="min-h-screen bg-[#F4EFEA] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid lg:grid-cols-12 min-h-[580px] border border-[#EAE3D9]">
        
        {/* Left Side — Dark Coffee Brand Panel (Farmaku Left Banner) */}
        <div className="lg:col-span-6 bg-[#3A2213] text-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#5C3B24] rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#7C4E2D] rounded-full blur-3xl opacity-40" />

          {/* Top Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-md">
              <Coffee size={24} className="text-[#F3E5D8]" />
            </div>
            <div>
              <span className="font-bold text-xl text-white tracking-wide font-display">BrewMate POS</span>
              <p className="text-xs text-[#E4DACC]">Coffee POS & Gemini AI</p>
            </div>
          </div>

          {/* Center Text */}
          <div className="relative z-10 my-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#F7EFE5] text-xs font-semibold">
              <Sparkles size={14} className="text-amber-300" />
              Powered by Google Gemini AI
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-display leading-tight text-white">
              Sistem Kasir Coffee Shop Modern & Serba Otomatis.
            </h2>
            <p className="text-[#E8DCCF] text-sm leading-relaxed max-w-md">
              Kelola transaksi kasir, katalog produk, dan buat deskripsi menu otomatis dengan bantuan kecerdasan buatan.
            </p>
          </div>

          {/* Footer */}
          <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-xs text-[#D8C7B4]">
            <span>© 2026 BrewMate POS — Kelompok 1</span>
            <span>Kasir & AI System</span>
          </div>
        </div>

        {/* Right Side — Clean White Form Panel (Farmaku Right Login) */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-sm mx-auto w-full space-y-6">
            
            <div>
              <h3 className="text-2xl font-bold text-[#2D1C10] font-display">Selamat Datang!</h3>
              <p className="text-xs text-[#6F4E2B] mt-1 font-medium">Pilih peran akun untuk masuk ke sistem POS</p>
            </div>

            {/* Farmaku Role Tab Switcher */}
            <div className="p-1 bg-[#F5F0E8] rounded-2xl flex border border-[#E4DACC]">
              <button
                type="button"
                onClick={() => handleRoleSwitch('admin')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  roleTab === 'admin'
                    ? 'bg-[#3A2213] text-white shadow-sm'
                    : 'text-[#5C3B24] hover:text-[#2D1C10]'
                }`}
              >
                <ShieldCheck size={15} />
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleRoleSwitch('kasir')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  roleTab === 'kasir'
                    ? 'bg-[#3A2213] text-white shadow-sm'
                    : 'text-[#5C3B24] hover:text-[#2D1C10]'
                }`}
              >
                <UserCheck size={15} />
                Kasir
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2D1C10] mb-1.5" htmlFor="login-email">
                  Email
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C6438]" />
                  <input
                    id="login-email"
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="nama@coffeeshop.com"
                    className="input-field pl-10 text-sm"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D1C10] mb-1.5" htmlFor="login-password">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C6438]" />
                  <input
                    id="login-password"
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    placeholder="••••••••"
                    className="input-field pl-10 pr-12 text-sm"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C6438] hover:text-[#2D1C10] transition-colors"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                id="login-submit-btn"
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-bold shadow-md"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memproses Login...</span>
                  </>
                ) : (
                  <>
                    <Coffee size={18} />
                    <span>Masuk ke POS</span>
                  </>
                )}
              </button>
            </form>

            {/* Selected Demo Account Info */}
            <div className="p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D9] text-xs space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#2D1C10]">Akun Terpilih:</span>
                <span className="badge bg-[#EFE6D8] text-[#3D2616] font-mono text-[11px]">
                  {roleTab === 'admin' ? 'admin@coffeeshop.com' : 'kasir@coffeeshop.com'}
                </span>
              </div>
              <p className="text-[11px] text-[#6F4E2B]">Password: <span className="font-mono font-bold text-[#2D1C10]">{roleTab === 'admin' ? 'admin123' : 'kasir123'}</span></p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
