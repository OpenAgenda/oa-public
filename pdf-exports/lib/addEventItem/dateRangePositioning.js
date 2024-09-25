import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getLocaleValue } from '@openagenda/intl';
import addText from '../addText.js';
import addIcon from '../addIcon.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dateRangeIconPath = `${__dirname}/../../images/calendar.png`;

export default function dateRangePositioning(doc, cursor, event, options = {}) {
  const {
    columnMaxWidth,
    fontSize,
    base,
    iconHeightAndWidth,
    margin,
    simulate,
    lang,
  } = options;

  const { width: dateRangeWidthIcon, height: dateRangeIconHeight } = addIcon(
    doc,
    dateRangeIconPath,
    cursor,
    iconHeightAndWidth,
    {
      simulate,
    },
  );

  cursor.x += dateRangeWidthIcon + margin;
  cursor.y -= base.margin / 20;

  const { width: dateRangeWidth, height: dateRangeHeight } = addText(
    doc,
    cursor,
    getLocaleValue(event.dateRange, lang),
    {
      width: columnMaxWidth - (iconHeightAndWidth + margin),
      fontSize,
      base,
      simulate,
    },
  );

  cursor.x += dateRangeWidth;
  cursor.y += base.margin / 20;

  return {
    width: cursor.x,
    height: Math.max(dateRangeIconHeight, dateRangeHeight),
  };
}
