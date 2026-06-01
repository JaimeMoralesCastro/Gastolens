import { useState } from 'react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as PieTooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as LineTooltip,
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDayLabel, isSameDay, formatCurrency } from '../utils/dateHelpers.js';
import { CATEGORIES } from '../utils/categoryConfig.js';

const TOOLTIP_STYLE = {
  background: '#121212',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '10px',
  color: '#fff',
  fontSize: 12,
  padding: '8px 12px',
};

function DonutTooltip({ active, payload, monthTotal }) {
  if (!active || !payload?.length) return null;
  const { name, value, color } = payload[0].payload;
  const pct = monthTotal > 0 ? ((value / monthTotal) * 100).toFixed(1) : '0.0';
  return (
    <div style={{
      background: '#121212',
      border: `1px solid ${color}44`,
      borderRadius: '10px',
      fontSize: 12,
      padding: '8px 12px',
    }}>
      <p style={{ color, margin: 0, fontWeight: 300 }}>
        {name} : {formatCurrency(value)} · {pct}%
      </p>
    </div>
  );
}

function buildDonutData(expenses, year, month) {
  const monthly = expenses.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const totals = {};
  for (const e of monthly) totals[e.category] = (totals[e.category] || 0) + e.amount;
  return Object.entries(totals)
    .map(([name, value]) => ({ name, value: +value.toFixed(2), color: CATEGORIES[name]?.color ?? '#6b7280' }))
    .sort((a, b) => b.value - a.value);
}

function buildLineData(expenses, year, month, isCurrentMonth) {
  const now = new Date();
  const first = new Date(year, month, 1);
  const last = isCurrentMonth ? now : new Date(year, month + 1, 0);
  const days = [];
  for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
    const clone = new Date(d);
    const total = expenses
      .filter(e => isSameDay(e.date, clone))
      .reduce((s, e) => s + e.amount, 0);
    days.push({ day: getDayLabel(clone.toISOString()), amount: +total.toFixed(2) });
  }
  return days;
}

export default function Charts({ expenses }) {
  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0);

  const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const isCurrentMonth = monthOffset === 0;

  const monthLabel = viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  const monthShort = viewDate.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();

  const donutData = buildDonutData(expenses, year, month);
  const lineData = buildLineData(expenses, year, month, isCurrentMonth);
  const monthTotal = donutData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">

      {/* Month navigator */}
      <div className="lg:col-span-2 flex items-center justify-between px-1">
        <button
          onClick={() => setMonthOffset(o => o - 1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/[0.08] text-white/30 hover:text-white/60 hover:border-white/[0.15] transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-[10px] tracking-[0.2em] text-white/40 uppercase">{monthLabel}</span>
        <button
          onClick={() => setMonthOffset(o => o + 1)}
          disabled={isCurrentMonth}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-white/[0.08] text-white/30 hover:text-white/60 hover:border-white/[0.15] transition-colors disabled:opacity-20 disabled:cursor-default"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Donut */}
      <div className="bg-dark-700 border border-white/[0.06] rounded-xl p-5">
        <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase mb-4">Distribución Mensual</p>
        {donutData.length === 0 ? (
          <div className="flex items-center justify-center h-44 text-white/20 text-sm">
            Sin datos este mes
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="relative flex-shrink-0" style={{ width: 180, height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={82}
                    dataKey="value"
                    strokeWidth={0}
                    paddingAngle={2}
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <PieTooltip
                    content={(props) => <DonutTooltip {...props} monthTotal={monthTotal} />}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-light tabular-nums" style={{ color: '#00ff88', textShadow: '0 0 10px rgba(0,255,136,0.6)' }}>
                  {monthTotal.toFixed(0)}€
                </span>
                <span className="text-[9px] text-white/25 tracking-widest mt-0.5">
                  {isCurrentMonth ? 'ESTE MES' : monthShort}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 flex-1 w-full min-w-0">
              {donutData.map(({ name, value, color }) => (
                <div key={name} className="flex items-center gap-2 group">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}88` }} />
                  <span className="text-white/50 text-xs truncate flex-1">{name}</span>
                  <span className="text-xs font-light tabular-nums" style={{ color }}>{formatCurrency(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Line */}
      <div className="bg-dark-700 border border-white/[0.06] rounded-xl p-5">
        <p className="text-white/40 text-[10px] tracking-[0.2em] uppercase mb-4">Evolución Mensual</p>
        {lineData.every(d => d.amount === 0) ? (
          <div className="flex items-center justify-center h-44 text-white/20 text-sm">
            Sin datos este mes
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={lineData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <filter id="glow-cyan">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.06)' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.25)', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={v => `${v}€`}
              />
              <LineTooltip
                contentStyle={TOOLTIP_STYLE}
                formatter={v => [formatCurrency(v), 'Gasto']}
                labelStyle={{ color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#00d4ff"
                strokeWidth={1.5}
                dot={{ fill: '#00d4ff', r: 2.5, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#00d4ff', strokeWidth: 0, style: { filter: 'url(#glow-cyan)' } }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
