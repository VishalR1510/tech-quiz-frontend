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

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div className="glass-panel p-10 text-center rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10">
          <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-4 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />
          <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Quiz Completed!</h1>
          <p className="text-slate-400 mb-10 text-lg">Here is how you performed.</p>
          
          <div className="inline-flex items-center justify-center w-40 h-40 rounded-full border-8 border-slate-800/50 bg-slate-900/50 shadow-inner shadow-black/50 mb-6 relative">
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="46%"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-800"
              />
              <circle
                cx="50%"
                cy="50%"
                r="46%"
                fill="transparent"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeDasharray="290"
                strokeDashoffset={290 - (290 * scorePercentage) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-4xl font-black text-white">{result.score}</span>
              <span className="text-slate-500 font-medium text-sm mt-1">/ {totalQuestions}</span>
            </div>
          </div>
          
          <p className="font-semibold text-xl text-slate-200">
            Accuracy: <span className="text-brand-400 font-bold">{scorePercentage}%</span>
          </p>
        </div>
      </div>

      <div className="glass-panel p-8 sm:p-10 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[50px] pointer-events-none" />
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Sparkles className="w-6 h-6 text-purple-400" /> AI Feedback
        </h2>
        <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50">
          {result.ai_feedback || "No AI feedback available for this attempt."}
        </div>
      </div>

      <div className="text-center pt-4">
        <Link 
          to="/"
          className="inline-flex items-center gap-2 bg-slate-800 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          <ArrowLeft className="w-5 h-5" /> Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
