import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatRupiah, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Sparkles, Coffee, Tag, Clock, Wand2,
  CheckCircle2, RotateCcw, Edit3, Save, MessageSquareText
} from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Editable description state
  const [descriptionText, setDescriptionText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isAiDraft, setIsAiDraft] = useState(false);

  function loadProduct() {
    api.get(`/products/${id}`)
      .then(res => {
        const prod = res.data.data.product;
        setProduct(prod);
        const currentDesc = prod.ai_description || prod.description || '';
        setDescriptionText(currentDesc);
        setOriginalText(currentDesc);
        setIsAiDraft(false);
      })
      .catch(() => { toast.error('Produk tidak ditemukan'); navigate('/products'); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadProduct(); }, [id]);

  // Step 1: Generate AI Draft directly into the editable textarea
  async function handleGenerateAIDraft() {
    setGenerating(true);
    const toastId = toast.loading('🤖 Gemini AI sedang membuat draf deskripsi...');
    try {
      const res = await api.post(`/products/${id}/generate-description`);
      const generatedText = res.data.data.ai_description;
      setDescriptionText(generatedText);
      setIsAiDraft(true);
      toast.success(`✨ Draf AI selesai (${res.data.data.generation_time})! Kamu bisa edit teks ini sebelum menyimpan.`, { id: toastId });
    } catch {
      toast.error('Gagal membuat draf deskripsi AI', { id: toastId });
    } finally {
      setGenerating(false);
    }
  }

  // Step 2: Save the edited/confirmed description to the database
  async function handleSaveDescription() {
    if (!descriptionText.trim()) {
      toast.error('Deskripsi menu tidak boleh kosong!');
      return;
    }
    setSaving(true);
    try {
      await api.post(`/products/${id}/save-ai-description`, { ai_description: descriptionText.trim() });
      toast.success('✅ Deskripsi menu berhasil disimpan!');
      setOriginalText(descriptionText.trim());
      setIsAiDraft(false);
      loadProduct();
    } catch {
      toast.error('Gagal menyimpan deskripsi menu');
    } finally {
      setSaving(false);
    }
  }

  // Reset to saved state
  function handleReset() {
    setDescriptionText(originalText);
    setIsAiDraft(false);
    toast('Teks dikembalikan ke deskripsi tersimpan', { icon: 'ℹ️' });
  }

  const isChanged = descriptionText !== originalText;

  if (loading) return (
    <div className="space-y-4 max-w-3xl">
      <div className="skeleton h-8 w-48 rounded-xl" />
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-3xl animate-fadeIn space-y-6 font-sans">
      
      {/* Back Button */}
      <button
        onClick={() => navigate('/products')}
        className="flex items-center gap-2 text-[#6F4E2B] hover:text-[#2D1C10] font-semibold transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        Kembali ke Katalog Menu
      </button>

      {/* Main Detail & Edit Card */}
      <div className="bg-white border border-[#EAE3D9] shadow-card rounded-3xl p-6 sm:p-8 space-y-6">
        
        {/* Product Header Info */}
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-[#F0E9DF]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge bg-[#EFE6D8] text-[#3D2616] border border-[#E2D9CC] text-xs font-bold">
                <Tag size={12} className="mr-1" />
                {product.category_name || 'Umum'}
              </span>
              <span className={`badge text-xs font-bold ${product.is_available 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {product.is_available ? '● Tersedia' : '● Stok Habis'}
              </span>
            </div>
            <h1 className="text-3xl font-bold font-display text-[#2D1C10]">{product.name}</h1>
            <p className="text-2xl font-bold text-[#6F4E2B] mt-1">{formatRupiah(product.price)}</p>
          </div>
          <div className="w-16 h-16 bg-[#EFE6D8] rounded-2xl flex items-center justify-center border border-[#E2D9CC] shadow-sm flex-shrink-0">
            <Coffee size={32} className="text-[#3A2213]" />
          </div>
        </div>

        {/* Deskripsi Menu (Editable Textarea + AI Generator & Save Workflow) */}
        <div className="space-y-3">
          
          {/* Section Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Edit3 size={16} className="text-[#4A2E1A]" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#2D1C10]">Deskripsi Menu</h2>
              
              {isAiDraft && (
                <span className="badge bg-amber-100 text-amber-900 border border-amber-300 text-[11px]">
                  <Sparkles size={11} className="mr-1" /> Draf AI (Belum Disimpan)
                </span>
              )}
            </div>

            {/* AI Generate Button */}
            <button
              id="generate-ai-btn"
              onClick={handleGenerateAIDraft}
              disabled={generating}
              className="btn-primary flex items-center gap-2 py-2 px-3 text-xs font-bold shadow-md"
            >
              {generating ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Wand2 size={14} />
              )}
              {generating ? 'Membuat Draf AI...' : 'Generate Draf AI'}
            </button>
          </div>

          {/* Interactive Editable Textarea */}
          <div className="relative">
            <textarea
              value={descriptionText}
              onChange={e => setDescriptionText(e.target.value)}
              rows={4}
              placeholder="Tulis deskripsi menu atau klik 'Generate Draf AI' untuk buat otomatis dengan Gemini..."
              className="input-field text-sm font-sans bg-[#FAF8F5] resize-none leading-relaxed border-[#E2D9CC] focus:bg-white text-[#2D1C10]"
            />
            <span className="absolute bottom-2.5 right-3 text-[10px] text-[#8C6438] font-semibold">
              Bisa diedit manual
            </span>
          </div>

          {/* Action Bar (Save & Reset) */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-[#6F4E2B]">
              {isChanged ? '⚠️ Ada perubahan teks belum disimpan' : '✅ Teks sesuai database'}
            </p>

            <div className="flex items-center gap-2">
              {isChanged && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={saving}
                  className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5 text-[#5C3B24]"
                >
                  <RotateCcw size={14} /> Reset
                </button>
              )}
              <button
                type="button"
                onClick={handleSaveDescription}
                disabled={saving || (!isChanged && !isAiDraft)}
                className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5 bg-[#4A2E1A] hover:bg-[#372112] disabled:opacity-50 font-bold"
              >
                {saving ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 size={15} />
                )}
                <span>Simpan Deskripsi</span>
              </button>
            </div>
          </div>

        </div>

        {/* Metadata Footer */}
        <div className="flex items-center gap-4 text-xs text-[#8C6438] pt-4 border-t border-[#F0E9DF]">
          <div className="flex items-center gap-1">
            <Clock size={13} />
            <span>Terdaftar: {formatDate(product.created_at)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
