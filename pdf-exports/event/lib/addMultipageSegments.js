import logs from '@openagenda/logs';
import addPageColumns from './addPageColumns.js';
import Cursor from './Cursor.js';
import rtd from './roundToDecimal.js';

const log = logs('addMultipageSegments');

const hasColumnsWithContent = (columns) =>
  !!columns.filter(({ content }) => !!content?.length).length;

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

    const segmentColumns = state.remainingSegments.shift();

    log('  placing segment', { availableHeight: rtd(availableHeight) });

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
      state.newPage = false;
      continue;
    }

    if (hasColumnsWithContent(remaining)) {
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
