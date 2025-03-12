import addText from '../addText.js';
import iconPositioning from '../iconPositioning.js';

export default async function addAdditionalLinksSection(
  doc,
  cursor,
  options = {},
) {
  const {
    content,
    iconHeightAndWidth,
    margin,
    width,
    lang,
    simulate,
    footerHeight,
    height,
  } = options;
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
      const link = remainingContent[index];
      const simulateLinkIcon = await iconPositioning(doc, cursor, 'link', {
        iconHeightAndWidth,
        margin,
        simulate: true,
      });

      const simulateLinkSection = await addText(doc, cursor, {
        content: link,
        width: width - iconHeightAndWidth - margin / 2,
        link,
        lang,
        simulate: true,
      });

      accumulatedHeight += Math.max(
        simulateLinkIcon.height,
        simulateLinkSection.height,
      );
      maxWidth = Math.max(
        maxWidth,
        simulateLinkIcon.width + margin / 2 + simulateLinkSection.width,
      );

      if (currentCursor.y + accumulatedHeight > availableHeight) {
        cursor.y = currentCursor.y;
        return {
          remainingContent: remainingContent.slice(index),
          width: maxWidth,
          height: accumulatedHeight,
        };
      }

      if (!simulate) {
        await iconPositioning(doc, cursor, 'link', {
          iconHeightAndWidth,
          margin,
          simulate,
        });

        const additionalLinksSectionContent = await addText(doc, cursor, {
          content: link,
          width: width - iconHeightAndWidth - margin / 2,
          link,
          lang,
          simulate,
        });

        cursor.y += additionalLinksSectionContent.height;
      }

      cursor.x = currentCursor.x;

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
