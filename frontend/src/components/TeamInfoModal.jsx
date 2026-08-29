import { User, X } from 'lucide-react';

export default function TeamInfoModal({ isOpen, onClose, members }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="font-display font-bold text-lg text-[#2D1C10]">Informasi Kelompok</h3>
            <p className="text-xs text-[#6F4E2B]">BrewMate POS — Final Project</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8C6438] hover:bg-[#F5F0E8] rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          {members.map((m) => (
            <div
              key={m.nim}
              className="flex items-center gap-3 p-3 bg-[#FAF7F2] rounded-2xl border border-[#EAE3D9]"
            >
              <div className="w-9 h-9 shrink-0 bg-[#EFE6D8] rounded-xl flex items-center justify-center text-[#3D2616] font-bold text-sm">
                <User size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#2D1C10] truncate">{m.nama}</p>
                <p className="text-[11px] text-[#6F4E2B]">{m.nim} • {m.role}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 bg-[#3A2213] text-white rounded-xl font-semibold text-sm hover:bg-[#2D1A0F] transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}