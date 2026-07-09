import { cloudinary } from '../config/cloudinary.js';
import ApiError from '../utils/ApiError.js';
import type { UploadApiResponse } from 'cloudinary';

export interface ImageMeta {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

const folderPath = (listingId: string): string => `maliquez/listings/${listingId}`;

const uploadBuffer = (
  buffer: Buffer,
  mimeType: string,
  listingId: string,
  index: number,
): Promise<UploadApiResponse> =>
  new Promise((resolve, reject) => {
    const base64 = buffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64}`;

    cloudinary.uploader.upload(
      dataUri,
      {
        folder: folderPath(listingId),
        public_id: `image-${index}`,
        quality: 'auto',
        transformation: [{ width: 1200, height: 1200, crop: 'limit', quality: 'auto' }],
      },
      (error, result) => {
        if (error) {
          console.error('[CLOUDINARY] Upload error:', JSON.stringify(error));
          reject(ApiError.internal(`Image upload failed: ${error.message}`));
        } else if (!result) {
          reject(ApiError.internal('Image upload returned no result'));
        } else {
          resolve(result);
        }
      },
    );
  });

export const uploadImagesToCloudinary = async (
  files: Express.Multer.File[],
  listingId: string,
): Promise<ImageMeta[]> => {
  if (files.length === 0) return [];

  const results = await Promise.allSettled(
    files.map((file, i) => uploadBuffer(file.buffer, file.mimetype, listingId, i)),
  );

  const uploaded: ImageMeta[] = [];
  const errors: string[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i] as PromiseSettledResult<UploadApiResponse>;
    if (result.status === 'fulfilled') {
      const r = result.value;
      uploaded.push({
        url: r.secure_url,
        publicId: r.public_id,
        width: r.width,
        height: r.height,
        format: r.format,
      });
    } else {
      const reason = result.reason instanceof ApiError ? result.reason.message : 'Unknown error';
      console.error(`[CLOUDINARY] Failed to upload ${files[i].originalname}: ${reason}`);
      errors.push(files[i].originalname);
    }
  }

  if (errors.length > 0) {
    await deleteCloudinaryImages(uploaded.map((img) => img.publicId));
    throw ApiError.internal(
      `Failed to upload: ${errors.join(', ')}. All uploads have been rolled back.`,
    );
  }

  return uploaded;
};

export const deleteCloudinaryImages = async (publicIds: string[]): Promise<void> => {
  if (publicIds.length === 0) return;

  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    const deleted = result.deleted as Record<string, string>;
    const failed = Object.entries(deleted).filter(([, status]) => status !== 'deleted');
    if (failed.length > 0) {
      console.warn('[CLOUDINARY] Some images failed to delete:', failed.map(([id]) => id));
    }
  } catch (error) {
    console.error('[CLOUDINARY] Batch delete error:', error);
  }
};

export const deleteListingFolder = async (listingId: string): Promise<void> => {
  try {
    const result = await cloudinary.api.delete_resources_by_prefix(
      `${folderPath(listingId)}/`,
    );
    console.log(`[CLOUDINARY] Deleted resources for listing ${listingId}`);
  } catch (error) {
    console.error(`[CLOUDINARY] Failed to delete folder for listing ${listingId}:`, error);
  }
};
