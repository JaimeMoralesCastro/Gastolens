import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, X, Check, AlertCircle, Loader2, FileText } from 'lucide-react';
import { classifyFromDescription } from '../utils/nlpParser.js';
import { CATEGORIES } from '../utils/categoryConfig.js';

// ── Parsers ──────────────────────────────────────────────────────────────────

function parseDate(str) {
  if (!str) return null;
  // "24/08/2026" → ISO
  const m = String(str).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}T12:00:00.000Z`;
  // Already ISO-ish
  if (String(str).includes('-')) return new Date(str).toISOString();
  return null;
}

function parseSerialDate(serial) {
  // Excel date serial
  const d = XLSX.SSF.parse_date_code(serial);
  if (!d) return null;
  return `${d.y}-${String(d.m).padStart(2,'0')}-${String(d.d).padStart(2,'0')}T12:00:00.000Z`;
}

function parseBBVA(workbook) {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });
  const results = [];
  for (let i = 5; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length < 6) continue;
    const rawDate = r[2]; // "Fecha" col (col C, index 2)
    const desc    = String(r[3] ?? '').trim();
    const tipo    = String(r[4] ?? '').trim();
    const importe = parseFloat(r[5]);
    if (!desc || isNaN(importe)) continue;
    // Only expenses (negative). Skip income, bizum received, transfers received
    if (importe >= 0) continue;
    const skip = ['transferencia recibida', 'ingreso', 'abono', 'bizum recibido'];
    if (skip.some(s => tipo.toLowerCase().includes(s))) continue;

    let date = typeof rawDate === 'number' ? parseSerialDate(rawDate) : parseDate(rawDate);
    if (!date) date = new Date().toISOString();

    results.push({ desc, amount: Math.abs(importe), date, bank: 'BBVA' });
  }
  return results;
}

function parseRevolut(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const idx = {
    tipo:   header.findIndex(h => h === 'Tipo'),
    fecha:  header.findIndex(h => h.includes('inicio')),
    desc:   header.findIndex(h => h === 'Descripción' || h === 'Descripcion'),
    importe:header.findIndex(h => h === 'Importe'),
    comision:header.findIndex(h => h === 'Comisión' || h === 'Comision'),
    state:  header.findIndex(h => h === 'State'),
  };

  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.replace(/^"|"$/g, '').trim());
    if (idx.state >= 0 && cols[idx.state] !== 'COMPLETADO') continue;

    const tipo    = cols[idx.tipo] ?? '';
    const skipTipos = ['recarga', 'reembolso', 'abono', 'cambio de divisa'];
    if (skipTipos.some(s => tipo.toLowerCase().includes(s))) continue;

    const desc    = cols[idx.desc] ?? '';
    const importe = parseFloat((cols[idx.importe] ?? '0').replace(',', '.'));
    const comision= parseFloat((cols[idx.comision] ?? '0').replace(',', '.'));
    const rawDate = cols[idx.fecha] ?? '';

    if (isNaN(importe) || importe >= 0) continue;

    let date = parseDate(rawDate.substring(0, 10));
    if (!date) date = new Date().toISOString();

    const amount = Math.abs(importe) + (comision > 0 ? comision : 0);
    results.push({ desc, amount: parseFloat(amount.toFixed(2)), date, bank: 'Revolut' });
  }
  return results;
}

function buildExpense(raw) {
  const { category, subcategory } = classifyFromDescription(raw.desc);
  return {
    description: raw.desc,
    amount: raw.amount,
    originalAmount: raw.amount,
    currency: 'EUR',
    category,
    subcategory,
    rawText: raw.desc,
    date: raw.date,
    bank: raw.bank,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ImportBank({ onImport, existingExpenses }) {
  const fileRef = useRef(null);
  const [step, setStep] = useState('idle'); // idle | preview | importing | done
  const [rows, setRows]   = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [progress, setProgress] = useState(0);
  const [error, setError]   = useState(null);

  function handleFile(file) {
    if (!file) return;
    setError(null);
    const reader = new FileReader();

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.onload = e => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'array' });
          const raw = parseBBVA(wb);
          finish(raw);
        } catch(err) {
          setError('No se pudo leer el archivo BBVA: ' + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = e => {
        try {
          const raw = parseRevolut(e.target.result);
          finish(raw);
        } catch(err) {
          setError('No se pudo leer el archivo Revolut: ' + err.message);
        }
      };
      reader.readAsText(file, 'UTF-8');
    }
  }

  function finish(raw) {
    if (raw.length === 0) {
      setError('No se encontraron gastos en el archivo. Comprueba que es un extracto válido de BBVA o Revolut.');
      return;
    }
    // Dedup: skip rows already in DB (same date + amount + description)
    const existing = new Set(
      existingExpenses.map(e => `${e.date?.substring(0,10)}|${e.amount}|${e.description}`)
    );
    const expenses = raw.map(buildExpense).filter(e => {
      const key = `${e.date?.substring(0,10)}|${e.amount}|${e.description}`;
      return !existing.has(key);
    });
    if (expenses.length === 0) {
      setError('Todos los gastos del archivo ya están importados.');
      return;
    }
    setRows(expenses);
    setSelected(new Set(expenses.map((_, i) => i)));
    setStep('preview');
  }

  async function doImport() {
    setStep('importing');
    const toImport = rows.filter((_, i) => selected.has(i));
    let done = 0;
    for (const exp of toImport) {
      await onImport(exp);
      done++;
      setProgress(Math.round((done / toImport.length) * 100));
    }
    setStep('done');
  }

  function reset() {
    setStep('idle');
    setRows([]);
    setSelected(new Set());
    setProgress(0);
    setError(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  const catColor = cat => CATEGORIES[cat]?.color ?? '#6b7280';
  const catIcon  = cat => CATEGORIES[cat]?.icon ?? '📦';

  if (step === 'done') {
    const n = rows.filter((_, i) => selected.has(i)).length;
    return (
      <div className="bg-dark-700 border border-white/[0.06] rounded-xl px-4 py-6 flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)' }}>
          <Check size={20} style={{ color: '#00ff88' }} />
        </div>
        <p className="text-white/70 text-sm">{n} gastos importados correctamente</p>
        <button onClick={reset} className="text-[10px] tracking-widest text-white/30 hover:text-white/60 transition-colors uppercase">
          Importar otro archivo
        </button>
      </div>
    );
  }

  if (step === 'importing') {
    return (
      <div className="bg-dark-700 border border-white/[0.06] rounded-xl px-4 py-6 flex flex-col items-center gap-3">
        <Loader2 size={20} className="animate-spin" style={{ color: '#00d4ff' }} />
        <p className="text-white/50 text-xs tracking-wider">Importando… {progress}%</p>
        <div className="w-full bg-white/5 rounded-full h-1 mt-1">
          <div className="h-1 rounded-full transition-all" style={{ width: `${progress}%`, background: '#00d4ff' }} />
        </div>
      </div>
    );
  }

  if (step === 'preview') {
    const allSelected = selected.size === rows.length;
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <p className="text-white/50 text-[10px] tracking-widest uppercase">
            {rows.length} gastos encontrados · {selected.size} seleccionados
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelected(allSelected ? new Set() : new Set(rows.map((_, i) => i)))}
              className="text-[10px] tracking-wider text-neon-cyan/60 hover:text-neon-cyan transition-colors"
            >
              {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
            </button>
            <button onClick={reset} className="text-white/25 hover:text-white/60 transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1 max-h-80 overflow-y-auto pr-1">
          {rows.map((exp, i) => {
            const isOn = selected.has(i);
            return (
              <div
                key={i}
                onClick={() => {
                  const s = new Set(selected);
                  isOn ? s.delete(i) : s.add(i);
                  setSelected(s);
                }}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all border ${isOn ? 'bg-dark-700 border-white/[0.08]' : 'bg-dark-800 border-transparent opacity-40'}`}
              >
                <div className={`w-4 h-4 rounded-md flex-shrink-0 flex items-center justify-center border transition-all ${isOn ? 'border-neon-green/50' : 'border-white/20'}`}
                  style={isOn ? { background: 'rgba(0,255,136,0.15)' } : {}}>
                  {isOn && <Check size={9} style={{ color: '#00ff88' }} />}
                </div>
                <span className="text-base flex-shrink-0">{catIcon(exp.category)}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/75 text-xs truncate">{exp.description}</p>
                  <p className="text-white/25 text-[10px]">{exp.date?.substring(0, 10)} · {exp.bank}</p>
                </div>
                <span className="text-xs font-light tabular-nums flex-shrink-0" style={{ color: catColor(exp.category) }}>
                  {exp.amount.toFixed(2)} €
                </span>
              </div>
            );
          })}
        </div>

        <button
          onClick={doImport}
          disabled={selected.size === 0}
          className="w-full py-3 rounded-xl text-xs tracking-widest uppercase transition-all disabled:opacity-30"
          style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.25)', color: '#00ff88' }}
        >
          Importar {selected.size} gastos
        </button>
      </div>
    );
  }

  // idle
  return (
    <div className="flex flex-col gap-3">
      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2.5">
          <AlertCircle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400/80 text-xs leading-relaxed">{error}</p>
        </div>
      )}
      <button
        onClick={() => fileRef.current?.click()}
        className="w-full flex flex-col items-center gap-2.5 py-6 rounded-xl border border-dashed border-white/[0.12] hover:border-white/25 hover:bg-white/[0.02] transition-all"
      >
        <Upload size={20} className="text-white/25" />
        <div className="text-center">
          <p className="text-white/50 text-xs">Selecciona un extracto bancario</p>
          <p className="text-white/20 text-[10px] mt-1">BBVA (.xlsx) · Revolut (.csv)</p>
        </div>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0])}
      />
      <div className="flex items-center gap-2 px-1">
        <FileText size={11} className="text-white/15 flex-shrink-0" />
        <p className="text-white/15 text-[10px] leading-relaxed">
          Los datos se procesan localmente en tu dispositivo. Solo los gastos seleccionados se guardan en tu cuenta.
        </p>
      </div>
    </div>
  );
}
