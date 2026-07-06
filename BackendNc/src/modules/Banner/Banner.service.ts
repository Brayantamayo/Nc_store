import { Prisma } from '@prisma/client';
import { prisma } from '../../config/db';
import { cloudinary } from '../../config/cloudinary';
import { CreateBannerDto, UpdateBannerDto } from './Validaciones/Banner.schema';

const MAX_BANNERS = 8;

type BannerRow = {
  id: number;
  url: string;
  publicId: string;
  titulo: string;
  subtitulo: string;
  desc: string | null;
  orden: number;
  activo: boolean;
  creadoEn: Date;
};

export const getBanners = async () => {
  return prisma.$queryRaw<BannerRow[]>(Prisma.sql`
    SELECT "id", "url", "publicId", "titulo", "subtitulo", "desc", "orden", "activo", "creadoEn"
    FROM "BannerSlide"
    ORDER BY "orden" ASC
  `);
};

export const getBannersActivos = async () => {
  return prisma.$queryRaw<BannerRow[]>(Prisma.sql`
    SELECT "id", "url", "publicId", "titulo", "subtitulo", "desc", "orden", "activo", "creadoEn"
    FROM "BannerSlide"
    WHERE "activo" = true
    ORDER BY "orden" ASC
  `);
};

export const uploadBanner = async (file: Express.Multer.File, data: CreateBannerDto) => {
  if (!file) throw new Error('No se envió ninguna imagen');

  const existingOrders = await prisma.$queryRaw<Array<{ orden: number }>>(Prisma.sql`
    SELECT "orden" FROM "BannerSlide" ORDER BY "orden" ASC
  `);

  if (existingOrders.length >= MAX_BANNERS) {
    throw new Error(`Solo se permiten ${MAX_BANNERS} banners en el carrusel`);
  }

  const occupied = new Set(existingOrders.map((item) => item.orden));
  let orden = 1;
  while (occupied.has(orden) && orden <= MAX_BANNERS) orden++;

  const [created] = await prisma.$queryRaw<BannerRow[]>(Prisma.sql`
    INSERT INTO "BannerSlide" ("url", "publicId", "titulo", "subtitulo", "desc", "orden")
    VALUES (${file.path}, ${file.filename}, ${data.titulo}, ${data.subtitulo}, ${data.desc ?? null}, ${orden})
    RETURNING "id", "url", "publicId", "titulo", "subtitulo", "desc", "orden", "activo", "creadoEn"
  `);

  return created;
};

export const updateBanner = async (id: number, data: UpdateBannerDto) => {
  const [existing] = await prisma.$queryRaw<BannerRow[]>(Prisma.sql`
    SELECT "id" FROM "BannerSlide" WHERE "id" = ${id} LIMIT 1
  `);

  if (!existing) throw new Error(`Banner con id ${id} no encontrado`);

  const sets: string[] = [];
  if (data.titulo !== undefined)    sets.push(`"titulo" = '${data.titulo}'`);
  if (data.subtitulo !== undefined) sets.push(`"subtitulo" = '${data.subtitulo}'`);
  if (data.desc !== undefined)      sets.push(`"desc" = '${data.desc}'`);
  if (data.activo !== undefined)    sets.push(`"activo" = ${data.activo}`);

  if (sets.length === 0) {
    const [current] = await prisma.$queryRaw<BannerRow[]>(Prisma.sql`
      SELECT "id", "url", "publicId", "titulo", "subtitulo", "desc", "orden", "activo", "creadoEn"
      FROM "BannerSlide" WHERE "id" = ${id} LIMIT 1
    `);
    return current;
  }

  const [updated] = await prisma.$queryRaw<BannerRow[]>(
    Prisma.sql`
      UPDATE "BannerSlide"
      SET ${Prisma.raw(sets.join(', '))}
      WHERE "id" = ${id}
      RETURNING "id", "url", "publicId", "titulo", "subtitulo", "desc", "orden", "activo", "creadoEn"
    `
  );

  return updated;
};

export const deleteBanner = async (id: number) => {
  const [banner] = await prisma.$queryRaw<Array<{ id: number; publicId: string }>>(Prisma.sql`
    SELECT "id", "publicId" FROM "BannerSlide" WHERE "id" = ${id} LIMIT 1
  `);

  if (!banner) throw new Error(`Banner con id ${id} no encontrado`);

  await cloudinary.uploader.destroy(banner.publicId);

  await prisma.$executeRaw(Prisma.sql`DELETE FROM "BannerSlide" WHERE "id" = ${id}`);

  return banner;
};
