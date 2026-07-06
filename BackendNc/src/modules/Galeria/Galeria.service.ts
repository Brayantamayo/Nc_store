import { Prisma } from '@prisma/client';
import { prisma } from '../../config/db';
import { cloudinary } from '../../config/cloudinary';
import { CreateGaleriaDto } from './Validaciones/Galeria.schema';

const MAX_IMAGES = 9;

type GalleryRow = {
  id: number;
  url: string;
  publicId: string;
  caption: string | null;
  orden: number;
  creadoEn: Date;
};

export const getGallery = async () => {
  return prisma.$queryRaw<GalleryRow[]>(Prisma.sql`
    SELECT "id", "url", "publicId", "caption", "orden", "creadoEn"
    FROM "GaleriaImagen"
    ORDER BY "orden" ASC
    LIMIT ${MAX_IMAGES}
  `);
};

export const uploadGalleryImage = async (file: Express.Multer.File, data: CreateGaleriaDto) => {
  if (!file) {
    throw new Error('No se envió ninguna imagen');
  }

  const existingOrders = await prisma.$queryRaw<Array<{ orden: number }>>(Prisma.sql`
    SELECT "orden"
    FROM "GaleriaImagen"
    ORDER BY "orden" ASC
  `);

  if (existingOrders.length >= MAX_IMAGES) {
    throw new Error('La galería solo permite 9 imágenes');
  }

  const occupied = new Set(existingOrders.map((item: { orden: number }) => item.orden));
  let orden = 1;
  while (occupied.has(orden) && orden <= MAX_IMAGES) {
    orden += 1;
  }

  const [created] = await prisma.$queryRaw<GalleryRow[]>(Prisma.sql`
    INSERT INTO "GaleriaImagen" ("url", "publicId", "caption", "orden")
    VALUES (${file.path}, ${file.filename}, ${data.caption ?? null}, ${orden})
    RETURNING "id", "url", "publicId", "caption", "orden", "creadoEn"
  `);

  return created;
};

export const deleteGalleryImage = async (id: number) => {
  const [image] = await prisma.$queryRaw<Array<{ id: number; publicId: string; orden: number }>>(Prisma.sql`
    SELECT "id", "publicId", "orden"
    FROM "GaleriaImagen"
    WHERE "id" = ${id}
    LIMIT 1
  `);

  if (!image) {
    throw new Error(`Imagen de galería con id ${id} no encontrada`);
  }

  await cloudinary.uploader.destroy(image.publicId);

  await prisma.$executeRaw(Prisma.sql`
    DELETE FROM "GaleriaImagen"
    WHERE "id" = ${id}
  `);

  return image;
};
