import sharp from 'sharp';
import logs from '@openagenda/logs';
import urlToBuffer from '../../utils/urlToBuffer.js';
import addText from './addText.js';
import Cursor from './Cursor.js';
import adjustSize from './adjustSize.js';
import extractImageInfoFromValue from './extractImageInfoFromValue.js';

const log = logs('addImage');

async function getAdjustedSize(
  buffer,
  { size, firstOfColumn, availableHeight, availableWidth },
) {
  const { width, height } = size?.width && size?.height ? size : await sharp(buffer).metadata();

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

function addCredits(doc, cursor, params) {
  const { relatedValues } = params;

  const credits = relatedValues?.credits;

  if (!credits) {
    return { height: 0, width: 0 };
  }

  return addText(doc, cursor, {
    ...params,
    value: relatedValues.credits,
    fontSize: '0.8em',
    align: 'right',
  });
}

export default async function addImage(doc, parentCursor, params) {
  const {
    availableWidth,
    availableHeight,
    value,
    simulate,
    firstOfColumn,
    imagePath,
    min,
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

  const { height: creditsHeight } = addCredits(doc, cursor, {
    ...params,
    simulate: true,
  });

  const buffer = await urlToBuffer(`${base}${filename}`);

  const adjustedSize = await getAdjustedSize(buffer, {
    size,
    firstOfColumn,
    availableHeight: availableHeight - creditsHeight,
    availableWidth,
  });

  if (adjustedSize.height > availableHeight) {
    return {
      height: 0,
      width: 0,
      remaining: params.value,
    };
  }

  if (min?.height && adjustedSize.height < min.height) {
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
    cursor.moveY(adjustedSize.height);
    adjustSize(adjustedSize, addCredits(doc, cursor, params));
  }

  return adjustedSize;
}
