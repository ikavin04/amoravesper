'use client';

import { useState, useEffect, useCallback } from 'react';
import { suggestionsApi } from '@/lib/api';
import { FadeIn } from '@/components/ui/FadeIn';
import { MessageSquarePlus, Trash2, CheckCircle2, Clock, Sparkles, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '@/lib/utils';

interface Suggestion {
  id: string;
  reader_name: string;
  reader_email: string | null;
  book_topic: string | null;
  suggestion: string;
  status: 'pending' | 'reviewed' | 'planned' | 'released';
  created_at: string;
}

export default function AdminSuggestionsPage() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const fetchSuggestions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await suggestionsApi.getAllAdmin();
      setSuggestions(data);
    } catch {
      toast.error('Failed to load reader suggestions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await suggestionsApi.updateStatus(id, status);
      toast.success(`Suggestion marked as ${status}`);
      fetchSuggestions();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this suggestion?')) return;
    try {
      await suggestionsApi.delete(id);
      toast.success('Suggestion deleted');
      fetchSuggestions();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const filteredSuggestions = suggestions.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'released':
        return <span className="badge badge-gold flex items-center gap-1"><Sparkles size={10} /> Released</span>;
      case 'planned':
        return <span className="badge badge-rose flex items-center gap-1"><Clock size={10} /> Planned</span>;
      case 'reviewed':
        return <span className="badge badge-gold flex items-center gap-1"><CheckCircle2 size={10} /> Reviewed</span>;
      default:
        return <span className="badge badge-mist flex items-center gap-1"><Clock size={10} /> Pending</span>;
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <p className="text-label mb-2">Author Studio</p>
            <h1 className="text-subheading" style={{ fontFamily: 'var(--font-display)' }}>
              Reader Suggestions & Requests
            </h1>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={14} style={{ color: 'var(--color-mist)' }} />
            {['all', 'pending', 'reviewed', 'planned', 'released'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded text-xs capitalize transition-all ${
                  filter === f
                    ? 'bg-[var(--color-gold)] text-black font-semibold'
                    : 'bg-[var(--color-ink-muted)] text-[var(--color-mist)] border border-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </FadeIn>

      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="shimmer h-24 rounded-sm" />
          ))}
        </div>
      ) : filteredSuggestions.length === 0 ? (
        <div className="text-center py-20 bg-[var(--color-ink-muted)] border border-white/5 rounded-sm">
          <MessageSquarePlus size={36} className="mx-auto mb-3 text-[var(--color-mist)] opacity-40" />
          <p className="text-sm font-medium" style={{ color: 'var(--color-parchment)' }}>
            No reader suggestions found.
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-mist)' }}>
            Reader requests submitted on your site will appear here!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSuggestions.map((item) => (
            <FadeIn key={item.id}>
              <div
                className="p-5 rounded-sm space-y-3 transition-all"
                style={{
                  background: 'var(--color-ink-muted)',
                  border: '1px solid rgba(255,255,255,0.06)'
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm" style={{ color: 'var(--color-parchment)' }}>
                      {item.reader_name || 'Anonymous Reader'}
                    </span>
                    {item.reader_email && (
                      <span className="text-xs" style={{ color: 'var(--color-gold)' }}>
                        ({item.reader_email})
                      </span>
                    )}
                    {item.book_topic && (
                      <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-[var(--color-mist-light)]">
                        Topic: {item.book_topic}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(item.status)}
                    <span className="text-xs" style={{ color: 'var(--color-mist)' }}>
                      {formatDate(item.created_at, 'MMM d, yyyy · h:mm a')}
                    </span>
                  </div>
                </div>

                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-mist-light)' }}>
                  &ldquo;{item.suggestion}&rdquo;
                </p>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-mist)]">Set Status:</span>
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="text-xs px-2 py-1 rounded bg-[var(--color-ink-soft)] border border-white/10 text-[var(--color-parchment)]"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="planned">Planned for Release</option>
                      <option value="released">Released / Done</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 rounded hover:text-rose-400 transition-colors"
                    title="Delete suggestion"
                    style={{ color: 'var(--color-mist)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
