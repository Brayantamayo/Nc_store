import { Router } from "express";
import * as VarianteController from "./Variente.controller";
import { soloAdmin } from "../../middlewares/Auth.middleware";

const router = Router();

// GET — PÚBLICOS (sin protección)
router.get("/", VarianteController.getAll);
router.get("/producto/:productoId(\\d+)", VarianteController.getByProducto);
router.get("/:id(\\d+)", VarianteController.getById);

// POST, PATCH, DELETE — PROTEGIDOS (solo admin)
router.post("/bulk", soloAdmin, VarianteController.createMany);
router.post("/", soloAdmin, VarianteController.create);
router.patch("/:id(\\d+)", soloAdmin, VarianteController.update);
router.patch("/:id(\\d+)/stock", soloAdmin, VarianteController.ajustarStock);
router.delete("/:id(\\d+)", soloAdmin, VarianteController.remove);

export default router;
