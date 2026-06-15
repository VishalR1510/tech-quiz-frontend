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
    { question_text: '', options: ['', ''], correct_answer: '' }
  ]);
  const [submitting, setSubmitting] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([...questions, { question_text: '', options: ['', ''], correct_answer: '' }]);
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

  const handleAddOption = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].options.push('');
    setQuestions(updated);
  };

  const handleRemoveOption = (qIndex, oIndex) => {
    const updated = [...questions];
    if (updated[qIndex].options.length > 2) {
      updated[qIndex].options.splice(oIndex, 1);
      setQuestions(updated);
    }
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto border border-zinc-800 bg-zinc-900/30 p-6 sm:p-10 rounded-2xl relative overflow-hidden shadow-sm"
    >
      <div className="mb-10 border-b border-zinc-800 pb-8">
        <h1 className="text-2xl font-bold text-zinc-100 tracking-tight uppercase">Create Custom Quiz</h1>
        <p className="text-zinc-500 mt-1 text-xs font-bold uppercase tracking-widest">Share your technical knowledge.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Quiz Title</label>
            <input 
              required
              type="text" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="input-field" 
              placeholder="e.g. Advanced React Patterns" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Topic</label>
            <input 
              required
              type="text" 
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="input-field" 
              placeholder="e.g. React" 
            />
          </div>
        </div>

        <div className="space-y-10">
          <h2 className="text-xs font-bold text-zinc-400 flex items-center gap-2 uppercase tracking-[0.2em] pt-4">
            Questions
          </h2>
          
          <AnimatePresence>
            {questions.map((q, qIndex) => (
              <motion.div 
                key={qIndex}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-zinc-950/40 border border-zinc-800 p-8 rounded-xl relative transition-all"
              >
                {questions.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => handleRemoveQuestion(qIndex)}
                    className="absolute top-4 right-4 text-zinc-600 hover:text-red-400/80 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                <div className="mb-8">
                  <label className="block text-[10px] font-bold text-zinc-500 mb-2 uppercase tracking-widest">Question {qIndex + 1}</label>
                  <input 
                    required
                    type="text" 
                    value={q.question_text}
                    onChange={e => handleQuestionChange(qIndex, 'question_text', e.target.value)}
                    className="input-field bg-transparent"
                    placeholder="Enter the question text..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="relative">
                      <label className="block text-[10px] font-bold text-zinc-500 mb-2 flex justify-between uppercase tracking-widest">
                        Option {oIndex + 1}
                        {q.options.length > 2 && oIndex >= 2 && (
                          <button 
                            type="button" 
                            onClick={() => handleRemoveOption(qIndex, oIndex)}
                            className="text-orange-400/80 hover:text-orange-400 transition-colors"
                          >
                            Remove
                          </button>
                        )}
                      </label>
                      <input 
                        required
                        type="text" 
                        value={opt}
                        onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                        className="input-field bg-transparent"
                        placeholder={`Option ${oIndex + 1}`}
                      />
                    </div>
                  ))}
                  
                  <div className="flex items-end">
                    <button 
                      type="button" 
                      onClick={() => handleAddOption(qIndex)}
                      className="text-zinc-400 hover:text-white text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition h-[42px] px-2"
                    >
                      <PlusCircle className="w-3.5 h-3.5"/> Add Option
                    </button>
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-6">
                  <label className="block text-[10px] font-bold text-zinc-500 mb-2 flex flex-wrap items-center gap-2 uppercase tracking-widest">
                    <CheckCircle className="w-3.5 h-3.5 text-zinc-400"/> Correct Answer 
                    <span className="text-[10px] font-medium text-zinc-700">(Must match one option exactly)</span>
                  </label>
                  <input 
                    required
                    type="text" 
                    value={q.correct_answer}
                    onChange={e => handleQuestionChange(qIndex, 'correct_answer', e.target.value)}
                    className="input-field bg-transparent border-dashed border-zinc-800"
                    placeholder="Enter the correct option content"
                  />
                  {q.correct_answer && (
                    <div className="mt-2 ml-1">
                      {q.options.includes(q.correct_answer) ? (
                        <p className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest flex items-center gap-1">
                          Valid match
                        </p>
                      ) : (
                        <p className="text-[10px] font-bold text-red-500/80 uppercase tracking-widest flex items-center gap-1">
                          No match found
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
            className="w-full py-6 border border-zinc-800 bg-zinc-900/10 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] rounded-xl hover:border-zinc-700 hover:text-zinc-300 transition-all flex items-center justify-center gap-2"
          >
            <PlusCircle className="w-4 h-4"/> Add Question
          </button>
        </div>

        <div className="pt-10 border-t border-zinc-800 flex justify-end">
          <button 
            type="submit" 
            disabled={submitting}
            className="btn-primary w-full sm:w-auto text-xs uppercase tracking-widest py-4 px-10"
          >
            {submitting ? 'Publishing...' : 'Publish Quiz'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
