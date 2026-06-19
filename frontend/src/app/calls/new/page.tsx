'use client';

import { useState, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { callsAPI } from '@/lib/api';
import { Upload, FileText, Loader2, Sparkles, AlertCircle } from 'lucide-react';

const SAMPLE_TRANSCRIPT = `Sales Agent: Hello, this is Raj from TechSolutions. Am I speaking with Priya?

Customer: Yes, this is Priya.

Sales Agent: Hi Priya! I'm calling about our enterprise CRM platform. I noticed your company has been growing rapidly. How are you currently managing your customer relationships?

Customer: We're using spreadsheets mostly. It's becoming difficult to track everything, honestly.

Sales Agent: I completely understand. That's where we can help. Our platform automates the entire pipeline and gives real-time analytics. Would you be open to a quick demo?

Customer: I'm interested, but I'm worried about the pricing. We're a startup and budget is tight.

Sales Agent: Totally valid concern. We have a startup plan starting at just ₹5,000/month. Plus we're offering 30% discount for annual subscriptions right now.

Customer: That's actually reasonable. What about data migration from our spreadsheets?

Sales Agent: We handle the full migration at no extra cost. Our team sets everything up within 3 business days.

Customer: Okay, let me discuss with my co-founder. Can you send over the pricing details and case studies?

Sales Agent: Absolutely! I'll send that right over. Should I schedule a follow-up call for next week?

Customer: Yes, that works. Let's do Thursday afternoon.`;

export default function NewCallPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: '',
    customerName: '',
    salesRepName: '',
    callDate: new Date().toISOString().split('T')[0],
    transcript: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFile = (file: File) => {
    if (!file.name.endsWith('.txt') && file.type !== 'text/plain') {
      setError('Only .txt files supported for transcript upload.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setForm(f => ({ ...f, transcript: e.target?.result as string || '' }));
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.transcript.trim()) {
      setError('Please provide a call transcript.');
      return;
    }
    if (form.transcript.trim().length < 50) {
      setError('Transcript too short. Please provide a meaningful conversation.');
      return;
    }
    setLoading(true);
    try {
      const res = await callsAPI.create(form);
      router.push(`/calls/${res.data.call._id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to analyze call.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Analyze New Call</h1>
        <p className="text-slate-400 text-sm mt-0.5">Upload or paste a call transcript for AI analysis</p>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 bg-red-950/50 border border-red-800/50 text-red-400 rounded-lg p-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-slate-300">Call Details</h2>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Call Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              placeholder="e.g. Discovery call with Priya - TechCorp"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">Customer Name</label>
              <input
                type="text"
                value={form.customerName}
                onChange={e => setForm({ ...form, customerName: e.target.value })}
                placeholder="Priya Sharma"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1.5">Sales Rep</label>
              <input
                type="text"
                value={form.salesRepName}
                onChange={e => setForm({ ...form, salesRepName: e.target.value })}
                placeholder="Raj Kumar"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-400 block mb-1.5">Call Date</label>
            <input
              type="date"
              value={form.callDate}
              onChange={e => setForm({ ...form, callDate: e.target.value })}
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>

        {/* Transcript */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-300">Call Transcript *</h2>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, transcript: SAMPLE_TRANSCRIPT }))}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition"
            >
              Load sample
            </button>
          </div>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-lg p-4 text-center cursor-pointer transition group"
          >
            <Upload className="w-6 h-6 text-slate-500 group-hover:text-indigo-400 mx-auto mb-1.5 transition" />
            <p className="text-sm text-slate-500 group-hover:text-slate-400 transition">
              Drop .txt file here or <span className="text-indigo-400">browse</span>
            </p>
            <input ref={fileInputRef} type="file" accept=".txt" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>

          <div className="text-center text-xs text-slate-500">or paste directly below</div>

          <textarea
            value={form.transcript}
            onChange={e => setForm({ ...form, transcript: e.target.value })}
            rows={12}
            placeholder="Paste your call transcript here...&#10;&#10;Format:&#10;Sales Agent: Hello...&#10;Customer: Hi, I'm interested but..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none font-mono leading-relaxed"
          />

          {form.transcript && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <FileText className="w-3.5 h-3.5" />
              {form.transcript.split('\n').length} lines · {form.transcript.length} characters
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !form.title || !form.transcript}
          className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing with AI... this may take a moment
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Analyze Call with AI
            </>
          )}
        </button>
      </form>
    </div>
  );
}
