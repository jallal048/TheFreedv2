// Configuración de Prisma para TheFreed.v1
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

export const prisma = new PrismaClient();

// Manejar cierre de conexión
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;