import { asyncHandler } from '../../middlewares/Asynchandler';
import { paginar } from '../../utils/paginar';
import * as ProductService from './products.service';
import {
  createProductoSchema,
  idParamSchema,
  slugParamSchema,
  updateProductoSchema,
} from './Validaciones/Schema.producto';

///---Obtener todos los productos---///
export const getAll = asyncHandler(async (req, res) => {
  const pagination = paginar(req.query);
  const data = await ProductService.getAllProductos(pagination);

  res.status(200).json({ ok: true, ...data });
});

///---Obtener producto por ID---///
export const getById = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await ProductService.getProductoById(id);

  if (!data) {
    res.status(404).json({ ok: false, message: 'Producto no encontrado' });
    return;
  }

  res.status(200).json({ ok: true, data });
});

//---Obtener producto por Slug---///
export const getBySlug = asyncHandler(async (req, res) => {
  const { slug } = slugParamSchema.parse(req.params);
  const data = await ProductService.getProductoBySlug(slug);

  if (!data) {
    res.status(404).json({ ok: false, message: 'Producto no encontrado' });
    return;
  }

  res.status(200).json({ ok: true, data });
});

///---Crear producto---///
export const create = asyncHandler(async (req, res) => {
  const body = createProductoSchema.parse(req.body);
  const data = await ProductService.createProducto(body);

  res.status(201).json({ ok: true, data });
});

///---Actualizar producto---///
export const update = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const body = updateProductoSchema.parse(req.body);
  const data = await ProductService.updateProducto(id, body);

  res.status(200).json({ ok: true, data });
});

///---Eliminar producto---///
export const remove = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await ProductService.deleteProducto(id);

  res.status(200).json({ ok: true, data, message: 'Producto eliminado correctamente' });
});
