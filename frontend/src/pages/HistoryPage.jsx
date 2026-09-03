import { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatRupiah, formatDate } from '../utils/formatters';
import { History, ChevronDown, ChevronUp, Calendar, Printer, Coffee, FileX, Download } from 'lucide-react';

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

  function handleExportCSV() {
    if (transactions.length === 0) return;
    const headers = ['Kode Transaksi', 'Kasir', 'Tanggal', 'Metode Pembayaran', 'Total Belanja (Rp)', 'Rincian Menu'];
    const rows = transactions.map(t => {
      const itemsStr = (t.items || []).map(i => `${i.product_name} (${i.quantity}x)`).join('; ');
      return [
        `"${t.transaction_code}"`,
        `"${t.cashier_name}"`,
        `"${formatDate(t.created_at)}"`,
        `"${t.payment_method?.toUpperCase()}"`,
        t.total_amount,
        `"${itemsStr}"`
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `laporan-penjualan-brewmate-${dateFilter || 'semua'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="space-y-6 animate-fadeIn font-sans w-full">

      {/* Print-only styling: saat print, cuma struk yang sedang di-expand (#receipt-area) yang muncul */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-area, #receipt-area * { visibility: visible; }
          #receipt-area { position: absolute; top: 0; left: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-coffee-950">Riwayat Penjualan Kasir</h1>
          <p className="text-coffee-600 text-xs sm:text-sm mt-0.5">
            {transactions.length} transaksi recorded • Total Penjualan: <span className="font-bold text-coffee-900">{formatRupiah(totalRevenue)}</span>
          </p>
        </div>

        {/* Action Controls (Date Filter & Export CSV) */}
        <div className="flex items-center gap-2">
          {transactions.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5 font-bold shadow-2xs text-[#4A2E1A] hover:bg-[#F5EFE4]"
              title="Unduh Laporan Format CSV (Excel)"
            >
              <Download size={14} />
              <span>Export CSV</span>
            </button>
          )}

          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-[#EAE3D9] shadow-2xs">
            <Calendar size={16} className="text-coffee-500 ml-2" />
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="input-field w-auto text-xs py-1.5 px-2 bg-transparent border-0"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="btn-secondary text-[11px] px-2.5 py-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* History List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}
        </div>
      ) : transactions.length === 0 ? (
        // Desain Empty State baru yang lebih menarik saat data transaksi kosong / filter tanggal tidak cocok
        <div className="card text-center py-16 px-6 bg-white border border-[#EAE3D9] rounded-3xl shadow-card flex flex-col items-center justify-center animate-fadeIn">
          <div className="w-16 h-16 bg-cream-100 rounded-full flex items-center justify-center text-coffee-600 mb-4 border border-cream-200 shadow-inner">
            {dateFilter ? <FileX size={32} /> : <Coffee size={32} />}
        </div>
          <h3 className="text-coffee-950 font-extrabold text-base sm:text-lg mb-1">
            {dateFilter ? 'Tidak Ada Transaksi Pada Tanggal Ini' : 'Belum Ada Riwayat Transaksi'}
          </h3>
          <p className="text-coffee-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            {dateFilter 
              ? 'Coba ganti filter tanggal atau klik tombol reset untuk melihat semua riwayat transaksi.' 
              : 'Semua catatan penjualan kasir akan tampil di sini. Mulai buat transaksi pertama Anda di menu Kasir!'}
          </p>
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="mt-5 btn-secondary text-xs px-4 py-2 font-semibold shadow-xs"
            >
              Tampilkan Semua Transaksi
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map(t => (
            <div
              key={t.id}
              className="bg-white border border-[#EAE3D9] rounded-3xl overflow-hidden shadow-soft hover:shadow-card transition-all"
            >
              <button
                className="w-full flex items-center justify-between p-4 text-left"
                onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-cream-200 rounded-2xl flex items-center justify-center text-coffee-800 flex-shrink-0 border border-cream-300">
                    <History size={18} />
                  </div>
                  <div>
                    <p className="font-mono font-bold text-xs sm:text-sm text-coffee-950">{t.transaction_code}</p>
                    <p className="text-[11px] text-coffee-500">{t.cashier_name} • {formatDate(t.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-extrabold text-coffee-950 text-sm">{formatRupiah(t.total_amount)}</p>
                    <span className="badge bg-cream-100 text-coffee-800 text-[10px] uppercase font-bold">
                      {t.payment_method}
                    </span>
                  </div>
                  {expandedId === t.id ? (
                    <ChevronUp size={18} className="text-coffee-500" />
                  ) : (
                    <ChevronDown size={18} className="text-coffee-500" />
                  )}
                </div>
              </button>

              {/* Expanded Item Details */}
              {expandedId === t.id && (
                <div
                  id="receipt-area"
                  className="px-5 pb-5 border-t border-[#F0E9DF] pt-4 bg-[#FAF7F2] animate-fadeIn space-y-3"
                >
                  {/* Header struk khusus untuk mode print, supaya kode transaksi & tanggal tetap ikut tercetak
                      walaupun baris accordion di atas (#receipt-area) tersembunyi saat print */}
                  <div className="hidden print:block text-center pb-2 border-b border-dashed border-cream-300">
                    <p className="font-bold text-coffee-950 text-sm">BrewMate Coffee Shop</p>
                    <p className="text-coffee-500 text-[11px] mt-0.5">Struk Cetak Ulang</p>
                    <p className="text-coffee-600 text-xs font-mono mt-1">{t.transaction_code}</p>
                    <p className="text-coffee-400 text-[11px] mt-0.5">
                      {formatDate(t.created_at)} · Kasir: {t.cashier_name}
                    </p>
                  </div>

                  <p className="text-xs font-bold text-coffee-900 border-b border-cream-300 pb-1.5">Detail Pesanan</p>
                  <div className="space-y-1.5">
                    {t.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-coffee-800 font-medium">{item.product_name} × {item.quantity}</span>
                        <span className="text-coffee-950 font-bold">{formatRupiah(item.subtotal)}</span>
                      </div>
                    ))}
                    <div className="border-t border-cream-300 mt-2 pt-2 space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-coffee-950">
                        <span>Total Belanja</span>
                        <span>{formatRupiah(t.total_amount)}</span>
                      </div>
                      <div className="flex justify-between text-coffee-700">
                        <span>Metode Pembayaran</span>
                        <span className="uppercase font-semibold">{t.payment_method}</span>
                      </div>
                      <div className="flex justify-between text-coffee-700">
                        <span>Nominal Bayar</span>
                        <span>{formatRupiah(t.payment_amount)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-emerald-700">
                        <span>Kembalian</span>
                        <span>{formatRupiah(t.change_amount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    {t.notes ? (
                      <p className="text-xs text-coffee-600 italic">📝 Catatan: {t.notes}</p>
                    ) : <span />}
                    <button
                      onClick={() => window.print()}
                      className="no-print btn-secondary text-[11px] py-1.5 px-3 flex items-center gap-1 font-semibold"
                    >
                      <Printer size={12} /> Cetak Struk
                    </button>
                  </div>

                  <p className="hidden print:block text-center text-[10px] text-coffee-400 pt-2 border-t border-dashed border-cream-300">
                    Terima kasih sudah ngopi di BrewMate ☕
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}