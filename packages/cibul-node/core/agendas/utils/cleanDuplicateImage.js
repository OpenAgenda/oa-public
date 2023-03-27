'use strict';

module.exports = function cleanDuplicateImage(core, image) {
  return {
    url: `${core.getConfig().aws.imageBucketPath}${image.variants.find(v => v.type === 'full').filename}`,
  };
};

module.exports.isImageToDuplicate = function isImageToDuplicate(image) {
  if (!image) {
    return false;
  }

  if (image?.path) {
    return false;
  }

  return !!image?.filename;
};
