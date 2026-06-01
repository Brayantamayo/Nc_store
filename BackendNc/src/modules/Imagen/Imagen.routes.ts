import { Router }              from 'express'
import { upload }              from '../../config/cloudinary'
import { subirImagen, eliminarImagen, optimizarImagen } from './Imagen.controller'

const router = Router()

router.post(  '/upload',       upload.single('image'), subirImagen)
router.delete('/:publicId',    eliminarImagen)
router.get(   '/optimize/:publicId', optimizarImagen)

export default router