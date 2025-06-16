import sharp from 'sharp';
import _ from 'lodash';
import urlToBuffer from '../../utils/urlToBuffer.js';

import extractImageFromValue from './extractImageInfoFromValue.js';

async function extractSize({ filename, base, size }) {
  if (size.height && size.width) {
    return size;
  }

  const buffer = await urlToBuffer(`${base}${filename}`);

  return _.pick(await sharp(buffer).metadata(), ['height', 'width']);
}

export default async function isLandscape(image, imagePath) {
  const { filename, base, size } = extractImageFromValue(image, imagePath);

  if (!filename) return;

  const { width, height } = await extractSize({ filename, base, size });

  return width / height > 1;
}
