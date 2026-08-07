'use client';

import { useState, useCallback, useRef } from 'react';
import { uploadApi } from '@/lib/api';
import { FadeIn } from '@/components/ui/FadeIn';
import { Upload, Loader, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

const FOLDERS = [
  { key: 'covers', label: 'Book Covers', desc: '2:3 ratio · 600×900px' },
  { key: 'banners', label: 'Banners', desc: 'Wide · 1920×600px' },
  { key: 'characters', label: 'Character Photos', desc: '2:3 ratio · 600×900px' },
  { key: 'gallery', label: 'Gallery Images', desc: 'Square · 1200×1200px' },
  { key: 'quotes', label: 'Quote Backgrounds', desc: 'Square · 1080×1080px' },
  { key: 'moodboards', label: 'Moodboards', desc: 'Wide · 1200×900px' },
  { key: 'blog', label: 'Blog Covers', desc: 'OG · 1200×630px' },
  { key: 'about', label: 'About Photo', desc: 'Portrait · 800×1000px' },
];

interface UploadResult { url: string; path: string; name: string; }

export default function AdminUploadsPage() {
  const [selectedFolder, setSelectedFolder] = useState('gallery');
  const [results, setResults] = useState<UploadResult[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setProgress(0);

    const newResults: UploadResult[] = [];
    const fileArray = Array.from(files);

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const result = await uploadApi.upload(selectedFolder, file, p => {
          setProgress(Math.round(((i / fileArray.length) + (p / 100 / fileArray.length)) * 100));
        });
        newResults.push({ url: result.url, path: result.path, name: file.name });
      }
      setResults(prev => [...newResults, ...prev]);
      toast.success(`${fileArray.length} file${fileArray.length > 1 ? 's' : ''} uploaded`);
    } catch {
      toast.error('Some uploads failed');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [selectedFolder]);

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('URL copied!');
  };

  return (
    <div className="p-6 lg:p-10">
      <FadeIn>
        <div className="mb-8">
          <p className="text-label mb-2">Media</p>
          <h1 className="text-subheading" style={{ fontFamily: 'var(--font-display)' }}>Quick Upload</h1>
          <p className="text-sm mt-2" style={{ color: 'var(--color-mist-light)' }}>
            Upload images and get instant URLs. Images are auto-compressed and optimized.
          </p>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Panel */}
        <div className="lg:col-span-1">
          <FadeIn>
            <div className="card p-6">
              <p className="text-label mb-4">Upload Folder</p>
              <div className="space-y-2 mb-6">
                {FOLDERS.map(folder => (
                  <button
                    key={folder.key}
                    onClick={() => setSelectedFolder(folder.key)}
                    className="w-full text-left px-3 py-2.5 rounded-sm text-sm transition-all"
                    style={{
                      background: selectedFolder === folder.key ? 'rgba(201,168,76,0.1)' : 'transparent',
                      color: selectedFolder === folder.key ? 'var(--color-gold)' : 'var(--color-mist-light)',
                      border: selectedFolder === folder.key ? '1px solid rgba(201,168,76,0.2)' : '1px solid transparent',
                    }}
                  >
                    <p className="font-medium">{folder.label}</p>
                    <p className="text-xs opacity-60">{folder.desc}</p>
                  </button>
                ))}
              </div>

              {/* Drop Zone */}
              <div
                className="border-2 border-dashed rounded-sm p-6 text-center cursor-pointer transition-all"
                style={{ borderColor: uploading ? 'var(--color-gold)' : 'rgba(255,255,255,0.1)' }}
                onClick={() => !uploading && fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--color-gold)'; }}
                onDragLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                onDrop={e => {
                  e.preventDefault();
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  handleUpload(e.dataTransfer.files);
                }}
              >
                <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
                  onChange={e => handleUpload(e.target.files)} />
                {uploading ? (
                  <div className="space-y-3">
                    <Loader size={28} className="animate-spin mx-auto" style={{ color: 'var(--color-gold)' }} />
                    <p className="text-sm" style={{ color: 'var(--color-gold)' }}>Uploading... {progress}%</p>
                    <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: 'var(--color-gold)' }} />
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload size={28} className="mx-auto mb-3" style={{ color: 'var(--color-mist)', opacity: 0.5 }} />
                    <p className="text-sm" style={{ color: 'var(--color-mist)' }}>Drop images or click</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--color-mist)', opacity: 0.6 }}>→ {selectedFolder}</p>
                  </>
                )}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Results */}
        <div className="lg:col-span-2">
          {results.length === 0 ? (
            <div className="text-center py-24">
              <Upload size={40} style={{ color: 'var(--color-mist)', opacity: 0.2, margin: '0 auto 1rem' }} />
              <p style={{ color: 'var(--color-mist-light)' }}>Uploaded images will appear here with their URLs.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {results.map((r, i) => (
                <FadeIn key={r.path || i} delay={i * 0.05}>
                  <div className="card overflow-hidden group">
                    <div className="relative" style={{ aspectRatio: '16/9' }}>
                      <Image src={r.url} alt={r.name} fill className="object-cover" sizes="300px" />
                      {/* Copy overlay */}
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                        style={{ background: 'rgba(10,9,8,0.7)' }}
                        onClick={() => copyUrl(r.url)}
                      >
                        <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full"
                          style={{ background: 'var(--color-gold)', color: 'var(--color-ink)' }}>
                          <Check size={12} /> Copy URL
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-xs truncate" style={{ color: 'var(--color-mist)' }}>{r.name}</p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
