import logs from '@openagenda/logs';
import addPageColumn from './addPageColumn.js';
import Cursor from './Cursor.js';
import rtd from './roundToDecimal.js';

const log = logs('addPageColumns');

export default async function addPageColumns(
  doc,
  parentCursor,
  columns,
  options = {},
) {
  const {
    availableHeight,
    availableWidth,
    iconHeightAndWidth,
    margin,
    intl,
    lang,
  } = options;

  const cursor = Cursor(parentCursor);
  const widthPerUnit = availableWidth / columns.reduce((t, c) => t + c.width, 0);

  const remaining = [];
  const size = { height: 0, width: 0 };

  for (let i = 0; i < columns.length; i++) {
    const column = columns[i];

    const columnWidth = column.width * widthPerUnit;
    const paddedColumnWidth = columnWidth - (column.padding ?? 0) * 2;

    log(
      'adding column of width %s, (%s padded)',
      rtd(columnWidth),
      rtd(paddedColumnWidth),
    );

    const result = await addPageColumn(doc, cursor, column, {
      ...options,
      availableWidth: paddedColumnWidth,
      availableHeight,
      iconHeightAndWidth,
      margin,
      intl,
      lang,
    });

    const {
      remaining: remainingContent,
      height: colHeight,
      width: colWidth,
    } = result;

    size.width += colWidth;
    size.height = Math.max(size.height, colHeight);

    remaining.push({
      ...column,
      content: remainingContent,
    });

    cursor.moveX(columnWidth);
  }

  return { ...size, remaining };
}
