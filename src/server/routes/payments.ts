// Rutas de pagos para TheFreed.v1
import express from 'express';
import {
  getPayments,
  createPaymentIntent,
  confirmPayment,
  requestRefund,
  getPaymentMethods,
  addPaymentMethod,
  stripeWebhook
} from '../controllers/paymentController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Rutas protegidas
router.get('/', authMiddleware, getPayments);
router.get('/methods', authMiddleware, getPaymentMethods);
router.post('/methods', authMiddleware, addPaymentMethod);
router.post('/create-payment-intent', authMiddleware, validateRequest, createPaymentIntent);
router.post('/confirm-payment', authMiddleware, confirmPayment);
router.post('/refund', authMiddleware, validateRequest, requestRefund);

// Webhook de Stripe (sin autenticación)
router.post('/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhook);

export default router;