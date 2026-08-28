import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { formatRupiah } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  Search, Plus, Coffee, Edit2, Trash2, Sparkles,
  Filter, Package, ToggleLeft, ToggleRight, ChevronRight
} from 'lucide-react';
import ProductFormModal from '../components/ProductFormModal';

const CATEGORY_COLORS = {
  'Kopi': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'Non-Kopi': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'Makanan': 'bg-green-500/10 text-green-400 border-green-500/20',
  'Minuman Lain': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export default function ProductsPage() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [generatingId, setGeneratingId] = useState(null);

  function loadProducts() {
    const params = {};
    if (search) params.search = search;
    if (filterCat) params.category_id = filterCat;
    api.get('/products', { params })
      .then(res => {
        setProducts(res.data.data.products);
        setCategories(res.data.data.categories);
      })
      .catch(() => toast.error('Gagal memuat produk'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadProducts(); }, [search, filterCat]);

  async function handleGenerateAI(product) {
    setGeneratingId(product.id);
    const toastId = toast.loading(`🤖 Gemini AI sedang membuat deskripsi untuk "${product.name}"...`);
    try {
      const res = await api.post(`/products/${product.id}/generate-description`);
      toast.success(`✨ Deskripsi berhasil! (${res.data.data.generation_time})`, { id: toastId });
      loadProducts();
    } catch (err) {
      toast.error('Gagal generate deskripsi', { id: toastId });
    } finally {
      setGeneratingId(null);
    }
  }

  async function handleDelete(product) {
    if (!confirm(`Hapus "${product.name}"?`)) return;
    try {
      await api.delete(`/products/${product.id}`);
      toast.success('Produk berhasil dihapus');
      loadProducts();
    } catch {
      toast.error('Gagal menghapus produk');
    }
  }

  function openAdd() { setEditProduct(null); setShowModal(true); }
  function openEdit(p) { setEditProduct(p); setShowModal(true); }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Outfit'] text-gray-100">Menu & Produk</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} produk tersedia</p>
        </div>
        {isAdmin && (
          <button id="add-product-btn" onClick={openAdd} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            <span>Tambah Produk</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            id="search-product-input"
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="input-field w-auto"
        >
          <option value="">Semua Kategori</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-56 rounded-2xl" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="card text-center py-16">
          <Package size={40} className="text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500">Tidak ada produk ditemukan</p>
          {isAdmin && (
            <button onClick={openAdd} className="btn-primary mt-4 inline-flex items-center gap-2">
              <Plus size={16} /> Tambah Produk
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map(product => (
            <div
              key={product.id}
              className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-gray-700 transition-all duration-200 hover:shadow-xl hover:shadow-black/20 group"
            >
              {/* Product color header */}
              <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500" />
              
              <div className="p-4">
                {/* Category badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`badge border text-xs ${CATEGORY_COLORS[product.category_name] || 'bg-gray-800 text-gray-400 border-gray-700'}`}>
                    {product.category_name || 'Umum'}
                  </span>
                  <span className={`text-xs font-medium ${product.is_available ? 'text-green-400' : 'text-red-400'}`}>
                    {product.is_available ? '● Tersedia' : '● Habis'}
                  </span>
                </div>

                {/* Name & Price */}
                <h3 className="font-semibold text-gray-100 mb-1">{product.name}</h3>
                <p className="text-xl font-bold gradient-text mb-2">{formatRupiah(product.price)}</p>

                {/* AI Description preview */}
                {product.ai_description ? (
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-2.5 mb-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Sparkles size={10} className="text-amber-400" />
                      <span className="text-xs text-amber-400/80 font-medium">AI Generated</span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">{product.ai_description}</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2 italic">
                    {product.description || 'Belum ada deskripsi'}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    to={`/products/${product.id}`}
                    className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1"
                  >
                    Detail <ChevronRight size={12} />
                  </Link>
                  <button
                    id={`ai-gen-btn-${product.id}`}
                    onClick={() => handleGenerateAI(product)}
                    disabled={generatingId === product.id}
                    className="p-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/20 transition-all duration-200 disabled:opacity-50"
                    title="Generate AI Description"
                  >
                    {generatingId === product.id ? (
                      <div className="w-4 h-4 border border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => openEdit(product)}
                        className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200 rounded-xl border border-gray-700 transition-all"
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl border border-red-500/20 transition-all"
                        title="Hapus"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Form Modal */}
      {showModal && (
        <ProductFormModal
          product={editProduct}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); loadProducts(); }}
        />
      )}
    </div>
  );
}
