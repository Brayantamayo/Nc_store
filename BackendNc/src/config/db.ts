// src/config/db.ts

/**
 * Configuración del cliente Prisma.
 *
 * Crea una única instancia de PrismaClient para toda la aplicación
 * y la reutiliza en desarrollo para evitar múltiples conexiones
 * a la base de datos causadas por hot reload o reinicios del servidor.
 */

import { PrismaClient } from "@prisma/client";
import { env } from "./environment";

// Extiende el objeto global de Node.js para almacenar Prisma
const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

// Reutiliza la instancia existente de Prisma si ya fue creada,
// de lo contrario crea una nueva instancia
export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    // Habilita logs detallados en desarrollo
    log:
      env.NODE_ENV === "development"
        ? ["query", "info", "warn", "error"]
        : ["error"],
  });

// Evita crear múltiples instancias de Prisma en desarrollo
if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}