import addText from '../../lib/addText.js';

export default async function addTestTitle(doc, cursor, content) {
  await addText(doc, cursor, { content, fontSize: 10 });
  cursor.y += 30;
}
