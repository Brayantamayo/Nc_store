import { asyncHandler } from '../../middlewares/Asynchandler';
import { paginar } from '../../utils/paginar';
import * as ClientesService from './Clientes.service';
import { createClienteSchema, idParamSchema, updateClienteSchema } from './Validaciones/Cliente.schema';

export const getAll = asyncHandler(async (req, res) => {
  const pagination = paginar(req.query);
  const data = await ClientesService.getAllClientes(pagination);

  res.status(200).json({ ok: true, ...data });
});

export const getById = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await ClientesService.getClienteById(id);

  if (!data) {
    res.status(404).json({ ok: false, message: 'Cliente no encontrado' });
    return;
  }

  res.status(200).json({ ok: true, data });
});

export const create = asyncHandler(async (req, res) => {
  const body = createClienteSchema.parse(req.body);
  const data = await ClientesService.createCliente(body);

  res.status(201).json({ ok: true, data });
});

export const update = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const body = updateClienteSchema.parse(req.body);
  const data = await ClientesService.updateCliente(id, body);

  res.status(200).json({ ok: true, data });
});
