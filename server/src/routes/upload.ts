import { Router, Request, Response } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth';
import { uploadImage, UploadFolder } from '../services/storage';
import { uploadLimiter } from '../middleware/rateLimiter';

const router = Router();

// Use memory storage — pass buffer directly to Sharp
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WebP, and GIF files are allowed'));
    }
  },
});

const FOLDER_DIMENSIONS: Record<string, { width?: number; height?: number; quality?: number }> = {
  covers:     { width: 600,  height: 900,  quality: 85 },
  banners:    { width: 1920, height: 600,  quality: 80 },
  characters: { width: 600,  height: 900,  quality: 85 },
  gallery:    { width: 1200, height: 1200, quality: 82 },
  quotes:     { width: 1080, height: 1080, quality: 82 },
  moodboards: { width: 1200, height: 900,  quality: 80 },
  blog:       { width: 1200, height: 630,  quality: 82 },
  about:      { width: 800,  height: 1000, quality: 85 },
};

// POST /api/upload/:folder — admin: upload image
router.post('/:folder', requireAuth, uploadLimiter, upload.single('image'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const folder = req.params.folder as UploadFolder;
    const validFolders: UploadFolder[] = ['covers', 'banners', 'characters', 'gallery', 'quotes', 'moodboards', 'blog', 'about'];

    if (!validFolders.includes(folder)) {
      res.status(400).json({ error: 'Invalid upload folder' });
      return;
    }

    const dimensions = FOLDER_DIMENSIONS[folder] || {};
    const result = await uploadImage(
      req.file.buffer,
      req.file.originalname,
      folder,
      dimensions
    );

    res.json({ url: result.url, path: result.path });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// POST /api/upload/multiple/:folder — admin: upload multiple
router.post('/multiple/:folder', requireAuth, uploadLimiter, upload.array('images', 20), async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files uploaded' });
      return;
    }

    const folder = req.params.folder as UploadFolder;
    const dimensions = FOLDER_DIMENSIONS[folder] || {};

    const results = await Promise.all(
      files.map(file => uploadImage(file.buffer, file.originalname, folder, dimensions))
    );

    res.json(results);
  } catch (err) {
    console.error('Multi-upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
