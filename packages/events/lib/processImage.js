'use strict';

const _ = require('lodash');

const ValidationError = require('./ValidationError');
const isUnknownFormatException = error => (error?.jse_info?.uploadReason?.message || '').indexOf('no decode delegate for this image format') !== -1;

module.exports = async (service, { image, fileKey }) => {
  if (image?.filename && !('transformAndUpload' in image)) {
    return image;
  }

  if (!service.imageTransformAndUpload) {
    return null;
  }

  let result;
  try {
    result = await service.imageTransformAndUpload(image, {
      fileKey
    });
  } catch (error) {
    throw isUnknownFormatException(error) ? new ValidationError({
      field: 'image',
      code: 'format.unknown',
      message: 'provided format is unknown'
    }): error;
  }

  const base = result.shift();

  return {
    ..._.pick(base, ['filename', 'size']),
    variants: result.map(r => _.pick(r, ['filename', 'size', 'type']))
  };
}