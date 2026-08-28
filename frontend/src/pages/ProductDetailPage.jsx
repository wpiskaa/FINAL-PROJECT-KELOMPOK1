import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { formatRupiah, formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Sparkles, Coffee, Tag, Clock, Wand2,
  CheckCircle2, XCircle, Edit3, Save, MessageSquareText
} from 'lucide-react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // AI Generation & Draft state
  const [tone, setTone] = useState('modern');
  const [generating, setGenerating] = useState(false);
  const [aiDraft, setAiDraft] = useState('');
  const [isEditingDraft, setIsEditingDraft] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  function loadProduct() {
    api.get(`/products/${id}`)
      .then(res => {
        setProduct(res.data.data.product);
        setAiDraft(''); // Reset draft on reload
      })
      .catch(() => { toast.error('Produk tidak ditemukan'); navigate('/products'); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadProduct(); }, [id]);

  // Step 1: Generate AI Draft Preview (Not saved to DB yet)
  async function handleGenerateAIDraft(selectedTone = tone) {
    setGenerating(true);
    const toastId = toast.loading(`🤖 Gemini AI (${selectedTone}) sedang membuat draf deskripsi...`);
    try {
      const res = await api.post(`/products/${id}/generate-description`, { tone: selectedTone, save: false });
      const generatedText = res.data.data.ai_description;
      setAiDraft(generatedText);
      setIsEditingDraft(true);
      toast.success(`✨ Draf AI selesai (${res.data.data.generation_time})! Silakan tinjau/edit sebelum disimpan.`, { id: toastId });
    } catch {
      toast.error('Gagal generate deskripsi AI', { id: toastId });
    } finally {
      setGenerating(false);
    }
  }

  // Step 2: Confirm & Save Draft to Database
  async function handleSaveAIDescription() {
    if (!aiDraft.trim()) {
      toast.error('Deskripsi AI tidak boleh kosong!');
      return;
    }
    setSavingDraft(true);
    try {
      await api.post(`/products/${id}/save-ai-description`, { ai_description: aiDraft.trim() });
      toast.success('✅ Deskripsi AI berhasil disetujui & disimpan!');
      setIsEditingDraft(false);
      loadProduct();
    } catch {
      toast.error('Gagal menyimpan deskripsi AI');
    } finally {
      setSavingDraft(false);
    }
  }

  function handleCancelDraft() {
    setAiDraft('');
    setIsEditingDraft(false);
    toast('Draf AI dibatalkan', { icon: 'ℹ️' });
  }

  if (loading) return (
    <div className="space-y-4 max-w-3xl">
      <div className="skeleton h-8 w-48 rounded-xl" />
      <div className="skeleton h-64 rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-3xl animate-fadeIn space-y-6">
      <button
        onClick={() => navigate('/products')}
        className="flex items-center gap-2 text-coffee-600 hover:text-coffee-950 font-medium transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        Kembali ke Katalog Menu
      </button>

      <div className="card space-y-6 bg-white border border-[#EAE3D9] shadow-card rounded-3xl p-6 sm:p-8">
        
        {/* Header Details */}
        <div className="flex items-start justify-between gap-4 pb-6 border-b border-[#F0E9DF]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge bg-coffee-100 text-coffee-800 border border-coffee-200 text-xs">
                <Tag size={12} className="mr-1" />
                {product.category_name || 'Umum'}
              </span>
              <span className={`badge text-xs ${product.is_available 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                {product.is_available ? '● Tersedia' : '● Stok Habis'}
              </span>
            </div>
            <h1 className="text-3xl font-bold font-display text-coffee-950">{product.name}</h1>
            <p className="text-2xl font-bold text-coffee-700 mt-1">{formatRupiah(product.price)}</p>
          </div>
          <div className="w-16 h-16 bg-cream-200 rounded-2xl flex items-center justify-center border border-cream-300 shadow-sm flex-shrink-0">
            <Coffee size={32} className="text-coffee-800" />
          </div>
        </div>

        {/* Manual Description */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-coffee-500 mb-2">Deskripsi Manual Menu</h3>
          <p className="text-coffee-800 text-sm leading-relaxed bg-[#FAF8F5] p-4 rounded-2xl border border-[#EBE4D8]">
            {product.description || <span className="text-coffee-400 italic">Belum ada deskripsi manual</span>}
          </p>
        </div>

        {/* AI Description Panel with Draft Preview & Edit Workflow */}
        <div className="bg-gradient-to-br from-[#FAF7F2] to-[#F5EFE6] border border-[#E2D6C5] rounded-3xl p-6 shadow-sm space-y-4">
          
          {/* Top Panel Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-coffee-800 rounded-xl flex items-center justify-center shadow-xs">
                <Sparkles size={18} className="text-amber-300" />
              </div>
              <div>
                <p className="text-sm font-bold text-coffee-950 font-display">Asisten AI Gemini</p>
                <p className="text-xs text-coffee-600">Generate draf deskripsi → Tinjau/Edit → Simpan ke Database</p>
              </div>
            </div>

            <button
              id="generate-ai-btn"
              onClick={() => handleGenerateAIDraft(tone)}
              disabled={generating}
              className="btn-primary flex items-center gap-2 py-2 text-xs font-semibold"
            >
              {generating ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Wand2 size={14} />
              )}
              {generating ? 'Membuat Draf...' : 'Generate Draf AI'}
            </button>
          </div>

          {/* Tone Selector Pills */}
          <div className="flex items-center gap-2 p-1 bg-white rounded-2xl border border-[#E2D6C5] w-fit shadow-2xs">
            {[
              { id: 'modern', label: '☕ Modern / Santai' },
              { id: 'elegant', label: '✨ Elegan / Artisan' },
              { id: 'playful', label: '🎉 Ceria / Playful' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { setTone(item.id); handleGenerateAIDraft(item.id); }}
                disabled={generating}
                className={`px-3 py-1.5 text-xs rounded-xl transition-all font-semibold ${
                  tone === item.id
                    ? 'bg-coffee-800 text-white shadow-xs'
                    : 'text-coffee-700 hover:text-coffee-950 hover:bg-cream-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* DRAFT PREVIEW & MANUAL EDIT SECTION (User Request #2) */}
          {isEditingDraft ? (
            <div className="bg-white p-4 rounded-2xl border-2 border-coffee-500 shadow-md space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="badge bg-amber-100 text-amber-900 border border-amber-300 text-[11px]">
                  <MessageSquareText size={12} className="mr-1" /> Draf AI Baru (Dapat Diedit Manual)
                </span>
                <span className="text-[11px] text-coffee-500">Edit teks di bawah jika perlu penyesuaian</span>
              </div>

              {/* Editable Textarea */}
              <textarea
                value={aiDraft}
                onChange={e => setAiDraft(e.target.value)}
                rows={3}
                className="input-field text-sm font-sans bg-[#FAF8F5] resize-none leading-relaxed border-coffee-300"
                placeholder="Tulis atau edit deskripsi AI di sini..."
              />

              {/* Action Buttons: Confirm vs Cancel */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-cream-200">
                <button
                  type="button"
                  onClick={handleCancelDraft}
                  disabled={savingDraft}
                  className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5 text-rose-700 hover:bg-rose-50"
                >
                  <XCircle size={14} /> Batalkan Draf
                </button>
                <button
                  type="button"
                  onClick={handleSaveAIDescription}
                  disabled={savingDraft}
                  className="btn-primary py-2 px-4 text-xs flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800"
                >
                  {savingDraft ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  <span>Setujui & Simpan Deskripsi</span>
                </button>
              </div>
            </div>
          ) : product.ai_description ? (
            /* SAVED AI DESCRIPTION DISPLAY */
            <div className="bg-white p-4 rounded-2xl border border-[#E2D6C5] space-y-2">
              <div className="flex items-center justify-between text-xs text-coffee-600">
                <span className="font-semibold text-coffee-900 flex items-center gap-1">
                  <CheckCircle2 size={14} className="text-emerald-600" /> Deskripsi AI Tersimpan
                </span>
                <button
                  onClick={() => { setAiDraft(product.ai_description); setIsEditingDraft(true); }}
                  className="text-coffee-700 hover:text-coffee-950 flex items-center gap-1 font-semibold text-xs"
                >
                  <Edit3 size={12} /> Edit Teks Tersimpan
                </button>
              </div>
              <p className="text-coffee-800 text-sm leading-relaxed">{product.ai_description}</p>
            </div>
          ) : (
            /* EMPTY STATE */
            <div className="text-center py-6 bg-white/50 rounded-2xl border border-dashed border-[#DCCCB4]">
              <Wand2 size={24} className="text-coffee-400 mx-auto mb-2" />
              <p className="text-coffee-700 text-sm font-medium">Belum ada deskripsi AI yang disetujui</p>
              <button
                onClick={() => handleGenerateAIDraft(tone)}
                disabled={generating}
                className="btn-primary mt-3 text-xs flex items-center gap-2 mx-auto"
              >
                <Sparkles size={14} />
                Buat Draf AI Baru
              </button>
            </div>
          )}

        </div>

        {/* Metadata Footer */}
        <div className="flex items-center gap-4 text-xs text-coffee-500 pt-2">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>Terdaftar: {formatDate(product.created_at)}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
