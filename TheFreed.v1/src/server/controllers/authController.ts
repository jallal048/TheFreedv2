// Controlador de autenticación para TheFreed.v1
import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/authMiddleware';
import { createError } from '../middleware/errorHandler';
import { logger } from '../config/logger';
import prisma from '../config/prisma';

// Registrar usuario
export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, username, password, firstName, lastName } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      throw createError('El usuario con este email o nombre de usuario ya existe', 400);
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true
      }
    });

    // Generar tokens
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );

    logger.info(`Usuario registrado: ${user.email}`);

    res.status(201).json({
      success: true,
      data: {
        user,
        token,
        refreshToken
      },
      message: 'Usuario registrado exitosamente'
    });
  } catch (error) {
    throw error;
  }
};

// Iniciar sesión
export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true,
        firstName: true,
        lastName: true,
        isActive: true,
        isSuspended: true,
        userType: true
      }
    });

    if (!user) {
      throw createError('Credenciales inválidas', 401);
    }

    if (!user.isActive || user.isSuspended) {
      throw createError('Cuenta suspendida o desactivada', 403);
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw createError('Credenciales inválidas', 401);
    }

    // Generar tokens
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );

    // Actualizar última actividad
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() }
    });

    logger.info(`Usuario inició sesión: ${user.email}`);

    // Remover contraseña de la respuesta
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        refreshToken
      },
      message: 'Inicio de sesión exitoso'
    });
  } catch (error) {
    throw error;
  }
};

// Cerrar sesión
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user) {
      logger.info(`Usuario cerró sesión: ${req.user.email}`);
    }

    res.json({
      success: true,
      message: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    throw error;
  }
};

// Renovar token
export const refreshToken = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError('Refresh token requerido', 400);
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any;
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
        isSuspended: true
      }
    });

    if (!user || !user.isActive || user.isSuspended) {
      throw createError('Usuario no válido', 401);
    }

    const newToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      data: {
        token: newToken
      },
      message: 'Token renovado exitosamente'
    });
  } catch (error) {
    throw error;
  }
};

// Obtener perfil del usuario actual
export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        userType: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
        lastActive: true,
        profile: {
          select: {
            id: true,
            displayName: true,
            bio: true,
            avatarUrl: true,
            isVerified: true,
            followerCount: true,
            totalEarnings: true
          }
        }
      }
    });

    if (!user) {
      throw createError('Usuario no encontrado', 404);
    }

    res.json({
      success: true,
      data: { user },
      message: 'Perfil obtenido exitosamente'
    });
  } catch (error) {
    throw error;
  }
};