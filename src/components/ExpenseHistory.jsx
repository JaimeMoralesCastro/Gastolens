import { useState, useMemo } from 'react';
import { Search, Trash2, X, ChevronDown } from 'lucide-react';
import { CATEGORIES, CATEGORY_LIST } from '../utils/categoryConfig.js';
import { formatDate, formatTime, formatCurrency, startOfDay, startOfWeek, startOfMonth } from '../utils/dateHelpers.js';

const DATE_FILTERS = [
  { id: null, label: 'Todo' },
  { id: 'today', label: 'Hoy' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mes' },
  { id: 'custom', label: 'Rango' },
];

export default function ExpenseHistory({ expenses, onDelete, onSelect }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [minAmt, setMinAmt] = useState('');
  const [maxAmt, setMaxAmt] = useState('');
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return expenses.filter(e => {
      if (q && !e.description.toLowerCase().includes(q) &&
          !e.category.toLowerCase().includes(q) &&
          !e.subcategory.toLowerCase().includes(q) &&
          !e.rawText.toLowerCase().includes(q)) return false;

      if (category && e.category !== category) return false;

      const d = new Date(e.date);
      if (dateFilter === 'today' && d < startOfDay()) return false;
      if (dateFilter === 'week' && d < startOfWeek()) return false;
      if (dateFilter === 'month' && d < startOfMonth()) return false;
      if (dateFilter === 'custom') {
        if (dateFrom && d < new Date(dateFrom)) return false;
        if (dateTo && d > new Date(dateTo + 'T23:59:59')) return false;
      }

      if (minAmt && e.amount < parseFloat(minAmt)) return false;
      if (maxAmt && e.amount > parseFloat(maxAmt)) return false;

      return true;
    });
  }, [expenses, search, category, dateFilter, dateFrom, dateTo, minAmt, maxAmt]);

  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);
  const hasFilters = search || category || dateFilter || minAmt || maxAmt;

  const clearFilters = () => {
    setSearch(''); setCategory(''); setDateFilter(null);
    setDateFrom(''); setDateTo(''); setMinAmt(''); setMaxAmt('');
    setShowPriceFilter(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar gastos..."
          className="w-full bg-dark-700 border border-white/[0.07] rounded-xl pl-9 pr-4 py-3 text-sm text-white/80 placeholder-white/20 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/10 transition-all"
          style={{ caretColor: '#00d4ff' }}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-col gap-2">
        {/* Category chips */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <Chip active={!category} onClick={() => setCategory('')}>Todos</Chip>
          {CATEGORY_LIST.filter(c => c !== 'Otros').map(cat => (
            <Chip key={cat} active={category === cat} onClick={() => setCategory(category === cat ? '' : cat)}>
              <span>{CATEGORIES[cat].icon}</span>
              <span>{cat}</span>
            </Chip>
          ))}
        </div>

        {/* Date + Price row */}
        <div className="flex gap-1.5 flex-wrap items-center">
          {DATE_FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => { setDateFilter(f.id === dateFilter ? null : f.id); }}
              className={`px-2.5 py-1 rounded-lg text-[11px] tracking-wide border transition-all whitespace-nowrap ${
                dateFilter === f.id && f.id !== null
                  ? 'border-purple-500/50 bg-purple-500/10 text-purple-300'
                  : 'border-white/[0.07] text-white/35 hover:border-white/15 hover:text-white/55'
              }`}
            >
              {f.label}
            </button>
          ))}
          <button
            onClick={() => setShowPriceFilter(v => !v)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] tracking-wide border transition-all ${
              showPriceFilter || minAmt || maxAmt
                ? 'border-purple-500/50 bg-purple-500/10 text-purple-300'
                : 'border-white/[0.07] text-white/35 hover:border-white/15 hover:text-white/55'
            }`}
          >
            Precio <ChevronDown size={10} />
          </button>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 px-2 py-1 text-[11px] text-red-400/60 hover:text-red-400 transition-colors ml-auto">
              <X size={10} /> Limpiar
            </button>
          )}
        </div>

        {/* Custom date range */}
        {dateFilter === 'custom' && (
          <div className="flex gap-2 animate-fade-in">
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="flex-1 bg-dark-700 border border-white/[0.07] rounded-lg px-3 py-1.5 text-xs text-white/60 focus:outline-none focus:border-purple-500/40 [color-scheme:dark]" />
            <span className="text-white/20 self-center text-xs">—</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="flex-1 bg-dark-700 border border-white/[0.07] rounded-lg px-3 py-1.5 text-xs text-white/60 focus:outline-none focus:border-purple-500/40 [color-scheme:dark]" />
          </div>
        )}

        {/* Price range */}
        {showPriceFilter && (
          <div className="flex gap-2 animate-fade-in">
            <input type="number" value={minAmt} onChange={e => setMinAmt(e.target.value)}
              placeholder="Mín €" min={0}
              className="flex-1 bg-dark-700 border border-white/[0.07] rounded-lg px-3 py-1.5 text-xs text-white/60 placeholder-white/20 focus:outline-none focus:border-purple-500/40 [color-scheme:dark]" />
            <input type="number" value={maxAmt} onChange={e => setMaxAmt(e.target.value)}
              placeholder="Máx €" min={0}
              className="flex-1 bg-dark-700 border border-white/[0.07] rounded-lg px-3 py-1.5 text-xs text-white/60 placeholder-white/20 focus:outline-none focus:border-purple-500/40 [color-scheme:dark]" />
          </div>
        )}
      </div>

      {/* Results summary */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-white/25 text-xs">{filtered.length} registro{filtered.length !== 1 ? 's' : ''}</span>
          <span className="text-xs font-light tabular-nums" style={{ color: '#a855f7', textShadow: '0 0 8px rgba(168,85,247,0.5)' }}>
            {formatCurrency(totalFiltered)}
          </span>
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-1.5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-4xl opacity-20">🔍</span>
            <p className="text-white/20 text-sm">
              {expenses.length === 0 ? 'Aún no hay gastos registrados' : 'No hay resultados para esta búsqueda'}
            </p>
          </div>
        ) : (
          filtered.map(expense => <ExpenseItem key={expense.id} expense={expense} onDelete={onDelete} onSelect={onSelect} />)
        )}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] tracking-wide border transition-all whitespace-nowrap flex-shrink-0 ${
        active
          ? 'border-neon-green/40 bg-neon-green/8 text-neon-green'
          : 'border-white/[0.07] text-white/35 hover:border-white/15 hover:text-white/55'
      }`}
    >
      {children}
    </button>
  );
}

