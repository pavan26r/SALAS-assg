'use client';

import { useEffect, useState } from 'react';
import { analyticsAPI } from '@/lib/api';
import { Analytics } from '@/types';
import { CallTrendChart, OutcomeDonutChart, ObjectionsChart } from '@/components/charts/AnalyticsCharts';
import { Phone, TrendingUp, TrendingDown, Minus, Star } from 'lucide-react';
import Link from 'next/link';

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: number | string; icon: React.ElementType; color: string; sub?: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="text-2xl font-bold text-white font-mono">{value}</div>
      <div className="text-sm text-slate-400 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.overview()
      .then(res => setAnalytics(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <div className="h-7 w-40 bg-slate-800 rounded shimmer mb-2" />
          <div className="h-4 w-60 bg-slate-800 rounded shimmer" />
        </div>
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-800 rounded-xl shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const ov = analytics?.overview;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-0.5">Sales call performance overview</p>
        </div>
        <Link
          href="/calls/new"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
        >
          <Phone className="w-4 h-4" />
          Analyze Call
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Calls"
          value={ov?.total ?? 0}
          icon={Phone}
          color="bg-indigo-600/20 text-indigo-400"
        />
        <StatCard
          label="Positive Calls"
          value={ov?.positive ?? 0}
          icon={TrendingUp}
          color="bg-emerald-600/20 text-emerald-400"
          sub={ov?.total ? `${Math.round(((ov.positive) / ov.total) * 100)}% win rate` : undefined}
        />
        <StatCard
          label="Negative Calls"
          value={ov?.negative ?? 0}
          icon={TrendingDown}
          color="bg-red-600/20 text-red-400"
        />
        <StatCard
          label="Avg. Sales Score"
          value={`${ov?.avgScore ?? 0}`}
          icon={Star}
          color="bg-amber-600/20 text-amber-400"
          sub="out of 100"
        />
      </div>

      {/* Charts row */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Call Trend — Last 7 Days</h3>
            <CallTrendChart analytics={analytics} />
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Outcome Breakdown</h3>
            <OutcomeDonutChart analytics={analytics} />
          </div>
        </div>
      )}

      {analytics && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-4">Top Objections</h3>
          <ObjectionsChart analytics={analytics} />
        </div>
      )}

      {/* Empty state */}
      {!loading && ov?.total === 0 && (
        <div className="mt-8 text-center py-16 bg-slate-900/50 border border-slate-800 border-dashed rounded-xl">
          <div className="w-14 h-14 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No calls analyzed yet</h3>
          <p className="text-slate-400 text-sm mb-6">Upload your first sales call transcript to get AI-powered insights</p>
          <Link
            href="/calls/new"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition"
          >
            <Phone className="w-4 h-4" />
            Analyze First Call
          </Link>
        </div>
      )}
    </div>
  );
}
