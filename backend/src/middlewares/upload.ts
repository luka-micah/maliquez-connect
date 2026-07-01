import multer from 'multer';
import { cloudinary } from '../config/cloudinary.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import ApiError from '../utils/ApiError.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'maliquez-connect',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
  } as Record<string, unknown>,
});

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image files (jpg, jpeg, png, gif, webp) are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export const uploadSingle = upload.single('image');
export const uploadMultiple = upload.array('images', 10);
