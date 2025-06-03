import { remark } from 'remark';
import Cursor from './Cursor.js';
import addText from './addText.js';
import addMarkdownElement from './addMarkdownElement.js';

export default async function addMarkdownSegment(
  doc,
  parentCursor,
  params = {},
) {
  const { value, availableWidth = doc.page.width - parentCursor.x } = params;

  const size = { height: 0, width: 0 };

  const { height: lineHeight } = addText(doc, parentCursor, {
    ...params,
    value: '_',
    simulate: true,
  });

  const cursor = Cursor(parentCursor, { availableWidth, lineHeight });
  const state = { cursor, size };

  const parsed = remark().parse(value);

  const result = await addMarkdownElement(doc, state, parsed, params);

  return {
    overflow: !!result?.overflow,
    width: availableWidth,
    height: cursor.lineHeight + cursor.y - cursor.init.y,
  };
}
