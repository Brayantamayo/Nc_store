import { asyncHandler } from '../../middlewares/Asynchandler';
import { createBannerSchema, idParamSchema, updateBannerSchema } from './Validaciones/Banner.schema';
import * as BannerService from './Banner.service';

/** GET /api/banners — todos (admin) */
export const getAll = asyncHandler(async (_req, res) => {
  const data = await BannerService.getBanners();
  res.status(200).json({ ok: true, data });
});

/** GET /api/banners/activos — solo los activos (público, para el HeroSection) */
export const getActivos = asyncHandler(async (_req, res) => {
  const data = await BannerService.getBannersActivos();
  res.status(200).json({ ok: true, data });
});

/** POST /api/banners/upload — subir nuevo banner */
export const create = asyncHandler(async (req, res) => {
  const body = createBannerSchema.parse(req.body);
  const file = req.file;
  const data = await BannerService.uploadBanner(file as Express.Multer.File, body);
  res.status(201).json({ ok: true, data });
});

/** PATCH /api/banners/:id — editar texto o activo */
export const update = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const body = updateBannerSchema.parse(req.body);
  const data = await BannerService.updateBanner(id, body);
  res.status(200).json({ ok: true, data });
});

/** DELETE /api/banners/:id — eliminar banner */
export const remove = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await BannerService.deleteBanner(id);
  res.status(200).json({ ok: true, data, message: 'Banner eliminado correctamente' });
});
