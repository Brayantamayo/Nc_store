import { Request, Response, NextFunction } from 'express'
import { cloudinary } from '../../config/cloudinary'

export const subirImagen = (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ message: 'No se envió ninguna imagen' })
    return
  }

  res.status(201).json({
    url:       req.file.path,
    public_id: req.file.filename,
  })
}

export const eliminarImagen = async (
  req: Request, res: Response, next: NextFunction
): Promise<void> => {
  try {
    const publicId = decodeURIComponent(req.params.publicId)
    const result   = await cloudinary.uploader.destroy(publicId)

    if (result.result !== 'ok') {
      res.status(404).json({ message: 'Imagen no encontrada' })
      return
    }

    res.json({ message: 'Imagen eliminada correctamente' })
  } catch (err) {
    next(err) // lo maneja tu errorHandler existente
  }
}

export const optimizarImagen = (req: Request, res: Response): void => {
  const publicId = decodeURIComponent(req.params.publicId)

  const url = cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality:      'auto',
    width:        800,
    crop:         'fill',
  })

  res.json({ url })
}