import { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatRupiah, formatDate } from '../utils/formatters';
import { History, ChevronDown, ChevronUp, Search, Calendar } from 'lucide-react';

export default function HistoryPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [dateFilter, setDateFilter] = useState('');

  function load() {
    const params = { limit: 50 };
    if (dateFilter) params.date = dateFilter;
    api.get('/transactions', { params })
      .then(res => setTransactions(res.data.data.transactions))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [dateFilter]);

  const totalRevenue = transactions.reduce((s, t) => s + t.total_amount, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-gray-100">Riwayat Transaksi</h1>
          <p className="text-gray-500 text-sm mt-1">
            {transactions.length} transaksi
            {dateFilter ? ` pada ${dateFilter}` : ''} • Total: {formatRupiah(totalRevenue)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="input-field w-auto text-sm"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="btn-secondary text-xs px-3 py-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
        </div>
      ) : transactions.length === 0 ? (
        <div className="card text-center py-16">
          <History size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">Belum ada transaksi</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map(t => (
            <div
              key={t.id}
              className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-colors"
            >
              <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <History size={16} className="text-amber-400" />
                  </div>
                  <div>
                    <p className="font-mono text-sm text-amber-400">{t.transaction_code}</p>
                    <p className="text-xs text-gray-500">{t.cashier_name} • {formatDate(t.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-100">{formatRupiah(t.total_amount)}</p>
                    <p className="text-xs text-gray-500 capitalize">{t.payment_method}</p>
                  </div>
                  {expandedId === t.id ? (
                    <ChevronUp size={16} className="text-gray-500" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-500" />
                  )}
                </div>
              </button>

              {expandedId === t.id && (
                <div className="px-4 pb-4 border-t border-gray-800 pt-3 animate-fadeIn">
                  <div className="space-y-2">
                    {t.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-400">{item.product_name} × {item.quantity}</span>
                        <span className="text-gray-200">{formatRupiah(item.subtotal)}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-800 mt-2 pt-2 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Bayar</span>
                        <span className="text-gray-200">{formatRupiah(t.payment_amount)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-amber-400">Kembalian</span>
                        <span className="text-amber-400">{formatRupiah(t.change_amount)}</span>
                      </div>
                    </div>
                    {t.notes && (
                      <p className="text-xs text-gray-500 mt-2 italic">📝 {t.notes}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
