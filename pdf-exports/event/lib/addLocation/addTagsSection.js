import addText from '../addText.js';

export default async function addTagsSection(doc, cursor, options = {}) {
  const { content, margin, width, lang, simulate, footerHeight, height } = options;
  const currentCursor = { ...cursor };

  const availableHeight = height - margin - footerHeight;

  let accumulatedHeight = 0;
  let maxWidth = 0;
  let index = 0;

  const remainingContent = content.remainingContent
    ? content.remainingContent
    : content;

  if (content) {
    while (index < remainingContent.length) {
      const tag = remainingContent[index];
      const simulateTagSection = await addText(doc, cursor, {
        content: tag.label,
        width,
        lang,
        simulate: true,
      });

      accumulatedHeight += simulateTagSection.height;
      maxWidth = Math.max(maxWidth, simulateTagSection.width);

      if (currentCursor.y + accumulatedHeight > availableHeight) {
        cursor.y = currentCursor.y;
        return {
          remainingContent: remainingContent.slice(index),
          width: maxWidth,
          height: accumulatedHeight,
        };
      }

      if (!simulate) {
        const tagSection = await addText(doc, cursor, {
          content: tag.label,
          width,
          lang,
          simulate,
        });

        cursor.y += tagSection.height;
      }

      index += 1;
    }
    cursor.y = currentCursor.y;
  }

  return {
    remainingContent: [],
    width: maxWidth,
    height: accumulatedHeight,
  };
}
