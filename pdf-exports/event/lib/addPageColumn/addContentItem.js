import addText from '../addText.js';

export default async function addContentItem(doc, cursor, addFn, addFunctions, contentItem, options = {}) {
  const { columnWidth, iconHeightAndWidth, margin, lang, simulate } = options;
  const currentCursor = { ...cursor };

  let totalHeight = 0;

  if (contentItem.title) {
    const title = await addText(doc, cursor, {
      content: contentItem.title,
      width: columnWidth,
      bold: true,
      lang,
      simulate,
    });

    totalHeight += title.height;

    if (!simulate) {
      cursor.y += title.height;
    }
  }

  const content = await addFn(doc, cursor, {
    content: contentItem.data,
    agenda: contentItem.agenda,
    width: columnWidth,
    height: doc.page.height,
    bold: contentItem.bold,
    columnNumber: contentItem.columnNumber,
    iconHeightAndWidth,
    margin,
    lang,
    simulate,
  });

  totalHeight += content.height;

  if (!simulate) {
    cursor.y += content.height;
  }

  if (simulate) {
    cursor.x = currentCursor.x;
    cursor.y = currentCursor.y;
  }

  return totalHeight;
}
