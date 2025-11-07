// Rutas de usuarios para TheFreed.v1
import { Router } from 'express';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  getUserSettings,
  updateUserSettings
} from '../controllers/userController';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { validateRequest } from '../middleware/validateRequest';

const router = Router();

// Rutas públicas
router.get('/', getUsers);
router.get('/:id', getUser);
router.get('/:id/profile', getUserProfile);

// Rutas protegidas
router.put('/:id', authMiddleware, validateRequest, updateUser);
router.delete('/:id', authMiddleware, adminMiddleware, deleteUser);
router.put('/:id/profile', authMiddleware, validateRequest, updateUserProfile);
router.get('/:id/settings', authMiddleware, getUserSettings);
router.put('/:id/settings', authMiddleware, validateRequest, updateUserSettings);

export default router;