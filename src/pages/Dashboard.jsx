import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getQuizzes, getUserQuizzes, deleteQuiz } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { Code, BookOpen, PlusCircle, ArrowRight, Trash2 } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { error: errorToast, success: successToast } = useToastStore();
  const [defaultQuizzes, setDefaultQuizzes] = useState([]);
  const [userQuizzes, setUserQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quizCode, setQuizCode] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const [defaultRes, userRes] = await Promise.all([
          getQuizzes().catch(() => ({ data: [] })),
          user ? getUserQuizzes(user.id).catch(() => ({ data: [] })) : Promise.resolve({ data: [] })
        ]);
        setDefaultQuizzes(defaultRes.data || []);
        setUserQuizzes(userRes.data || []);
      } catch (err) {
        console.error('Failed to fetch quizzes:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuizzes();
  }, [user]);

  const handleJoinByCode = (e) => {
    e.preventDefault();
    if (quizCode.trim()) navigate(`/quiz/${quizCode.trim()}`);
  };

  const handleDeleteQuiz = async (quizId) => {
    if (confirmingDelete === quizId) {
      // Proceed with deletion
      try {
        setDeleting(quizId);
        await deleteQuiz(quizId, user.id);
        setUserQuizzes(userQuizzes.filter(q => q.id !== quizId));
        successToast('Quiz deleted successfully');
        setConfirmingDelete(null);
      } catch (err) {
        console.error('Failed to delete quiz:', err);
        errorToast(`Failed to delete quiz: ${err.message}`);
      } finally {
        setDeleting(null);
      }
    } else {
      // Show confirmation
      setConfirmingDelete(quizId);
      setTimeout(() => setConfirmingDelete(null), 3000); // Auto-dismiss after 3 seconds
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 glass-panel p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 w-full text-center sm:text-left">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Dashboard</h1>
          <p className="text-slate-400 mt-2 text-sm">Take a tech quiz or create your own custom challenge</p>
        </div>
        <div className="flex gap-4 relative z-10 w-full sm:w-auto">
          <Link 
            to="/create" 
            className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <PlusCircle className="w-5 h-5"/> Create Quiz
          </Link>
        </div>
      </div>

      {/* Join via Code */}
      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute bottom-0 right-0 -mr-6 -mb-6">
          <Code className="w-32 h-32 text-slate-800/30 -rotate-12" />
        </div>
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-5 text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-brand-400" /> Join via Code
          </h2>
          <form onSubmit={handleJoinByCode} className="flex gap-3 max-w-md">
            <input
              type="text"
              placeholder="Enter Quiz Code"
              className="input-field uppercase tracking-wider font-mono placeholder:normal-case placeholder:tracking-normal w-full"
              value={quizCode}
              onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
            />
            <button type="submit" className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-2 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50">
              Join
            </button>
          </form>
        </div>
      </div>

      {/* My Quizzes */}
      {user && userQuizzes.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2 px-2">
            <PlusCircle className="w-5 h-5 text-purple-400" /> My Quizzes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {userQuizzes.map(quiz => (
              <div key={quiz.id} className="glass-panel p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300 group flex flex-col justify-between border-slate-700/50 hover:border-purple-500/30 border-2">
                <div>
                  <h3 className="font-bold text-xl text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-snug">{quiz.title}</h3>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-900/30 border border-purple-700/50 text-purple-300">
                      {quiz.topic}
                    </span>
                    <span className="inline-flex items-center text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                      {quiz.quiz_code}
                    </span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center gap-2">
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    disabled={deleting === quiz.id}
                    className={`${
                      confirmingDelete === quiz.id
                        ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 bg-orange-500/5'
                        : 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
                    } p-2 rounded-lg transition-all disabled:opacity-50 font-semibold text-xs`}
                    title={confirmingDelete === quiz.id ? 'Click again to confirm deletion' : 'Delete this quiz'}
                  >
                    {confirmingDelete === quiz.id ? 'Confirm?' : <Trash2 className="w-4 h-4" />}
                  </button>
                  <Link 
                    to={`/quiz/${quiz.id}`}
                    className="flex items-center gap-2 text-purple-400 font-semibold text-sm hover:text-purple-300 transition-colors"
                  >
                    Take <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Default Quizzes */}
      <div>
        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2 px-2">
          <BookOpen className="w-5 h-5 text-brand-400" /> Available Quizzes
        </h2>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-panel p-6 rounded-2xl h-40 animate-pulse bg-slate-800/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {defaultQuizzes.map(quiz => (
              <div key={quiz.id} className="glass-panel p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300 group flex flex-col justify-between border-slate-700/50 hover:border-brand-500/30">
                <div>
                  <h3 className="font-bold text-xl text-white group-hover:text-brand-300 transition-colors line-clamp-2 leading-snug">{quiz.title}</h3>
                  <div className="mt-3">
                    <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-brand-300">
                      {quiz.topic}
                    </span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                  <Link 
                    to={`/quiz/${quiz.id}`}
                    className="flex items-center gap-2 text-brand-400 font-semibold text-sm hover:text-brand-300 transition-colors"
                  >
                    Start Quiz <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
            {defaultQuizzes.length === 0 && (
              <div className="col-span-full py-12 text-center text-slate-500 glass-panel rounded-2xl">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No default quizzes available.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
