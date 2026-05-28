import { Request, Response }     from 'express'
import * as CategoriaService     from './Categoria.service'
import { asyncHandler }          from '../../middlewares/Asynchandler'
import {
  createCategoriaSchema,  
  updateCategoriaSchema,
  idParamSchema,
} from './Validaciones/Schema.categoria'

// ─── OBTENER ─────────────────────────────────────────

export const getAll = asyncHandler(async (_req, res) => {const data = await CategoriaService.getAllCategorias()
res.status(200).json({ ok: true, data })
})

// ─── OBTENER POR ID ───────────────────────────────────────

export const getById = asyncHandler(async (req, res) => {const { id } = idParamSchema.parse(req.params)
  const data = await CategoriaService.getCategoriaById(id)
  if (!data) {  res.status(404).json({ ok: false, message: 'Categoría no encontrada' })
    return
  }res.status(200).json({ ok: true, data })
})

// ─── OBTENER POR SLUG ─────────────────────────────────────

export const getBySlug = asyncHandler(async (req, res) => {const data = await CategoriaService.getCategoriaBySlug(req.params.slug)
  if (!data) {res.status(404).json({ ok: false, message: 'Categoría no encontrada' })
  return
  }res.status(200).json({ ok: true, data })
})

// ─── CREAR──────────────────────────────────────────

export const create = asyncHandler(async (req, res) => {const body = createCategoriaSchema.parse(req.body)
  const data = await CategoriaService.createCategoria(body)
  res.status(201).json({ ok: true, data })
})

// ─── ACTUALIZAR ──────────────────────────────────────────

export const update = asyncHandler(async (req, res) => {const { id } = idParamSchema.parse(req.params)
  const body   = updateCategoriaSchema.parse(req.body)
  const data   = await CategoriaService.updateCategoria(id, body)
  res.status(200).json({ ok: true, data })
})

// ─── ELIMINAR──────────────────────────────────────────

export const remove = asyncHandler(async (req, res) => {const { id } = idParamSchema.parse(req.params)
  const data   = await CategoriaService.deleteCategoria(id)
  res.status(200).json({ ok: true, data, message: 'Categoría eliminada correctamente' })
})