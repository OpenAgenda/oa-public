import addText from './addText.js';
import iconPositioning from './iconPositioning.js';

export default async function addRegistration(doc, cursor, options = {}) {
  const { content, width, iconHeightAndWidth, margin, lang, simulate } = options;
  let totalHeight = 0;
  const maxWidth = 0;
  const currentCursor = { ...cursor };
  if (content) {
    for (const registration of content) {
      const icon = await iconPositioning(doc, cursor, registration.type, { iconHeightAndWidth, margin, simulate });

      const reg = await addText(doc, cursor, {
        content: registration.value,
        width: width - iconHeightAndWidth - margin / 2,
        bold: content.bold,
        link: icon.linkPrefix + registration.value,
        lang,
        simulate,
      });

      Math.max(maxWidth, reg.width + icon.width + margin / 2);
      totalHeight += Math.max(reg.height, icon.height);
      if (!simulate) {
        cursor.y += reg.height;
      }
      cursor.x = currentCursor.x;
    }
  }

  cursor.y = currentCursor.y;

  return {
    width: maxWidth,
    height: totalHeight,
  };
}
