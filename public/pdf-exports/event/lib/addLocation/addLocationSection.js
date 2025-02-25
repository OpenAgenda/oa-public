import addText from '../addText.js';

export default async function addLocationSection(doc, cursor, options = {}) {
  const { content, width, lang, simulate } = options;
  const currentCursor = { ...cursor };

  let accumulatedHeight = 0;
  let maxWidth = 0;

  if (content.name || content.address) {
    if (content.name) {
      const locationNameSection = await addText(doc, cursor, {
        content: content.name,
        width,
        lang,
        simulate,
      });
      accumulatedHeight += locationNameSection.height;
      maxWidth = Math.max(maxWidth, locationNameSection.width);

      if (!simulate) {
        cursor.y += locationNameSection.height;
      }
    }
    if (content.address) {
      const locationAddressSection = await addText(doc, cursor, {
        content: content.address,
        width,
        lang,
        simulate,
      });
      accumulatedHeight += locationAddressSection.height;
      maxWidth = Math.max(maxWidth, locationAddressSection.width);

      if (!simulate) {
        cursor.y += locationAddressSection.height;
      }
    }
    cursor.y = currentCursor.y;
  }

  return {
    height: accumulatedHeight,
    width: maxWidth,
  };
}
