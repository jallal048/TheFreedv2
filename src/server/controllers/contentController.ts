// Controlador de contenido para TheFreed.v1
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { createError } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import path from 'path';
import fs from 'fs/promises';
import prisma from '../config/prisma';

// Obtener todo el contenido con filtros
export const getContent = async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      contentType,
      creatorId,
      isPremium,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (category) where.category = String(category);
    if (contentType) where.contentType = String(contentType);
    if (creatorId) where.creatorId = String(creatorId);
    if (isPremium !== undefined) where.isPremium = isPremium === 'true';
    
    if (search) {
      where.OR = [
        { title: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
        { tags: { hasSome: [String(search)] } }
      ];
    }

    const content = await prisma.content.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        contentType: true,
        category: true,
        thumbnailUrl: true,
        duration: true,
        isPremium: true,
        isFree: true,
        price: true,
        views: true,
        likesCount: true,
        downloads: true,
        createdAt: true,
        publishedAt: true,
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
                isVerified: true
              }
            }
          }
        }
      },
      skip,
      take: Number(limit),
      orderBy: { [sortBy as string]: sortOrder as any }
    });

    const total = await prisma.content.count({ where });

    res.json({
      success: true,
      data: {
        content,
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

// Obtener contenido específico
export const getContentById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const content = await prisma.content.findUnique({
      where: { id },
      include: {
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
                isVerified: true,
                verificationLevel: true
              }
            }
          }
        },
        comments: {
          where: { isDeleted: false },
          select: {
            id: true,
            content: true,
            likesCount: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                profile: {
                  select: { avatarUrl: true }
                }
              }
            },
            replies: {
              where: { isDeleted: false },
              select: {
                id: true,
                content: true,
                likesCount: true,
                createdAt: true,
                user: {
                  select: {
                    id: true,
                    username: true,
                    profile: { select: { avatarUrl: true } }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!content) {
      throw createError('Contenido no encontrado', 404);
    }

    // Incrementar vistas
    await prisma.content.update({
      where: { id },
      data: { views: { increment: 1 } }
    });

    // Registrar en analytics
    await prisma.analytics.create({
      data: {
        contentId: id,
        type: 'DAILY',
        date: new Date(),
        views: { increment: 1 }
      }
    });

    res.json({
      success: true,
      data: { content }
    });
  } catch (error) {
    throw error;
  }
};

// Crear contenido
export const createContent = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      contentType,
      category,
      tags,
      mediaUrl,
      thumbnailUrl,
      duration,
      fileSize,
      isPremium,
      isFree,
      price,
      isPrivate,
      isNSFW,
      ageRestriction
    } = req.body;

    // Verificar que el usuario es creador
    if (req.user!.userType !== 'CREATOR') {
      throw createError('Solo los creadores pueden subir contenido', 403);
    }

    const content = await prisma.content.create({
      data: {
        creatorId: req.user!.id,
        title,
        description,
        contentType,
        category,
        tags: tags || [],
        mediaUrl,
        thumbnailUrl,
        duration,
        fileSize,
        isPremium: isPremium || false,
        isFree: isFree || false,
        price,
        isPrivate: isPrivate || false,
        isNSFW: isNSFW || false,
        ageRestriction,
        publishedAt: new Date()
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

    // Actualizar estadísticas del perfil del creador
    await prisma.creatorProfile.update({
      where: { userId: req.user!.id },
      data: {
        totalContent: { increment: 1 }
      }
    });

    logger.info(`Contenido creado: ${content.id} por usuario ${req.user!.id}`);

    res.status(201).json({
      success: true,
      data: { content },
      message: 'Contenido creado exitosamente'
    });
  } catch (error) {
    throw error;
  }
};

// Actualizar contenido
export const updateContent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar que el usuario es el creador del contenido
    const existingContent = await prisma.content.findUnique({
      where: { id },
      select: { creatorId: true }
    });

    if (!existingContent) {
      throw createError('Contenido no encontrado', 404);
    }

    if (existingContent.creatorId !== req.user!.id && req.user!.userType !== 'ADMIN') {
      throw createError('No tienes permisos para actualizar este contenido', 403);
    }

    const content = await prisma.content.update({
      where: { id },
      data: updateData,
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

    logger.info(`Contenido actualizado: ${id}`);

    res.json({
      success: true,
      data: { content },
      message: 'Contenido actualizado exitosamente'
    });
  } catch (error) {
    throw error;
  }
};

// Eliminar contenido
export const deleteContent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario es el creador del contenido
    const existingContent = await prisma.content.findUnique({
      where: { id },
      select: { creatorId: true, mediaUrl: true }
    });

    if (!existingContent) {
      throw createError('Contenido no encontrado', 404);
    }

    if (existingContent.creatorId !== req.user!.id && req.user!.userType !== 'ADMIN') {
      throw createError('No tienes permisos para eliminar este contenido', 403);
    }

    // Eliminar archivo físico si existe
    if (existingContent.mediaUrl) {
      try {
        const filePath = path.join(process.cwd(), existingContent.mediaUrl.replace('/uploads/', 'uploads/'));
        await fs.unlink(filePath);
      } catch (error) {
        logger.warn(`No se pudo eliminar el archivo físico: ${existingContent.mediaUrl}`);
      }
    }

    await prisma.content.delete({
      where: { id }
    });

    // Actualizar estadísticas del perfil del creador
    await prisma.creatorProfile.update({
      where: { userId: req.user!.id },
      data: {
        totalContent: { decrement: 1 }
      }
    });

    logger.info(`Contenido eliminado: ${id}`);

    res.json({
      success: true,
      message: 'Contenido eliminado exitosamente'
    });
  } catch (error) {
    throw error;
  }
};

// Obtener contenido por categoría
export const getContentByCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 12 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const content = await prisma.content.findMany({
      where: { 
        category,
        isPrivate: false
      },
      select: {
        id: true,
        title: true,
        description: true,
        contentType: true,
        thumbnailUrl: true,
        duration: true,
        isPremium: true,
        price: true,
        views: true,
        likesCount: true,
        createdAt: true,
        creator: {
          select: {
            id: true,
            username: true,
            profile: {
              select: {
                avatarUrl: true,
                displayName: true,
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

    const total = await prisma.content.count({
      where: { 
        category,
        isPrivate: false
      }
    });

    res.json({
      success: true,
      data: {
        content,
        category,
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

// Dar like a contenido
export const likeContent = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const content = await prisma.content.findUnique({
      where: { id },
      include: { likes: { where: { userId: req.user!.id } } }
    });

    if (!content) {
      throw createError('Contenido no encontrado', 404);
    }

    const existingLike = content.likes.find(like => like.userId === req.user!.id);

    if (existingLike) {
      // Quitar like
      await prisma.like.delete({ where: { id: existingLike.id } });
      await prisma.content.update({
        where: { id },
        data: { likesCount: { decrement: 1 } }
      });

      res.json({
        success: true,
        message: 'Like removido exitosamente',
        data: { liked: false }
      });
    } else {
      // Dar like
      await prisma.like.create({
        data: {
          userId: req.user!.id,
          contentId: id,
          type: 'LIKE'
        }
      });
      await prisma.content.update({
        where: { id },
        data: { likesCount: { increment: 1 } }
      });

      res.json({
        success: true,
        message: 'Like agregado exitosamente',
        data: { liked: true }
      });
    }
  } catch (error) {
    throw error;
  }
};

// Subir archivo de contenido
export const uploadContentFile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      throw createError('No se proporcionó ningún archivo', 400);
    }

    const uploadsDir = path.join(process.cwd(), 'uploads');
    await fs.mkdir(uploadsDir, { recursive: true });

    const fileName = `${Date.now()}-${req.file.originalname}`;
    const filePath = path.join(uploadsDir, fileName);
    
    await fs.writeFile(filePath, req.file.buffer);

    const fileUrl = `/uploads/${fileName}`;

    res.json({
      success: true,
      data: {
        fileUrl,
        fileName,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      },
      message: 'Archivo subido exitosamente'
    });
  } catch (error) {
    throw error;
  }
};