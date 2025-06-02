import logs from '@openagenda/logs';
import { getLocaleValue } from '@openagenda/intl';
import adjustSize from './adjustSize.js';
import Cursor from './Cursor.js';
import addMarkdownSegment from './addMarkdownSegment.js';
import rtd from './roundToDecimal.js';

const log = logs('addMarkdown');

export default async function addMarkdown(doc, parentCursor, params = {}) {
  const { value, availableHeight, lang, field } = params;
  const flattenedValue = getLocaleValue(value, lang);

  const cursor = Cursor(parentCursor);

  const segments = (flattenedValue ?? '').split('\n');
  log(
    'got %s segments',
    segments.length,
    rtd({ availableHeight, field: field?.field }),
  );

  const size = { height: 0, width: 0 };
  for (const [index, segment] of segments.entries()) {
    log('adding segment %s at position %j', index, cursor);
    const { height: simulatedSegmentHeight, overflow } = await addMarkdownSegment(doc, cursor, {
      ...params,
      value: segment,
      simulate: true,
    });
    log('simulation show height at %s', rtd(simulatedSegmentHeight));

    if (overflow) {
      log('available height is insufficient, returning remaining segments');
      return {
        ...size,
        remaining: segments.slice(index).join('\n'),
      };
    }

    log('available height sufficient, adding segment', {
      index,
      simulatedSegmentHeight,
      availableHeight,
      size,
    });
    const markdownSegmentSize = await addMarkdownSegment(doc, cursor, {
      ...params,
      value: segment,
    });

    adjustSize(size, markdownSegmentSize);
    cursor.moveY(markdownSegmentSize.height);
  }

  return size;
}
