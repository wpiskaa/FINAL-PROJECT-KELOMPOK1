import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { formatRupiah } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import {
  Search, Plus, Coffee, Edit2, Trash2, Sparkles,
  Package, ChevronRight, SlidersHorizontal
} from 'lucide-react';
import ProductFormModal from '../components/ProductFormModal';

export default function ProductsPage() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Modals & AI
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

  async function handleQuickGenerateAI(product) {
    setGeneratingId(product.id);
    const toastId = toast.loading(`🤖 Gemini AI sedang membuat deskripsi untuk "${product.name}"...`);
    try {
      // Save directly on quick generate from catalog page
      const res = await api.post(`/products/${product.id}/generate-description`, { save: true });
      toast.success(`✨ Deskripsi AI disimpan! (${res.data.data.generation_time})`, { id: toastId });
      loadProducts();
    } catch {
      toast.error('Gagal generate deskripsi', { id: toastId });
    } finally {
      setGeneratingId(null);
    }
  }

  async function handleDelete(product) {
    if (!confirm(`Hapus "${product.name}"? Data transaksi lama tetap tersimpan.`)) return;
    try {
      await api.delete(`/products/${product.id}`);
      toast.success('Produk berhasil dihapus (soft delete)');
      loadProducts();
    } catch {
      toast.error('Gagal menghapus produk');
    }
  }

  function openAdd() { setEditProduct(null); setShowModal(true); }
  function openEdit(p) { setEditProduct(p); setShowModal(true); }

  const filteredProducts = products.filter(p => {
    if (!maxPrice) return true;
    return p.price <= parseFloat(maxPrice);
  });

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-coffee-950">Katalog Menu & Produk</h1>
          <p className="text-coffee-600 text-sm mt-0.5">{filteredProducts.length} menu kopi & sajian tersedia</p>
        </div>
        {isAdmin && (
          <button id="add-product-btn" onClick={openAdd} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} />
            <span>Tambah Menu Baru</span>
          </button>
        )}
      </div>

      {/* Farmaku Style Category Tabs & Search Bar */}
      <div className="space-y-3">
        
        {/* Top Search & Price Filter Controls */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-56">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-coffee-400" />
            <input
              id="search-product-input"
              type="text"
              placeholder="Cari menu kopi atau makanan..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-10 text-sm bg-white shadow-2xs"
            />
          </div>

          {/* Max Price filter */}
          <div className="relative w-44">
            <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-coffee-400" />
            <input
              type="number"
              placeholder="Maks. Harga (Rp)"
              value={maxPrice}
              onChange={e => setMaxPrice(e.target.value)}
              className="input-field pl-9 text-xs bg-white shadow-2xs"
            />
          </div>
        </div>

        {/* Category Pills (Farmaku style horizontal tabs) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1">
          <button
            onClick={() => setFilterCat('')}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap border ${
              filterCat === ''
                ? 'bg-coffee-800 text-white border-coffee-800 shadow-sm'
                : 'bg-white text-coffee-700 border-[#EAE3D9] hover:bg-cream-100'
            }`}
          >
            Semua Menu
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setFilterCat(c.id.toString())}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap border ${
                filterCat === c.id.toString()
                  ? 'bg-coffee-800 text-white border-coffee-800 shadow-sm'
                  : 'bg-white text-coffee-700 border-[#EAE3D9] hover:bg-cream-100'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

      </div>

      {/* Product Grid (Farmaku Clean White Cards) */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-60 rounded-3xl" />)}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="card text-center py-16 bg-white rounded-3xl">
          <Package size={40} className="text-coffee-300 mx-auto mb-3" />
          <p className="text-coffee-600 font-medium">Tidak ada produk ditemukan</p>
          {isAdmin && (
            <button onClick={openAdd} className="btn-primary mt-4 inline-flex items-center gap-2 text-xs">
              <Plus size={16} /> Tambah Menu Sekarang
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <div
              key={product.id}
              className="bg-white border border-[#EAE3D9] rounded-3xl p-5 shadow-soft hover:shadow-card transition-all duration-200 flex flex-col justify-between group"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="badge bg-cream-200 text-coffee-800 text-[11px] font-semibold">
                    {product.category_name || 'Umum'}
                  </span>
                  <span className={`text-[11px] font-bold ${product.is_available ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {product.is_available ? '● Tersedia' : '● Stok Habis'}
                  </span>
                </div>

                {/* Coffee Icon & Product Name */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-[#F5EFE6] rounded-2xl flex items-center justify-center flex-shrink-0 border border-[#E2D6C5]">
                    <Coffee size={20} className="text-coffee-800" />
                  </div>
                  <div>
                    <h3 className="font-bold text-coffee-950 text-base leading-tight font-display">{product.name}</h3>
                    <p className="text-lg font-extrabold text-coffee-700">{formatRupiah(product.price)}</p>
                  </div>
                </div>

                {/* AI Description / Manual preview */}
                {product.ai_description ? (
                  <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-2xl p-3 my-3">
                    <div className="flex items-center gap-1 mb-1 text-[10px] font-bold text-coffee-700 uppercase tracking-wider">
                      <Sparkles size={11} className="text-amber-600" />
                      <span>Deskripsi AI</span>
                    </div>
                    <p className="text-xs text-coffee-800 line-clamp-2 leading-relaxed">{product.ai_description}</p>
                  </div>
                ) : (
                  <p className="text-xs text-coffee-500 my-3 line-clamp-2 italic leading-relaxed">
                    {product.description || 'Belum ada deskripsi menu'}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-cream-200">
                <Link
                  to={`/products/${product.id}`}
                  className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1 font-semibold"
                >
                  Detail & AI <ChevronRight size={14} />
                </Link>

                <button
                  id={`ai-gen-btn-${product.id}`}
                  onClick={() => handleQuickGenerateAI(product)}
                  disabled={generatingId === product.id}
                  className="p-2 bg-coffee-100 hover:bg-coffee-200 text-coffee-800 rounded-xl border border-coffee-300 transition-all disabled:opacity-50"
                  title="Quick Generate AI Description"
                >
                  {generatingId === product.id ? (
                    <div className="w-4 h-4 border-2 border-coffee-700/30 border-t-coffee-700 rounded-full animate-spin" />
                  ) : (
                    <Sparkles size={15} />
                  )}
                </button>

                {isAdmin && (
                  <>
                    <button
                      onClick={() => openEdit(product)}
                      className="p-2 bg-cream-100 hover:bg-cream-200 text-coffee-700 rounded-xl border border-cream-300 transition-all"
                      title="Edit Menu"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition-all"
                      title="Hapus Menu (Soft Delete)"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
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
