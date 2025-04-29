import addText from '../../lib/addText.js';
import addSeparatorLine from '../../../utils/addSeparatorLine.js';

export default async function addTestTitle(doc, cursor, content) {
  const localCursor = { ...cursor };
  const size = await addText(doc, localCursor, {
    content,
    fontSize: 12,
    bold: true,
  });

  localCursor.x = cursor.x + size.width + 5;
  localCursor.y = cursor.y + size.height / 2;

  await addSeparatorLine(doc, localCursor);

  return { height: 30 };
}
