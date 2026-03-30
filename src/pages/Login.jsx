import { useState } from 'react';
import { supabase } from '../services/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
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
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;
        setSuccessMsg("Registration successful! You can now log in.");
        setIsSignUp(false);
        setPassword('');
        setConfirmPassword('');
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
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
    <div className="min-h-[80vh] flex items-center justify-center -mt-8 relative z-10">
      {/* Background glowing orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-2xl relative overflow-hidden"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.9 }} animate={{ scale: 1 }} 
            className="w-16 h-16 mx-auto bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30 mb-6"
          >
            <Lock className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
            {isSignUp ? 'Create an Account' : 'Welcome Back'}
          </h2>
          <p className="text-slate-400 text-sm">
            {isSignUp ? 'Join the ultimate AI Tech Quiz platform' : 'Sign in to continue your journey'}
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
        
        <form onSubmit={handleAuth} className="flex flex-col gap-5">
          <div>
            <div className="relative">
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${validationErrors.email ? 'text-red-400' : 'text-slate-400'}`} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if(validationErrors.email) setValidationErrors({...validationErrors, email: undefined}) }}
                className={`input-field pl-12 ${validationErrors.email ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' : ''}`}
              />
            </div>
            {validationErrors.email && <p className="text-red-400 text-xs mt-1.5 ml-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{validationErrors.email}</p>}
          </div>

          <div>
            <div className="relative">
              <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${validationErrors.password ? 'text-red-400' : 'text-slate-400'}`} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); if(validationErrors.password) setValidationErrors({...validationErrors, password: undefined}) }}
                className={`input-field pl-12 ${validationErrors.password ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' : ''}`}
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
                    className={`input-field pl-12 ${validationErrors.confirmPassword ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/50' : ''}`}
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
        
        <div className="mt-8 text-center bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
          <p className="text-sm text-slate-400">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button
              className="text-brand-400 font-semibold hover:text-brand-300 transition-colors py-1"
              onClick={toggleMode}
            >
              {isSignUp ? 'Log in here' : 'Sign up for free'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
