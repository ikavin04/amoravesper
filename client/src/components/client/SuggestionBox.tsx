'use client';

import { useState } from 'react';
import { suggestionsApi } from '@/lib/api';
import { MessageSquarePlus, Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export function SuggestionBox() {
  const [form, setForm] = useState({
    reader_name: '',
    reader_email: '',
    book_topic: '',
    suggestion: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.suggestion.trim()) {
      toast.error('Please enter your suggestion or request');
      return;
    }

    setSubmitting(true);
    try {
      await suggestionsApi.submit(form);
      setSubmitted(true);
      toast.success('Suggestion sent directly to Amora Vesper!');
      setForm({ reader_name: '', reader_email: '', book_topic: '', suggestion: '' });
    } catch {
      toast.error('Failed to submit suggestion. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="p-6 md:p-8 rounded-md relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(201,168,76,0.06) 0%, rgba(20,18,16,0.95) 100%)',
        border: '1px solid rgba(201,168,76,0.2)'
      }}
    >
      <div className="flex items-center gap-3 mb-3">
        <MessageSquarePlus className="w-5 h-5" style={{ color: 'var(--color-gold)' }} />
        <h3 className="font-display text-xl font-bold" style={{ color: 'var(--color-parchment)' }}>
          Reader Suggestion & Request Box
        </h3>
      </div>

      <p className="text-sm mb-6" style={{ color: 'var(--color-mist-light)' }}>
        Have a trope request, character idea, or release suggestion? Share it directly with the author!
      </p>

      {submitted ? (
        <div className="py-8 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 mx-auto" style={{ color: 'var(--color-gold)' }} />
          <h4 className="font-display text-lg font-bold" style={{ color: 'var(--color-parchment)' }}>
            Suggestion Received!
          </h4>
          <p className="text-xs" style={{ color: 'var(--color-mist)' }}>
            Thank you! Your idea has been sent directly to the Author Studio.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="btn btn-secondary text-xs mt-3"
          >
            Submit Another Suggestion
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-label block mb-1.5">Your Name (Optional)</label>
              <input
                type="text"
                placeholder="Reader name or alias"
                value={form.reader_name}
                onChange={(e) => setForm(f => ({ ...f, reader_name: e.target.value }))}
                className="input text-xs"
              />
            </div>
            <div>
              <label className="text-xs text-label block mb-1.5">Email (Optional)</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={form.reader_email}
                onChange={(e) => setForm(f => ({ ...f, reader_email: e.target.value }))}
                className="input text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-label block mb-1.5">Book or Topic (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Shadows of Vesper, Chapter release day, Special bonus scene..."
              value={form.book_topic}
              onChange={(e) => setForm(f => ({ ...f, book_topic: e.target.value }))}
              className="input text-xs"
            />
          </div>

          <div>
            <label className="text-xs text-label block mb-1.5">Your Suggestion / Request *</label>
            <textarea
              required
              rows={3}
              placeholder="Write your suggestion, trope idea, or chapter request here..."
              value={form.suggestion}
              onChange={(e) => setForm(f => ({ ...f, suggestion: e.target.value }))}
              className="textarea text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full flex items-center justify-center gap-2 text-xs py-3"
          >
            {submitting ? 'Sending Suggestion...' : (
              <>
                <Send size={14} /> Send Suggestion to Author
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
