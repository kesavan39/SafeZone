import React, { useState } from 'react';
import { X, Star, MessageSquare, CheckCircle } from 'lucide-react';
import { api } from '../api';

interface FeedbackModalProps {
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
  const [role, setRole] = useState('Safety Officer');
  const [easeOfUse, setEaseOfUse] = useState(5);
  const [clarity, setClarity] = useState(5);
  const [confidence, setConfidence] = useState(5);
  const [languageUsability, setLanguageUsability] = useState(5);
  const [comments, setComments] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.submitFeedback({
        user_role: role,
        ease_of_use: easeOfUse,
        clarity_rating: clarity,
        confidence_rating: confidence,
        language_usability: languageUsability,
        comments
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setIsSubmitted(true);
    }
  };

  const renderStars = (val: number, setter: (v: number) => void) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setter(star)}
          className="focus:outline-none transition hover:scale-110"
        >
          <Star className={`w-5 h-5 ${star <= val ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-slate-100">Stakeholder Prototype Validation</h2>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">User Stakeholder Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="Safety Officer">Safety Officer</option>
                <option value="Production Supervisor">Production Supervisor</option>
                <option value="Operator">Operator</option>
                <option value="Systems Engineer">Systems Engineer</option>
              </select>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Ease of Layout & Simulator Use</span>
                {renderStars(easeOfUse, setEaseOfUse)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Clarity of Safety Explanations</span>
                {renderStars(clarity, setClarity)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Confidence in Dynamic Calculations</span>
                {renderStars(confidence, setConfidence)}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Multilingual & Accessibility Usability</span>
                {renderStars(languageUsability, setLanguageUsability)}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Feedback Comments / Suggestions</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share your experience or recommendations for industrial deployment..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 h-20 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs py-2.5 rounded-xl transition shadow-lg shadow-cyan-600/20"
            >
              Submit Validation Feedback
            </button>
          </form>
        ) : (
          <div className="py-8 text-center space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-100">Feedback Submitted Successfully!</h3>
            <p className="text-xs text-slate-400">Thank you for validating the Dynamic Human-Robot Safety Zone Simulator.</p>
            <button
              onClick={onClose}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-5 py-2 rounded-xl border border-slate-700 transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
