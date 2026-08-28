import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { formatRupiah, formatDate } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';
import {
  TrendingUp, Coffee, ArrowUpRight, 
  BarChart3, Clock, Sparkles, ShoppingBag
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <div className="stat-card bg-white border border-[#EAE3D9] rounded-3xl p-5 shadow-soft hover:shadow-card transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2.5 rounded-2xl bg-cream-200 text-coffee-800 border border-cream-300">
          <Icon size={20} />
        </div>
        <ArrowUpRight size={16} className="text-coffee-400" />
      </div>
      <p className="text-2xl font-extrabold text-coffee-950 font-display mb-0.5">{value}</p>
      <p className="text-xs font-bold text-coffee-800">{title}</p>
      {subtitle && <p className="text-[11px] text-coffee-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <div className="bg-coffee-900 text-white rounded-2xl p-3 shadow-xl border border-coffee-700 text-xs">
        <p className="text-amber-200/70 mb-1">{label}</p>
        <p className="text-sm font-bold text-white">{formatRupiah(payload[0].value)}</p>
        <p className="text-[11px] text-amber-100/80">{payload[1]?.value} Transaksi</p>
      </div>
    );
  }
  return null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats')
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat Pagi';
    if (h < 17) return 'Selamat Siang';
    return 'Selamat Malam';
  };

  if (loading) {
    return (
      <div className="space-y-6 w-full font-sans">
        <div className="skeleton h-20 w-full rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-3xl" />)}
        </div>
        <div className="skeleton h-64 rounded-3xl" />
      </div>
    );
  }

  const chartData = stats?.revenue_chart?.map(d => ({
    date: new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: '2-digit' }).format(new Date(d.date)),
    revenue: d.revenue,
    transactions: d.transactions,
  })) || [];

  return (
    <div className="space-y-6 animate-fadeIn font-sans w-full">
      
      {/* Banner Greeting Header */}
      <div className="bg-white border border-[#EAE3D9] rounded-3xl p-6 sm:p-8 shadow-card flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cream-200 text-coffee-800 text-xs font-bold mb-2">
            <Coffee size={14} className="text-coffee-700" /> Coffee Shop Kasir Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-coffee-950">
            {greeting()}, <span className="text-coffee-700">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-coffee-600 text-xs sm:text-sm mt-1">
            Ringkasan transaksi kasir dan kinerja penjualan coffee shop hari ini
          </p>
        </div>
        <Link to="/transaction" className="btn-primary flex items-center gap-2 text-sm font-semibold shadow-md">
          <ShoppingBag size={18} />
          <span>Buka Kasir Sekarang</span>
        </Link>
      </div>

      {/* Stats Grid Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pendapatan Hari Ini"
          value={formatRupiah(stats?.today?.revenue || 0)}
          subtitle={`${stats?.today?.transactions || 0} Transaksi Selesai`}
          icon={TrendingUp}
        />
        <StatCard
          title="Pendapatan Bulan Ini"
          value={formatRupiah(stats?.this_month?.revenue || 0)}
          subtitle={`${stats?.this_month?.transactions || 0} Total Transaksi`}
          icon={BarChart3}
        />
        <StatCard
          title="Total Katalog Menu"
          value={stats?.total_products || 0}
          subtitle="Menu kopi & sajian aktif"
          icon={Coffee}
        />
        <StatCard
          title="Fitur AI Gemini"
          value="Aktif"
          subtitle="Auto-generate & edit deskripsi"
          icon={Sparkles}
        />
      </div>

      {/* Chart & Top Selling Section */}
      <div className="grid lg:grid-cols-12 gap-6">
        
        {/* Revenue Chart (8 cols) */}
        <div className="lg:col-span-8 card bg-white border border-[#EAE3D9] rounded-3xl p-6 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-coffee-950 text-base font-display">Grafik Pendapatan Penjualan</h2>
              <p className="text-xs text-coffee-500 mt-0.5">Tren omzet 7 hari terakhir</p>
            </div>
            <span className="badge bg-cream-200 text-coffee-800 text-xs">7 Hari Terakhir</span>
          </div>

          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6F4E2B" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#6F4E2B" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0E9DF" />
                <XAxis dataKey="date" tick={{ fill: '#6F4E2B', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6F4E2B', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#4A2E2B" strokeWidth={2.5}
                  fill="url(#revenueGrad)" dot={{ fill: '#4A2E2B', r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-coffee-400 text-xs bg-[#FAF7F2] rounded-2xl border border-dashed border-[#EBE4D8]">
              Belum ada data transaksi penjualan minggu ini
            </div>
          )}
        </div>

        {/* Top Products (4 cols) */}
        <div className="lg:col-span-4 card bg-white border border-[#EAE3D9] rounded-3xl p-6 shadow-soft">
          <h2 className="font-bold text-coffee-950 text-base font-display mb-0.5">Menu Terlaris</h2>
          <p className="text-xs text-coffee-500 mb-4">Produk paling favorit pelanggan</p>
          
          <div className="space-y-3">
            {(stats?.top_products || []).length === 0 ? (
              <p className="text-xs text-coffee-400 text-center py-10">Belum ada data penjualan</p>
            ) : (
              stats.top_products.map((p, i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-2xl bg-[#FAF7F2] border border-[#EBE4D8]">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold shadow-2xs ${
                    i === 0 ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-white text-coffee-800 border border-cream-300'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-coffee-950 truncate font-display">{p.name}</p>
                    <p className="text-[10px] text-coffee-500">{p.total_sold} Cup Terjual</p>
                  </div>
                  <span className="text-xs font-bold text-coffee-800">{formatRupiah(p.total_revenue)}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Recent Transactions */}
      <div className="card bg-white border border-[#EAE3D9] rounded-3xl p-6 shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-coffee-700" />
            <h2 className="font-bold text-coffee-950 font-display text-base">Transaksi Terbaru</h2>
          </div>
          <Link to="/history" className="text-xs font-bold text-coffee-700 hover:text-coffee-950 transition-colors">
            Lihat Semua Riwayat →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-wider text-coffee-500 border-b border-[#F0E9DF]">
                <th className="pb-3 font-semibold">Kode Transaksi</th>
                <th className="pb-3 font-semibold">Kasir</th>
                <th className="pb-3 font-semibold">Total Belanja</th>
                <th className="pb-3 font-semibold hidden sm:table-cell">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0E9DF]">
              {(stats?.recent_transactions || []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-xs text-coffee-400">Belum ada transaksi recorded</td>
                </tr>
              ) : (
                stats.recent_transactions.map((t, i) => (
                  <tr key={i} className="text-xs hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3 pr-4 font-mono font-bold text-coffee-800">{t.transaction_code}</td>
                    <td className="py-3 pr-4 text-coffee-900 font-medium">{t.cashier_name}</td>
                    <td className="py-3 pr-4 font-bold text-coffee-950">{formatRupiah(t.total_amount)}</td>
                    <td className="py-3 text-coffee-500 hidden sm:table-cell">{formatDate(t.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
