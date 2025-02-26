import ValidationError from './ValidationError.js';

const isUnknownFormatException = (error) =>
  (
    error?.info?.uploadReason?.message
    || error?.jse_info?.uploadReason?.message
    || ''
  ).includes('no decode delegate for this image format');

const isTooLargeException = (error) =>
  (
    error?.info?.uploadReason?.message
    || error?.jse_info?.uploadReason?.message
    || ''
  ).includes('Content length exceeded the maximum limit');

export default async function processImage(service, { image, fileKey }) {
  if (image?.filename && !('transformAndUpload' in image)) {
    return image;
  }

  if (!service.imageTransformAndUpload) {
    return null;
  }

  let result;
  try {
    result = await service.imageTransformAndUpload(image, {
      fileKey,
    });
  } catch (error) {
    if (isUnknownFormatException(error)) {
      throw new ValidationError({
        field: 'image',
        code: 'format.unknown',
        message: 'provided format is unknown',
      });
    }
    if (isTooLargeException(error)) {
      throw new ValidationError({
        field: 'image',
        code: 'size.tooLarge',
        message: 'provided image is too large',
      });
    }
    throw error;
  }

  const base = result.shift();
  const timestamp = new Date().getTime();

  return {
    filename: `${base.filename}?_ts=${timestamp}`,
    size: base.size,
    variants: result.map((r) => ({
      filename: `${r.filename}?_ts=${timestamp}`,
      size: r.size,
      type: r.type,
    })),
  };
}
