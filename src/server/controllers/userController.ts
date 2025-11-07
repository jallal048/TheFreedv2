// Controlador de usuarios para TheFreed.v1
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { createError } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import prisma from '../config/prisma';

// Obtener todos los usuarios (solo admin)
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search, userType } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: String(search), mode: 'insensitive' } },
        { username: { contains: String(search), mode: 'insensitive' } },
        { firstName: { contains: String(search), mode: 'insensitive' } },
        { lastName: { contains: String(search), mode: 'insensitive' } }
      ];
    }
    
    if (userType) {
      where.userType = userType;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        userType: true,
        isActive: true,
        isSuspended: true,
        createdAt: true,
        lastActive: true,
        profile: {
          select: {
            isVerified: true,
            followerCount: true
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.user.count({ where });

    res.json({
      success: true,
      data: {
        users,
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

// Obtener usuario por ID
export const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        userType: true,
        isActive: true,
        isSuspended: true,
        createdAt: true,
        lastActive: true,
        profile: {
          select: {
            id: true,
            displayName: true,
            bio: true,
            avatarUrl: true,
            bannerUrl: true,
            website: true,
            socialLinks: true,
            isVerified: true,
            verificationLevel: true,
            followerCount: true,
            totalViews: true,
            totalEarnings: true,
            totalContent: true
          }
        }
      }
    });

    if (!user) {
      throw createError('Usuario no encontrado', 404);
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    throw error;
  }
};

// Actualizar usuario
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, country, city } = req.body;

    // Verificar que el usuario puede actualizar su propio perfil
    if (req.user!.id !== id && req.user!.userType !== 'ADMIN') {
      throw createError('No tienes permisos para actualizar este usuario', 403);
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(phone && { phone }),
        ...(country && { country }),
        ...(city && { city })
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        country: true,
        city: true,
        updatedAt: true
      }
    });

    logger.info(`Usuario actualizado: ${user.id}`);

    res.json({
      success: true,
      data: { user },
      message: 'Usuario actualizado exitosamente'
    });
  } catch (error) {
    throw error;
  }
};

// Eliminar usuario (solo admin)
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // No permitir que un usuario se elimine a sí mismo
    if (req.user!.id === id) {
      throw createError('No puedes eliminar tu propia cuenta', 400);
    }

    await prisma.user.delete({
      where: { id }
    });

    logger.info(`Usuario eliminado: ${id}`);

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    });
  } catch (error) {
    throw error;
  }
};

// Obtener perfil de usuario
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const profile = await prisma.creatorProfile.findUnique({
      where: { userId: id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!profile) {
      throw createError('Perfil no encontrado', 404);
    }

    res.json({
      success: true,
      data: { profile }
    });
  } catch (error) {
    throw error;
  }
};

// Actualizar perfil de usuario
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { displayName, bio, website, categories, contentTypes } = req.body;

    // Verificar permisos
    if (req.user!.id !== id) {
      throw createError('No tienes permisos para actualizar este perfil', 403);
    }

    const profile = await prisma.creatorProfile.upsert({
      where: { userId: id },
      update: {
        ...(displayName && { displayName }),
        ...(bio && { bio }),
        ...(website && { website }),
        ...(categories && { categories }),
        ...(contentTypes && { contentTypes })
      },
      create: {
        userId: id,
        displayName: displayName || req.user!.username,
        bio: bio || '',
        website: website || '',
        categories: categories || [],
        contentTypes: contentTypes || []
      }
    });

    res.json({
      success: true,
      data: { profile },
      message: 'Perfil actualizado exitosamente'
    });
  } catch (error) {
    throw error;
  }
};

// Obtener configuración de usuario
export const getUserSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar permisos
    if (req.user!.id !== id) {
      throw createError('No tienes permisos para ver esta configuración', 403);
    }

    const settings = await prisma.userSettings.findUnique({
      where: { userId: id }
    });

    res.json({
      success: true,
      data: { settings }
    });
  } catch (error) {
    throw error;
  }
};

// Actualizar configuración de usuario
export const updateUserSettings = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const settingsData = req.body;

    // Verificar permisos
    if (req.user!.id !== id) {
      throw createError('No tienes permisos para actualizar esta configuración', 403);
    }

    const settings = await prisma.userSettings.upsert({
      where: { userId: id },
      update: settingsData,
      create: {
        userId: id,
        ...settingsData
      }
    });

    res.json({
      success: true,
      data: { settings },
      message: 'Configuración actualizada exitosamente'
    });
  } catch (error) {
    throw error;
  }
};