import logs from '@openagenda/logs';
import VError from '@openagenda/verror';
import addSeparatorLine from '../../utils/addSeparatorLine.js';
import addPageColumns from './addPageColumns.js';
import Cursor from './Cursor.js';
import rtd from './roundToDecimal.js';

const log = logs('addMultipageSegments');

const hasColumnsWithContent = (columns) =>
  !!columns.filter(({ content }) => !!content?.length).length;

const extractSegmentInfo = (segment) =>
  (Array.isArray(segment) ? { separator: false, columns: segment } : segment);

// What a segment still asks to place, field by field. Two consecutive EMPTY
// pages handing back the same leftover means nothing went on the second one
// — and nothing will go on any later one. Leftovers are compared with each
// other, never with the original input: an add function may re-encode its
// value on the first pass (slots → month segments, a stripped label) and
// that is progress, not a loop. Values are the event's own data, so a JSON
// snapshot is a faithful identity for them.
const contentFingerprint = (columns) =>
  JSON.stringify(
    columns.map((column) =>
      (column.content ?? []).map((item) => [item.field?.field, item.value])),
  );

export default async function addMultipageSegments(
  doc,
  segments,
  options = {},
) {
  const {
    addHeader,
    addFooter,
    availableWidth = doc.page.width
      - doc.page.margins.left
      - doc.page.margins.right,
  } = options;

  const cursor = Cursor({
    x: doc.page.margins.left,
    y: doc.page.margins.top,
  });

  const state = {
    remainingSegments: [...segments],
    newPage: true,
    pageNumber: 1,
    // Leftover of the last segment placement attempted on an empty page.
    lastEmptyPageLeftover: null,
  };

  while (state.remainingSegments.length) {
    log('page %s', state.pageNumber);
    if (state.newPage && addHeader) {
      const { height } = await addHeader(doc, cursor, {
        ...options,
        availableWidth,
        pageNumber: state.pageNumber,
      });
      log('  added header', { height: rtd(height) });
      cursor.moveY(height);
    }

    const { height: footerHeight } = addFooter
      ? await addFooter(doc, cursor, {
        ...options,
        simulate: true,
        pageNumber: state.pageNumber,
      })
      : { height: 0 };

    const availableHeight = doc.page.height - cursor.y - footerHeight - doc.page.margins.bottom;

    const { separator, columns: segmentColumns } = extractSegmentInfo(
      state.remainingSegments.shift(),
    );

    log('  placing segment', { availableHeight: rtd(availableHeight) });

    const placedOnEmptyPage = state.newPage;

    const { remaining, ...segmentSize } = await addPageColumns(
      doc,
      cursor,
      segmentColumns,
      {
        ...options,
        availableHeight,
        availableWidth,
      },
    );

    cursor.moveY(segmentSize.height);

    if (!hasColumnsWithContent(remaining)) {
      state.lastEmptyPageLeftover = null;
    }

    if (!hasColumnsWithContent(remaining) && state.remainingSegments.length) {
      log('  segment does not have left over');
      if (separator) {
        cursor.moveY(
          addSeparatorLine(doc, cursor, {
            ...options,
            padding: 30,
            availableHeight: availableHeight - segmentSize.height,
          }).height,
        );
      }
      state.newPage = false;
      continue;
    }

    if (hasColumnsWithContent(remaining)) {
      // A segment that comes back from an EMPTY page unchanged since the
      // previous empty page will come back unchanged from every page after
      // it. Left alone, the loop below adds pages forever — pdfkit buffers
      // each one, and the process grows by ~100MB/min until it is killed
      // (web workers, 2026-08-30 → 09-01). Failing the render is the only
      // outcome that ends.
      if (placedOnEmptyPage) {
        const leftover = contentFingerprint(remaining);

        if (leftover === state.lastEmptyPageLeftover) {
          throw new VError(
            {
              name: 'PDFSegmentDoesNotFit',
              info: {
                pageNumber: state.pageNumber,
                fields: remaining.flatMap((column) =>
                  (column.content ?? []).map((item) => item.field?.field)),
              },
            },
            'a segment cannot be placed on an empty page: aborting instead of paginating forever',
          );
        }

        state.lastEmptyPageLeftover = leftover;
      }

      log('  segment has leftover');
      state.remainingSegments.splice(0, 0, remaining);
    }

    if (addFooter) {
      cursor.setY(doc.page.height - footerHeight - doc.page.margins.bottom);
      await addFooter(doc, cursor, {
        ...options,
        pageNumber: state.pageNumber,
      });
      log('  added footer', { height: rtd(footerHeight) });
    }

    if (state.remainingSegments.length) {
      log('  segments are remaining, adding page');
      state.newPage = true;
      doc.addPage();
      cursor.reset();
      state.pageNumber += 1;
    }
  }
}
