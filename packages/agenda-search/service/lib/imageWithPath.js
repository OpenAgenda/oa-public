'use strict';

module.exports = (defaultImage, path, image) => {
  if (!image) {
    return defaultImage;
  } else if (image.split('/').length > 1) {
    return image;
  }
  return path + image;
}
