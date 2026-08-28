import { useState, useEffect } from 'react';
import api from '../utils/api';
import { formatRupiah } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  ShoppingCart, Plus, Minus, Trash2, Coffee, Search,
  CreditCard, Banknote, Check, Receipt
} from 'lucide-react';

export default function TransactionPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
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
  const change = parseFloat(paymentAmount) - total;

  async function handleCheckout() {
    if (cart.length === 0) { toast.error('Keranjang belanja kosong!'); return; }
    if (!paymentAmount || parseFloat(paymentAmount) < total) {
      toast.error('Jumlah pembayaran kurang dari total!'); return;
    }
    setProcessing(true);
    try {
      const res = await api.post('/transactions', {
        items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
        payment_amount: parseFloat(paymentAmount),
        payment_method: paymentMethod,
        notes,
      });
      setReceipt(res.data.data.transaction);
      setCart([]);
      setPaymentAmount('');
      setNotes('');
      toast.success('Transaksi berhasil! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaksi gagal!');
    } finally {
      setProcessing(false);
    }
  }

  if (receipt) {
    return (
      <div className="max-w-md mx-auto animate-fadeIn">
        <div className="card text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold font-['Outfit'] text-gray-100 mb-1">Pembayaran Sukses!</h2>
          <p className="text-gray-500 text-sm mb-6">{receipt.transaction_code}</p>

          <div className="bg-gray-800/50 rounded-xl p-4 text-left space-y-2 mb-4">
            {receipt.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-400">{item.product_name} x{item.quantity}</span>
                <span className="text-gray-200">{formatRupiah(item.subtotal)}</span>
              </div>
            ))}
            <div className="border-t border-gray-700 pt-2 mt-2 space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-gray-300">Total</span>
                <span className="text-gray-100">{formatRupiah(receipt.total_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Bayar</span>
                <span className="text-gray-300">{formatRupiah(receipt.payment_amount)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-amber-400">Kembalian</span>
                <span className="text-amber-400">{formatRupiah(receipt.change_amount)}</span>
              </div>
            </div>
          </div>

          <button
            id="new-transaction-btn"
            onClick={() => setReceipt(null)}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Receipt size={16} />
            Transaksi Baru
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-['Outfit'] text-gray-100">Transaksi Baru</h1>
        <p className="text-gray-500 text-sm mt-1">Pilih menu dan proses pembayaran</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 h-full">
        {/* Product selection */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Cari menu..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field pl-9 text-sm"
              />
            </div>
            <select
              value={filterCat}
              onChange={e => setFilterCat(e.target.value)}
              className="input-field w-auto text-sm"
            >
              <option value="">Semua</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {filteredProducts.map(product => {
                const inCart = cart.find(i => i.product_id === product.id);
                return (
                  <button
                    key={product.id}
                    id={`add-to-cart-${product.id}`}
                    onClick={() => addToCart(product)}
                    className={`text-left p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                      inCart
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-gray-900 border-gray-800 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Coffee size={15} className={inCart ? 'text-amber-400' : 'text-gray-500'} />
                      </div>
                      {inCart && (
                        <span className="badge bg-amber-500/20 text-amber-400 text-xs">x{inCart.quantity}</span>
                      )}
                    </div>
                    <p className="font-medium text-gray-200 text-sm mt-2 line-clamp-1">{product.name}</p>
                    <p className="text-amber-400 font-semibold text-sm">{formatRupiah(product.price)}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart & Payment */}
        <div className="lg:col-span-2">
          <div className="card sticky top-0 space-y-4">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-amber-400" />
              <h2 className="font-semibold text-gray-100">Keranjang</h2>
              {cart.length > 0 && (
                <span className="badge bg-amber-500/20 text-amber-400 ml-auto">{cart.length} item</span>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <ShoppingCart size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Keranjang kosong</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.product_id} className="flex items-center gap-2 bg-gray-800/50 rounded-xl p-2.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">{item.name}</p>
                      <p className="text-xs text-amber-400">{formatRupiah(item.subtotal)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQty(item.product_id, -1)}
                        className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <Minus size={10} />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQty(item.product_id, 1)}
                        className="w-6 h-6 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors"
                      >
                        <Plus size={10} />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="w-6 h-6 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg flex items-center justify-center ml-1 transition-colors"
                      >
                        <Trash2 size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total */}
            <div className="bg-gray-800/50 rounded-xl p-3 space-y-1">
              <div className="flex justify-between font-bold">
                <span className="text-gray-300">Total</span>
                <span className="text-xl gradient-text">{formatRupiah(total)}</span>
              </div>
            </div>

            {/* Payment method */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  paymentMethod === 'cash'
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400'
                }`}
              >
                <Banknote size={15} /> Cash
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  paymentMethod === 'card'
                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    : 'bg-gray-800 border-gray-700 text-gray-400'
                }`}
              >
                <CreditCard size={15} /> Kartu
              </button>
            </div>

            {/* Payment input */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Jumlah Bayar (Rp)</label>
              <input
                id="payment-amount-input"
                type="number"
                value={paymentAmount}
                onChange={e => setPaymentAmount(e.target.value)}
                placeholder="0"
                className="input-field text-lg font-bold"
                min={total}
              />
              {paymentAmount && parseFloat(paymentAmount) >= total && (
                <p className="text-xs text-amber-400 mt-1.5 font-medium">
                  Kembalian: {formatRupiah(Math.max(0, change))}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Catatan (opsional)</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Catatan pesanan..."
                className="input-field text-sm"
              />
            </div>

            {/* Checkout button */}
            <button
              id="checkout-btn"
              onClick={handleCheckout}
              disabled={processing || cart.length === 0 || !paymentAmount || parseFloat(paymentAmount) < total}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {processing ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Bayar {cart.length > 0 && formatRupiah(total)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
