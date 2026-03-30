import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuiz, submitQuiz } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
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
      alert("Failed to submit quiz.");
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-400 animate-pulse text-lg">Loading quiz...</div>;
  if (!quiz || questions.length === 0) return <div className="p-12 text-center text-red-400 glass-panel max-w-lg mx-auto rounded-2xl">Quiz not found or has no questions.</div>;

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto glass-panel p-6 sm:p-10 rounded-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
        <motion.div 
          className="h-full bg-gradient-to-r from-brand-400 to-brand-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="mb-8 mt-2">
        <div className="flex justify-between items-end mb-4">
          <h1 className="text-2xl font-bold text-white tracking-tight">{quiz.title}</h1>
          <span className="text-brand-400 font-mono text-sm font-semibold bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
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
            <h2 className="text-xl font-medium text-slate-200 mb-8 leading-relaxed">
              {currentQuestion.question_text}
            </h2>
            
            <div className="space-y-4">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = answers[currentQuestion.id] === opt;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(currentQuestion.id, opt)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group ${
                      isSelected 
                        ? 'border-brand-500 bg-brand-500/10 text-white shadow-[0_0_15px_rgba(79,70,229,0.15)]' 
                        : 'border-slate-700/50 bg-slate-800/40 hover:border-brand-400/50 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <span className="pr-4">{opt}</span>
                    {isSelected ? (
                      <CheckCircle2 className="w-6 h-6 text-brand-400 shrink-0" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-600 group-hover:text-brand-400/50 shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-center border-t border-slate-700/50 pt-8 mt-4">
        <button
          onClick={() => setCurrentIndex(prev => prev - 1)}
          disabled={currentIndex === 0 || submitting}
          className="px-6 py-3 rounded-xl font-medium text-slate-400 disabled:opacity-20 hover:bg-slate-800 hover:text-white transition flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Previous
        </button>

        {currentIndex === questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting || !answers[currentQuestion.id]}
            className="px-8 py-3 btn-primary !w-auto"
          >
            {submitting ? 'Submitting...' : 'Complete Quiz'}
          </button>
        ) : (
          <button
            onClick={() => setCurrentIndex(prev => prev + 1)}
            disabled={!answers[currentQuestion.id]}
            className="px-8 py-3 bg-slate-100 text-slate-900 rounded-xl font-bold hover:bg-white transition disabled:opacity-20 flex items-center gap-2 shadow-lg"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
