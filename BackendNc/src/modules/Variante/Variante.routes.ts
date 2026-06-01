import { Router } from "express";
import * as VarianteController from "./Variente.controller";

const router = Router();

// GET    /api/variantes
router.get("/", VarianteController.getAll);

// GET    /api/variantes/producto/:productoId
router.get("/producto/:productoId(\\d+)", VarianteController.getByProducto);

// GET    /api/variantes/:id
router.get("/:id(\\d+)", VarianteController.getById);

// POST   /api/variantes
router.post("/", VarianteController.create);

// PATCH  /api/variantes/:id
router.patch("/:id(\\d+)", VarianteController.update);

// PATCH  /api/variantes/:id/stock
router.patch("/:id(\\d+)/stock", VarianteController.ajustarStock);

// DELETE /api/variantes/:id
router.delete("/:id(\\d+)", VarianteController.remove);

export default router;
