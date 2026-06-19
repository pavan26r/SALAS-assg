'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, Area, AreaChart
} from 'recharts';
import { Analytics } from '@/types';

const OUTCOME_COLORS = {
  positive: '#10b981',
  neutral: '#6366f1',
  negative: '#ef4444',
};

interface Props {
  analytics: Analytics;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs shadow-xl">
        <div className="text-slate-400 mb-1">{label}</div>
        {payload.map((p) => (
          <div key={p.name} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-slate-300 capitalize">{p.name}:</span>
            <span className="text-white font-semibold">{p.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function CallTrendChart({ analytics }: Props) {
  const data = analytics.trend.map(d => ({
    date: d._id.slice(5), // MM-DD
    calls: d.count,
    score: Math.round(d.avgScore || 0),
    positive: d.positive,
    negative: d.negative,
  }));

  if (!data.length) return (
    <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No trend data yet</div>
  );

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="callGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="calls" stroke="#6366f1" fill="url(#callGrad)" strokeWidth={2} name="Total Calls" />
        <Area type="monotone" dataKey="positive" stroke="#10b981" fill="none" strokeWidth={2} strokeDasharray="5 3" name="Positive" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function OutcomeDonutChart({ analytics }: Props) {
  const { positive, neutral, negative } = analytics.overview;
  const data = [
    { name: 'Positive', value: positive, color: '#10b981' },
    { name: 'Neutral', value: neutral, color: '#6366f1' },
    { name: 'Negative', value: negative, color: '#ef4444' },
  ].filter(d => d.value > 0);

  if (!data.length) return (
    <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No call data yet</div>
  );

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span className="text-slate-400 text-xs">{value}</span>}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function ObjectionsChart({ analytics }: Props) {
  const data = analytics.topObjections.map(o => ({ name: o._id, count: o.count }));

  if (!data.length) return (
    <div className="h-48 flex items-center justify-center text-slate-500 text-sm">No objection data yet</div>
  );

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
        <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} name="Occurrences" />
      </BarChart>
    </ResponsiveContainer>
  );
}
