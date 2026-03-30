import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../services/supabase';

export default function Navbar() {
  const { user } = useAuthStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="glass-panel sticky top-0 z-50 rounded-b-2xl mb-8">
      <div className="container mx-auto px-6 py-4 max-w-5xl flex justify-between items-center">
        <Link to="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-brand-600 tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center p-1 shadow-lg shadow-brand-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          TechQuiz
        </Link>
        <div>
          {user ? (
            <div className="flex gap-4 items-center">
              <span className="text-slate-300 text-sm hidden sm:inline font-medium bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700/50">
                {user.email}
              </span>
              <button 
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 font-semibold text-sm transition-all hover:bg-red-400/10 px-4 py-2 rounded-lg"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
