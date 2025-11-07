// Controlador de pagos para TheFreed.v1
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { createError } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import Stripe from 'stripe';
import prisma from '../config/prisma';

// Inicializar Stripe (en producción usar variables de entorno reales)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy', {
  apiVersion: '2023-10-16'
});

// Obtener historial de pagos del usuario
export const getPayments = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, status, type } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId: req.user!.id };
    
    if (status) where.status = status;
    if (type) where.gateway = type;

    const payments = await prisma.payment.findMany({
      where,
      select: {
        id: true,
        amount: true,
        currency: true,
        paymentMethod: true,
        status: true,
        gateway: true,
        gatewayTransactionId: true,
        failureReason: true,
        processedAt: true,
        createdAt: true,
        transactions: {
          select: {
            id: true,
            type: true,
            amount: true,
            description: true,
            status: true
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.payment.count({ where });

    res.json({
      success: true,
      data: {
        payments,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    throw error;
  }
};

// Crear intención de pago
export const createPaymentIntent = async (req: AuthRequest, res: Response) => {
  try {
    const {
      amount,
      currency = 'usd',
      paymentMethodId,
      type,
      description,
      subscriptionId,
      contentId
    } = req.body;

    if (!amount || amount <= 0) {
      throw createError('Monto inválido', 400);
    }

    // Crear payment intent con Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convertir a centavos
      currency,
      payment_method: paymentMethodId,
      description: description || 'Pago TheFreed',
      metadata: {
        userId: req.user!.id,
        type: type || 'general',
        subscriptionId: subscriptionId || '',
        contentId: contentId || ''
      }
    });

    // Crear registro en nuestra base de datos
    const payment = await prisma.payment.create({
      data: {
        userId: req.user!.id,
        amount,
        currency: currency.toUpperCase(),
        paymentMethod: paymentMethodId || 'stripe',
        status: 'PENDING',
        gateway: 'STRIPE',
        gatewayTransactionId: paymentIntent.id
      }
    });

    // Crear transacción asociada
    const transaction = await prisma.transaction.create({
      data: {
        userId: req.user!.id,
        paymentId: payment.id,
        type: type || 'CONTENT_PURCHASE',
        amount,
        currency: currency.toUpperCase(),
        status: 'PENDING',
        description: description || 'Compra en TheFreed'
      }
    });

    logger.info(`Payment intent creado: ${paymentIntent.id} para usuario ${req.user!.id}`);

    res.status(201).json({
      success: true,
      data: {
        paymentIntent: {
          id: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          status: paymentIntent.status
        },
        payment,
        transaction
      },
      message: 'Intención de pago creada exitosamente'
    });
  } catch (error) {
    logger.error('Error creando payment intent:', error);
    throw error;
  }
};

// Confirmar pago
export const confirmPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      throw createError('Payment intent ID requerido', 400);
    }

    // Verificar payment intent con Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw createError('El pago no ha sido confirmado por Stripe', 400);
    }

    // Buscar nuestro registro de pago
    const payment = await prisma.payment.findFirst({
      where: { gatewayTransactionId: paymentIntentId },
      include: { transactions: true }
    });

    if (!payment) {
      throw createError('Registro de pago no encontrado', 404);
    }

    if (payment.status === 'COMPLETED') {
      throw createError('El pago ya fue procesado', 400);
    }

    // Actualizar estado del pago
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        processedAt: new Date()
      }
    });

    // Actualizar transacciones asociadas
    const updatedTransaction = await prisma.transaction.update({
      where: { id: payment.transactions[0]?.id },
      data: {
        status: 'COMPLETED',
        description: paymentIntent.description || undefined
      }
    });

    // Procesar lógica específica según el tipo de pago
    await processSuccessfulPayment(updatedPayment, paymentIntent);

    logger.info(`Pago confirmado: ${payment.id} para usuario ${payment.userId}`);

    res.json({
      success: true,
      data: {
        payment: updatedPayment,
        transaction: updatedTransaction
      },
      message: 'Pago confirmado exitosamente'
    });
  } catch (error) {
    logger.error('Error confirmando pago:', error);
    throw error;
  }
};

