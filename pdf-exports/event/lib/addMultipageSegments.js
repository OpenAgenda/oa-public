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

// What a segment asks to place, field by field — compared before and after a
// placement to tell "some of it went on the page" from "none of it did".
// Values are the event's own data (timings, texts, ids), so a JSON snapshot
// is a faithful identity for them.
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
    const before = placedOnEmptyPage
      ? contentFingerprint(segmentColumns)
      : null;

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
      // A segment that comes back whole from an EMPTY page will come back
      // whole from every page after it: nothing changes between attempts.
      // Left alone, the loop below adds pages forever — pdfkit buffers each
      // one, and the process grows by ~100MB/min until it is killed (web
      // workers, 2026-08-30 → 09-01). Failing the render is the only
      // outcome that ends.
      if (placedOnEmptyPage && contentFingerprint(remaining) === before) {
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
