import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createQuiz } from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { PlusCircle, Trash2, CheckCircle, Save, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CreateQuiz() {
  const { user } = useAuthStore();
  const { error: errorToast, success: successToast, info: infoToast } = useToastStore();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState([
    { question_text: '', options: ['', '', '', ''], correct_answer: '' }
  ]);
  const [submitting, setSubmitting] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([...questions, { question_text: '', options: ['', '', '', ''], correct_answer: '' }]);
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = value;
    setQuestions(updated);
  };

  const handleRemoveQuestion = (index) => {
    const updated = questions.filter((_, i) => i !== index);
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      errorToast("Must be logged in.");
      return;
    }
    
    // Validate all fields and correct answers
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      // Check all fields are filled
      if (!q.question_text || !q.correct_answer || q.options.some(o => !o)) {
        errorToast(`Question ${i + 1}: Please fill all fields.`);
        return;
      }
      
      // Validate that correct_answer matches one of the options
      if (!q.options.includes(q.correct_answer)) {
        errorToast(
          `Question ${i + 1}: Correct answer must match one of the options.`
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        topic,
        created_by: user.id,
        questions
      };
      const res = await createQuiz(payload);
      console.log('Create quiz response:', res);
      if (!res.quiz_code) {
        errorToast(`Error: ${res.message || 'Unknown error'}`);
        return;
      }
      successToast(`Quiz Created! Share Code: ${res.quiz_code}`);
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      console.error('Create quiz error:', err);
      errorToast(`Failed to create quiz: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto glass-panel p-6 sm:p-10 rounded-2xl relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-400 via-purple-500 to-brand-600"></div>
      
      <div className="mb-8 border-b border-slate-700/50 pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <PlusCircle className="w-8 h-8 text-brand-400"/> Create Custom Quiz
        </h1>
        <p className="text-slate-400 mt-2">Design your own tech challenge and share it with others.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Quiz Title</label>
            <input 
              required
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="input-field shadow-inner" 
              placeholder="e.g. Advanced React Patterns" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Topic/Category</label>
            <input 
              required
              type="text" 
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="input-field shadow-inner" 
              placeholder="e.g. React" 
            />
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-brand-400"/> Questions
          </h2>
          
          <AnimatePresence>
            {questions.map((q, qIndex) => (
              <motion.div 
                key={qIndex}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-xl relative shadow-lg"
              >
                {questions.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className="absolute top-4 right-4 text-red-400/70 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                
                <div className="mb-6 pr-12">
                  <label className="block text-sm font-semibold text-slate-300 mb-2">Question {qIndex + 1}</label>
                  <input 
                    required
                    type="text" 
                    value={q.question_text}
                    onChange={e => handleQuestionChange(qIndex, 'question_text', e.target.value)}
                    className="input-field bg-slate-900/50"
                    placeholder="Enter the question text..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex}>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Option {oIndex + 1}</label>
                      <input 
                        required
                        type="text" 
                        value={opt}
                        onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none text-slate-200 text-sm"
                        placeholder={`Option ${oIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2 flex flex-wrap items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400"/> Correct Answer 
                    <span className="text-xs font-normal text-slate-500 bg-slate-900/60 px-2 py-0.5 rounded-full">(Must match one option exactly)</span>
                  </label>
                  <input 
                    required
                    type="text" 
                    value={q.correct_answer}
                    onChange={e => handleQuestionChange(qIndex, 'correct_answer', e.target.value)}
                    className="w-full px-4 py-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none text-emerald-100 placeholder-emerald-900/50"
                    placeholder="e.g. Option text here"
                  />
                  {q.correct_answer && (
                    <div className="mt-2">
                      {q.options.includes(q.correct_answer) ? (
                        <p className="text-xs text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Valid: matches an option
                        </p>
                      ) : (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          ❌ Invalid: doesn't match any option
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          <button 
            type="button" 
            onClick={handleAddQuestion}
            className="w-full py-4 border-2 border-dashed border-slate-600 text-slate-400 rounded-xl hover:border-brand-500 hover:bg-brand-500/5 hover:text-brand-400 transition-all font-semibold flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-5 h-5"/> Add Another Question
          </button>
        </div>

        <div className="pt-8 border-t border-slate-700/50 flex justify-end">
          <button 
            type="submit" 
            disabled={submitting}
            className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-lg py-4 px-8"
          >
            {submitting ? 'Publishing...' : <><Save className="w-5 h-5"/> Publish Quiz</>}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
