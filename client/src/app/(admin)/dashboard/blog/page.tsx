'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { blogApi, uploadApi } from '@/lib/api';
import { BlogPost } from '@/types';
import { FadeIn } from '@/components/ui/FadeIn';
import { Plus, Trash2, Edit2, Eye, EyeOff, ExternalLink, X, Loader, Upload, Save } from 'lucide-react';
import { slugify, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await blogApi.getAllAdmin();
      setPosts(data);
    } catch { toast.error('Failed to load posts'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post?')) return;
    try {
      await blogApi.delete(id);
      toast.success('Post deleted');
      fetchPosts();
    } catch { toast.error('Failed'); }
  };

  const togglePublish = async (post: BlogPost) => {
    try {
      await blogApi.update(post.id, { ...post, is_published: !post.is_published });
      toast.success(post.is_published ? 'Unpublished' : 'Published');
      fetchPosts();
    } catch { toast.error('Failed'); }
  };

  if (editing || creating) {
    return (
      <BlogEditor
        post={editing}
        onBack={() => { setEditing(null); setCreating(false); fetchPosts(); }}
      />
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <FadeIn>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-label mb-2">Manage</p>
            <h1 className="text-subheading" style={{ fontFamily: 'var(--font-display)' }}>Blog & News</h1>
          </div>
          <button onClick={() => setCreating(true)} className="btn btn-primary flex items-center gap-2">
            <Plus size={16} /> New Post
          </button>
        </div>
      </FadeIn>

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="shimmer h-16 rounded-sm" />)}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-24">
          <p style={{ color: 'var(--color-mist-light)' }}>No posts yet. Write your first post.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <FadeIn key={post.id}>
              <div className="flex items-center gap-4 p-4 rounded-sm"
                style={{ background: 'var(--color-ink-muted)', border: '1px solid rgba(255,255,255,0.05)', opacity: post.is_published ? 1 : 0.65 }}>
                {post.cover_url && (
                  <div className="relative flex-shrink-0 rounded-sm overflow-hidden" style={{ width: 60, height: 40 }}>
                    <Image src={post.cover_url} alt={post.title} fill className="object-cover" sizes="60px" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm" style={{ color: 'var(--color-parchment)' }}>{post.title}</p>
                    {!post.is_published && <span className="badge badge-mist" style={{ fontSize: '0.55rem' }}>Draft</span>}
                    <span className="badge badge-gold" style={{ fontSize: '0.55rem' }}>{post.category}</span>
                  </div>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--color-mist)' }}>
                    {post.published_at ? formatDate(post.published_at, 'MMM d, yyyy') : 'Not published yet'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => togglePublish(post)} className="p-1.5 rounded"
                    style={{ color: post.is_published ? 'var(--color-gold)' : 'var(--color-mist)' }}>
                    {post.is_published ? <Eye size={13} /> : <EyeOff size={13} />}
                  </button>
                  {post.is_published && (
                    <a href={`/news/${post.slug}`} target="_blank" className="p-1.5 rounded"
                      style={{ color: 'var(--color-mist)' }}><ExternalLink size={13} /></a>
                  )}
                  <button onClick={() => setEditing(post)} className="p-1.5 rounded" style={{ color: 'var(--color-mist)' }}>
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(post.id)} className="p-1.5 rounded"
                    style={{ color: 'var(--color-mist)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-rose-light)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-mist)')}>
                    <Trash2 size={13} />
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

function BlogEditor({ post, onBack }: { post: BlogPost | null; onBack: () => void }) {
  const [form, setForm] = useState({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    cover_url: post?.cover_url || '',
    category: post?.category || 'update',
    is_published: post?.is_published || false,
  });
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TiptapImage,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Write your post here...' }),
    ],
    content: post?.content || '',
    editorProps: {
      attributes: {
        class: 'prose-editor min-h-[300px] p-4 outline-none text-sm leading-relaxed',
        style: 'color: var(--color-mist-light);',
      },
    },
  });

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }));

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    try {
      const result = await uploadApi.upload('blog', file);
      set('cover_url', result.url);
      toast.success('Cover uploaded');
    } catch { toast.error('Upload failed'); }
    finally { setUploadingCover(false); }
  };

  const handleSave = async (publish: boolean) => {
    if (!form.title) { toast.error('Title required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        slug: form.slug || slugify(form.title),
        content: editor?.getHTML() || '',
        is_published: publish,
      };
      if (post) {
        await blogApi.update(post.id, payload);
        toast.success('Post updated');
      } else {
        await blogApi.create(payload);
        toast.success('Post created');
      }
      onBack();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Save failed';
      toast.error(msg);
    } finally { setSaving(false); }
  };

  return (
    <div className="p-6 lg:p-10">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="btn btn-ghost flex items-center gap-2">
          ← Back
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => handleSave(false)} disabled={saving} className="btn btn-outline flex items-center gap-2">
            {saving ? <Loader size={14} className="animate-spin" /> : <Save size={14} />}
            Save Draft
          </button>
          <button onClick={() => handleSave(true)} disabled={saving} className="btn btn-primary flex items-center gap-2">
            {saving ? <Loader size={14} className="animate-spin" /> : null}
            {form.is_published ? 'Update' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-5">
        {/* Title */}
        <input
          className="w-full bg-transparent text-3xl font-display font-bold outline-none border-none"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-parchment)' }}
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: f.slug || slugify(e.target.value) }))}
          placeholder="Post title..."
        />

        {/* Meta Row */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-label" style={{ fontSize: '0.6rem' }}>Slug:</span>
            <input className="input flex-1 text-xs" style={{ height: '32px' }}
              value={form.slug} onChange={e => set('slug', slugify(e.target.value))} placeholder="post-slug" />
          </div>
          <select className="input" style={{ height: '32px', padding: '0 0.75rem', fontSize: '0.8rem', width: 'auto' }}
            value={form.category} onChange={e => set('category', e.target.value)}>
            {['update', 'writing', 'announcement', 'event', 'release'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Cover */}
        <div>
          <div
            className="relative border-2 border-dashed rounded-sm p-4 text-center cursor-pointer mb-2"
            style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            onClick={() => coverRef.current?.click()}
          >
            <input ref={coverRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleCoverUpload(f); }} />
            {form.cover_url ? (
              <div className="relative w-full" style={{ height: 120 }}>
                <Image src={form.cover_url} alt="" fill className="object-cover rounded-sm" sizes="600px" />
              </div>
            ) : (
              <div className="py-4 flex flex-col items-center gap-2">
                {uploadingCover ? <Loader size={20} className="animate-spin" style={{ color: 'var(--color-mist)' }} /> :
                  <Upload size={20} style={{ color: 'var(--color-mist)', opacity: 0.5 }} />}
                <p className="text-xs" style={{ color: 'var(--color-mist)' }}>Upload cover image</p>
              </div>
            )}
          </div>
        </div>

        {/* Excerpt */}
        <div>
          <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Excerpt</label>
          <textarea className="textarea" rows={2} value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="Brief summary shown in lists..." />
        </div>

        {/* Editor */}
        <div>
          <label className="text-label block mb-2" style={{ fontSize: '0.6rem' }}>Content</label>
          <div className="rounded-sm overflow-hidden" style={{ background: 'var(--color-ink-muted)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b flex-wrap" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              {[
                { label: 'B', action: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive('bold') },
                { label: 'I', action: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive('italic') },
                { label: 'H2', action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive('heading', { level: 2 }) },
                { label: 'H3', action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), active: editor?.isActive('heading', { level: 3 }) },
                { label: '¶', action: () => editor?.chain().focus().setParagraph().run(), active: false },
                { label: '—', action: () => editor?.chain().focus().setHorizontalRule().run(), active: false },
              ].map(btn => (
                <button key={btn.label} onClick={btn.action} type="button"
                  className="px-2 py-1 rounded text-xs font-mono transition-colors"
                  style={{
                    background: btn.active ? 'rgba(201,168,76,0.15)' : 'transparent',
                    color: btn.active ? 'var(--color-gold)' : 'var(--color-mist-light)',
                    border: '1px solid transparent',
                  }}>
                  {btn.label}
                </button>
              ))}
            </div>
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
    </div>
  );
}
