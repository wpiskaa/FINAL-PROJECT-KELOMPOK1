import { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatRupiah } from '../utils/formatters';
import toast from 'react-hot-toast';
import {
  ShoppingCart, Plus, Minus, Trash2, Coffee, Search,
  CreditCard, Banknote, QrCode, Check, Printer, Receipt, PackageCheck
} from 'lucide-react';

export default function TransactionPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  
  // Payment
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash', 'qris', 'card'
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    api.get('/products', { params: { available: 'true' } })
      .then(res => {
        setProducts(res.data.data.products);
        setCategories(res.data.data.categories);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || p.category_id == filterCat;
    return matchSearch && matchCat;
  });

  function addToCart(product) {
    setCart(prev => {
      const existing = prev.find(i => i.product_id === product.id);
      if (existing) {
        return prev.map(i => i.product_id === product.id
          ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.price }
          : i
        );
      }
      return [...prev, { product_id: product.id, name: product.name, price: product.price, quantity: 1, subtotal: product.price }];
    });
  }

  function updateQty(productId, delta) {
    setCart(prev => {
      return prev
        .map(i => i.product_id === productId
          ? { ...i, quantity: i.quantity + delta, subtotal: (i.quantity + delta) * i.price }
          : i
        )
        .filter(i => i.quantity > 0);
    });
  }

  function removeFromCart(productId) {
    setCart(prev => prev.filter(i => i.product_id !== productId));
  }

  const total = cart.reduce((sum, i) => sum + i.subtotal, 0);
  const effectivePayment = paymentMethod === 'cash' ? (parseFloat(paymentAmount) || 0) : total;
  const change = Math.max(0, effectivePayment - total);

  async function handleCheckout() {
    if (cart.length === 0) { toast.error('Keranjang pesanan masih kosong!'); return; }
    if (paymentMethod === 'cash' && (!paymentAmount || parseFloat(paymentAmount) < total)) {
      toast.error('Jumlah pembayaran uang tunai kurang!'); return;
    }
    setProcessing(true);
    try {
      const res = await api.post('/transactions', {
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        payment_amount: effectivePayment,
        payment_method: paymentMethod,
        notes,
      });
      setReceipt(res.data.data.transaction);
      setCart([]);
      setPaymentAmount('');
      setNotes('');
      toast.success('Pesanan berhasil diproses! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaksi gagal!');
    } finally {
      setProcessing(false);
    }
  }

  /* Farmaku Style Receipt Success View */
  if (receipt) {
    return (
      <div className="max-w-md mx-auto animate-fadeIn font-sans py-6">
        <div className="card text-center bg-white rounded-3xl p-8 border border-[#EAE3D9] shadow-card space-y-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700 shadow-xs">
            <Check size={36} />
          </div>

          <div>
            <h2 className="text-2xl font-bold font-display text-coffee-950">Transaksi Selesai!</h2>
            <p className="text-coffee-600 text-xs font-mono mt-1">{receipt.transaction_code}</p>
          </div>

          {/* Struk Details */}
          <div className="bg-[#FAF7F2] rounded-2xl p-4 text-left space-y-3 border border-[#EBE4D8]">
            <p className="text-xs font-bold text-coffee-900 border-b border-cream-300 pb-2">Rincian Pesanan</p>
            {receipt.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-coffee-800 font-medium">{item.product_name} ×{item.quantity}</span>
                <span className="text-coffee-950 font-bold">{formatRupiah(item.subtotal)}</span>
              </div>
            ))}
            
            <div className="border-t border-cream-300 pt-2 space-y-1 text-xs">
              <div className="flex justify-between font-bold text-coffee-950 text-sm">
                <span>Total Belanja</span>
                <span className="text-coffee-800">{formatRupiah(receipt.total_amount)}</span>
              </div>
              <div className="flex justify-between text-coffee-700">
                <span>Metode Pembayaran</span>
                <span className="uppercase font-semibold">{receipt.payment_method}</span>
              </div>
              <div className="flex justify-between text-coffee-700">
                <span>Jumlah Bayar</span>
                <span>{formatRupiah(receipt.payment_amount)}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700">
                <span>Kembalian</span>
                <span>{formatRupiah(receipt.change_amount)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="btn-secondary flex-1 py-2.5 text-xs flex items-center justify-center gap-1.5"
            >
              <Printer size={15} /> Cetak Struk
            </button>
            <button
              id="new-transaction-btn"
              onClick={() => setReceipt(null)}
              className="btn-primary flex-1 py-2.5 text-xs flex items-center justify-center gap-1.5"
            >
              <Receipt size={15} /> Pesanan Baru
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn font-sans h-full">
      
      {/* Farmaku Style Grid Layout: Left Catalog (3 cols) vs Right Order Summary (2 cols) */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Catalog Area (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Top Search & Category Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-coffee-400" />
              <input
                type="text"
                placeholder="Cari menu kopi untuk transaksi..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-10 text-sm bg-white shadow-2xs"
              />
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setFilterCat('')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                  filterCat === ''
                    ? 'bg-coffee-800 text-white border-coffee-800 shadow-xs'
                    : 'bg-white text-coffee-700 border-[#EAE3D9] hover:bg-cream-100'
                }`}
              >
                Semua
              </button>
              {categories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setFilterCat(c.id.toString())}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap border ${
                    filterCat === c.id.toString()
                      ? 'bg-coffee-800 text-white border-coffee-800 shadow-xs'
                      : 'bg-white text-coffee-700 border-[#EAE3D9] hover:bg-cream-100'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Selection Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
              {filteredProducts.map(product => {
                const inCart = cart.find(i => i.product_id === product.id);
                return (
                  <button
                    key={product.id}
                    id={`add-to-cart-${product.id}`}
                    onClick={() => addToCart(product)}
                    className={`text-left p-3.5 rounded-2xl border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex flex-col justify-between h-36 ${
                      inCart
                        ? 'bg-[#FAF5EE] border-coffee-600 shadow-md ring-2 ring-coffee-500/20'
                        : 'bg-white border-[#EAE3D9] hover:border-coffee-400 shadow-soft'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div className="w-8 h-8 bg-[#F5EFE6] rounded-xl flex items-center justify-center flex-shrink-0 border border-[#E2D6C5]">
                        <Coffee size={16} className={inCart ? 'text-coffee-800' : 'text-coffee-600'} />
                      </div>
                      {inCart && (
                        <span className="badge bg-coffee-800 text-white text-[10px] px-2 py-0.5 font-bold">
                          {inCart.quantity}x
                        </span>
                      )}
                    </div>

                    <div>
                      <p className="font-bold text-coffee-950 text-xs sm:text-sm line-clamp-2 leading-snug font-display">{product.name}</p>
                      <p className="text-coffee-700 font-extrabold text-xs sm:text-sm mt-1">{formatRupiah(product.price)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Area — Farmaku Style Persistent Order Summary Panel (5 cols) */}
        <div className="lg:col-span-5">
          <div className="card bg-white border border-[#EAE3D9] rounded-3xl p-5 shadow-card space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#F0E9DF] pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} className="text-coffee-800" />
                <h2 className="font-bold text-coffee-950 font-display text-base">Order Summary</h2>
              </div>
              {cart.length > 0 && (
                <span className="badge bg-cream-200 text-coffee-800 text-xs">{cart.length} Jenis Item</span>
              )}
            </div>

            {/* Cart Items List with Quantity Controls (Farmaku style - 1 + buttons) */}
            {cart.length === 0 ? (
              <div className="text-center py-10 text-coffee-400 bg-[#FAF8F5] rounded-2xl border border-dashed border-[#E2D9CC]">
                <ShoppingCart size={32} className="mx-auto mb-2 opacity-40" />
                <p className="text-xs font-semibold">Keranjang pesanan masih kosong</p>
                <p className="text-[11px] text-coffee-400 mt-0.5">Pilih produk di sebelah kiri untuk menambahkan</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {cart.map(item => (
                  <div key={item.product_id} className="flex items-center justify-between bg-[#FAF7F2] rounded-2xl p-3 border border-[#EBE4D8]">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-coffee-950 truncate font-display">{item.name}</p>
                      <p className="text-[11px] text-coffee-700 font-semibold">{formatRupiah(item.subtotal)}</p>
                    </div>

                    {/* Quantity Controls (- Qty +) */}
                    <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-cream-300 shadow-2xs">
                      <button
                        onClick={() => updateQty(item.product_id, -1)}
                        className="w-6 h-6 bg-cream-100 hover:bg-cream-200 text-coffee-800 rounded-lg flex items-center justify-center transition-colors text-xs font-bold"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-coffee-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.product_id, 1)}
                        className="w-6 h-6 bg-coffee-800 text-white hover:bg-coffee-900 rounded-lg flex items-center justify-center transition-colors text-xs font-bold"
                      >
                        <Plus size={12} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="w-6 h-6 text-rose-600 hover:bg-rose-50 rounded-lg flex items-center justify-center ml-1 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Payment Summary */}
            <div className="bg-[#FAF7F2] rounded-2xl p-3.5 space-y-1.5 border border-[#EBE4D8]">
              <div className="flex justify-between text-xs text-coffee-700">
                <span>Sub Total</span>
                <span>{formatRupiah(total)}</span>
              </div>
              <div className="flex justify-between text-xs text-coffee-700">
                <span>Pajak (0%)</span>
                <span>Rp 0</span>
              </div>
              <div className="flex justify-between font-bold text-coffee-950 text-base border-t border-cream-300 pt-2">
                <span>Total Bayar</span>
                <span className="text-coffee-800">{formatRupiah(total)}</span>
              </div>
            </div>

            {/* Payment Method Selector (Farmaku Style: QRIS, Card, Cash) */}
            <div>
              <label className="block text-xs font-bold text-coffee-800 mb-2">Pilih Metode Pembayaran</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-2xl border text-xs font-semibold transition-all ${
                    paymentMethod === 'cash'
                      ? 'bg-coffee-800 text-white border-coffee-800 shadow-sm'
                      : 'bg-white border-[#EAE3D9] text-coffee-700 hover:bg-cream-100'
                  }`}
                >
                  <Banknote size={16} /> Cash
                </button>
                <button
                  onClick={() => setPaymentMethod('qris')}
                  className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-2xl border text-xs font-semibold transition-all ${
                    paymentMethod === 'qris'
                      ? 'bg-coffee-800 text-white border-coffee-800 shadow-sm'
                      : 'bg-white border-[#EAE3D9] text-coffee-700 hover:bg-cream-100'
                  }`}
                >
                  <QrCode size={16} /> QRIS
                </button>
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-2xl border text-xs font-semibold transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-coffee-800 text-white border-coffee-800 shadow-sm'
                      : 'bg-white border-[#EAE3D9] text-coffee-700 hover:bg-cream-100'
                  }`}
                >
                  <CreditCard size={16} /> Debit / Kartu
                </button>
              </div>
            </div>

            {/* Cash Payment Input */}
            {paymentMethod === 'cash' && (
              <div>
                <label className="block text-xs font-semibold text-coffee-800 mb-1">Nominal Uang Tunai (Rp)</label>
                <input
                  id="payment-amount-input"
                  type="number"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  placeholder="Contoh: 50000"
                  className="input-field text-sm font-bold bg-white"
                  min={total}
                />
                {paymentAmount && parseFloat(paymentAmount) >= total && (
                  <p className="text-xs text-emerald-700 font-bold mt-1">
                    Kembalian: {formatRupiah(change)}
                  </p>
                )}
              </div>
            )}

            {/* Place Order Button (Farmaku style blue/brown big button) */}
            <button
              id="checkout-btn"
              onClick={handleCheckout}
              disabled={processing || cart.length === 0 || (paymentMethod === 'cash' && (!paymentAmount || parseFloat(paymentAmount) < total))}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold shadow-md"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Memproses Pesanan...</span>
                </>
              ) : (
                <>
                  <PackageCheck size={18} />
                  <span>Proses Pesanan ({formatRupiah(total)})</span>
                </>
              )}
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
