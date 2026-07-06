import { Router } from 'express';
import { upload } from '../../config/cloudinary';
import { soloAdmin } from '../../middlewares/Auth.middleware';
import * as BannerController from './Banner.controller';

const router = Router();

// Pública — el HeroSection la consume sin autenticación
router.get('/activos', BannerController.getActivos);

// Admin
router.get('/',                soloAdmin, BannerController.getAll);
router.post('/upload',         soloAdmin, upload.single('image'), BannerController.create);
router.patch('/:id(\\d+)',     soloAdmin, BannerController.update);
router.delete('/:id(\\d+)',    soloAdmin, BannerController.remove);

export default router;
