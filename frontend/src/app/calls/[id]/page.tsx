'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { callsAPI } from '@/lib/api';
import { Call } from '@/types';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { SentimentBar } from '@/components/ui/SentimentBar';
import {
  ArrowLeft, RefreshCw, Loader2, AlertTriangle, Lightbulb,
  MessageSquare, CheckCircle, User, Calendar, Phone
} from 'lucide-react';
import Link from 'next/link';

const OUTCOME_COLORS: Record<string, string> = {
  positive: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  neutral: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
  negative: 'text-red-400 bg-red-500/10 border-red-500/30',
};

function Section({ title, icon: Icon, children, color = 'text-slate-300' }: {
  title: string; icon: React.ElementType; children: React.ReactNode; color?: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-4 h-4 ${color}`} />
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function CallDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    callsAPI.getById(params.id as string)
      .then(res => setCall(res.data.call))
      .catch(() => router.push('/calls'))
      .finally(() => setLoading(false));
  }, [params.id, router]);

  const handleReanalyze = async () => {
    setReanalyzing(true);
    try {
      const res = await callsAPI.reanalyze(call!._id);
      setCall(res.data.call);
    } catch (e) {
      console.error(e);
    } finally {
      setReanalyzing(false);
    }
  };

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-slate-800 rounded shimmer" />
      <div className="grid grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-40 bg-slate-800 rounded-xl shimmer" />)}
      </div>
    </div>
  );

  if (!call) return null;
  const a = call.analysis;

  return (
    <div>
      {/* Header */}
      <div className="flex items-start gap-4 mb-6">
        <Link href="/calls" className="mt-1 text-slate-400 hover:text-white transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white leading-tight">{call.title}</h1>
          <div className="flex items-center gap-4 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <User className="w-3 h-3" /> {call.customerName}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Phone className="w-3 h-3" /> {call.salesRepName}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              <Calendar className="w-3 h-3" /> {new Date(call.callDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
            {a.isAnalyzed && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize ${OUTCOME_COLORS[a.callOutcome]}`}>
                {a.callOutcome}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleReanalyze}
          disabled={reanalyzing}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-600 px-3 py-2 rounded-lg transition"
        >
          {reanalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Re-analyze
        </button>
      </div>

      {!a.isAnalyzed ? (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 border-dashed rounded-xl">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Analysis pending. Click Re-analyze to run AI analysis.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left column - Score + Summary */}
          <div className="space-y-4">
            {/* Score */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col items-center gap-3">
              <h3 className="text-sm font-semibold text-slate-300 self-start">Sales Quality Score</h3>
              <ScoreRing score={a.salesScore} size={110} strokeWidth={9} />
            </div>

            {/* Sentiment */}
            <Section title="Sentiment Analysis" icon={MessageSquare} color="text-indigo-400">
              <SentimentBar
                positive={a.sentiment.positive}
                neutral={a.sentiment.neutral}
                negative={a.sentiment.negative}
              />
            </Section>
          </div>

          {/* Middle column - Summary + Insights */}
          <div className="space-y-4">
            <Section title="AI Summary" icon={Lightbulb} color="text-amber-400">
              <p className="text-sm text-slate-300 leading-relaxed">{a.summary}</p>
            </Section>

            <Section title="Key Insights" icon={CheckCircle} color="text-emerald-400">
              <ul className="space-y-2">
                {a.keyInsights?.map((insight, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          {/* Right column - Objections + Follow-up */}
          <div className="space-y-4">
            <Section title="Objections Detected" icon={AlertTriangle} color="text-amber-400">
              {a.objections?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {a.objections.map((obj, i) => (
                    <span key={i} className="text-sm bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full">
                      {obj}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No major objections detected</p>
              )}
            </Section>

            <Section title="Follow-up Actions" icon={CheckCircle} color="text-indigo-400">
              <ul className="space-y-2.5">
                {a.followUpSuggestions?.map((sug, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                    <span className="text-sm text-slate-300 leading-relaxed">{sug}</span>
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          {/* Transcript toggle */}
          <div className="lg:col-span-3">
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="text-sm text-slate-400 hover:text-white flex items-center gap-2 transition mb-2"
            >
              <MessageSquare className="w-4 h-4" />
              {showTranscript ? 'Hide' : 'Show'} Full Transcript
            </button>
            {showTranscript && call.transcript && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <pre className="text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
                  {call.transcript}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
