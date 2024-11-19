import addText from '../addText.js';
import messages from '../messages.js';


export default async function addContentItem(doc, cursor, addFn, addFunctions, contentItem, options = {}) {
  const { columnWidth, iconHeightAndWidth, margin, footerHeight, intl, lang, simulate } = options;
  const currentCursor = { ...cursor };

  let totalHeight = 0;

  if (contentItem.title) {
    const title = await addText(doc, cursor, {
      content:`${intl.formatMessage(messages[contentItem.title])}`,
      width: columnWidth,
      bold: true,
      intl,
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
    footerHeight,
    margin,
    intl,
    lang,
    simulate,
  });

  totalHeight += content.height + margin / 2;

  if (!simulate) {
    cursor.y += content.height + margin / 2;
  }

  if (simulate) {
    cursor.x = currentCursor.x;
    cursor.y = currentCursor.y;
  }

  return totalHeight;
}
