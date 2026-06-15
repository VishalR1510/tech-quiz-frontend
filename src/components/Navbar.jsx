import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { supabase } from '../services/supabase';

export default function Navbar() {
  const { user } = useAuthStore();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className="border-b border-zinc-800 bg-black/50 sticky top-0 z-50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4 max-w-5xl flex justify-between items-center">
        <Link to="/" className="text-xl font-bold text-zinc-100 tracking-tight flex items-center gap-2.5">
          <div className="w-7 h-7 rounded bg-zinc-100 flex items-center justify-center p-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full text-zinc-950"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
          TechQuiz
        </Link>
        <div>
          {user ? (
            <div className="flex gap-6 items-center">
              <span className="text-zinc-400 text-xs hidden sm:inline font-medium px-0 py-1 border-b border-transparent">
                {user.user_metadata?.name || user.email}
              </span>
              <button 
                onClick={handleLogout}
                className="text-zinc-500 hover:text-zinc-200 font-semibold text-xs transition-all"
              >
                Sign out
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
