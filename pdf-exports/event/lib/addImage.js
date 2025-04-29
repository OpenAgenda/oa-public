import sharp from 'sharp';
import logs from '@openagenda/logs';
import urlToBuffer from '../../utils/urlToBuffer.js';
import Cursor from './Cursor.js';

const log = logs('addImage');

async function getAdjustedSize(
  buffer,
  { size, firstOfColumn, availableHeight, availableWidth },
) {
  const { width, height } = size ?? await sharp(buffer).metadata();

  log(
    '  got w:%s,h:%s for available w:%s,h:%s',
    width,
    height,
    availableWidth,
    availableHeight,
  );

  const adjustedWidth = Math.min(availableWidth, width);

  const adjusted = { width: adjustedWidth };
  adjusted.height = height * (adjusted.width / width);

  if (firstOfColumn && adjusted.height > availableHeight) {
    Object.assign(adjusted, {
      width: adjusted.width * (availableHeight / adjusted.height),
      height: availableHeight,
    });
  }

  log('  calculated adjustment to w:%s,h:%s', adjusted.width, adjusted.height);

  return adjusted;
}

const extractImageInfoFromValue = (value, imagePath) => {
  if (!value) return { filename: undefined };

  if (typeof value === 'string') {
    return {
      filename: value,
      base: imagePath,
    };
  }

  return value;
};

export default async function addImage(doc, parentCursor, params) {
  const {
    availableWidth,
    availableHeight,
    value,
    simulate,
    firstOfColumn,
    imagePath,
  } = params;

  const { filename, base, size } = extractImageInfoFromValue(value, imagePath);

  if (!filename) {
    return { height: 0, width: 0 };
  }

  log('processing %s', filename);

  const cursor = Cursor(parentCursor);

  if (!base && !imagePath) {
    throw new Error('base and paths are missing from value');
  }

  const buffer = await urlToBuffer(`${base}${filename}`);

  const adjustedSize = await getAdjustedSize(buffer, {
    size,
    firstOfColumn,
    availableHeight,
    availableWidth,
  });

  if (adjustedSize.height > availableHeight) {
    return {
      height: 0,
      width: 0,
      remaining: params.value,
    };
  }

  if (!simulate) {
    doc.image(
      buffer,
      cursor.x + (availableWidth - adjustedSize.width) / 2,
      cursor.y,
      {
        fit: [adjustedSize.width, adjustedSize.height],
      },
    );
  }

  return adjustedSize;
}
