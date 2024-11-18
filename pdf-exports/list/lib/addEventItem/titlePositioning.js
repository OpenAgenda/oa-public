import { getLocaleValue } from '@openagenda/intl';
import addText from '../addText.js';
import cleanString from '../../../utils/cleanString.js';

export default function titlePositioning(doc, cursor, event, options = {}) {
  const { columnMaxWidth, fontSize, base, simulate, lang } = options;

  const { height, width } = addText(
    doc,
    cursor,
    cleanString(getLocaleValue(event.title, lang)),
    {
      width: columnMaxWidth,
      fontSize,
      base,
      bold: true,
      simulate,
    },
  );

  return {
    width,
    height,
  };
}
