import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import urlToBuffer from './urlToBuffer.js';

export default async function thumbnail(event, options = {}) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const { defaultImagePath = `${__dirname}/../images/oaLogo.png` } = options;

  const imageWidth = 200;
  const imageHeight = 200;

  const thumbnailFilename = event.image?.variants.find(
    el => el.type === 'thumbnail',
  )?.filename;

  const newVersionThumbnail = thumbnailFilename?.includes('.thumb.image.jpg');

  if (!thumbnailFilename) {
    return defaultImagePath;
  }

  if (thumbnailFilename && newVersionThumbnail) {
    const baseImageUrl = `https://img.openagenda.com/u/${imageWidth}x${imageHeight}/cibul/`;
    return urlToBuffer(baseImageUrl + thumbnailFilename, defaultImagePath);
  }
  return urlToBuffer(event.image.base + thumbnailFilename, defaultImagePath);
}
