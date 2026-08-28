import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { formatRupiah, formatDate } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';
import {
  TrendingUp, Coffee, ShoppingBag, ArrowUpRight, 
  BarChart3, Clock, Package, Sparkles
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

function StatCard({ title, value, subtitle, icon: Icon, color = 'amber' }) {
  const colors = {
    amber: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    green: 'text-green-400 bg-green-400/10 border-green-400/20',
    blue: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    purple: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  };

  return (
    <div className="stat-card animate-fadeIn">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-2.5 rounded-xl border ${colors[color]}`}>
          <Icon size={18} className={colors[color].split(' ')[0]} />
        </div>
        <ArrowUpRight size={16} className="text-gray-600" />
      </div>
      <p className="text-2xl font-bold text-gray-100 mb-1">{value}</p>
      <p className="text-sm font-medium text-gray-300">{title}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload?.length) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-3 shadow-xl">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="text-sm font-semibold text-amber-400">{formatRupiah(payload[0].value)}</p>
        <p className="text-xs text-gray-500">{payload[1]?.value} transaksi</p>
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
      <div className="space-y-6">
        <div className="skeleton h-20 w-full rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );
  }

  const chartData = stats?.revenue_chart?.map(d => ({
    date: new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: '2-digit' }).format(new Date(d.date)),
    revenue: d.revenue,
    transactions: d.transactions,
  })) || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-gray-100">
            {greeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
          </p>
        </div>
        <Link to="/transaction" className="btn-primary flex items-center gap-2 hidden sm:flex">
          <ShoppingBag size={16} />
          <span>Transaksi Baru</span>
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pendapatan Hari Ini"
          value={formatRupiah(stats?.today?.revenue || 0)}
          subtitle={`${stats?.today?.transactions || 0} transaksi`}
          icon={TrendingUp}
          color="amber"
        />
        <StatCard
          title="Pendapatan Bulan Ini"
          value={formatRupiah(stats?.this_month?.revenue || 0)}
          subtitle={`${stats?.this_month?.transactions || 0} transaksi`}
          icon={BarChart3}
          color="green"
        />
        <StatCard
          title="Total Menu Aktif"
          value={stats?.total_products || 0}
          subtitle="Produk tersedia"
          icon={Coffee}
          color="blue"
        />
        <StatCard
          title="Fitur AI Aktif"
          value="Gemini"
          subtitle="Auto-generate deskripsi"
          icon={Sparkles}
          color="purple"
        />
      </div>

      {/* Chart + Top Products */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-semibold text-gray-100">Grafik Pendapatan</h2>
              <p className="text-xs text-gray-500 mt-0.5">7 hari terakhir</p>
            </div>
            <div className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BarChart3 size={12} className="mr-1" />
              Revenue
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2}
                  fill="url(#revenueGrad)" dot={{ fill: '#f59e0b', r: 3 }} />
                <Area type="monotone" dataKey="transactions" stroke="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-600 text-sm">
              Belum ada data transaksi
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="card">
          <h2 className="font-semibold text-gray-100 mb-1">Menu Terlaris</h2>
          <p className="text-xs text-gray-500 mb-4">Semua waktu</p>
          <div className="space-y-3">
            {(stats?.top_products || []).length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-8">Belum ada penjualan</p>
            ) : (
              stats.top_products.map((p, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${i === 0 ? 'bg-amber-500/20 text-amber-400' : 
                      i === 1 ? 'bg-gray-700 text-gray-300' :
                      'bg-gray-800 text-gray-500'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-200 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.total_sold} terjual</p>
                  </div>
                  <span className="text-xs font-medium text-amber-400">{formatRupiah(p.total_revenue)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-gray-400" />
            <h2 className="font-semibold text-gray-100">Transaksi Terbaru</h2>
          </div>
          <Link to="/history" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
            Lihat Semua →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500 border-b border-gray-800">
                <th className="pb-3 font-medium">Kode</th>
                <th className="pb-3 font-medium">Kasir</th>
                <th className="pb-3 font-medium">Total</th>
                <th className="pb-3 font-medium hidden sm:table-cell">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {(stats?.recent_transactions || []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-sm text-gray-600">Belum ada transaksi</td>
                </tr>
              ) : (
                stats.recent_transactions.map((t, i) => (
                  <tr key={i} className="text-sm hover:bg-gray-800/30 transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs text-amber-400">{t.transaction_code}</td>
                    <td className="py-3 pr-4 text-gray-300">{t.cashier_name}</td>
                    <td className="py-3 pr-4 font-medium text-gray-100">{formatRupiah(t.total_amount)}</td>
                    <td className="py-3 text-gray-500 hidden sm:table-cell text-xs">{formatDate(t.created_at)}</td>
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
