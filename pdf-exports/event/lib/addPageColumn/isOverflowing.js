import cursorYOverflowing from '../../../utils/cursorYOverflowing.js';
import addContentItem from './addContentItem.js';

export default async function isOverflowing(doc, cursor, addFn, contentItem, options = {}) {
  const { addFunctions, columnWidth, iconHeightAndWidth, margin, footerHeight, intl, lang } = options;

  const currentCursor = { ...cursor };

  const totalHeight = await addContentItem(doc, cursor, addFn, addFunctions, contentItem, {
    columnWidth,
    iconHeightAndWidth,
    margin,
    footerHeight,
    bold: contentItem.bold,
    intl,
    lang,
    simulate: true,
  });

  cursor.x = currentCursor.x;
  cursor.y = currentCursor.y;

  return cursorYOverflowing(doc, cursor.y + totalHeight + margin + footerHeight);
}
