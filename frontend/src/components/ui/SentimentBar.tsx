'use client';

interface SentimentBarProps {
  positive: number;
  neutral: number;
  negative: number;
}

export function SentimentBar({ positive, neutral, negative }: SentimentBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex rounded-full overflow-hidden h-3">
        <div className="bg-emerald-500 transition-all" style={{ width: `${positive}%` }} />
        <div className="bg-slate-500 transition-all" style={{ width: `${neutral}%` }} />
        <div className="bg-red-500 transition-all" style={{ width: `${negative}%` }} />
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Positive {positive}%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
          Neutral {neutral}%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          Negative {negative}%
        </span>
      </div>
    </div>
  );
}
