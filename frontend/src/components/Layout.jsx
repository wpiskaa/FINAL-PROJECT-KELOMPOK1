import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import TeamInfoModal from './TeamInfoModal';
import {
  LayoutDashboard, Coffee, ShoppingCart, History,
  LogOut, Menu, Sparkles, ChevronRight, User, Info
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/products', icon: Coffee, label: 'Katalog Menu' },
  { to: '/transaction', icon: ShoppingCart, label: 'Kasir & Transaksi' },
  { to: '/history', icon: History, label: 'Riwayat Penjualan' },
];

const teamMembers = [
  { nama: 'Safira Dwi Khairunisa', nim: '20240140173', role: 'Project Lead / Frontend' },
  { nama: 'Anneira Nur Khairani', nim: '20240140178', role: 'Frontend Developer' },
  { nama: 'Rossa Kayla Isma Aziz', nim: '20240140215', role: 'UI/UX & Testing' },
  { nama: 'Ilham Saputra', nim: '20240140118', role: 'Backend & Database' },
  { nama: 'Hafiz Kurniawan', nim: '20240140024', role: 'Backend & UI Research' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen bg-[#F7F4EF] overflow-hidden font-sans text-[#2D1C10]">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-[#1D1208]/40 backdrop-blur-xs z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-[#EAE3D9] 
        flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-sm
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div>
          {/* Brand Logo Header */}
          <div className="p-6 border-b border-[#F0E9DF]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#3A2213] rounded-2xl flex items-center justify-center shadow-md">
                <Coffee size={20} className="text-[#F3E5D8]" />
              </div>
              <div>
                <h1 className="font-bold text-lg font-display text-[#2D1C10] tracking-tight">BrewMate</h1>
                <p className="text-[11px] text-[#6F4E2B] font-semibold">Coffee Shop POS System</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <div className="p-4">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#8C6438] mb-2">Menu Utama</p>
            <nav className="space-y-1">
              {navItems.map(({ to, icon: Icon, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-semibold text-sm
                    ${isActive
                      ? 'bg-[#3A2213] text-white shadow-md shadow-black/10'
                      : 'text-[#5C3B24] hover:text-[#2D1C10] hover:bg-[#F5F0E8]'
                    }
                  `}
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={18} className={isActive ? 'text-[#F3E5D8]' : 'text-[#8C6438]'} />
                      <span>{label}</span>
                      {isActive && <ChevronRight size={14} className="ml-auto text-[#F3E5D8]" />}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-[#F0E9DF] space-y-3 bg-[#FAF7F2]">
          {/* Tombol Info Kelompok */}
          <button
            onClick={() => setShowInfoModal(true)}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-white hover:bg-[#F0E9DF] rounded-2xl border border-[#EAE3D9] transition-colors text-left"
          >
            <Info size={16} className="text-[#8C6438] shrink-0" />
            <span className="text-xs font-bold text-[#3D2616]">Info Kelompok & Pengembang</span>
          </button>

          {/* Gemini AI Card */}
          <div className="p-3.5 bg-[#3A2213] rounded-2xl text-white shadow-sm border border-[#5C3B24]">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={14} className="text-amber-300" />
              <span className="text-xs font-bold text-[#F3E5D8]">Gemini AI Assistant</span>
            </div>
            <p className="text-[11px] text-[#E8DCCF] leading-snug">Auto-generate & edit deskripsi menu kopi secara cerdas</p>
          </div>

          {/* User Profile */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 bg-[#EFE6D8] rounded-xl flex items-center justify-center text-[#3D2616] font-bold text-sm">
                <User size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#2D1C10] truncate">{user?.name || 'Kasir Coffee'}</p>
                <p className="text-[10px] text-[#6F4E2B] capitalize font-medium">{user?.role || 'Kasir'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
              title="Keluar"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Right Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="bg-white border-b border-[#EAE3D9] px-6 py-3.5 flex items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-[#5C3B24] hover:text-[#2D1C10] hover:bg-[#F5F0E8] rounded-xl lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <p className="text-xs text-[#6F4E2B] font-medium">
                {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
              </p>
              <h2 className="text-sm font-bold text-[#2D1C10] font-display">BrewMate Cashier Dashboard</h2>
            </div>
          </div>

          {/* Top Right Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF7F2] rounded-xl border border-[#EAE3D9] text-xs font-bold text-[#3D2616]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Sistem Kasir Aktif</span>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      {/* Modal Info Kelompok & Pengembang */}
      <TeamInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        members={teamMembers}
      />
    </div>
  );
}