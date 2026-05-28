import { Request, Response }    from 'express'
import * as VarianteService     from './Variante.services'
import { asyncHandler }         from '../../middlewares/Asynchandler'
import {
  createVarianteSchema,
  updateVarianteSchema,
  ajustarStockSchema,
  idParamSchema,
  productoIdParamSchema,
} from './Validaciones/Variante.Schema'

// ─── OBTENER POR PRODUCTO ─────────────────────────────────

export const getByProducto = asyncHandler(async (req, res) => {const { productoId } = productoIdParamSchema.parse(req.params)
const data = await VarianteService.getAllVariantesByProducto(productoId)
res.status(200).json({ ok: true, data })
})

// ─── OBTENER POR ID ───────────────────────────────────────

export const getById = asyncHandler(async (req, res) => {const { id } = idParamSchema.parse(req.params)
const data = await VarianteService.getVarianteById(id)
    if (!data) {
        res.status(404).json({ ok: false, message: 'Variante no encontrada' })
    return
}res.status(200).json({ ok: true, data })
})

// ─── CREAR ──────────────────────────────────────────

export const create = asyncHandler(async (req, res) => {const body = createVarianteSchema.parse(req.body)
const data = await VarianteService.createVariante(body)
res.status(201).json({ ok: true, data })
})

// ─── ACTUALIZAR ──────────────────────────────────────────

export const update = asyncHandler(async (req, res) => {const { id } = idParamSchema.parse(req.params)
const body   = updateVarianteSchema.parse(req.body)
const data   = await VarianteService.updateVariante(id, body)
res.status(200).json({ ok: true, data })
})

// ─── AJUSTAR STOCK ───────────────────────────────────

export const ajustarStock = asyncHandler(async (req, res) => {const { id }      = idParamSchema.parse(req.params)
const { cantidad } = ajustarStockSchema.parse(req.body)
const data        = await VarianteService.ajustarStock(id, cantidad)
res.status(200).json({
    ok: true,
    data,
    message: `Stock ajustado en ${cantidad > 0 ? '+' : ''}${cantidad}`,
})
})

// ─── DELETE ──────────────────────────────────────────

export const remove = asyncHandler(async (req, res) => {const { id } = idParamSchema.parse(req.params)
const data   = await VarianteService.deleteVariante(id)
res.status(200).json({ ok: true, data, message: 'Variante eliminada correctamente' })
})