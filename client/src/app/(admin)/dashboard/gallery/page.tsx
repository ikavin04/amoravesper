'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { galleryApi, uploadApi } from '@/lib/api';
import { GalleryImage } from '@/types';
import { FadeIn } from '@/components/ui/FadeIn';
import { Upload, Trash2, Eye, EyeOff, FolderOpen, Plus, X, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

const FOLDERS = ['general', 'moodboards', 'aesthetics', 'characters', 'book-photography', 'wallpapers', 'pinterest'];

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFolder, setSelectedFolder] = useState('general');
  const [showAddModal, setShowAddModal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    try {
      const data = await galleryApi.getAllAdmin();
      setImages(data);
    } catch { toast.error('Failed to load gallery'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchImages(); }, [fetchImages]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadProgress(0);

    try {
      const fileArray = Array.from(files);
      // Upload one by one for progress tracking
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const result = await uploadApi.upload('gallery', file, p => {
          setUploadProgress(Math.round(((i / fileArray.length) + (p / 100 / fileArray.length)) * 100));
        });
        await galleryApi.create({
          image_url: result.url,
          folder: selectedFolder,
          is_published: true,
          title: file.name.replace(/\.[^.]+$/, '').replace(/-/g, ' '),
        });
      }
      toast.success(`${fileArray.length} image${fileArray.length > 1 ? 's' : ''} uploaded`);
      fetchImages();
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); setUploadProgress(0); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this image?')) return;
    try {
      await galleryApi.delete(id);
      toast.success('Image deleted');
      fetchImages();
    } catch { toast.error('Failed to delete'); }
  };

  const togglePublish = async (img: GalleryImage) => {
    try {
      await galleryApi.update(img.id, { ...img, is_published: !img.is_published });
      fetchImages();
    } catch { toast.error('Failed to update'); }
  };

  const filteredImages = selectedFolder === 'all' ? images : images.filter(i => i.folder === selectedFolder);

  return (
    <div className="p-6 lg:p-10">
      <FadeIn>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-label mb-2">Manage</p>
            <h1 className="text-subheading" style={{ fontFamily: 'var(--font-display)' }}>Gallery</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="btn btn-primary flex items-center gap-2"
            >
              {uploading ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />}
              {uploading ? `${uploadProgress}%` : 'Upload Images'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={e => handleUpload(e.target.files)}
            />
          </div>
        </div>

        {/* Upload Progress Bar */}
        {uploading && (
          <div className="mb-6">
            <div className="h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%`, background: 'linear-gradient(to right, var(--color-gold-dim), var(--color-gold))' }} />
            </div>
          </div>
        )}

        {/* Folder Tabs */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          <button
            onClick={() => setSelectedFolder('all')}
            className={`btn ${selectedFolder === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ padding: '0.4rem 1rem', fontSize: '0.7rem' }}
          >
            All ({images.length})
          </button>
          {FOLDERS.map(folder => {
            const count = images.filter(i => i.folder === folder).length;
            return (
              <button
                key={folder}
                onClick={() => setSelectedFolder(folder)}
                className={`btn ${selectedFolder === folder ? 'btn-primary' : 'btn-ghost'} flex items-center gap-1.5`}
                style={{ padding: '0.4rem 1rem', fontSize: '0.7rem' }}
              >
                <FolderOpen size={11} />
                {folder} ({count})
              </button>
            );
          })}
        </div>
      </FadeIn>

      {/* Drag & Drop Zone */}
      <div
        className="border-2 border-dashed rounded-sm mb-8 p-8 text-center transition-colors cursor-pointer"
        style={{ borderColor: 'rgba(255,255,255,0.08)' }}
        onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--color-gold)'; }}
        onDragLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
        onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; handleUpload(e.dataTransfer.files); }}
        onClick={() => fileRef.current?.click()}
      >
        <Upload size={28} style={{ color: 'var(--color-mist)', margin: '0 auto 0.75rem', opacity: 0.5 }} />
        <p className="text-sm" style={{ color: 'var(--color-mist)' }}>
          Drag & drop images here, or click to browse
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--color-mist)', opacity: 0.6 }}>
          Upload to: <strong style={{ color: 'var(--color-gold)' }}>{selectedFolder}</strong> folder
        </p>
      </div>

      {/* Images Grid */}
      {loading ? (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {[...Array(12)].map((_, i) => <div key={i} className="shimmer rounded-sm" style={{ aspectRatio: '1' }} />)}
        </div>
      ) : filteredImages.length === 0 ? (
        <div className="text-center py-16">
          <p style={{ color: 'var(--color-mist-light)' }}>No images in this folder yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredImages.map(img => (
            <FadeIn key={img.id}>
              <div className="group relative rounded-sm overflow-hidden" style={{ aspectRatio: '1' }}>
                <Image
                  src={img.image_url}
                  alt={img.alt_text || img.title || ''}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 33vw, 16vw"
                  loading="lazy"
                />
                {!img.is_published && (
                  <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
                )}
                {/* Action overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
                  style={{ background: 'rgba(10,9,8,0.7)' }}
                >
                  <button
                    onClick={() => togglePublish(img)}
                    className="p-1.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.15)', color: img.is_published ? 'var(--color-gold)' : 'var(--color-mist)' }}
                  >
                    {img.is_published ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="p-1.5 rounded-full"
                    style={{ background: 'rgba(155,79,110,0.3)', color: 'var(--color-rose-light)' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                {/* Folder badge */}
                <div className="absolute bottom-1 left-1">
                  <span className="badge badge-mist" style={{ fontSize: '0.5rem', padding: '0.1rem 0.4rem' }}>
                    {img.folder}
                  </span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
