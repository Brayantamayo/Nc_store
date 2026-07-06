import { asyncHandler } from '../../middlewares/Asynchandler';
import { paginar } from '../../utils/paginar';
import * as CategoriaService from './Categoria.service';
import {
  createCategoriaSchema,
  idParamSchema,
  updateCategoriaSchema,
} from './Validaciones/Schema.categoria';

///---Obtener todas las categorías---///
export const getAll = asyncHandler(async (req, res) => {
  const pagination = paginar(req.query);
  const data = await CategoriaService.getAllCategorias(pagination);

  res.status(200).json({ ok: true, ...data });
});

///---Obtener árbol de categorías---///
export const getTree = asyncHandler(async (_req, res) => {
  const data = await CategoriaService.getCategoriaTree();

  res.status(200).json({ ok: true, data });
});

///---Obtener categoría por ID---///
export const getById = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await CategoriaService.getCategoriaById(id);

  if (!data) {
    res.status(404).json({ ok: false, message: 'Categoría no encontrada' });
    return;
  }

  res.status(200).json({ ok: true, data });
});

////Obtener por slug---///
export const getBySlug = asyncHandler(async (req, res) => {
  const data = await CategoriaService.getCategoriaBySlug(req.params.slug);

  if (!data) {
    res.status(404).json({ ok: false, message: 'Categoría no encontrada' });
    return;
  }

  res.status(200).json({ ok: true, data });
});

///---Crear categoria---///
export const create = asyncHandler(async (req, res) => {
  const body = createCategoriaSchema.parse(req.body);
  const data = await CategoriaService.createCategoria(body);

  res.status(201).json({ ok: true, data });
});
///---Actualizar categoría---//
export const update = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const body = updateCategoriaSchema.parse(req.body);
  const data = await CategoriaService.updateCategoria(id, body);

  res.status(200).json({ ok: true, data });
});
///---Eliminar categoría---///
export const remove = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await CategoriaService.deleteCategoria(id);

  res.status(200).json({ ok: true, data, message: 'Categoría eliminada correctamente' });
});
