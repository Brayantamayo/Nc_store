import { Router } from 'express';
import * as PedidoController from './Pedidos.controller';
import { soloAdmin } from '../../middlewares/Auth.middleware';

const router = Router();

router.post('/', PedidoController.create);
router.get('/', soloAdmin, PedidoController.getAll);
router.get('/:id(\\d+)', soloAdmin, PedidoController.getById);
router.patch('/:id(\\d+)', soloAdmin, PedidoController.update);
router.delete('/:id(\\d+)', soloAdmin, PedidoController.remove);

export default router;
