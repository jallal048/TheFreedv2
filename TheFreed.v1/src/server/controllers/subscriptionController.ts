// Controlador de suscripciones para TheFreed.v1
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { createError } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import prisma from '../config/prisma';

// Obtener suscripciones del usuario
export const getSubscriptions = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, status, creatorId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { subscriberId: req.user!.id };
    
    if (status) where.status = status;
    if (creatorId) where.creatorId = String(creatorId);

    const subscriptions = await prisma.subscription.findMany({
      where,
      select: {
        id: true,
        subscriptionType: true,
        price: true,
        currency: true,
        isActive: true,
        startDate: true,
        endDate: true,
        autoRenew: true,
        status: true,
        createdAt: true,
        creator: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
                displayName: true,
                bio: true,
                isVerified: true
              }
            }
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.subscription.count({ where });

    res.json({
      success: true,
      data: {
        subscriptions,
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

// Crear suscripción
export const createSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { creatorId, subscriptionType, paymentMethodId } = req.body;

    // Verificar que el creador existe y tiene perfil
    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      include: { profile: true }
    });

    if (!creator || !creator.profile) {
      throw createError('Creador no encontrado o sin perfil', 404);
    }

    // Verificar que no es el mismo usuario
    if (creatorId === req.user!.id) {
      throw createError('No puedes suscribirte a ti mismo', 400);
    }

    // Verificar que no existe ya una suscripción activa
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        subscriberId: req.user!.id,
        creatorId,
        isActive: true,
        status: 'ACTIVE'
      }
    });

    if (existingSubscription) {
      throw createError('Ya tienes una suscripción activa con este creador', 400);
    }

    // Determinar precio según tipo de suscripción
    let price: number;
    switch (subscriptionType) {
      case 'MONTHLY':
        price = creator.profile.monthlyPrice || 9.99;
        break;
      case 'YEARLY':
        price = creator.profile.yearlyPrice || 99.99;
        break;
      case 'LIFETIME':
        price = creator.profile.customPrice || 999.99;
        break;
      default:
        throw createError('Tipo de suscripción inválido', 400);
    }

    // Calcular fecha de vencimiento
    let endDate: Date;
    const now = new Date();
    switch (subscriptionType) {
      case 'MONTHLY':
        endDate = new Date(now.setMonth(now.getMonth() + 1));
        break;
      case 'YEARLY':
        endDate = new Date(now.setFullYear(now.getFullYear() + 1));
        break;
      default:
        endDate = new Date('2099-12-31'); // Lifetime
    }

    const subscription = await prisma.subscription.create({
      data: {
        subscriberId: req.user!.id,
        creatorId,
        subscriptionType,
        price,
        currency: 'USD',
        endDate,
        paymentMethod: paymentMethodId || 'stripe',
        status: 'PENDING'
      },
      include: {
        creator: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
                displayName: true,
                isVerified: true
              }
            }
          }
        }
      }
    });

    // TODO: Procesar pago con Stripe u otro gateway
    // await processSubscriptionPayment(subscription, paymentMethodId);

    // Crear transacción pendiente
    await prisma.transaction.create({
      data: {
        userId: req.user!.id,
        subscriptionId: subscription.id,
        type: 'SUBSCRIPTION',
        amount: price,
        currency: 'USD',
        description: `Suscripción ${subscriptionType} a ${creator.profile?.displayName || creator.username}`
      }
    });

    logger.info(`Suscripción creada: ${subscription.id} por usuario ${req.user!.id}`);

    res.status(201).json({
      success: true,
      data: { subscription },
      message: 'Suscripción creada exitosamente'
    });
  } catch (error) {
    throw error;
  }
};

// Cancelar suscripción
export const cancelSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: { creator: { select: { id: true } } }
    });

    if (!subscription) {
      throw createError('Suscripción no encontrada', 404);
    }

    if (subscription.subscriberId !== req.user!.id) {
      throw createError('No tienes permisos para cancelar esta suscripción', 403);
    }

    if (!subscription.isActive || subscription.status !== 'ACTIVE') {
      throw createError('La suscripción no está activa', 400);
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        isActive: false,
        status: 'CANCELLED',
        autoRenew: false,
        endDate: new Date() // Cancelación inmediata
      },
      include: {
        creator: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
            profile: {
              select: {
                avatarUrl: true,
                displayName: true
              }
            }
          }
        }
      }
    });

    logger.info(`Suscripción cancelada: ${id} por usuario ${req.user!.id}`);

    res.json({
      success: true,
      data: { subscription: updatedSubscription },
      message: 'Suscripción cancelada exitosamente'
    });
  } catch (error) {
    throw error;
  }
};

