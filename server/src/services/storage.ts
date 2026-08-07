import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import sharp from 'sharp';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET = 'amora-vesper';

export type UploadFolder =
  | 'covers'
  | 'banners'
  | 'characters'
  | 'gallery'
  | 'quotes'
  | 'moodboards'
  | 'blog'
  | 'about';

interface UploadResult {
  url: string;
  path: string;
}

/**
 * Compress + upload an image buffer to Supabase Storage
 */
export async function uploadImage(
  buffer: Buffer,
  originalName: string,
  folder: UploadFolder,
  options?: { width?: number; height?: number; quality?: number }
): Promise<UploadResult> {
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const baseName = path.basename(originalName, ext).replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const timestamp = Date.now();
  const fileName = `${folder}/${baseName}-${timestamp}.webp`;

  // Compress with Sharp
  let sharpInstance = sharp(buffer);

  if (options?.width || options?.height) {
    sharpInstance = sharpInstance.resize(options.width, options.height, {
      fit: 'cover',
      withoutEnlargement: true,
    });
  }

  const compressed = await sharpInstance
    .webp({ quality: options?.quality ?? 82 })
    .toBuffer();

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, compressed, {
      contentType: 'image/webp',
      upsert: false,
    });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path);

  return { url: urlData.publicUrl, path: data.path };
}

/**
 * Delete an image from Supabase Storage by its storage path
 */
export async function deleteImage(storagePath: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET).remove([storagePath]);
  if (error) throw new Error(`Storage delete failed: ${error.message}`);
}

/**
 * Replace an image — delete old, upload new
 */
export async function replaceImage(
  oldPath: string,
  buffer: Buffer,
  originalName: string,
  folder: UploadFolder,
  options?: { width?: number; height?: number; quality?: number }
): Promise<UploadResult> {
  if (oldPath) {
    try {
      await deleteImage(oldPath);
    } catch {
      // Non-fatal — continue with new upload
    }
  }
  return uploadImage(buffer, originalName, folder, options);
}
