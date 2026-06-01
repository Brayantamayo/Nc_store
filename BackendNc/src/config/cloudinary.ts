import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage }  from 'multer-storage-cloudinary'
import multer                 from 'multer'
import { env }                from './environment'

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key:    env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:           'mi-proyecto',
    allowed_formats:  ['jpg', 'jpeg', 'png', 'webp'],
    transformation:   [{ width: 1200, crop: 'limit' }],
  } as object,
})

export const upload    = multer({ storage })
export { cloudinary }