'use strict';

module.exports = img => {
  if (!img || img?.filename === null) {
    return {
      image: false,
      thumbnail: false,
      originalImage: false,
    };
  }

  if (!img?.variants || !img.variants.length) {
    return {
      image: img.base + img.filename,
      thumbnail: false,
      originalImage: false,
    };
  }

  const { base, filename, variants } = img;
  const image = base + filename;
  const thumbnail = base + variants.find(variant => variant.type === 'thumbnail').filename;
  const originalImage = base + variants.find(variant => variant.type === 'full').filename;

  return {
    image,
    thumbnail,
    originalImage,
  };
};
