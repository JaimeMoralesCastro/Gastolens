import { useState, useEffect } from 'react';
import { Mic, MicOff, Plus, Zap, AlertCircle, CheckCircle } from 'lucide-react';
import { parseExpenseText } from '../utils/nlpParser.js';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition.js';
import { formatCurrency } from '../utils/dateHelpers.js';
import { CATEGORIES } from '../utils/categoryConfig.js';

export default function ExpenseInput({ onAdd }) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState(null);
  const [toast, setToast] = useState(null);
  const { isListening, interim, supported, start, stop } = useSpeechRecognition();

  useEffect(() => {
    const t = text.trim() || interim;
    if (t.length > 3) {
      const parsed = parseExpenseText(t);
      setPreview(parsed);
    } else {
      setPreview(null);
    }
  }, [text, interim]);

  const handleMic = () => {
    if (isListening) { stop(); return; }
    start(result => setText(result));
  };

  const handleAdd = async () => {
    const raw = text.trim();
    if (!raw) return;
    const parsed = parseExpenseText(raw);
    if (parsed.amount <= 0) {
      setToast({ type: 'error', msg: 'No se detectó ningún importe. Incluye la cantidad (ej: "café 2€").' });
      setTimeout(() => setToast(null), 3500);
      return;
    }
    const ok = await onAdd(parsed);
    if (ok === false) {
      setToast({ type: 'error', msg: 'Error al guardar. Comprueba la conexión o el estado de la base de datos.' });
      setTimeout(() => setToast(null), 4000);
      return;
    }
    setText('');
    setPreview(null);
    const currencyNote = parsed.currency !== 'EUR' ? ` (${parsed.originalAmount} ${parsed.currency})` : '';
    setToast({ type: 'success', msg: `${parsed.description} — ${formatCurrency(parsed.amount)}${currencyNote}` });
    setTimeout(() => setToast(null), 2500);
  };

  const handleKey = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd(); }
  };

  const catColor = preview ? CATEGORIES[preview.category]?.color : undefined;
  const displayText = interim || text;

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-dark-700 border border-white/[0.06] rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-start gap-2">
          <Zap size={13} className="mt-0.5 flex-shrink-0" style={{ color: '#00d4ff' }} />
          <p className="text-white/30 text-xs leading-relaxed">
            Describe el gasto en lenguaje natural · <span style={{ color: '#00d4ff' }}>Ej: "Cena con amigos 45€"</span>
          </p>
        </div>

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              value={isListening ? interim : text}
              onChange={e => { if (!isListening) setText(e.target.value); }}
              onKeyDown={handleKey}
              placeholder="Pagué la luz 85€ · Café rápido 2.50€ · Supermercado 43€..."
              rows={2}
              className="w-full bg-dark-600 border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white/85 placeholder-white/20 resize-none focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all duration-200 leading-relaxed"
              style={{ caretColor: '#00d4ff' }}
            />
            {isListening && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                <span className="text-[10px] text-red-400 tracking-wider">ESCUCHANDO</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {supported && (
              <button
                onClick={handleMic}
                title={isListening ? 'Detener' : 'Activar micrófono'}
                className={`w-11 h-11 flex items-center justify-center rounded-lg border transition-all duration-200 active:scale-95 ${
                  isListening
                    ? 'bg-red-500/10 border-red-500/40 animate-pulse-mic'
                    : 'bg-dark-600 border-white/[0.08] hover:border-white/20'
                }`}
              >
                {isListening
                  ? <MicOff size={16} className="text-red-400" />
                  : <Mic size={16} className="text-white/50" />
                }
              </button>
            )}

            <button
              onClick={handleAdd}
              disabled={!displayText.trim()}
              className="w-11 h-11 flex items-center justify-center rounded-lg border border-white/[0.08] bg-dark-600 hover:border-neon-cyan/40 hover:bg-neon-cyan/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
            >
              <Plus size={18} style={{ color: '#00d4ff' }} />
            </button>
          </div>
        </div>

        {preview && preview.amount > 0 && (
          <div className="flex items-center gap-2 py-2 px-3 bg-white/[0.03] rounded-lg border border-white/[0.05] animate-fade-in">
            <span className="text-base">{CATEGORIES[preview.category]?.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-xs truncate">{preview.description}</p>
              <p className="text-white/30 text-[10px]">{preview.category} · {preview.subcategory}</p>
            </div>
            <div className="flex flex-col items-end flex-shrink-0">
              <span
                className="text-sm font-light tabular-nums"
                style={{ color: catColor, textShadow: `0 0 8px ${catColor}88` }}
              >
                {formatCurrency(preview.amount)}
              </span>
              {preview.currency !== 'EUR' && (
                <span className="text-[10px] text-white/30 tabular-nums">
                  {preview.originalAmount} {preview.currency}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm animate-slide-up ${
            toast.type === 'success'
              ? 'bg-neon-green/5 border-neon-green/20 text-neon-green'
              : 'bg-red-500/5 border-red-500/20 text-red-400'
          }`}
        >
          {toast.type === 'success'
            ? <CheckCircle size={14} />
            : <AlertCircle size={14} />
          }
          <span className="text-xs">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
