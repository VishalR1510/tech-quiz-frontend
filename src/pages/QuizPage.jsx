import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuiz, submitQuiz } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { error: errorToast } = useToastStore();
  
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getQuiz(id)
      .then(res => {
        if (res.quiz) {
          setQuiz(res.quiz);
          setQuestions(res.questions || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSelectOption = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  const currentQuestion = questions[currentIndex];

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      await submitQuiz(id, {
        user_id: user.id,
        answers: answers
      });
      navigate(`/results/${id}`);
    } catch (err) {
      console.error(err);
      errorToast("Failed to submit quiz.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto glass-panel p-6 sm:p-10 rounded-2xl relative overflow-hidden animate-pulse">
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800" />
        
        <div className="mb-8 mt-2 flex justify-between items-end">
          <div className="h-8 bg-slate-800/80 rounded w-1/3"></div>
          <div className="h-6 bg-slate-800/80 rounded-full w-16"></div>
        </div>
        
        <div className="mb-10 min-h-[300px]">
          <div className="h-6 bg-slate-800/80 rounded w-full mb-3"></div>
          <div className="h-6 bg-slate-800/80 rounded w-5/6 mb-8"></div>
          
          <div className="space-y-4">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="w-full h-16 rounded-xl border-2 border-slate-700/50 bg-slate-800/30"></div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between items-center border-t border-slate-700/50 pt-8 mt-4">
          <div className="h-12 bg-slate-800/60 rounded-xl w-32"></div>
          <div className="h-12 bg-slate-800/80 rounded-xl w-32"></div>
        </div>
      </div>
    );
  }
  if (!quiz || questions.length === 0) return <div className="p-12 text-center text-red-400 glass-panel max-w-lg mx-auto rounded-2xl">Quiz not found or has no questions.</div>;

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto glass-panel p-6 sm:p-10 rounded-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-[3px] bg-zinc-800">
        <motion.div 
          className="h-full bg-zinc-100"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="mb-10 mt-4 flex justify-between items-baseline border-b border-zinc-800/50 pb-6">
        <h1 className="text-xl font-bold text-zinc-100 tracking-tight">{quiz.title}</h1>
        <span className="text-zinc-500 font-mono text-[10px] font-bold uppercase tracking-widest bg-zinc-900 px-3 py-1 rounded border border-zinc-800">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      <div className="mb-10 min-h-[300px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-lg font-bold text-zinc-100 mb-8 leading-relaxed">
              {currentQuestion.question_text}
            </h2>
            
            <div className="space-y-3">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = answers[currentQuestion.id] === opt;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(currentQuestion.id, opt)}
                    className={`w-full text-left px-5 py-4 rounded-lg border transition-all flex items-center justify-between group ${
                      isSelected 
                        ? 'border-zinc-100 bg-zinc-100 text-zinc-950 font-bold' 
                        : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 text-zinc-400 hover:text-zinc-100'
                    }`}
                  >
                    <span className="text-sm">{opt}</span>
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-zinc-950 shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-800 group-hover:text-zinc-600 shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center border-t border-zinc-800 pt-8 mt-10">
        <button
          onClick={() => setCurrentIndex(prev => prev - 1)}
          disabled={currentIndex === 0 || submitting}
          className="px-4 py-2 text-zinc-500 font-bold text-xs uppercase tracking-widest disabled:opacity-0 hover:text-zinc-100 transition flex items-center gap-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting || !answers[currentQuestion.id]}
            className="px-8 py-3 bg-zinc-100 hover:bg-white text-zinc-950 rounded font-bold text-xs uppercase tracking-widest transition disabled:opacity-20"
          >
            {submitting ? 'Sending...' : 'Complete'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex(prev => prev + 1)}
            disabled={!answers[currentQuestion.id]}
            className="px-8 py-3 bg-zinc-100 hover:bg-white text-zinc-950 rounded font-bold text-xs uppercase tracking-widest transition disabled:opacity-20 flex items-center gap-2"
          >
            Next <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
