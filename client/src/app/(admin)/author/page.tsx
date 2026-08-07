'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

export default function AuthorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await authApi.login(email, password);
      router.push('/dashboard');
    } catch {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--color-ink)' }}
    >
      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <p
            className="font-display text-3xl font-bold mb-1"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-parchment)' }}
          >
            Amora Vesper
          </p>
          <p className="text-label">Author Studio</p>
        </div>

        {/* Card */}
        <div
          className="p-8 rounded-sm"
          style={{
            background: 'var(--color-ink-muted)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full mx-auto mb-6"
            style={{ background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)' }}>
            <Lock size={16} style={{ color: 'var(--color-gold)' }} />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="author@example.com"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-mist)' }}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full mt-2"
              style={{ height: '48px' }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                'Enter'
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
