import { Router } from 'express';
import * as ProductController from './products.controller';
import { soloAdmin } from '../../middlewares/Auth.middleware';

const router = Router();

// GET — PÚBLICOS (sin protección)
router.get('/', ProductController.getAll);
router.get('/slug/:slug', ProductController.getBySlug);
router.get('/:id(\\d+)', ProductController.getById);

// GET — RUTAS PARA TIENDA (filtradas)
router.get('/store/all', ProductController.getAllForStore);
router.get('/store/slug/:slug', ProductController.getBySlugForStore);

// POST, PATCH, DELETE — PROTEGIDOS (solo admin)
router.post('/', soloAdmin, ProductController.create);
router.patch('/:id(\\d+)', soloAdmin, ProductController.update);
router.delete('/:id(\\d+)', soloAdmin, ProductController.remove);

export default router;
