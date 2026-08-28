import { useState, useEffect } from 'react';
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
    if (!form.name || !form.price) {
      toast.error('Nama dan harga wajib diisi!');
      return;
    }
    setLoading(true);
    try {
      if (isEdit) {
        await api.put(`/products/${product.id}`, form);
        toast.success('Produk berhasil diperbarui!');
      } else {
        await api.post('/products', form);
        toast.success('Produk berhasil ditambahkan!');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan produk');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl animate-fadeIn"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-gray-100">
            {isEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Nama Produk *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Contoh: Cappuccino"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Harga (Rp) *</label>
            <input
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              placeholder="25000"
              className="input-field"
              min={0}
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Kategori</label>
            <select name="category_id" value={form.category_id} onChange={handleChange} className="input-field">
              <option value="">Pilih Kategori</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Deskripsi</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Deskripsi produk..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          {isEdit && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_available"
                name="is_available"
                checked={!!form.is_available}
                onChange={handleChange}
                className="w-4 h-4 accent-amber-500"
              />
              <label htmlFor="is_available" className="text-sm text-gray-300">Produk tersedia</label>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Batal
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? (
                <div className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {isEdit ? 'Simpan Perubahan' : 'Tambah Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
