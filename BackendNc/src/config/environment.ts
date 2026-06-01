// src/config/environment.ts

/**
 * Configuración y validación de variables de entorno.
 *
 * Carga las variables desde el archivo .env y valida
 * que todas las variables necesarias existan y tengan
 * el formato correcto antes de iniciar la aplicación.
 */

import dotenv from "dotenv";
import { z } from "zod";

// Carga las variables de entorno desde el archivo .env
dotenv.config();

// Esquema de validación de variables de entorno
const envSchema = z.object({
  PORT:         z.coerce.number().default(3001),
  DATABASE_URL: z.string(),
  JWT_SECRET:   z.string().min(8),
  NODE_ENV:     z.enum(['development', 'production', 'test']).default('development'),

  // ─── Cloudinary ───────────────────────────────────────
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY:    z.string(),
  CLOUDINARY_API_SECRET: z.string(),
});

// Valida las variables de entorno contra el esquema definido
const parsed = envSchema.safeParse(process.env);

// Detiene la aplicación si las variables son inválidas
if (!parsed.success) {
  console.error(
    "Variables de entorno inválidas:",
    parsed.error.format()
  );

  process.exit(1);
}

// Exporta las variables validadas y tipadas
export const env = parsed.data;