import logs from '@openagenda/logs';
import Cursor from './Cursor.js';

import adjustSize from './adjustSize.js';
import addTimingsMonthSegment from './addTimingsMonthSegment.js';
import rtd from './roundToDecimal.js';
import { getTimingMonthSegments, areTimings } from './timings.utils.js';

const log = logs('addTimings');

export default async function addTimings(doc, parentCursor, params = {}) {
  const {
    availableWidth,
    availableHeight,
    margins = {
      monthSegments: { bottom: 5, right: 10 },
    },
  } = params;

  const cursor = Cursor(parentCursor);

  const timingMonthSegments = areTimings(params.value)
    ? getTimingMonthSegments(params)
    : params.value;

  const size = { width: 0, height: 0 };

  let index = 0;
  let column = 0;
  const lastColumnSize = { width: 0, height: 0 };
  while (index < timingMonthSegments.length) {
    const availableHeightForSegment = availableHeight - (cursor.y - parentCursor.y);
    const availableWidthForSegment = availableWidth - (cursor.x - parentCursor.x);

    log('processing month segment %s', timingMonthSegments[index].value, {
      column,
      index,
      availableHeightForSegment: rtd(availableHeightForSegment),
      availableWidthForSegment: rtd(availableWidthForSegment),
    });

    const { width } = await addTimingsMonthSegment(doc, cursor, {
      ...params,
      value: timingMonthSegments[index],
      availableHeight: availableHeightForSegment,
      simulate: true,
      margins: margins.monthSegments,
    });
    if (width > availableWidthForSegment) {
      log('  no available width left for segment', {
        sizeWidth: size.width,
        width,
        availableWidth,
      });
      timingMonthSegments[index].displayMonthName = true;
      return {
        ...size,
        remaining: timingMonthSegments.slice(index),
      };
    }

    log('  placing month segment', {
      index,
      column,
      cursor: { x: rtd(cursor.x), y: rtd(cursor.y) },
      availableWidthForSegment: rtd(availableWidthForSegment),
      width: rtd(width),
    });

    const { remaining, ...monthSize } = await addTimingsMonthSegment(
      doc,
      cursor,
      {
        ...params,
        availableHeight: availableHeightForSegment,
        value: timingMonthSegments[index],
        margins: margins.monthSegments,
      },
    );

    adjustSize(lastColumnSize, monthSize);
    cursor.moveY(monthSize.height);

    if (remaining) {
      log('  remaining for next column', { index });
      column += 1;
      timingMonthSegments[index] = remaining;
      cursor.moveX(lastColumnSize.width);
      cursor.setY(parentCursor.y);
      Object.assign(lastColumnSize, { width: 0, height: 0 });
      continue;
    }

    index += 1;
  }

  return size;
}
