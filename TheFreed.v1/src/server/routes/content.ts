// Rutas de contenido para TheFreed.v1
import { Router } from 'express';
import {
  getContent,
  getContentById,
  createContent,
  updateContent,
  deleteContent,
  getContentByCategory,
  likeContent,
  uploadContentFile
} from '../controllers/contentController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import multer from 'multer';

const router = Router();

// Configurar multer para uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// Rutas públicas
router.get('/', getContent);
router.get('/category/:category', getContentByCategory);
router.get('/:id', getContentById);

// Rutas protegidas
router.post('/', authMiddleware, validateRequest, createContent);
router.put('/:id', authMiddleware, validateRequest, updateContent);
router.delete('/:id', authMiddleware, deleteContent);
router.post('/:id/like', authMiddleware, likeContent);
router.post('/upload', authMiddleware, upload.single('file'), uploadContentFile);

export default router;