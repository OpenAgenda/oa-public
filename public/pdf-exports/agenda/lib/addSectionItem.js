import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getLocaleValue } from '@openagenda/intl';
import cleanString from '../../utils/cleanString.js';
import addIcon from '../../utils/addIcon.js';
import addSeparatorLine from '../../utils/addSeparatorLine.js';
import addText from './addText.js';

export default function addSectionItem(doc, cursor, options = {}) {
  const {
    base = {
      margin: 20,
      color: '#413a42',
    },
    fontSize,
    bold = true,
    simulate,
    eventSectionKeys,
    little,
    medium,
    currentCursorX,
    lang,
  } = options;

  let iconHeightAndWidth;

  if (little) {
    iconHeightAndWidth = 4;
  } else if (medium) {
    iconHeightAndWidth = 5;
  } else {
    iconHeightAndWidth = 6;
  }

  const columnMaxWidth = doc.page.width - base.margin * 2;
  let textHeight = 0;
  let heightOfArrowRightIcon = 0;

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const arrowRightIconPath = `${__dirname}/../../images/arrow-right.png`;

  eventSectionKeys.forEach((item, index) => {
    if (!item.value) {
      return;
    }
    const localValue = getLocaleValue(item.value, lang);

    const { width, height } = addText(doc, cursor, cleanString(localValue), {
      width: columnMaxWidth,
      fontSize,
      base,
      bold,
      underline: false,
      simulate,
    });

    textHeight = height;
    cursor.x += width;

    if (index < eventSectionKeys.length - 1) {
      cursor.x += base.margin / 8 + iconHeightAndWidth / 2;
      cursor.y += base.margin / 5;
      const { width: iconWidth, height: iconHeight } = addIcon(
        doc,
        arrowRightIconPath,
        cursor,
        iconHeightAndWidth,
        { simulate },
      );
      heightOfArrowRightIcon = iconHeight;
      cursor.x += iconWidth + base.margin / 8;
      cursor.y -= base.margin / 5;
    }
  });

  const hasSectionText = !!eventSectionKeys.filter((item) => item.value).length;

  cursor.x += hasSectionText ? base.margin / 2 : 0;
  cursor.y += textHeight / 2;
  if (!simulate) {
    addSeparatorLine(doc, cursor, {
      width: doc.page.width - cursor.x - base.margin * (hasSectionText ? 3 : 1),
    });
  }

  cursor.x = currentCursorX;

  return {
    width: cursor.x,
    height: Math.max(textHeight, heightOfArrowRightIcon),
  };
}
