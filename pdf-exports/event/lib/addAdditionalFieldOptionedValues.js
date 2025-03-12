import { getLocaleValue } from '@openagenda/intl';
import addText from './addText.js';

export default async function addAddtionalFieldOptionedValues(
  doc,
  cursor,
  params = {},
) {
  const {
    field,
    values,
    lang,
    simulate,
    availableWidth = doc.page.width,
  } = params;

  const localCursor = { ...cursor };

  const blockSize = await addText(doc, localCursor, {
    content: getLocaleValue(field.label, lang),
    width: availableWidth,
    bold: true,
    lang,
    simulate,
  });

  localCursor.y += blockSize.height;

  for (const value of values) {
    const option = field.options.find((opt) => opt.id === value);

    const valueBlock = await addText(doc, localCursor, {
      content: getLocaleValue(option.label, lang),
      width: availableWidth,
      lang,
      simulate,
    });

    blockSize.height += valueBlock.height;
    blockSize.width = Math.max(blockSize.width, valueBlock.width);
    localCursor.y += valueBlock.height;
  }

  return blockSize;
}
