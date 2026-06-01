import { Router } from "express";
import * as CategoriaController from "./Categoria.controller";

const router = Router();

// GET    /api/categorias
router.get("/", CategoriaController.getAll);

// GET    /api/categorias/slug/:slug
router.get("/slug/:slug", CategoriaController.getBySlug);

// GET    /api/categorias/:id
router.get("/:id(\\d+)", CategoriaController.getById);

// POST   /api/categorias
router.post("/", CategoriaController.create);

// PATCH  /api/categorias/:id
router.patch("/:id(\\d+)", CategoriaController.update);

// DELETE /api/categorias/:id
router.delete("/:id(\\d+)", CategoriaController.remove);

export default router;
