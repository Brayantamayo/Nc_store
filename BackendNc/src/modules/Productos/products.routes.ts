import { Router } from 'express';
import * as ProductController from './products.controller';

const router = Router();

// GET    /api/productos
router.get('/', ProductController.getAll);

// GET    /api/productos/slug/:slug
router.get('/slug/:slug', ProductController.getBySlug);

// GET    /api/productos/:id
router.get('/:id(\\d+)', ProductController.getById);

// POST   /api/productos
router.post('/', ProductController.create);

// PATCH  /api/productos/:id
router.patch('/:id(\\d+)', ProductController.update);

// DELETE /api/productos/:id
router.delete('/:id(\\d+)', ProductController.remove);

export default router;
