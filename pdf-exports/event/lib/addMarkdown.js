import logs from '@openagenda/logs';
import { getLocaleValue } from '@openagenda/intl';
import adjustSize from './adjustSize.js';
import Cursor from './Cursor.js';
import addMarkdownSegment from './addMarkdownSegment.js';

const log = logs('addMarkdown');

export default async function addMarkdown(doc, parentCursor, params = {}) {
  const { value, availableHeight, lang } = params;
  const flattenedValue = getLocaleValue(value, lang);

  const cursor = Cursor(parentCursor);

  const segments = (flattenedValue ?? '').split('\n');
  log('got %s segments', segments.length, { availableHeight });

  const size = { height: 0, width: 0 };
  for (const [index, segment] of segments.entries()) {
    log('adding segment %s at position %j', index, cursor);
    const { height: simulatedSegmentHeight } = await addMarkdownSegment(
      doc,
      cursor,
      {
        ...params,
        value: segment,
        simulate: true,
      },
    );

    if (size.height + simulatedSegmentHeight > availableHeight) {
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
