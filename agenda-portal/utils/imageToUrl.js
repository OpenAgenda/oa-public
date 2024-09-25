'use strict';

module.exports = function imageToUrl(image, type) {
  if (!image) {
    return '';
  }

  const variant = typeof type === 'string'
    ? image.variants?.find((img) => img.type === type) ?? image
    : image;

  return `${image.base}${variant.filename}`;
};
