import { formatCurrency } from '../utils/dateHelpers.js';
import { Sun, CalendarDays, TrendingUp } from 'lucide-react';

const CARDS = [
  { key: 'today', label: 'Hoy', Icon: Sun, color: '#00ff88', shadow: '0 0 12px rgba(0,255,136,0.35)' },
  { key: 'week', label: 'Semana', Icon: CalendarDays, color: '#00d4ff', shadow: '0 0 12px rgba(0,212,255,0.35)' },
  { key: 'month', label: 'Mes', Icon: TrendingUp, color: '#a855f7', shadow: '0 0 12px rgba(168,85,247,0.35)' },
];

export default function BalanceCards({ today, week, month }) {
  const values = { today, week, month };

  return (
    <div className="grid grid-cols-3 gap-2 lg:gap-3">
      {CARDS.map(({ key, label, Icon, color, shadow }) => (
        <div
          key={key}
          className="bg-dark-700 border border-white/[0.06] rounded-xl p-3 lg:p-4 flex flex-col gap-2 lg:gap-3 transition-all duration-300 hover:border-white/[0.12]"
        >
          <div className="flex items-center justify-between">
            <span className="text-white/35 text-[10px] lg:text-xs tracking-widest font-light uppercase">
              {label}
            </span>
            <Icon size={13} style={{ color, opacity: 0.7 }} />
          </div>
          <span
            className="text-base lg:text-xl font-light tabular-nums leading-none"
            style={{ color, textShadow: shadow }}
          >
            {formatCurrency(values[key])}
          </span>
        </div>
      ))}
    </div>
  );
}