// Renovar suscripción
export const renewSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const subscription = await prisma.subscription.findUnique({
      where: { id },
      include: {
        creator: { select: { profile: true } }
      }
    });

    if (!subscription) {
      throw createError('Suscripción no encontrada', 404);
    }

    if (subscription.subscriberId !== req.user!.id) {
      throw createError('No tienes permisos para renovar esta suscripción', 403);
    }

    // Verificar que está próxima a vencer
    const now = new Date();
    const daysUntilExpiry = Math.ceil((subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry > 7) {
      throw createError('La suscripción aún no está próxima a vencer', 400);
    }

    // Calcular nueva fecha de vencimiento
    let newEndDate: Date;
    const baseDate = new Date();
    
    switch (subscription.subscriptionType) {
      case 'MONTHLY':
        newEndDate = new Date(baseDate.setMonth(baseDate.getMonth() + 1));
        break;
      case 'YEARLY':
        newEndDate = new Date(baseDate.setFullYear(baseDate.getFullYear() + 1));
        break;
      default:
        newEndDate = new Date('2099-12-31'); // Lifetime
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id },
      data: {
        startDate: now,
        endDate: newEndDate,
        isActive: true,
        status: 'ACTIVE'
      }
    });

    // TODO: Procesar pago automático

    logger.info(`Suscripción renovada: ${id} por usuario ${req.user!.id}`);

    res.json({
      success: true,
      data: { subscription: updatedSubscription },
      message: 'Suscripción renovada exitosamente'
    });
  } catch (error) {
    throw error;
  }
};

// Obtener suscripciones a un creador específico
export const getCreatorSubscriptions = async (req: AuthRequest, res: Response) => {
  try {
    const { creatorId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Verificar que el creador existe
    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      include: { profile: true }
    });

    if (!creator || !creator.profile) {
      throw createError('Creador no encontrado', 404);
    }

    // Solo el creador puede ver sus suscripciones detalladas
    if (creatorId !== req.user!.id) {
      // Para otros usuarios, solo mostrar estadísticas públicas
      const totalSubscribers = await prisma.subscription.count({
        where: {
          creatorId,
          isActive: true,
          status: 'ACTIVE'
        }
      });

      return res.json({
        success: true,
        data: {
          creator: {
            id: creator.id,
            username: creator.username,
            profile: creator.profile
          },
          stats: {
            totalSubscribers,
            monthlyRevenue: 0, // TODO: Calcular ingresos mensuales
            yearlyRevenue: 0   // TODO: Calcular ingresos anuales
          }
        }
      });
    }

    const subscriptions = await prisma.subscription.findMany({
      where: { creatorId },
      select: {
        id: true,
        subscriptionType: true,
        price: true,
        currency: true,
        isActive: true,
        startDate: true,
        endDate: true,
        subscriber: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            profile: {
              select: { avatarUrl: true }
            }
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.subscription.count({
      where: { creatorId }
    });

    res.json({
      success: true,
      data: {
        creator: {
          id: creator.id,
          username: creator.username,
          profile: creator.profile
        },
        subscriptions,
        stats: {
          totalSubscribers: total,
          activeSubscribers: await prisma.subscription.count({
            where: { creatorId, isActive: true, status: 'ACTIVE' }
          }),
          totalRevenue: await prisma.transaction.aggregate({
            where: {
              subscription: { creatorId },
              type: 'SUBSCRIPTION',
              status: 'COMPLETED'
            },
            _sum: { amount: true }
          })
        },
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

// Obtener estadísticas de suscripción
export const getSubscriptionStats = async (req: AuthRequest, res: Response) => {
  try {
    const { period = 'month' } = req.query; // month, year, all

    let dateFilter: Date;
    const now = new Date();

    switch (period) {
      case 'month':
        dateFilter = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        dateFilter = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        dateFilter = new Date(0); // All time
    }

    const stats = await prisma.subscription.groupBy({
      by: ['subscriptionType', 'status'],
      where: {
        createdAt: { gte: dateFilter }
      },
      _count: true,
      _sum: { price: true }
    });

    const totalSubscriptions = await prisma.subscription.count();
    const activeSubscriptions = await prisma.subscription.count({
      where: { isActive: true, status: 'ACTIVE' }
    });

    const totalRevenue = await prisma.transaction.aggregate({
      where: {
        type: 'SUBSCRIPTION',
        status: 'COMPLETED',
        createdAt: { gte: dateFilter }
      },
      _sum: { amount: true }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalSubscriptions,
          activeSubscriptions,
          totalRevenue: totalRevenue._sum.amount || 0,
          period
        },
        breakdown: stats
      }
    });
  } catch (error) {
    throw error;
  }
};