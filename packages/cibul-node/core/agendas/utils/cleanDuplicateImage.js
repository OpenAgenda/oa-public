'use strict';

module.exports = function cleanDuplicateImage(core, image) {
  return {
    url: `${core.getConfig().aws.imageBucketPath}${image.variants.find(v => v.type === 'full').filename}`,
  };
};
