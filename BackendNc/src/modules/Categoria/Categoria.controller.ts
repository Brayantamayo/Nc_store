import { Request, Response } from "express";
import * as CategoriaService from "./Categoria.service";

// ─── OBTENER ─────────────────────────────────────────

export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categorias = await CategoriaService.getAllCategorias();
    res.status(200).json({ ok: true, data: categorias });
  } catch (error: any) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// ─── OBTENER POR ID───────────────────────────────────────

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ ok: false, message: "ID inválido" });
      return;
    }

    const categoria = await CategoriaService.getCategoriaById(id);
    if (!categoria) {
      res.status(404).json({ ok: false, message: "Categoría no encontrada" });
      return;
    }

    res.status(200).json({ ok: true, data: categoria });
  } catch (error: any) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// ─── OBTENER POR SLUG─────────────────────────────────────

export const getBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const categoria = await CategoriaService.getCategoriaBySlug(slug);
    if (!categoria) {
      res.status(404).json({ ok: false, message: "Categoría no encontrada" });
      return;
    }

    res.status(200).json({ ok: true, data: categoria });
  } catch (error: any) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

// ─── CREAR──────────────────────────────────────────

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, slug, imagen } = req.body;

    if (!nombre || !slug) {
      res.status(400).json({ ok: false, message: "nombre y slug son requeridos" });
      return;
    }

    const categoria = await CategoriaService.createCategoria({ nombre, slug, imagen });
    res.status(201).json({ ok: true, data: categoria });
  } catch (error: any) {
    const status = error.message.includes("Ya existe") ? 409 : 500;
    res.status(status).json({ ok: false, message: error.message });
  }
};

// ─── ACTUALIZAR ──────────────────────────────────────────

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ ok: false, message: "ID inválido" });
      return;
    }

    const { nombre, slug, imagen } = req.body;

    if (!nombre && !slug && imagen === undefined) {
      res.status(400).json({ ok: false, message: "Debes enviar al menos un campo para actualizar" });
      return;
    }

    const categoria = await CategoriaService.updateCategoria(id, { nombre, slug, imagen });
    res.status(200).json({ ok: true, data: categoria });
  } catch (error: any) {
    const status = error.message.includes("no encontrada")
      ? 404
      : error.message.includes("Ya existe")
      ? 409
      : 500;
    res.status(status).json({ ok: false, message: error.message });
  }
};

// ─── ELIMINAR──────────────────────────────────────────

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ ok: false, message: "ID inválido" });
      return;
    }

    const categoria = await CategoriaService.deleteCategoria(id);
    res.status(200).json({ ok: true, data: categoria, message: "Categoría eliminada correctamente" });
  } catch (error: any) {
    const status = error.message.includes("no encontrada")
      ? 404
      : error.message.includes("No se puede eliminar")
      ? 409
      : 500;
    res.status(status).json({ ok: false, message: error.message });
  }
};