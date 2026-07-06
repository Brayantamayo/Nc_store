import { Router } from 'express';
import { upload } from '../../config/cloudinary';
import { soloAdmin } from '../../middlewares/Auth.middleware';
import * as GaleriaController from './Galeria.controller';

const router = Router();

router.get('/', GaleriaController.getAll);
router.post('/upload', soloAdmin, upload.single('image'), GaleriaController.create);
router.delete('/:id(\\d+)', soloAdmin, GaleriaController.remove);

export default router;
