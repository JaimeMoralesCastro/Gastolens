import { useEffect } from 'react';
import { X, Trash2, MessageSquareQuote, CalendarDays, Tag } from 'lucide-react';
import { CATEGORIES } from '../utils/categoryConfig.js';
import { formatDate, formatTime, formatCurrency } from '../utils/dateHelpers.js';

export default function ExpenseDetail({ expense, onClose, onDelete }) {
  const { id, description, category, subcategory, amount, originalAmount, currency, rawText, date } = expense;
  const catData = CATEGORIES[category];
  const color = catData?.color ?? '#6b7280';

  // Cerrar con Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleDelete = () => {
    onDelete(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full lg:w-[440px] bg-dark-700 border border-white/[0.08] rounded-t-2xl lg:rounded-2xl animate-slide-up overflow-hidden">
        {/* Handle bar (mobile) */}
        <div className="lg:hidden flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 rounded-full bg-white/[0.12]" />
        </div>

        {/* Close (desktop) */}
        <button
          onClick={onClose}
          className="hidden lg:flex absolute top-4 right-4 w-8 h-8 items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.05] transition-all"
        >
          <X size={15} />
        </button>

        <div className="px-6 pt-4 pb-8">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div
              className="w-14 h-14 flex items-center justify-center rounded-2xl flex-shrink-0 text-2xl"
              style={{ background: `${color}14`, border: `1px solid ${color}30` }}
            >
              {catData?.icon ?? '📦'}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <p className="text-white/85 text-base font-light leading-snug">{description}</p>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-md"
                  style={{ background: `${color}18`, color }}
                >
                  {category}
                </span>
                <span className="text-white/20 text-[10px]">›</span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-md"
                  style={{ background: `${color}10`, color: `${color}bb` }}
                >
                  {subcategory}
                </span>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div
            className="flex items-center justify-between px-4 py-3.5 rounded-xl mb-4"
            style={{ background: `${color}08`, border: `1px solid ${color}20` }}
          >
            <span className="text-white/40 text-xs tracking-wider">IMPORTE</span>
            <div className="text-right">
              <span
                className="text-2xl font-light tabular-nums"
                style={{ color, textShadow: `0 0 12px ${color}66` }}
              >
                {formatCurrency(amount)}
              </span>
              {currency && currency !== 'EUR' && (
                <p className="text-white/30 text-[10px] mt-0.5">
                  {originalAmount} {currency} · cambio medio 2024
                </p>
              )}
            </div>
          </div>

          {/* Lo que dijiste */}
          {rawText && (
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <MessageSquareQuote size={12} className="text-white/25" />
                <span className="text-white/25 text-[10px] tracking-widest uppercase">Lo que dijiste</span>
              </div>
              <p
                className="text-white/50 text-sm leading-relaxed px-3 py-2.5 rounded-xl border italic"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.06)' }}
              >
                "{rawText}"
              </p>
            </div>
          )}

          {/* Fecha */}
          <div className="flex items-center gap-1.5 mb-6">
            <CalendarDays size={12} className="text-white/25" />
            <span className="text-white/35 text-xs">
              {formatDate(date)} · {formatTime(date)}
            </span>
          </div>

          {/* Eliminar */}
          <button
            onClick={handleDelete}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400/70 hover:text-red-400 hover:border-red-500/35 hover:bg-red-500/8 transition-all duration-200 active:scale-[0.98] text-sm tracking-wider"
          >
            <Trash2 size={14} />
            Eliminar gasto
          </button>
        </div>
      </div>
    </div>
  );
}
