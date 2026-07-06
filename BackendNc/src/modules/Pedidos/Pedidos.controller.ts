import { asyncHandler } from '../../middlewares/Asynchandler';
import { paginar } from '../../utils/paginar';
import * as PedidoService from './Pedidos.service';
import {
  createPedidoSchema,
  idParamSchema,
  updatePedidoSchema,
} from './Validaciones/Pedido.schema';

export const getAll = asyncHandler(async (req, res) => {
  const pagination = paginar(req.query);
  const data = await PedidoService.getAllPedidos(pagination);

  res.status(200).json({ ok: true, ...data });
});

export const getById = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await PedidoService.getPedidoById(id);

  if (!data) {
    res.status(404).json({ ok: false, message: 'Pedido no encontrado' });
    return;
  }

  res.status(200).json({ ok: true, data });
});

export const create = asyncHandler(async (req, res) => {
  const body = createPedidoSchema.parse(req.body);
  const data = await PedidoService.createPedido(body);

  res.status(201).json({ ok: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const body = updatePedidoSchema.parse(req.body);
  const data = await PedidoService.updatePedido(id, body);

  res.status(200).json({ ok: true, data });
});

export const remove = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await PedidoService.deletePedido(id);

  res.status(200).json({ ok: true, data, message: 'Pedido eliminado correctamente' });
});