// Solicitar reembolso
export const requestRefund = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId, reason, amount } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { transactions: true }
    });

    if (!payment) {
      throw createError('Pago no encontrado', 404);
    }

    if (payment.userId !== req.user!.id && req.user!.userType !== 'ADMIN') {
      throw createError('No tienes permisos para solicitar reembolso de este pago', 403);
    }

    if (payment.status !== 'COMPLETED') {
      throw createError('Solo se pueden reembolsar pagos completados', 400);
    }

    // Crear reembolso con Stripe
    const refundAmount = amount ? Math.round(amount * 100) : payment.amount * 100;
    
    const refund = await stripe.refunds.create({
      payment_intent: payment.gatewayTransactionId,
      amount: refundAmount,
      reason: 'requested_by_customer',
      metadata: {
        reason: reason || 'Solicitud de reembolso',
        requestedBy: req.user!.id
      }
    });

    // Crear nueva transacción de reembolso
    const refundTransaction = await prisma.transaction.create({
      data: {
        userId: payment.userId,
        paymentId: payment.id,
        type: 'REFUND',
        amount: -refundAmount / 100, // Negativo para reembolso
        currency: payment.currency,
        status: 'PENDING',
        description: `Reembolso: ${reason || 'Sin especificar'}`
      }
    });

    // Actualizar estado del pago original
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'REFUNDED',
        failureReason: `Reembolsado: ${reason || 'Sin especificar'}`
      }
    });

    logger.info(`Reembolso solicitado: ${payment.id} por usuario ${req.user!.id}`);

    res.status(201).json({
      success: true,
      data: {
        refund: {
          id: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
          reason: reason
        },
        transaction: refundTransaction
      },
      message: 'Reembolso solicitado exitosamente'
    });
  } catch (error) {
    logger.error('Error solicitando reembolso:', error);
    throw error;
  }
};

// Obtener métodos de pago del usuario
export const getPaymentMethods = async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Implementar métodos de pago guardados
    // Por ahora retornamos métodos básicos
    
    res.json({
      success: true,
      data: {
        paymentMethods: [
          {
            id: 'pm_visa',
            type: 'card',
            brand: 'visa',
            last4: '4242',
            expMonth: 12,
            expYear: 2025,
            isDefault: true
          },
          {
            id: 'pm_mastercard',
            type: 'card',
            brand: 'mastercard',
            last4: '5555',
            expMonth: 8,
            expYear: 2026,
            isDefault: false
          }
        ]
      }
    });
  } catch (error) {
    throw error;
  }
};

// Agregar método de pago
export const addPaymentMethod = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentMethodId, isDefault = false } = req.body;

    if (!paymentMethodId) {
      throw createError('Payment method ID requerido', 400);
    }

    // TODO: Guardar método de pago en Stripe para el usuario
    // const customer = await stripe.customers.create({
    //   email: req.user!.email,
    //   metadata: { userId: req.user!.id }
    // });

    // await stripe.paymentMethods.attach(paymentMethodId, {
    //   customer: customer.id
    // });

    logger.info(`Método de pago agregado: ${paymentMethodId} para usuario ${req.user!.id}`);

    res.status(201).json({
      success: true,
      data: {
        paymentMethodId,
        isDefault
      },
      message: 'Método de pago agregado exitosamente'
    });
  } catch (error) {
    throw error;
  }
};

// Webhook para procesar eventos de Stripe
export const stripeWebhook = async (req: AuthRequest, res: Response) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      throw createError('Webhook no configurado correctamente', 400);
    }

    const event = stripe.webhooks.constructEvent(req.body, sig as string, webhookSecret);

    logger.info(`Evento Stripe recibido: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      case 'charge.dispute.created':
        await handleChargeDispute(event.data.object);
        break;
      default:
        logger.info(`Evento Stripe no manejado: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Error procesando webhook Stripe:', error);
    throw error;
  }
};

// Funciones auxiliares

async function processSuccessfulPayment(payment: any, paymentIntent: any) {
  try {
    const metadata = paymentIntent.metadata;

    // Procesar según tipo
    switch (metadata.type) {
      case 'SUBSCRIPTION':
        // Activar suscripción
        if (metadata.subscriptionId) {
          await prisma.subscription.update({
            where: { id: metadata.subscriptionId },
            data: { status: 'ACTIVE' }
          });
        }
        break;
        
      case 'CONTENT_PURCHASE':
        // Dar acceso al contenido
        if (metadata.contentId) {
          await prisma.content.update({
            where: { id: metadata.contentId },
            data: { downloads: { increment: 1 } }
          });
        }
        break;
    }

    // Generar ganancias para el creador
    // TODO: Implementar sistema de comisiones
  } catch (error) {
    logger.error('Error procesando pago exitoso:', error);
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { gatewayTransactionId: paymentIntent.id }
    });

    if (payment && payment.status === 'PENDING') {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'COMPLETED', processedAt: new Date() }
      });
    }
  } catch (error) {
    logger.error('Error manejando pago exitoso:', error);
  }
}

async function handlePaymentFailure(paymentIntent: any) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { gatewayTransactionId: paymentIntent.id }
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          failureReason: paymentIntent.last_payment_error?.message || 'Pago fallido'
        }
      });
    }
  } catch (error) {
    logger.error('Error manejando pago fallido:', error);
  }
}

async function handleChargeDispute(dispute: any) {
  try {
    // Crear disputa en nuestra base de datos
    await prisma.dispute.create({
      data: {
        userId: dispute.metadata?.userId || '',
        type: 'PAYMENT_ISSUE',
        amount: dispute.amount / 100,
        currency: dispute.currency.toUpperCase(),
        reason: `Disputa de Stripe: ${dispute.reason}`,
        status: 'OPEN'
      }
    });

    logger.warn(`Nueva disputa creada: ${dispute.id}`);
  } catch (error) {
    logger.error('Error manejando disputa:', error);
  }
}