'use client';

import { useState, useEffect, useCallback } from 'react';
import { settingsApi } from '@/lib/api';
import { FadeIn } from '@/components/ui/FadeIn';
import { Save, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

const SETTING_GROUPS = [
  {
    title: 'Hero Section',
    keys: [
      { key: 'hero_title', label: 'Hero Title', type: 'text', placeholder: 'Stories that breathe.' },
      { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea', placeholder: 'Author of dark, atmospheric fiction...' },
      { key: 'hero_background_url', label: 'Hero Background Image URL', type: 'text', placeholder: 'https://...' },
    ],
  },
  {
    title: 'Writing Status',
    keys: [
      { key: 'writing_status', label: 'Current Writing Status', type: 'text', placeholder: 'Currently writing: Untitled Project' },
      { key: 'writing_progress', label: 'Writing Progress (0-100)', type: 'number', placeholder: '65' },
    ],
  },
  {
    title: 'Announcement Banner',
    keys: [
      { key: 'announcement_text', label: 'Announcement Text', type: 'text', placeholder: 'New book dropping next month...' },
      { key: 'announcement_active', label: 'Show Announcement', type: 'toggle', placeholder: '' },
    ],
  },
  {
    title: 'About Page',
    keys: [
      { key: 'about_bio', label: 'Biography (use blank lines for paragraphs)', type: 'textarea', placeholder: 'Your biography...' },
      { key: 'about_image_url', label: 'Author Photo URL', type: 'text', placeholder: 'https://...' },
    ],
  },
  {
    title: 'Social Links',
    keys: [
      { key: 'social_instagram', label: 'Instagram URL / Handle', type: 'text', placeholder: 'https://www.instagram.com/amoraavesper/' },
      { key: 'social_threads', label: 'Threads URL / Handle', type: 'text', placeholder: 'https://www.threads.com/@amoraavesper' },
      { key: 'social_wattpad', label: 'Wattpad Profile URL', type: 'text', placeholder: 'https://www.wattpad.com/user/AmoraVesper' },
      { key: 'social_email', label: 'Contact Email', type: 'text', placeholder: 'amoraavesper@gmail.com' },
    ],
  },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsApi.getAllAdmin()
      .then(setSettings)
      .catch(() => toast.error('Failed to load settings'))
      .finally(() => setLoading(false));
  }, []);

  const set = (key: string, value: string) =>
    setSettings(s => ({ ...s, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.update(settings);
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-10">
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-label mb-2">Configure</p>
            <h1 className="text-subheading" style={{ fontFamily: 'var(--font-display)' }}>Settings</h1>
          </div>
          <button onClick={handleSave} disabled={saving || loading} className="btn btn-primary flex items-center gap-2">
            {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
            {saving ? 'Saving...' : 'Save All'}
          </button>
        </div>
      </FadeIn>

      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => <div key={i} className="shimmer h-40 rounded-sm" />)}
        </div>
      ) : (
        <div className="space-y-6 max-w-2xl">
          {SETTING_GROUPS.map((group, gi) => (
            <FadeIn key={group.title} delay={gi * 0.1}>
              <div className="card p-6">
                <h2
                  className="font-display text-base font-bold mb-5 pb-4 border-b"
                  style={{ fontFamily: 'var(--font-display)', borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  {group.title}
                </h2>
                <div className="space-y-4">
                  {group.keys.map(field => (
                    <div key={field.key}>
                      <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>{field.label}</label>
                      {field.type === 'toggle' ? (
                        <div className="flex items-center gap-3">
                          <div
                            className="relative w-10 h-5 rounded-full cursor-pointer transition-colors"
                            style={{ background: settings[field.key] === 'true' ? 'var(--color-gold)' : 'rgba(255,255,255,0.1)' }}
                            onClick={() => set(field.key, settings[field.key] === 'true' ? 'false' : 'true')}
                          >
                            <div
                              className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                              style={{ transform: settings[field.key] === 'true' ? 'translateX(20px)' : 'translateX(0)' }}
                            />
                          </div>
                          <span className="text-xs" style={{ color: 'var(--color-mist-light)' }}>
                            {settings[field.key] === 'true' ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                      ) : field.type === 'textarea' ? (
                        <textarea
                          className="textarea"
                          rows={4}
                          value={settings[field.key] || ''}
                          onChange={e => set(field.key, e.target.value)}
                          placeholder={field.placeholder}
                        />
                      ) : (
                        <input
                          type={field.type}
                          className="input"
                          value={settings[field.key] || ''}
                          onChange={e => set(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          min={field.type === 'number' ? 0 : undefined}
                          max={field.type === 'number' ? 100 : undefined}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
