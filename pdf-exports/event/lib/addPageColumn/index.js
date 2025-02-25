import addText from '../addText.js';
import imagePositioning from '../imagePositioning.js';
import addMarkdownDescription from '../addMarkdownDescription.js';
import addCalendar from '../addCalendar.js';
import addRegistration from '../addRegistration.js';
import addAdditionalFields from '../addAdditionalFields.js';
import addStatus from '../addStatus.js';
import addLocation from '../addLocation.js';
import truncate from '../truncate.js';
import addContentItem from './addContentItem.js';
import isOverflowing from './isOverflowing.js';

const addFunctions = {
  addText,
  imagePositioning,
  addMarkdownDescription,
  addCalendar,
  addStatus,
  addRegistration,
  addAdditionalFields,
  addLocation,
};

export default async function addPageColumn(doc, cursor, config, options = {}) {
  const {
    columnWidth,
    iconHeightAndWidth,
    margin,
    footerHeight,
    intl,
    lang,
    simulate = false,
  } = options;
  const { content } = config;

  const initialY = cursor.y;

  const remainingContent = [];
  let hasReachedBottom = false;

  for (const contentItem of content) {
    const addFn = addFunctions[contentItem.addFn];
    if (!addFn) {
      throw new Error(`addFn '${contentItem.addFn}' missing`);
    }

    if (hasReachedBottom) {
      remainingContent.push(contentItem);
      continue;
    }

    const remainingHeight = doc.page.height - cursor.y;

    if (
      await isOverflowing(doc, cursor, addFn, contentItem, {
        addFunctions,
        columnWidth,
        iconHeightAndWidth,
        margin,
        footerHeight,
        intl,
        lang,
      })
    ) {
      hasReachedBottom = true;
      if (contentItem.truncable) {
        const [beforeOverflow, afterOverflow] = await truncate(
          doc,
          cursor,
          addFn,
          contentItem,
          remainingHeight,
          { columnWidth, iconHeightAndWidth, margin, footerHeight, intl, lang },
        );
        await addContentItem(doc, cursor, addFn, addFunctions, beforeOverflow, {
          columnWidth,
          iconHeightAndWidth,
          margin,
          footerHeight,
          intl,
          lang,
          simulate,
        });
        remainingContent.push(afterOverflow);
      } else {
        remainingContent.push(contentItem);
      }
      continue;
    }
    await addContentItem(doc, cursor, addFn, addFunctions, contentItem, {
      columnWidth,
      iconHeightAndWidth,
      margin,
      footerHeight,
      intl,
      lang,
      simulate,
    });
  }
  cursor.y = initialY;
  return remainingContent;
}
