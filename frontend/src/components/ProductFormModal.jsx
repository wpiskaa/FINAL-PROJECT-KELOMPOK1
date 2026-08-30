import { useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { X, Save } from 'lucide-react';

export default function ProductFormModal({ product, categories, onClose, onSuccess }) {
  const isEdit = !!product;
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    category_id: product?.category_id || '',
    is_available: product?.is_available !== undefined ? product.is_available : 1,
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? (checked ? 1 : 0) : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // Validasi 1: Memeriksa apakah nama menu dan harga sudah diisi
    if (!form.name.trim() || !form.price) {
      toast.error('Nama dan harga menu wajib diisi!');
      return;
    }
    // Validasi 2: Memeriksa panjang karakter nama menu minimal 3 karakter
    if (form.name.trim().length < 3) {
      toast.error('Nama menu minimal harus 3 karakter!');
      return;
    }
    // Validasi 3: Memeriksa harga produk tidak boleh kurang dari atau sama dengan 0
    if (Number(form.price) <= 0) {
      toast.error('Harga menu harus lebih dari Rp 0!');
      return;
    }

    if (!form.name || !form.price) {
      toast.error('Nama dan harga menu wajib diisi!');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/products/${product.id}`, form);
        toast.success('Menu berhasil diperbarui!');
      } else {
        await api.post('/products', form);
        toast.success('Menu baru berhasil ditambahkan!');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan menu');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-coffee-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-white border border-[#EAE3D9] rounded-3xl shadow-card animate-fadeIn overflow-hidden font-sans"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#F0E9DF] bg-[#FAF7F2]">
          <h2 className="text-lg font-bold font-display text-coffee-950">
            {isEdit ? 'Edit Menu Kopi' : 'Tambah Menu Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-coffee-500 hover:text-coffee-950 hover:bg-cream-200 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-coffee-800 mb-1.5">Nama Menu / Produk *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Contoh: Iced Hazelnut Latte"
              className="input-field text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-coffee-800 mb-1.5">Harga (Rp) *</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="28000"
              className="input-field text-sm"
              min={0}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-coffee-800 mb-1.5">Kategori Menu</label>
            <select name="category_id" value={form.category_id} onChange={handleChange} className="input-field text-sm bg-white">
              <option value="">Pilih Kategori</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-coffee-800 mb-1.5">Deskripsi Manual (Opsional)</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Catatan singkat rasa atau komposisi..."
              rows={3}
              className="input-field text-sm resize-none"
            />
          </div>

          {isEdit && (
            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                id="is_available"
                name="is_available"
                checked={!!form.is_available}
                onChange={handleChange}
                className="w-4 h-4 accent-coffee-800 rounded"
              />
              <label htmlFor="is_available" className="text-xs font-semibold text-coffee-800 cursor-pointer">
                Menu tersedia untuk dijual
              </label>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3 border-t border-cream-200">
            <button type="button" onClick={onClose} className="btn-secondary flex-1 py-2.5 text-xs font-semibold">
              Batal
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5 text-xs flex items-center justify-center gap-2 font-bold">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isEdit ? 'Simpan Perubahan' : 'Tambah Menu'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
