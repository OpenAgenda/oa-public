import { getLocaleValue } from '@openagenda/intl';
import adjustSize from './adjustSize.js';
import addText from './addText.js';
import Cursor from './Cursor.js';
import addImage from './addImage.js';

async function addAgendaPart(agenda, doc, parentCursor, params) {
  const { simulate } = params;
  const { image, title } = agenda;

  const cursor = Cursor(parentCursor);
  const size = { width: 0, height: 0 };

  if (image) {
    const imageParts = image.split('/');
    const value = imageParts.pop();
    const imagePath = `${imageParts.join('/')}/`;
    adjustSize(
      size,
      await addImage(doc, cursor, {
        ...params,
        availableWidth: 20,
        imagePath,
        value,
        simulate,
      }),
    );
    size.width += 5;
    cursor.moveX(size.width);
  }

  adjustSize(
    size,
    addText(doc, cursor, {
      value: title,
      simulate,
      fontSize: '1.1em',
    }),
  );

  return size;
}

export default async function addHeader(
  headerParams,
  doc,
  parentCursor,
  params = {},
) {
  const { agenda, event, padding = 0 } = headerParams;

  const { pageNumber, simulate, availableWidth, lang } = params;

  const cursor = Cursor(parentCursor);
  cursor.moveY(padding);
  const size = { width: padding, height: padding * 2 };

  if (!simulate) {
    adjustSize(
      size,
      await addAgendaPart(agenda, doc, parentCursor, { simulate: true }),
    );
    cursor.moveX((availableWidth - size.width) / 2);
  }

  const agendaPartSize = await addAgendaPart(agenda, doc, cursor, params);

  if (pageNumber === 1) {
    return size;
  }

  cursor.reset();
  cursor.moveY(agendaPartSize.height + padding);

  adjustSize(
    size,
    addText(doc, cursor, {
      value: getLocaleValue(event.title, lang),
      align: 'center',
      simulate,
      fontSize: '1.2em',
    }),
  );

  return size;
}
