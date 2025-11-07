// Rutas de suscripciones para TheFreed.v1
import { Router } from 'express';
import {
  getSubscriptions,
  createSubscription,
  cancelSubscription,
  renewSubscription,
  getCreatorSubscriptions,
  getSubscriptionStats
} from '../controllers/subscriptionController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { commonValidations } from '../middleware/validateRequest';

const router = Router();

// Rutas protegidas
router.get('/', authMiddleware, getSubscriptions);
router.get('/stats', authMiddleware, getSubscriptionStats);
router.get('/creator/:creatorId', authMiddleware, getCreatorSubscriptions);
router.post('/', authMiddleware, [
  commonValidations.email, // Reutilizar validación de email para creatorId
  validateRequest
], createSubscription);
router.put('/:id/cancel', authMiddleware, cancelSubscription);
router.put('/:id/renew', authMiddleware, renewSubscription);

export default router;