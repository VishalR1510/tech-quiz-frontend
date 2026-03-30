import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from './services/supabase';
import { useAuthStore } from './store/useAuthStore';
import { ToastContainer } from './components/Toast';

// We will import these pages soon
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import QuizPage from './pages/QuizPage';
import CreateQuiz from './pages/CreateQuiz';
import Results from './pages/Results';
import Navbar from './components/Navbar';

function App() {
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <BrowserRouter>
      <div className="font-sans text-slate-200">
        <Navbar />
        <ToastContainer />
        <main className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
          <Routes>
            <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/quiz/:id" element={user ? <QuizPage /> : <Navigate to="/login" />} />
            <Route path="/create" element={user ? <CreateQuiz /> : <Navigate to="/login" />} />
            <Route path="/results/:quizId" element={user ? <Results /> : <Navigate to="/login" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