function ExpenseItem({ expense, onDelete, onSelect }) {
  const { id, description, category, subcategory, amount, originalAmount, currency, date } = expense;
  const catData = CATEGORIES[category];
  const color = catData?.color ?? '#6b7280';

  return (
    <div
      className="group flex items-center gap-3 bg-dark-700 border border-white/[0.05] hover:border-white/[0.12] rounded-xl px-4 py-3 transition-all duration-200 animate-fade-in cursor-pointer active:scale-[0.99]"
      onClick={() => onSelect?.(expense)}
    >
      <span className="text-xl flex-shrink-0">{catData?.icon ?? '📦'}</span>

      <div className="flex-1 min-w-0">
        <p className="text-white/80 text-sm truncate leading-snug">{description}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${color}18`, color }}>
            {subcategory}
          </span>
          <span className="text-white/25 text-[10px]">{formatDate(date)} · {formatTime(date)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex flex-col items-end">
          <span
            className="text-sm font-light tabular-nums"
            style={{ color, textShadow: `0 0 8px ${color}66` }}
          >
            {formatCurrency(amount)}
          </span>
          {currency && currency !== 'EUR' && (
            <span className="text-[10px] text-white/25 tabular-nums">
              {originalAmount} {currency}
            </span>
          )}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete(id); }}
          className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all duration-150 active:scale-90"
          title="Eliminar"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
