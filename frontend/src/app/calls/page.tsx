'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { callsAPI } from '@/lib/api';
import { Call } from '@/types';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { Phone, PlusCircle, Trash2, ChevronRight, Loader2, User, Calendar } from 'lucide-react';

const OUTCOME_COLORS = {
  positive: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  neutral: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  negative: 'text-red-400 bg-red-500/10 border-red-500/30',
};

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  const fetchCalls = () => {
    callsAPI.getAll({ limit: 50 })
      .then(res => setCalls(res.data.calls))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCalls(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this call? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await callsAPI.delete(id);
      setCalls(calls.filter(c => c._id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(null);
    }
  };

  const filtered = calls.filter(c =>
    !filter ||
    c.title.toLowerCase().includes(filter.toLowerCase()) ||
    c.customerName.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Call Analysis</h1>
          <p className="text-slate-400 text-sm mt-0.5">{calls.length} calls total</p>
        </div>
        <Link
          href="/calls/new"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          <PlusCircle className="w-4 h-4" />
          New Analysis
        </Link>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by title or customer..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-slate-800 rounded-xl shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 border border-slate-800 border-dashed rounded-xl">
          <Phone className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No calls found</p>
          <Link href="/calls/new" className="inline-flex items-center gap-2 mt-4 text-indigo-400 hover:text-indigo-300 text-sm transition">
            <PlusCircle className="w-4 h-4" /> Analyze a call
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(call => (
            <div key={call._id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition group">
              <div className="flex items-start gap-4">
                {/* Score */}
                {call.analysis.isAnalyzed && (
                  <div className="shrink-0">
                    <ScoreRing score={call.analysis.salesScore} size={68} strokeWidth={6} />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-white text-sm leading-tight">{call.title}</h3>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <User className="w-3 h-3" /> {call.customerName}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Calendar className="w-3 h-3" /> {new Date(call.callDate).toLocaleDateString('en-IN')}
                        </span>
                        {call.analysis.isAnalyzed && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${OUTCOME_COLORS[call.analysis.callOutcome]}`}>
                            {call.analysis.callOutcome}
                          </span>
                        )}
                      </div>
                      {call.analysis.summary && (
                        <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{call.analysis.summary}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleDelete(call._id)}
                        disabled={deleting === call._id}
                        className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition opacity-0 group-hover:opacity-100"
                      >
                        {deleting === call._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                      <Link
                        href={`/calls/${call._id}`}
                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-indigo-400 hover:bg-indigo-950/30 rounded-lg transition"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Objections pills */}
                  {call.analysis.objections?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {call.analysis.objections.slice(0, 3).map((obj, i) => (
                        <span key={i} className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full">
                          {obj}
                        </span>
                      ))}
                      {call.analysis.objections.length > 3 && (
                        <span className="text-xs text-slate-500">+{call.analysis.objections.length - 3} more</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
