import { useState } from 'react';
import { supabase } from '../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2, User } from 'lucide-react';

export default function Login() {
  const [identifier, setIdentifier] = useState(''); // Name or Email for login, just Email for signup
  const [name, setName] = useState(''); // For Signup
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!identifier) {
      errors.identifier = isSignUp ? 'Email is required' : 'Name or Email is required';
    } else if (isSignUp && !/\S+@\S+\.\S+/.test(identifier)) {
      errors.identifier = 'Please enter a valid email address';
    }

    if (isSignUp && !name.trim()) {
      errors.name = 'Name is required';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (isSignUp) {
      if (!confirmPassword) {
        errors.confirmPassword = 'Confirm your password';
      } else if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: identifier,
          password,
          options: {
            data: { name: name.trim() }
          }
        });
        if (signUpError) throw signUpError;
        setSuccessMsg("Account created! Please check your email inbox to verify your account before logging in.");
        setIsSignUp(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        let loginEmail = identifier;
        
        // If it's a Name (doesn't contain '@'), resolve it through the backend
        if (!identifier.includes('@')) {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
          const resolveRes = await fetch(`${API_URL}/auth/resolve-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier })
          });
          
          if (!resolveRes.ok) {
            const data = await resolveRes.json().catch(() => ({}));
            throw new Error(data.detail || "Could not find a user with that Name");
          }
          const data = await resolveRes.json();
          loginEmail = data.email;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({ email: loginEmail, password });
        if (signInError) throw signInError;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setSuccessMsg(null);
    setValidationErrors({});
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center mt-8 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-2xl relative overflow-hidden"
      >
        <div className="text-center mb-10">
          <div className="w-12 h-12 mx-auto bg-zinc-100 rounded-lg flex items-center justify-center shadow-sm mb-6">
            <Lock className="w-6 h-6 text-zinc-950" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight mb-2">
            {isSignUp ? 'Create account' : 'Welcome back'}
          </h2>
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">
            {isSignUp ? 'Join the tech platform' : 'Enter your credentials'}
          </p>
        </div>
        
        <AnimatePresence mode="wait">
          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6">
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            </motion.div>
          )}
          
          {successMsg && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-6">
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>{successMsg}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <AnimatePresence mode="wait">
          {successMsg ? (
            <motion.div 
              key="success-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Verification Required</h3>
              <p className="text-zinc-500 text-sm leading-relaxed mb-8">
                {successMsg}
              </p>
              <button
                onClick={() => setSuccessMsg(null)}
                className="btn-primary flex items-center justify-center gap-2 group relative overflow-hidden"
              >
                Go to Login
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleAuth} className="flex flex-col gap-5">
              <AnimatePresence>
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 4 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="relative">
                      <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${validationErrors.name ? 'text-red-400' : 'text-slate-400'}`} />
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => { setName(e.target.value); if(validationErrors.name) setValidationErrors({...validationErrors, name: undefined}) }}
                        className={`input-field !pl-12 ${validationErrors.name ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' : ''}`}
                      />
                    </div>
                    {validationErrors.name && <p className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{validationErrors.name}</p>}
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${validationErrors.identifier ? 'text-red-400' : 'text-slate-400'}`} />
                  <input
                    type={isSignUp ? "email" : "text"}
                    placeholder={isSignUp ? "Email address" : "Name or Email"}
                    value={identifier}
                    onChange={(e) => { setIdentifier(e.target.value); if(validationErrors.identifier) setValidationErrors({...validationErrors, identifier: undefined}) }}
                    className={`input-field !pl-12 ${validationErrors.identifier ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' : ''}`}
                  />
                </div>
                {validationErrors.identifier && <p className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{validationErrors.identifier}</p>}
              </div>

              <div>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${validationErrors.password ? 'text-red-400' : 'text-slate-400'}`} />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if(validationErrors.password) setValidationErrors({...validationErrors, password: undefined}) }}
                    className={`input-field !pl-12 ${validationErrors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' : ''}`}
                  />
                </div>
                {validationErrors.password && <p className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{validationErrors.password}</p>}
              </div>
              
              <AnimatePresence>
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="relative">
                      <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${validationErrors.confirmPassword ? 'text-red-400' : 'text-slate-400'}`} />
                      <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => { setConfirmPassword(e.target.value); if(validationErrors.confirmPassword) setValidationErrors({...validationErrors, confirmPassword: undefined}) }}
                        className={`input-field !pl-12 ${validationErrors.confirmPassword ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' : ''}`}
                      />
                    </div>
                    {validationErrors.confirmPassword && <p className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{validationErrors.confirmPassword}</p>}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <button
                type="submit"
                disabled={loading}
                className="btn-primary mt-4 flex items-center justify-center gap-2 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-[0%] transition-transform duration-300" />
                <span className="relative z-10">{loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Log In'}</span>
                {!loading && <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          )}
        </AnimatePresence>
        
        <div className="mt-10 text-center border-t border-zinc-800 pt-8">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
            {isSignUp ? 'Already have an account?' : "Need an account?"}
            <button
              className="ml-2 text-zinc-100 font-bold hover:text-white transition-colors"
              onClick={toggleMode}
            >
              {isSignUp ? 'Log in' : 'Sign up'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
