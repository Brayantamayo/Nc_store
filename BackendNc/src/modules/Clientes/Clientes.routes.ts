import { Router } from 'express';
import * as ClientesController from './Clientes.controller';
import { soloAdmin } from '../../middlewares/Auth.middleware';

const router = Router();

router.get('/', soloAdmin, ClientesController.getAll);
router.get('/:id(\\d+)', soloAdmin, ClientesController.getById);
router.post('/', soloAdmin, ClientesController.create);
router.patch('/:id(\\d+)', soloAdmin, ClientesController.update);
router.patch('/:id(\\d+)/toggle-activo', soloAdmin, ClientesController.toggleActivo);

export default router;
