import { getLocaleValue } from '@openagenda/intl';
import addText from '../addText.js';
import cleanString from '../cleanString.js';

export default function descriptionPositioning(
  doc,
  cursor,
  event,
  options = {},
) {
  const { columnMaxWidth, fontSize, base, simulate, lang } = options;

  const description = getLocaleValue(event.description, lang);

  if (description && description.length > 0) {
    const { height, width } = addText(doc, cursor, cleanString(description), {
      width: columnMaxWidth,
      fontSize,
      base,
      simulate,
    });

    return {
      width,
      height,
    };
  }
  return {
    width: 0,
    height: 0,
  };
}
