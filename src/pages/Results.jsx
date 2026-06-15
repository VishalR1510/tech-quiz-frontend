import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getResults } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Trophy, Sparkles, ArrowLeft } from 'lucide-react';

export default function Results() {
  const { quizId } = useParams();
  const { user } = useAuthStore();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getResults(quizId, user.id)
      .then(res => {
        setResult(res);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [quizId, user]);

  if (loading) return <div className="p-12 text-center text-slate-400 animate-pulse text-lg">Loading results...</div>;
  if (!result) return <div className="p-12 text-center text-red-400 glass-panel max-w-lg mx-auto rounded-2xl">No results found for this quiz.</div>;

  const totalQuestions = Object.keys(result.answers || {}).length;
  const scorePercentage = totalQuestions > 0 ? Math.round((result.score / totalQuestions) * 100) : 0;

  const getScoreColors = (percent) => {
    if (percent >= 80) return { start: '#34d399', end: '#059669', text: 'text-emerald-400' }; // Emerald
    if (percent >= 50) return { start: '#fbbf24', end: '#d97706', text: 'text-amber-400' }; // Amber
    return { start: '#f87171', end: '#dc2626', text: 'text-red-400' }; // Red
  };
  
  const scoreColors = getScoreColors(scorePercentage);

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="border border-zinc-800 bg-zinc-900/40 p-10 text-center rounded-2xl relative overflow-hidden">
        <div className="relative z-10">
          <Trophy className={`${scoreColors.text} w-12 h-12 mx-auto mb-4 opacity-80`} />
          <h1 className="text-3xl font-bold text-zinc-100 mb-1 tracking-tight uppercase">Quiz Results</h1>
          <p className="text-zinc-500 mb-12 text-xs font-bold uppercase tracking-[0.2em]">{result.topic}</p>
          
          <div className="inline-flex items-center justify-center w-44 h-44 rounded-full border border-zinc-800 bg-black/20 mb-8 relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90 p-1">
              <circle
                cx="50%"
                cy="50%"
                r="46%"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="4"
                className="text-zinc-900"
              />
              <circle
                cx="50%"
                cy="50%"
                r="46%"
                fill="transparent"
                stroke={scoreColors.start}
                strokeWidth="4"
                strokeDasharray="290"
                strokeDashoffset={290 - (290 * scorePercentage) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-5xl font-bold text-white tracking-tighter">{result.score}</span>
              <span className="text-zinc-600 font-bold text-[10px] uppercase tracking-widest mt-1">/ {totalQuestions}</span>
            </div>
          </div>
          
          <p className="font-bold text-xs text-zinc-500 uppercase tracking-widest">
            Accuracy: <span className={`${scoreColors.text}`}>{scorePercentage}%</span>
          </p>
        </div>
      </div>

      <div className="border border-zinc-800 bg-zinc-950 p-8 sm:p-10 rounded-2xl relative">
        <h2 className="text-xs font-bold text-zinc-500 mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
          <Sparkles className="w-4 h-4 text-zinc-400" /> Professional Feedback
        </h2>
        <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap bg-zinc-900/30 p-8 rounded-xl border border-zinc-800/50 text-sm italic font-medium">
          {result.ai_feedback || "No AI feedback available for this attempt."}
        </div>
      </div>

      <div className="text-center pt-6">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 bg-zinc-100 text-zinc-950 px-8 py-3 rounded font-bold text-xs uppercase tracking-widest hover:bg-white transition-all shadow-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
        </Link>
      </div>
    </div>
  );
}
