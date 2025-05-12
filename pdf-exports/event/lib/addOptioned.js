import { getLocaleValue } from '@openagenda/intl';
import getIntl from '../../utils/intl.js';
import addText from './addText.js';
import Cursor from './Cursor.js';
import messages from './messages.js';

export default async function addOptioned(doc, cursor, params = {}) {
  const {
    field,
    lang,
    simulate,
    availableWidth = doc.page.width,
    availableHeight,
    assessHeight = true,
  } = params;

  const value = []
    .concat(params.value)
    .filter((v) => ![null, undefined].includes(v));

  const intl = getIntl(lang);

  if (assessHeight) {
    const { height } = await addOptioned(doc, cursor, {
      ...params,
      simulate: true,
      assessHeight: false,
    });
    if (height > availableHeight) {
      return { height: 0, width: 0, remaining: value };
    }
  }

  const localCursor = Cursor(cursor);
  const blockSize = { height: 0, width: 0 };

  if (!value.length) {
    const noSelectionBlock = await addText(doc, localCursor, {
      content: intl.formatMessage(messages.noSelection),
      width: availableWidth,
      lang,
      simulate,
      italic: true,
    });

    blockSize.height += noSelectionBlock.height;
    blockSize.width = Math.max(blockSize.width, noSelectionBlock.width);
    return blockSize;
  }

  for (const v of [].concat(value)) {
    const option = field.options.find((opt) => opt.id === v);

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
