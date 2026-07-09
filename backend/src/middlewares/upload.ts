import multer from 'multer';
import ApiError from '../utils/ApiError.js';
import type { Request, Response, NextFunction } from 'express';

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;
const MAX_FILES = 10;

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only JPG, JPEG, PNG, and WEBP images are allowed'));
  }
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter,
  limits: {
    fileSize: MAX_SIZE,
    files: MAX_FILES,
  },
});

const rawMiddleware = upload.array('images', MAX_FILES);

export const uploadListingImages = (req: Request, res: Response, next: NextFunction): void => {
  rawMiddleware(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return next(ApiError.badRequest('File size exceeds the 5MB limit'));
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return next(ApiError.badRequest('Maximum of 10 images allowed'));
      }
      if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return next(ApiError.badRequest('Unexpected file field'));
      }
      return next(ApiError.badRequest(err.message));
    }
    if (err instanceof ApiError) {
      return next(err);
    }
    if (err) {
      return next(ApiError.badRequest('File upload failed'));
    }
    next();
  });
};
