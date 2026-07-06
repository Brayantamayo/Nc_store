import { Router } from "express";
import * as CategoriaController from "./Categoria.controller";
import { soloAdmin } from "../../middlewares/Auth.middleware";

const router = Router();

// GET — PÚBLICOS (sin protección)
router.get("/", CategoriaController.getAll);
router.get("/tree", CategoriaController.getTree);
router.get("/slug/:slug", CategoriaController.getBySlug);
router.get("/:id(\\d+)", CategoriaController.getById);

// POST, PATCH, DELETE — PROTEGIDOS (solo admin)
router.post("/", soloAdmin, CategoriaController.create);
router.patch("/:id(\\d+)", soloAdmin, CategoriaController.update);
router.delete("/:id(\\d+)", soloAdmin, CategoriaController.remove);

export default router;
