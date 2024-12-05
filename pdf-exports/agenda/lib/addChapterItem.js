import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getLocaleValue } from '@openagenda/intl';
import cleanString from '../../utils/cleanString.js';
import addIcon from '../../utils/addIcon.js';
import addText from './addText.js';

export default function addChapterItem(doc, cursor, options = {}) {
  const {
    base = {
      margin: 20,
      color: '#413a42',
    },
    fontSize,
    bold = true,
    simulate,
    eventSortKeys,
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

  eventSortKeys.forEach((item, index) => {
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

    if (index < eventSortKeys.length - 1) {
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

  cursor.x = currentCursorX;
  return {
    width: cursor.x,
    height: Math.max(textHeight, heightOfArrowRightIcon),
  };
}
