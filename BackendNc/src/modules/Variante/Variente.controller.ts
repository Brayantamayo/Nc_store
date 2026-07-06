import { asyncHandler } from '../../middlewares/Asynchandler';
import { paginar } from '../../utils/paginar';
import * as VarianteService from './Variante.services';
import {
  ajustarStockSchema,
  createVarianteSchema,
  createManyVariantesSchema,
  idParamSchema,
  productoIdParamSchema,
  updateVarianteSchema,
} from './Validaciones/Variante.Schema';

///---Obtener todas las variantes---///
export const getAll = asyncHandler(async (req, res) => {
  const pagination = paginar(req.query);
  const data = await VarianteService.getAllVariantes(pagination);

  res.status(200).json({ ok: true, ...data });
});


///---Obtener variantes por producto---///
export const getByProducto = asyncHandler(async (req, res) => {
  const { productoId } = productoIdParamSchema.parse(req.params);
  const pagination = paginar(req.query);
  const data = await VarianteService.getAllVariantesByProducto(productoId, pagination);

  res.status(200).json({ ok: true, ...data });
});

///---Obtener variante por ID---///
export const getById = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await VarianteService.getVarianteById(id);

  if (!data) {
    res.status(404).json({ ok: false, message: 'Variante no encontrada' });
    return;
  }

  res.status(200).json({ ok: true, data });
});

///---Crear variante---///
export const create = asyncHandler(async (req, res) => {
  const body = createVarianteSchema.parse(req.body);
  const data = await VarianteService.createVariante(body);

  res.status(201).json({ ok: true, data });
});

///---Crear múltiples variantes---///
export const createMany = asyncHandler(async (req, res) => {
  const body = createManyVariantesSchema.parse(req.body);
  const data = await VarianteService.createManyVariantes(body);

  res.status(201).json({ ok: true, data });
});

//---Actualizar variante---///
export const update = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const body = updateVarianteSchema.parse(req.body);
  const data = await VarianteService.updateVariante(id, body);

  res.status(200).json({ ok: true, data });
});

///---Ajustar stock de una variante---///
export const ajustarStock = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const body = ajustarStockSchema.parse(req.body);
  const data = await VarianteService.ajustarStock(id, body);

  res.status(200).json({
    ok: true,
    data,
    message: `Stock ajustado en ${body.cantidad > 0 ? '+' : ''}${body.cantidad}`,
  });
});

///---Eliminar variante---///
export const remove = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await VarianteService.deleteVariante(id);

  res.status(200).json({ ok: true, data, message: 'Variante eliminada correctamente' });
});
