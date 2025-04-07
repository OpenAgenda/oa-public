import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import addText from './addText.js';
import Cursor from './Cursor.js';
import adjustSize from './adjustSize.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const icons = {
  email: `${__dirname}/../../images/email.png`,
  phone: `${__dirname}/../../images/phone.png`,
  link: `${__dirname}/../../images/link.png`,
};
const prefixes = {
  email: 'mailto:',
  phone: 'tel:',
  link: '',
};
const topPadding = 5;

async function addImage(doc, parentCursor, params) {
  const { simulate, value, iconSize } = params;

  const cursor = Cursor(parentCursor);

  if (!simulate) {
    doc.image(value, cursor.x, cursor.y, {
      align: 'center',
      valign: 'center',
      height: iconSize,
    });
  }

  return { height: iconSize, width: iconSize };
}

async function addContent(doc, parentCursor, params) {
  const { value } = params;
  const cursor = Cursor(parentCursor);

  const size = { height: topPadding, width: 0 };
  cursor.moveY(topPadding);

  const { height: lineHeight } = await addText(doc, cursor, {
    ...params,
    value: value[0].value,
    simulate: true,
  });

  for (const { type, value: registrationItemValue } of value) {
    const imageSize = await addImage(doc, cursor, {
      ...params,
      value: icons[type],
      iconSize: lineHeight * 0.6,
    });
    adjustSize(size, imageSize);

    cursor.moveX(imageSize.width * 1.5);
    cursor.moveY(-imageSize.height * 0.3);

    adjustSize(
      size,
      await addText(doc, cursor, {
        ...params,
        value: registrationItemValue,
        link: `${prefixes[type]}${registrationItemValue}`,
      }),
    );

    cursor.reset();
    cursor.moveY(size.height * 0.8);
  }

  return size;
}

export default async function addRegistration(doc, parentCursor, params = {}) {
  const { value, availableHeight } = params;

  if (!value.length) {
    return { height: 0, width: 0 };
  }

  const { height } = await addContent(doc, parentCursor, {
    ...params,
    simulate: true,
  });

  if (height > availableHeight) {
    return {
      height: 0,
      width: 0,
      remaining: value,
    };
  }

  return addContent(doc, parentCursor, params);
}
