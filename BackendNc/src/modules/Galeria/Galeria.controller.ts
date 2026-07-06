import { asyncHandler } from '../../middlewares/Asynchandler';
import { createGaleriaSchema, idParamSchema } from './Validaciones/Galeria.schema';
import * as GaleriaService from './Galeria.service';

export const getAll = asyncHandler(async (_req, res) => {
  const data = await GaleriaService.getGallery();
  res.status(200).json({ ok: true, data });
});

export const create = asyncHandler(async (req, res) => {
  const body = createGaleriaSchema.parse(req.body);
  const file = req.file;
  const data = await GaleriaService.uploadGalleryImage(file as Express.Multer.File, body);
  res.status(201).json({ ok: true, data });
});

export const remove = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await GaleriaService.deleteGalleryImage(id);
  res.status(200).json({ ok: true, data, message: 'Imagen eliminada correctamente' });
});
