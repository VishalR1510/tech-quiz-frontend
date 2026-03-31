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
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 border-b border-zinc-800 pb-10 mt-4">
        <div className="w-full text-center sm:text-left">
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 mt-1 text-sm font-medium">Test your knowledge or create a new challenge.</p>
        </div>
        <div className="flex gap-4 w-full sm:w-auto">
          <Link 
            to="/create" 
            className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 whitespace-nowrap text-sm"
          >
            <PlusCircle className="w-4 h-4"/> Create Quiz
          </Link>
        </div>
      </div>

      {/* Join via Code */}
      <div className="border border-zinc-800 bg-zinc-900/20 p-8 rounded-xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-sm font-bold mb-4 text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
            Join via Code
          </h2>
          <form onSubmit={handleJoinByCode} className="flex gap-3 max-w-sm">
            <input
              type="text"
              placeholder="Enter 6-digit code"
              className="input-field uppercase tracking-widest font-mono placeholder:normal-case placeholder:tracking-normal w-full"
              value={quizCode}
              onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
            />
            <button type="submit" className="bg-zinc-100 hover:bg-white text-zinc-950 px-6 py-2 rounded-md font-bold transition-all text-sm disabled:opacity-50">
              Join
            </button>
          </form>
        </div>
      </div>

      {/* My Quizzes */}
      {user && userQuizzes.length > 0 && (
        <div className="pt-4">
          <h2 className="text-sm font-bold mb-6 text-zinc-400 flex items-center gap-2 px-1 uppercase tracking-widest">
            My Quizzes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {userQuizzes.map(quiz => (
              <div key={quiz.id} className="border border-zinc-800 bg-zinc-900/10 p-6 rounded-xl hover:border-zinc-700 transition-all group flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-zinc-100 group-hover:text-white transition-colors line-clamp-2 leading-snug">{quiz.title}</h3>
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                      {quiz.topic}
                    </span>
                    <span className="inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900/50 text-zinc-500 border border-zinc-800">
                      {quiz.quiz_code}
                    </span>
                  </div>
                </div>
                <div className="mt-8 pt-4 border-t border-zinc-800/50 flex justify-between items-center gap-2">
                  <button
                    onClick={() => handleDeleteQuiz(quiz.id)}
                    disabled={deleting === quiz.id}
                    className={`${
                      confirmingDelete === quiz.id
                        ? 'text-orange-400/80'
                        : 'text-zinc-600 hover:text-red-400/80'
                    } transition-all disabled:opacity-50 font-bold text-[10px] uppercase tracking-widest p-1`}
                  >
                    {confirmingDelete === quiz.id ? 'Confirm?' : 'Delete'}
                  </button>
                  <Link 
                    to={`/quiz/${quiz.id}`}
                    className="flex items-center gap-2 text-zinc-100 font-bold text-xs hover:text-white transition-colors"
                  >
                    START <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Default Quizzes */}
      <div>
        <h2 className="text-sm font-bold mb-6 text-zinc-400 flex items-center gap-2 px-1 uppercase tracking-widest">
          Available Quizzes
        </h2>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-zinc-800 bg-zinc-900/10 p-6 rounded-xl h-40 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {defaultQuizzes.map(quiz => (
              <div key={quiz.id} className="border border-zinc-800 bg-zinc-900/10 p-6 rounded-xl hover:border-zinc-700 transition-all group flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-zinc-100 group-hover:text-white transition-colors line-clamp-2 leading-snug">{quiz.title}</h3>
                  <div className="mt-4">
                    <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-zinc-800 text-zinc-500 border border-zinc-700/50">
                      {quiz.topic}
                    </span>
                  </div>
                </div>
                <div className="mt-8 pt-4 border-t border-zinc-800/50 flex justify-end">
                  <Link 
                    to={`/quiz/${quiz.id}`}
                    className="flex items-center gap-2 text-zinc-100 font-bold text-xs hover:text-white transition-colors"
                  >
                    START QUIZ <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
            {defaultQuizzes.length === 0 && (
              <div className="col-span-full py-20 text-center text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
                <p className="text-sm font-medium">No quizzes available at the moment.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
