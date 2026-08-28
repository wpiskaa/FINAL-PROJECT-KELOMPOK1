import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatRupiah, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import { ArrowLeft, Sparkles, Coffee, Tag, Clock, Wand2 } from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  function loadProduct() {
    api.get(`/products/${id}`)
      .then(res => setProduct(res.data.data.product))
      .catch(() => { toast.error('Produk tidak ditemukan'); navigate('/products'); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadProduct(); }, [id]);

  const [tone, setTone] = useState('modern');

  async function handleGenerateAI(selectedTone = tone) {
    setGenerating(true);
    const toastId = toast.loading(`🤖 Gemini AI (${selectedTone}) sedang membuat deskripsi...`);
    try {
      const res = await api.post(`/products/${id}/generate-description`, { tone: selectedTone });
      toast.success(`✨ Deskripsi AI (${selectedTone}) selesai! (${res.data.data.generation_time})`, { id: toastId });
      loadProduct();
    } catch {
      toast.error('Gagal generate deskripsi', { id: toastId });
    } finally {
      setGenerating(false);
    }
  }

  if (loading) return (
    <div className="space-y-4">
      <div className="skeleton h-8 w-48 rounded-xl" />
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-2xl animate-fadeIn">
      <button
        onClick={() => navigate('/products')}
        className="flex items-center gap-2 text-gray-400 hover:text-gray-100 transition-colors mb-6 text-sm"
      >
        <ArrowLeft size={16} />
        Kembali ke Produk
      </button>

      <div className="card space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs">
                <Tag size={10} className="mr-1" />
                {product.category_name || 'Umum'}
              </span>
              <span className={`badge text-xs ${product.is_available 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {product.is_available ? 'Tersedia' : 'Tidak Tersedia'}
              </span>
            </div>
            <h1 className="text-2xl font-bold font-['Outfit'] text-gray-100">{product.name}</h1>
            <p className="text-3xl font-bold gradient-text mt-1">{formatRupiah(product.price)}</p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-2xl flex items-center justify-center border border-amber-500/20">
            <Coffee size={28} className="text-amber-400" />
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-medium text-gray-400 mb-2">Deskripsi Manual</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            {product.description || <span className="text-gray-600 italic">Belum ada deskripsi manual</span>}
          </p>
        </div>

        {/* AI Description */}
        <div className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/15 rounded-2xl p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500/20 rounded-xl flex items-center justify-center">
                <Sparkles size={16} className="text-amber-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-amber-400">Deskripsi AI (Gemini)</p>
                <p className="text-xs text-gray-500">Pilih gaya bahasa deskripsi AI</p>
              </div>
            </div>
            <button
              id="generate-ai-btn"
              onClick={() => handleGenerateAI(tone)}
              disabled={generating}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 rounded-xl border border-amber-500/20 transition-all text-xs font-medium disabled:opacity-50"
            >
              {generating ? (
                <div className="w-3 h-3 border border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
              ) : (
                <Wand2 size={12} />
              )}
              {generating ? 'Generating...' : 'Generate AI'}
            </button>
          </div>

          {/* Tone Selector Buttons */}
          <div className="flex items-center gap-2 mb-4 p-1 bg-gray-900/60 rounded-xl border border-gray-800 w-fit">
            {[
              { id: 'modern', label: '☕ Modern / Santai' },
              { id: 'elegant', label: '✨ Elegan / Artisan' },
              { id: 'playful', label: '🎉 Ceria / Playful' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { setTone(item.id); handleGenerateAI(item.id); }}
                disabled={generating}
                className={`px-3 py-1 text-xs rounded-lg transition-all font-medium ${
                  tone === item.id
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {product.ai_description ? (
            <p className="text-gray-300 text-sm leading-relaxed">{product.ai_description}</p>
          ) : (
            <div className="text-center py-6">
              <Wand2 size={24} className="text-gray-600 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">Belum ada deskripsi AI</p>
              <button
                onClick={() => handleGenerateAI(tone)}
                disabled={generating}
                className="btn-primary mt-3 text-sm flex items-center gap-2 mx-auto"
              >
                <Sparkles size={14} />
                Generate dengan AI
              </button>
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-gray-600 pt-2 border-t border-gray-800">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>Dibuat: {formatDate(product.created_at)}</span>
          </div>
          {product.updated_at !== product.created_at && (
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>Diperbarui: {formatDate(product.updated_at)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
